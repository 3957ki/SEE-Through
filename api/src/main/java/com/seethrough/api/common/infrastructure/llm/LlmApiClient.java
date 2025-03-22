package com.seethrough.api.common.infrastructure.llm;

import java.time.Duration;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

@Slf4j
@Component
@RequiredArgsConstructor
public class LlmApiClient {

	private static final int MAX_RETRY_ATTEMPTS = 3;
	private static final int TIMEOUT_SECONDS = 60;
	private static final int STREAMING_TIMEOUT_SECONDS = 300;

	private final WebClient llmWebClient;

	public <T, R> Mono<R> sendGetRequestMono(String uri, T request, Class<R> responseClass) {
		return llmWebClient.get()
			.uri(uri)
			.retrieve()
			.bodyToMono(responseClass)
			.timeout(Duration.ofSeconds(TIMEOUT_SECONDS))
			.retryWhen(Retry.backoff(MAX_RETRY_ATTEMPTS, Duration.ofMillis(500))
				.doBeforeRetry(this::logBeforeRetry)
			);
	}

	public <T, R> Mono<R> sendPostRequestMono(String uri, T request, Class<R> responseClass) {
		return llmWebClient.post()
			.uri(uri)
			.bodyValue(request)
			.retrieve()
			.bodyToMono(responseClass)
			.timeout(Duration.ofSeconds(TIMEOUT_SECONDS))
			.retryWhen(Retry.backoff(MAX_RETRY_ATTEMPTS, Duration.ofMillis(500))
				.doBeforeRetry(this::logBeforeRetry)
			);
	}

	public <T, R> Flux<R> sendPostRequestFlux(String uri, T request, Class<R> resposneClass) {
		return llmWebClient.post()
			.uri(uri)
			.bodyValue(request)
			.retrieve()
			.bodyToFlux(resposneClass)
			.timeout(Duration.ofSeconds(STREAMING_TIMEOUT_SECONDS))
			.doOnSubscribe(s -> log.info("[LlmApiClient] 스트리밍 요청 시작"))
			.doOnComplete(() -> log.info("[LlmApiClient] 스트리밍 완료"))
			.doOnError(e -> log.error("[LlmApiClient] 스트리밍 오류: error={}", e.getMessage()));
	}

	public <T, R> Mono<R> sendPutRequestMono(String uri, T request, Class<R> responseClass) {
		return llmWebClient.put()
			.uri(uri)
			.bodyValue(request)
			.retrieve()
			.bodyToMono(responseClass)
			.timeout(Duration.ofSeconds(TIMEOUT_SECONDS))
			.retryWhen(Retry.backoff(MAX_RETRY_ATTEMPTS, Duration.ofMillis(500))
				.doBeforeRetry(this::logBeforeRetry)
			);
	}

	private void logBeforeRetry(Retry.RetrySignal retrySignal) {
		log.warn("[LlmApiClient] 재시도 #{}: {}", retrySignal.totalRetries() + 1, retrySignal.failure().getMessage());
	}
}
