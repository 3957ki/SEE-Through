package com.seethrough.api.meal.application.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.seethrough.api.member.application.service.MemberService;
import com.seethrough.api.member.domain.Member;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MealOrchestrationService {

	private final static int MEAL_GENERATION_INACTIVITY_DAYS = 7;

	private final MemberService memberService;
	private final MealService mealService;

	@Transactional
	public void generateMealsForAllMembers() {
		log.debug("[Service] generateMealsForAllMembers 호출");

		LocalDateTime cutoffDate = LocalDateTime.now().minusDays(MEAL_GENERATION_INACTIVITY_DAYS);

		List<Member> members = memberService.findMembersByLastLoginAtAfter(cutoffDate);

		members.stream()
			.map(Member::getMemberId)
			.map(UUID::toString)
			.forEach(mealService::createMeals);
	}
}
