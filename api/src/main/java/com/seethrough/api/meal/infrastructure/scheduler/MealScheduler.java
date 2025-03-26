package com.seethrough.api.meal.infrastructure.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.seethrough.api.meal.application.service.MealOrchestrationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class MealScheduler {

	private final MealOrchestrationService mealOrchestrationService;

	@Scheduled(cron = "0 0 4 * * Sun")
	// @Scheduled(cron = "*/10 * * * * *")
	public void scheduleMealGeneration() {
		log.info("[Scheduler] 식단 자동 생성 스케줄러 실행");

		mealOrchestrationService.generateMealsForAllMembers();

		log.info("[Scheduler] 식단 자동 생성 스케줄러 종료");
	}
}
