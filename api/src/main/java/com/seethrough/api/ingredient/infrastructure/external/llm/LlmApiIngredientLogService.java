package com.seethrough.api.ingredient.infrastructure.external.llm;

import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import com.seethrough.api.common.infrastructure.llm.LlmApiClient;
import com.seethrough.api.ingredient.infrastructure.external.llm.dto.request.IngredientLogEmbeddingListRequest;
import com.seethrough.api.ingredient.infrastructure.external.llm.dto.response.IngredientLogEmbeddingListResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class LlmApiIngredientLogService {

	private final LlmApiClient llmApiClient;

	public IngredientLogEmbeddingListResponse createIngredientLogEmbedding(IngredientLogEmbeddingListRequest request) {
		log.info("[LlmApiIngredientLogService] 입출고 로그 임베딩 벡터 요청 시작: request = {}", request);

		String uri = UriComponentsBuilder.fromPath("/llm/embedding/food-log")
			.build()
			.toUriString();

		return llmApiClient.sendRequestMono(HttpMethod.POST, uri, request, IngredientLogEmbeddingListResponse.class)
			.doOnNext(response -> log.info("[LlmApiIngredientLogService] 입출고 로그 임베딩 벡터 응답: {}", response))
			.block();
	}
}
