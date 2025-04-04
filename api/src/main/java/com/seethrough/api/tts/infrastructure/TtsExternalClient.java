package com.seethrough.api.tts.infrastructure;

import java.net.URI;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import com.seethrough.api.tts.domain.dto.TtsRequest;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Slf4j
@Component
@RequiredArgsConstructor
public class TtsExternalClient {

	private final WebClient typecastWebClient;

	@Value("${typecast.api-key}")
	private String apiKey;

	public String requestSpeakUrl(TtsRequest request) {
		log.info("actorId: {}", request.getActorId());
		log.info("text: {}", request.getText());

		Map<String, Object> body = Map.of(
			"actor_id", request.getActorId(),
			"text", request.getText(),
			"lang", "ko",
			"tempo", 1,
			"volume", 100,
			"pitch", 0,
			"xapi_hd", true,
			"model_version", "latest",
			"xapi_audio_format", "mp3"
		);

		try {
			Map<?, ?> response = typecastWebClient.post()
				.uri("/api/speak")
				.contentType(MediaType.APPLICATION_JSON)
				.headers(h -> h.setBearerAuth(apiKey))
				.bodyValue(body)
				.retrieve()
				.bodyToMono(Map.class)
				.block();

			Map<?, ?> result = (Map<?, ?>) response.get("result");
			return (String) result.get("speak_v2_url");

		} catch (WebClientResponseException e) {
			log.error("TTS 요청 실패 - status: {}, body: {}", e.getRawStatusCode(), e.getResponseBodyAsString());
			throw e;
		}
	}


	public String pollAudioDownloadUrl(String speakUrl) throws InterruptedException {
		int retry = 0, maxRetry = 10;

		while (retry < maxRetry) {
			Thread.sleep(1000);

			Map<?, ?> response = typecastWebClient.get()
				.uri(URI.create(speakUrl))
				.headers(h -> h.setBearerAuth(apiKey))
				.retrieve()
				.bodyToMono(Map.class)
				.block();

			Map<?, ?> result = (Map<?, ?>) response.get("result");

			if ("done".equals(result.get("status"))) {
				return (String) result.get("audio_download_url");
			}

			retry++;
		}

		throw new RuntimeException("음성 생성 시간이 초과되었습니다.");
	}

	public byte[] downloadAudioFile(String audioUrl) {
		return typecastWebClient.get()
			.uri(audioUrl)
			.retrieve()
			.bodyToMono(byte[].class)
			.block();
	}
}
