package com.seethrough.api.meal.application.mapper;

import org.springframework.stereotype.Component;

import com.seethrough.api.meal.domain.DailyMeal;
import com.seethrough.api.meal.presentation.dto.response.DailyMealResponse;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DailyMealDtoMapper {

	private final MealDtoMapper mealDtoMapper;

	public DailyMealResponse toDailyResponse(DailyMeal dailyMeal) {
		return DailyMealResponse.builder()
			.breakfast(mealDtoMapper.toDetailResponse(dailyMeal.getBreakfast()))
			.lunch(mealDtoMapper.toDetailResponse(dailyMeal.getLunch()))
			.dinner(mealDtoMapper.toDetailResponse(dailyMeal.getDinner()))
			.build();
	}
}
