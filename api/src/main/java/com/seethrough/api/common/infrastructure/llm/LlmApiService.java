package com.seethrough.api.common.infrastructure.llm;

import org.springframework.stereotype.Service;

import com.seethrough.api.common.infrastructure.TransactionCallbackManager;
import com.seethrough.api.common.infrastructure.llm.dto.request.LlmInboundIngredientsRequest;
import com.seethrough.api.common.infrastructure.llm.dto.response.LlmSuccessResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
// TODO: 삭제 예정
public class LlmApiService {

	private final LlmApiClient llmApiClient;
	private final TransactionCallbackManager transactionCallbackManager;

	public void sendIngredientsInbound(LlmInboundIngredientsRequest request) {
		transactionCallbackManager.executeAfterCommit(() -> {
			log.info("[LlmApiService] 외부 API 식재료 입고 요청 시작: request = {}", request);

			llmApiClient.sendPostRequestMono("/llm/update-ingredient", request, LlmSuccessResponse.class)
				.subscribe(
					success -> log.info("[LlmApiService] 외부 API 식재료 입고 성공: response={}", success),
					error -> log.error("[LlmApiService] 외부 API 식재료 입고 실패 (최대 재시도 후): error={}", error.getMessage())
				);
		});
	}
}
