package com.seethrough.api.member.infrastructure.nickname;

import java.time.Duration;
import java.util.concurrent.TimeoutException;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Component
@RequiredArgsConstructor
public class NicknameApiClient {

	private static final int TIMEOUT_OF_MILLIS = 1500;

	private final WebClient nicknameWebClient;

	public Mono<String> getNickname() {
		return nicknameWebClient.get()
			.uri("/?format=text&count=1")
			.retrieve()
			.bodyToMono(String.class)
			.timeout(Duration.ofMillis(TIMEOUT_OF_MILLIS))
			.onErrorResume(e -> {
				if (e instanceof TimeoutException) {
					log.error("[NicknameApiClient] 닉네임 조회 타임아웃 발생 ({}ms 초과): {}", TIMEOUT_OF_MILLIS, e.getMessage());
				}
				else {
					log.error("[NicknameApiClient] 닉네임 조회 실패 - 타입: {}, 메시지: {}", e.getClass().getName(), e.getMessage(), e);
				}

				return Mono.empty();
			});
	}
}
