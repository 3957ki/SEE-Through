package com.seethrough.api.common.infrastructure.llm;

import java.util.Optional;
import java.util.concurrent.CompletableFuture;

import org.springframework.stereotype.Service;

import com.seethrough.api.common.infrastructure.TransactionCallbackManager;
import com.seethrough.api.common.infrastructure.llm.dto.request.LlmInboundIngredientsRequest;
import com.seethrough.api.common.infrastructure.llm.dto.request.LlmPersonalNoticeRequest;
import com.seethrough.api.common.infrastructure.llm.dto.response.LlmPersonalNoticeResponse;
import com.seethrough.api.common.infrastructure.llm.dto.response.LlmSuccessResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
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

	// TODO: Stream 형식으로 변경하기
	public CompletableFuture<String> sendPersonalNotice(LlmPersonalNoticeRequest request) {
		return transactionCallbackManager.executeAfterCommit(() -> {
			log.info("[LlmApiService] 외부 API 식재료 출고 개인 알림 요청 시작: request = {}", request);

			return Optional.ofNullable(
					llmApiClient.sendPostRequestFlux("/llm/personal-notice", request, LlmPersonalNoticeResponse.class)
						.doOnNext(response -> log.info("[LlmApiService] 외부 API 식재료 출고 개인 알림 응답: {}", response))
						.blockLast())
				.map(LlmPersonalNoticeResponse::getNoticeMessage)
				.orElse(null);
		});
	}
}
