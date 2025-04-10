package com.seethrough.api.member.infrastructure.nickname;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class NicknameApiService {

	private final NicknameApiClient nicknameApiClient;

	public String getNicknameSync() {
		try {
			log.info("[NicknameApiService] 닉네임 생성 API 호출");
			return nicknameApiClient.getNickname()
				.block();
		} catch (Exception e) {
			log.warn("랜덤 닉네임 획득 실패: {}", e.getMessage());
			return null;
		}
	}
}
