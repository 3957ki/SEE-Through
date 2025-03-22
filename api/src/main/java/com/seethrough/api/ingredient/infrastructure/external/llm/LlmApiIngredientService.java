package com.seethrough.api.ingredient.infrastructure.external.llm;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import com.seethrough.api.common.infrastructure.llm.LlmApiClient;
import com.seethrough.api.ingredient.infrastructure.external.llm.dto.request.IngredientEmbeddingListRequest;
import com.seethrough.api.ingredient.infrastructure.external.llm.dto.request.IngredientLogEmbeddingListRequest;
import com.seethrough.api.ingredient.infrastructure.external.llm.dto.response.CommentResponse;
import com.seethrough.api.ingredient.infrastructure.external.llm.dto.response.IngredientEmbeddingListResponse;
import com.seethrough.api.ingredient.infrastructure.external.llm.dto.response.IngredientLogEmbeddingListResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class LlmApiIngredientService {

	private final LlmApiClient llmApiClient;

	public IngredientEmbeddingListResponse createIngredientEmbedding(IngredientEmbeddingListRequest request) {
		log.info("[LlmApiIngredientService] 식재료 임베딩 벡터 요청 시작: request = {}", request);

		String uri = UriComponentsBuilder.fromPath("/llm/embedding/ingredient")
			.build()
			.toUriString();

		return llmApiClient.sendPostRequestMono(uri, request, IngredientEmbeddingListResponse.class)
			.doOnNext(response -> log.info("[LlmApiIngredientService] 식재료 임베딩 벡터 응답: {}", response))
			.block();
	}

	public IngredientLogEmbeddingListResponse createIngredientLogEmbedding(IngredientLogEmbeddingListRequest request) {
		log.info("[LlmApiIngredientService] 출고 로그 임베딩 벡터 요청 시작: request = {}", request);

		String uri = UriComponentsBuilder.fromPath("/llm/embedding/food-log")
			.build()
			.toUriString();

		return llmApiClient.sendPostRequestMono(uri, request, IngredientLogEmbeddingListResponse.class)
			.doOnNext(response -> log.info("[LlmApiIngredientService] 출고 로그 임베딩 벡터 응답: {}", response))
			.block();
	}

	// TODO: Stream 형식으로 변경하기
	public String creaetComment(UUID memberId, UUID ingredientId) {
		log.info("[LlmApiIngredientService] 외부 API 식재료 출고 개인 알림 요청 시작: memberId = {}, ingredientId = {}", memberId, ingredientId);

		String uri = UriComponentsBuilder.fromPath("/llm/food/comment")
			.queryParam("member_id", memberId)
			.queryParam("ingredient_id", ingredientId)
			.build()
			.toUriString();

		return Optional.ofNullable(llmApiClient.sendGetRequestMono(uri, null, CommentResponse.class)
				.doOnNext(response -> log.info("[LlmApiService] 외부 API 식재료 출고 개인 알림 응답: {}", response))
				.block())
			.map(CommentResponse::getComment)
			.orElse(null);
	}
}
