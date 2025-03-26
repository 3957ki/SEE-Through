package com.seethrough.api.alert.infrastructure.external.llm;

import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import com.seethrough.api.alert.infrastructure.external.llm.dto.response.AlertByIngredientListResponse;
import com.seethrough.api.common.infrastructure.llm.LlmApiClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class LlmApiAlertService {

	private final LlmApiClient llmApiClient;

	public AlertByIngredientListResponse createAlertByIngredient(String ingredientName) {
		log.info("[LlmApiAlertService] 식재료에 대한 구성원 경고 생성 요청 시작: ingredientName={}", ingredientName);

		String uri = UriComponentsBuilder.fromPath("/llm/food/risky-check")
			.queryParam("ingredient", ingredientName)
			.build()
			.toUriString();

		return llmApiClient.sendRequestMono(HttpMethod.GET, uri, AlertByIngredientListResponse.class)
			.doOnNext(response -> log.info("[LlmApiAlertService] 식재료에 대한 구성원 경고 생성 응답: {}", response))
			.block();
	}
}
