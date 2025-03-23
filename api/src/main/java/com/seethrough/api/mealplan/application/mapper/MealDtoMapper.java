package com.seethrough.api.mealplan.application.mapper;

import org.springframework.stereotype.Component;

import com.seethrough.api.mealplan.domain.Meal;
import com.seethrough.api.mealplan.presentation.dto.response.MealDetailResponse;

@Component
public class MealDtoMapper {

	public MealDetailResponse toDetailResponse(Meal meal) {
		return MealDetailResponse.builder()
			.mealId(meal.getMealId().toString())
			.servingDate(meal.getServingDate())
			.servingDay(meal.getMealPlanSchedule().getServingDay().getName())
			.servingTime(meal.getMealPlanSchedule().getServingTime().getHour())
			.menu(meal.getMenu())
			.build();
	}
}
