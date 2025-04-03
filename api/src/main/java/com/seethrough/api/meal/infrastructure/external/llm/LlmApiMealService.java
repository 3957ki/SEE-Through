package com.seethrough.api.meal.infrastructure.external.llm;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import com.seethrough.api.common.infrastructure.LlmApiClient;
import com.seethrough.api.meal.infrastructure.external.llm.dto.request.ScheduleMealListRequest;
import com.seethrough.api.meal.infrastructure.external.llm.dto.request.ScheduleMealRequest;
import com.seethrough.api.meal.infrastructure.external.llm.dto.response.ScheduleMealListResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class LlmApiMealService {

	private static final int BATCH_SIZE = 3;

	private final LlmApiClient llmApiClient;

	public ScheduleMealListResponse createMealList(ScheduleMealListRequest request) {
		log.info("[LlmApiMealService] 식단 생성 요청 시작: size={}, request={}", request.getSchedules().size(), request);

		String uri = UriComponentsBuilder.fromPath("/llm/meal-plan")
			.build()
			.toUriString();

		ScheduleMealListResponse finalResponse = ScheduleMealListResponse.builder()
			.memberId(request.getMemberId())
			.schedules(new ArrayList<>())
			.build();

		List<List<ScheduleMealRequest>> batchedRequests = splitIntoBatches(request.getSchedules(), BATCH_SIZE);

		for (int idx = 0; idx < batchedRequests.size(); idx++) {
			List<ScheduleMealRequest> batch = batchedRequests.get(idx);

			ScheduleMealListRequest batchRequest = ScheduleMealListRequest.builder()
				.memberId(request.getMemberId())
				.schedules(batch)
				.build();

			log.info("[LlmApiMealService] 배치 처리 중: {}/{}", idx + 1, batchedRequests.size());

			ScheduleMealListResponse batchResponse = llmApiClient.sendRequestMono(HttpMethod.POST, uri, batchRequest, ScheduleMealListResponse.class)
				.doOnNext(response -> log.info("[LlmApiMealService] 배치 응답: {}", response))
				.block();

			if (batchResponse != null && batchResponse.getSchedules() != null) {
				finalResponse.addSchedules(batchResponse);
			}
		}

		log.info("[LlmApiMealService] 전체 식단 생성 완료: total schedules={}",
			finalResponse.getSchedules() != null ? finalResponse.getSchedules().size() : 0);

		return finalResponse;
	}

	private <T> List<List<T>> splitIntoBatches(List<T> list, int batchSize) {
		List<List<T>> batches = new ArrayList<>();

		for (int idx = 0; idx < list.size(); idx += batchSize) {
			int endIdx = Math.min(idx + batchSize, list.size());

			batches.add(list.subList(idx, endIdx));
		}

		return batches;
	}
}
