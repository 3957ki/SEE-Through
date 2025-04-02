package com.seethrough.api.ingredient.application.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationContext;
import org.springframework.data.domain.Slice;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.github.f4b6a3.uuid.UuidCreator;
import com.seethrough.api.common.pagination.SliceRequestDto;
import com.seethrough.api.common.pagination.SliceResponseDto;
import com.seethrough.api.ingredient.application.mapper.IngredientLogDtoMapper;
import com.seethrough.api.ingredient.domain.Ingredient;
import com.seethrough.api.ingredient.domain.IngredientLog;
import com.seethrough.api.ingredient.domain.IngredientLogFactory;
import com.seethrough.api.ingredient.domain.IngredientLogRepository;
import com.seethrough.api.ingredient.domain.MovementType;
import com.seethrough.api.ingredient.infrastructure.external.llm.LlmApiIngredientLogService;
import com.seethrough.api.ingredient.infrastructure.external.llm.dto.request.IngredientLogEmbeddingListRequest;
import com.seethrough.api.ingredient.infrastructure.external.llm.dto.request.IngredientLogEmbeddingRequest;
import com.seethrough.api.ingredient.infrastructure.external.llm.dto.response.IngredientLogEmbeddingResponse;
import com.seethrough.api.ingredient.presentation.dto.response.IngredientLogListResponse;
import com.seethrough.api.member.application.service.MemberService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class IngredientLogService {

	private final ApplicationContext applicationContext;
	private final IngredientLogRepository ingredientLogRepository;
	private final IngredientLogDtoMapper ingredientLogDtoMapper;
	private final LlmApiIngredientLogService llmApiIngredientLogService;
	private final MemberService memberService;

	public SliceResponseDto<IngredientLogListResponse> getIngredientLogList(
		String memberId, Integer page, Integer size, String sortBy, String sortDirection
	) {
		log.debug("[Service] getIngredientLogList 호출");

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

		Slice<IngredientLog> ingredientLogs = ingredientLogRepository.findIngredientLogs(memberIdObj, sliceRequestDto.toPageable());

		return SliceResponseDto.of(ingredientLogs.map(ingredientLogDtoMapper::toListResponse));
	}

	@Async
	@Transactional
	protected void saveInboundLog(List<Ingredient> ingredients) {
		log.debug("[IngredientLogService] saveInboundLog 호출");

		List<IngredientLog> ingredientLogs = ingredients.stream()
			.map(ingredient -> IngredientLogFactory.create(
				UuidCreator.getTimeOrderedEpoch(),
				ingredient.getName(),
				ingredient.getImagePath(),
				ingredient.getMemberId(),
				MovementType.INBOUND,
				ingredient.getInboundAt()))
			.toList();

		ingredientLogRepository.saveAll(ingredientLogs);

		List<UUID> ingredientLogIdList = ingredientLogs.stream()
			.map(IngredientLog::getIngredientLogId)
			.toList();

		TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
			@Override
			public void afterCommit() {
				IngredientLogService proxy = applicationContext.getBean(IngredientLogService.class);
				proxy.setEmbeddingVectorsAsync(ingredientLogIdList);
			}
		});
	}

	@Async
	@Transactional
	protected void saveOutboundLog(List<Ingredient> ingredients) {
		log.debug("[IngredientLogService] saveOutboundLog 호출");

		LocalDateTime now = LocalDateTime.now();

		List<IngredientLog> ingredientLogs = ingredients.stream()
			.map(ingredient -> IngredientLogFactory.create(
				UuidCreator.getTimeOrderedEpoch(),
				ingredient.getName(),
				ingredient.getImagePath(),
				ingredient.getMemberId(),
				MovementType.OUTBOUND,
				now))
			.toList();

		ingredientLogRepository.saveAll(ingredientLogs);

		List<UUID> ingredientLogIdList = ingredientLogs.stream()
			.map(IngredientLog::getIngredientLogId)
			.toList();

		TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
			@Override
			public void afterCommit() {
				IngredientLogService proxy = applicationContext.getBean(IngredientLogService.class);
				proxy.setEmbeddingVectorsAsync(ingredientLogIdList);
			}
		});
	}

	@Async
	@Transactional(propagation = Propagation.REQUIRES_NEW)
	protected void setEmbeddingVectorsAsync(List<UUID> ingredientLogIdList) {
		log.debug("[IngredientLogService] setEmbeddingVectorsAsync 호출");

		List<IngredientLog> ingredientLogs = ingredientLogRepository.findAllById(ingredientLogIdList);

		Map<UUID, List<Float>> embeddings = createEmbeddingForIngredientLogs(ingredientLogs);

		ingredientLogs.stream()
			.filter(ingredientLog -> embeddings.containsKey(ingredientLog.getIngredientLogId()))
			.forEach(ingredientLog -> ingredientLog.setEmbeddingVector(embeddings.get(ingredientLog.getIngredientLogId())));
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

		return llmApiIngredientLogService.createIngredientLogEmbedding(request)
			.getEmbeddings()
			.stream()
			.collect(Collectors.toMap(
				response -> UUID.fromString(response.getIngredientLogId()),
				IngredientLogEmbeddingResponse::getEmbedding)
			);
	}
}
