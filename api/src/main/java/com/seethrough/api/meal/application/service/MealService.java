package com.seethrough.api.meal.application.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.seethrough.api.meal.application.mapper.MealDtoMapper;
import com.seethrough.api.meal.domain.Meal;
import com.seethrough.api.meal.domain.MealRepository;
import com.seethrough.api.meal.presentation.dto.response.DailyMealResponse;
import com.seethrough.api.member.application.service.MemberService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MealService {

	private final MealRepository mealRepository;
	private final MealDtoMapper mealDtoMapper;
	private final MemberService memberService;

	public DailyMealResponse getDailyMeal(String memberId, LocalDate servingDate) {
		log.debug("[Service] getDailyMeal 호출");

		UUID memberIdObj = UUID.fromString(memberId);
		memberService.checkMemberExists(memberIdObj);

		List<Meal> meals = mealRepository.findMealsByMemberIdAndDate(memberIdObj, servingDate);

		return mealDtoMapper.toDailyResponse(meals);
	}
}
