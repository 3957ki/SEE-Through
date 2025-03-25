package com.seethrough.api.meal.infrastructure.external.llm;

import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import com.seethrough.api.common.infrastructure.llm.LlmApiClient;
import com.seethrough.api.meal.infrastructure.external.llm.dto.request.ScheduleMealListRequest;
import com.seethrough.api.meal.infrastructure.external.llm.dto.response.ScheduleMealListResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class LlmApiMealService {

	private final LlmApiClient llmApiClient;

	public ScheduleMealListResponse createMealList(ScheduleMealListRequest request) {
		log.info("[LlmApiMealService] 식단 생성 요청 시작: size={}, request={}", request.getSchedules().size(), request);

		String uri = UriComponentsBuilder.fromPath("/llm/meal-plan")
			.build()
			.toUriString();

		return llmApiClient.sendRequestMono(HttpMethod.POST, uri, request, ScheduleMealListResponse.class)
			.doOnNext(response -> log.info("[LlmApiMealService] 식단 생성 응답: {}", response))
			.block();
	}
}
