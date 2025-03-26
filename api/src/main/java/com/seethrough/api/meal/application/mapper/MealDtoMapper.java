package com.seethrough.api.meal.application.mapper;

import org.springframework.stereotype.Component;

import com.seethrough.api.meal.domain.Meal;
import com.seethrough.api.meal.presentation.dto.response.MealDetailResponse;

@Component
public class MealDtoMapper {

	public MealDetailResponse toDetailResponse(Meal meal) {
		return MealDetailResponse.builder()
			.mealId(meal.getMealId().toString())
			.memberId(meal.getMemberId().toString())
			.servingDate(meal.getServingDate())
			.servingTime(meal.getServingTime().getName())
			.menu(meal.getMenu())
			.reason(meal.getReason())
			.build();
	}
}
