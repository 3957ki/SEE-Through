package com.seethrough.api.member.infrastructure.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.seethrough.api.member.application.service.MemberService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class MemberScheduler {

	private final MemberService memberService;

	@Scheduled(cron = "0 0 4 * * *")
	public void scheduleMealGeneration() {
		log.info("[Scheduler] 나이 갱신 스케줄러 실행");

		memberService.updateAllMembersAge();

		log.info("[Scheduler] 나이 갱신 스케줄러 종료");
	}
}
