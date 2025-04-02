package com.seethrough.api.ingredient.application.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.github.f4b6a3.uuid.UuidCreator;
import com.seethrough.api.alert.application.service.AlertService;
import com.seethrough.api.alert.domain.event.CreateAlertByIngredientEvent;
import com.seethrough.api.common.pagination.SliceRequestDto;
import com.seethrough.api.common.pagination.SliceResponseDto;
import com.seethrough.api.ingredient.application.mapper.IngredientDtoMapper;
import com.seethrough.api.ingredient.domain.Ingredient;
import com.seethrough.api.ingredient.domain.IngredientFactory;
import com.seethrough.api.ingredient.domain.IngredientRepository;
import com.seethrough.api.ingredient.exception.IngredientNotFoundException;
import com.seethrough.api.ingredient.infrastructure.external.llm.LlmApiIngredientService;
import com.seethrough.api.ingredient.infrastructure.external.llm.dto.request.IngredientEmbeddingListRequest;
import com.seethrough.api.ingredient.infrastructure.external.llm.dto.request.IngredientEmbeddingRequest;
import com.seethrough.api.ingredient.infrastructure.external.llm.dto.response.IngredientEmbeddingResponse;
import com.seethrough.api.ingredient.presentation.dto.request.InboundIngredientsRequest;
import com.seethrough.api.ingredient.presentation.dto.request.OutboundIngredientsRequest;
import com.seethrough.api.ingredient.presentation.dto.response.IngredientDetailResponse;
import com.seethrough.api.ingredient.presentation.dto.response.IngredientListResponse;
import com.seethrough.api.ingredient.presentation.dto.response.OutBoundCommentResponse;
import com.seethrough.api.member.application.service.MemberService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class IngredientService {

	private final ApplicationEventPublisher applicationEventPublisher;
	private final IngredientRepository ingredientRepository;
	private final IngredientDtoMapper ingredientDtoMapper;
	private final MemberService memberService;
	private final IngredientLogService ingredientLogService;
	private final AlertService alertService;
	private final LlmApiIngredientService llmApiIngredientService;

	public SliceResponseDto<IngredientListResponse> getIngredientList(
		String memberId, Integer page, Integer size, String sortBy, String sortDirection
	) {
		log.debug("[Service] getIngredientList 호출");

		UUID memberIdObj = null;
		if (memberId != null && !memberId.isEmpty()) {
			memberIdObj = memberService.checkMemberExists(memberId);
		}

		SliceRequestDto sliceRequestDto = SliceRequestDto.builder()
			.page(page)
			.size(size)
			.sortBy(sortBy)
			.sortDirection(sortDirection)
			.build();

		Slice<Ingredient> ingredients = memberIdObj == null ?
			ingredientRepository.findIngredients(sliceRequestDto.toPageable()) :
			ingredientRepository.findIngredientsOrderedByPreference(memberIdObj, sliceRequestDto.toPageableForNative());

		return SliceResponseDto.of(ingredients.map(ingredientDtoMapper::toListResponse));
	}

	public IngredientDetailResponse getIngredientDetail(String ingredientId) {
		log.debug("[Service] getIngredientDetail 호출");

		UUID ingredientIdObj = UUID.fromString(ingredientId);

		Ingredient ingredient = findIngredient(ingredientIdObj);

		return ingredientDtoMapper.toDetailResponse(ingredient);
	}

	private Ingredient findIngredient(UUID ingredientId) {
		return ingredientRepository.findByIngredientId(ingredientId)
			.orElseThrow(() ->
				new IngredientNotFoundException("식재료를 찾을 수 없습니다.")
			);
	}

	@Transactional
	public void inboundIngredients(InboundIngredientsRequest request) {
		log.debug("[Service] inboundIngredients 호출");

		UUID memberIdObj = memberService.checkMemberExists(request.getMemberId());

		LocalDateTime now = LocalDateTime.now();

		List<Ingredient> ingredients = request.getInboundIngredientRequestList()
			.stream()
			.map(obj -> IngredientFactory.create(
				obj.getIngredientId() == null ? UuidCreator.getTimeOrderedEpoch() : UUID.fromString(obj.getIngredientId()),
				obj.getName(),
				obj.getImagePath(),
				memberIdObj,
				now,
				obj.getExpirationAt()))
			.toList();

		Map<UUID, List<Float>> embeddings = createEmbeddingForIngredients(ingredients);

		ingredients.stream()
			.filter(ingredient -> embeddings.containsKey(ingredient.getIngredientId()))
			.forEach(ingredient -> ingredient.setEmbeddingVector(embeddings.get(ingredient.getIngredientId())));

		ingredientRepository.saveAll(ingredients);

		ingredientLogService.saveInboundLog(ingredients);

		applicationEventPublisher.publishEvent(CreateAlertByIngredientEvent.builder()
			.ingredients(ingredients)
			.build());
	}

	@Transactional
	public OutBoundCommentResponse outboundIngredients(OutboundIngredientsRequest request) {
		log.debug("[Service] outboundIngredients 호출");

		UUID memberIdObj = memberService.checkMemberExists(request.getMemberId());

		List<UUID> ingredientIdList = request.getIngredientIdList()
			.stream()
			.map(UUID::fromString)
			.toList();

		List<Ingredient> ingredients = ingredientRepository.findIngredientsByIngredientId(ingredientIdList);

		OutBoundCommentResponse response = null;
		if (ingredients.size() == 1) {
			response = alertService.getAlert(memberIdObj, ingredients.get(0).getIngredientId())
				.map(alert -> OutBoundCommentResponse.builder()
					.comment(alert.getComment())
					.isDanger(alert.isDanger())
					.build())
				.orElseGet(() -> llmApiIngredientService.createComment(memberIdObj, ingredients.get(0).getIngredientId()));
		}

		ingredientRepository.deleteAll(ingredients);

		ingredientLogService.saveOutboundLog(ingredients);

		return response;
	}

	private Map<UUID, List<Float>> createEmbeddingForIngredients(List<Ingredient> ingredients) {
		IngredientEmbeddingListRequest request = IngredientEmbeddingListRequest.builder()
			.ingredients(ingredients.stream()
				.map(ingredient -> IngredientEmbeddingRequest.builder()
					.ingredientId(ingredient.getIngredientId().toString())
					.name(ingredient.getName())
					.build())
				.toList())
			.build();

		return llmApiIngredientService.createIngredientEmbedding(request)
			.getEmbeddings()
			.stream()
			.collect(Collectors.toMap(
				response -> UUID.fromString(response.getIngredientId()),
				IngredientEmbeddingResponse::getEmbedding)
			);
	}
}
