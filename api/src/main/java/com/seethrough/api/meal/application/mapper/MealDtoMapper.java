package com.seethrough.api.meal.application.mapper;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.seethrough.api.meal.domain.Meal;
import com.seethrough.api.meal.domain.ServingTime;
import com.seethrough.api.meal.presentation.dto.response.DailyMealResponse;
import com.seethrough.api.meal.presentation.dto.response.MealDetailResponse;

@Component
public class MealDtoMapper {

	public DailyMealResponse toDailyResponse(List<Meal> meals) {
		Map<ServingTime, Meal> mealByServingTime = meals.stream()
			.collect(Collectors.toMap(
				Meal::getServingTime,
				meal -> meal
			));

		return DailyMealResponse.builder()
			.breakfast(toDetailResponse(mealByServingTime.get(ServingTime.BREAKFAST)))
			.lunch(toDetailResponse(mealByServingTime.get(ServingTime.LUNCH)))
			.dinner(toDetailResponse(mealByServingTime.get(ServingTime.DINNER)))
			.build();
	}

	private MealDetailResponse toDetailResponse(Meal meal) {
		if (meal == null)
			return null;
		
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
