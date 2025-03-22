package com.seethrough.api.ingredient.application.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.seethrough.api.common.pagination.SliceRequestDto;
import com.seethrough.api.common.pagination.SliceResponseDto;
import com.seethrough.api.ingredient.application.mapper.IngredientDtoMapper;
import com.seethrough.api.ingredient.domain.Ingredient;
import com.seethrough.api.ingredient.domain.IngredientFactory;
import com.seethrough.api.ingredient.domain.IngredientLog;
import com.seethrough.api.ingredient.domain.IngredientLogFactory;
import com.seethrough.api.ingredient.domain.IngredientLogRepository;
import com.seethrough.api.ingredient.domain.IngredientRepository;
import com.seethrough.api.ingredient.domain.MovementType;
import com.seethrough.api.ingredient.exception.IngredientNotFoundException;
import com.seethrough.api.ingredient.infrastructure.external.llm.LlmApiIngredientService;
import com.seethrough.api.ingredient.infrastructure.external.llm.dto.request.IngredientEmbeddingListRequest;
import com.seethrough.api.ingredient.infrastructure.external.llm.dto.request.IngredientEmbeddingRequest;
import com.seethrough.api.ingredient.infrastructure.external.llm.dto.request.IngredientLogEmbeddingListRequest;
import com.seethrough.api.ingredient.infrastructure.external.llm.dto.request.IngredientLogEmbeddingRequest;
import com.seethrough.api.ingredient.infrastructure.external.llm.dto.response.IngredientEmbeddingResponse;
import com.seethrough.api.ingredient.infrastructure.external.llm.dto.response.IngredientLogEmbeddingResponse;
import com.seethrough.api.ingredient.presentation.dto.request.InboundIngredientsRequest;
import com.seethrough.api.ingredient.presentation.dto.request.OutboundIngredientsRequest;
import com.seethrough.api.ingredient.presentation.dto.response.IngredientDetailResponse;
import com.seethrough.api.ingredient.presentation.dto.response.IngredientListResponse;
import com.seethrough.api.member.application.service.MemberService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class IngredientService {

	private final IngredientRepository ingredientRepository;
	private final IngredientDtoMapper ingredientDtoMapper;
	private final IngredientLogRepository ingredientLogRepository;
	private final MemberService memberService;
	private final LlmApiIngredientService llmApiIngredientService;

	public SliceResponseDto<IngredientListResponse> getIngredientList(
		Integer page, Integer size, String sortBy, String sortDirection
	) {
		log.debug("[Service] getIngredientList 호출");

		SliceRequestDto sliceRequestDto = SliceRequestDto.builder()
			.page(page)
			.size(size)
			.sortBy(sortBy)
			.sortDirection(sortDirection)
			.build();

		Slice<Ingredient> ingredients = ingredientRepository.findIngredients(sliceRequestDto.toPageable());

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

		UUID memberIdObj = UUID.fromString(request.getMemberId());
		memberService.checkMemberExists(memberIdObj);

		LocalDateTime now = LocalDateTime.now();

		List<Ingredient> ingredients = request.getInboundIngredientRequestList()
			.stream()
			.map(obj -> IngredientFactory.create(UUID.randomUUID(), obj.getName(), obj.getImagePath(), memberIdObj, now, obj.getExpirationAt()))
			.toList();

		Map<UUID, List<Float>> embeddings = createEmbeddingForIngredients(ingredients);

		ingredients.stream()
			.filter(ingredient -> embeddings.containsKey(ingredient.getIngredientId()))
			.forEach(ingredient -> ingredient.setEmbeddingVector(embeddings.get(ingredient.getIngredientId())));

		ingredientRepository.saveAll(ingredients);

		saveInboundLog(ingredients);

		// TODO: llm 통해 경고 테이블 생성하기
	}

	@Transactional
	public String outboundIngredients(OutboundIngredientsRequest request) {
		log.debug("[Service] outboundIngredients 호출");

		UUID memberIdObj = UUID.fromString(request.getMemberId());
		memberService.checkMemberExists(memberIdObj);

		// TODO: UUID 유틸로 뽑아내기
		List<UUID> ingredientIdList = request.getIngredientIdList()
			.stream()
			.map(UUID::fromString)
			.toList();

		// TODO: 찾을 수 없는 식재료에 대한 에러 처리
		List<Ingredient> ingredients = ingredientRepository.findIngredientsByIngredientId(ingredientIdList);

		// TODO: steram으로 수정 예정(호출 위치도 마지막으로 수정되어야 함)
		String response = null;
		if (ingredients.size() == 1)
			response = llmApiIngredientService.creaetComment(memberIdObj, ingredients.get(0).getIngredientId());

		ingredientRepository.deleteAll(ingredients);

		saveOutboundLog(ingredients);

		return response;
	}

	private void saveInboundLog(List<Ingredient> ingredients) {
		log.debug("[Service] saveInboundLog 호출");

		List<IngredientLog> ingredientLogs = ingredients.stream()
			.map(ingredient -> IngredientLogFactory.create(
				ingredient.getIngredientId(),
				ingredient.getName(),
				ingredient.getMemberId(),
				MovementType.INBOUND,
				ingredient.getInboundAt()))
			.toList();

		Map<UUID, List<Float>> embeddings = createEmbeddingForIngredientLogs(ingredientLogs);

		ingredientLogs.stream()
			.filter(ingredientLog -> embeddings.containsKey(ingredientLog.getIngredientLogId()))
			.forEach(ingredientLog -> ingredientLog.setEmbeddingVector(embeddings.get(ingredientLog.getIngredientLogId())));

		ingredientLogRepository.saveAll(ingredientLogs);
	}

	private void saveOutboundLog(List<Ingredient> ingredients) {
		log.debug("[Service] saveOutboundLog 호출");

		LocalDateTime now = LocalDateTime.now();

		List<IngredientLog> ingredientLogs = ingredients.stream()
			.map(ingredient -> IngredientLogFactory.create(
				ingredient.getIngredientId(),
				ingredient.getName(),
				ingredient.getMemberId(),
				MovementType.OUTBOUND,
				now))
			.toList();

		Map<UUID, List<Float>> embeddings = createEmbeddingForIngredientLogs(ingredientLogs);

		ingredientLogs.stream()
			.filter(ingredientLog -> embeddings.containsKey(ingredientLog.getIngredientLogId()))
			.forEach(ingredientLog -> ingredientLog.setEmbeddingVector(embeddings.get(ingredientLog.getIngredientLogId())));

		ingredientLogRepository.saveAll(ingredientLogs);
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

	private Map<UUID, List<Float>> createEmbeddingForIngredientLogs(List<IngredientLog> ingredientLogs) {
		IngredientLogEmbeddingListRequest request = IngredientLogEmbeddingListRequest.builder()
			.ingredientLogs(ingredientLogs.stream()
				.map(ingredientLog -> IngredientLogEmbeddingRequest.builder()
					.ingredientLogId(ingredientLog.getIngredientLogId().toString())
					.memberId(ingredientLog.getMemberId().toString())
					.food(ingredientLog.getIngredientName())
					.date(ingredientLog.getCreatedAt())
					.build())
				.toList())
			.build();

		return llmApiIngredientService.createIngredientLogEmbedding(request)
			.getEmbeddings()
			.stream()
			.collect(Collectors.toMap(
				response -> UUID.fromString(response.getIngredientLogId()),
				IngredientLogEmbeddingResponse::getEmbedding)
			);
	}
}
