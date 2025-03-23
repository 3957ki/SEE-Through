package com.seethrough.api.mealplan.application.mapper;

import org.springframework.stereotype.Component;

import com.seethrough.api.mealplan.domain.MealPlan;
import com.seethrough.api.mealplan.presentation.dto.response.MealPlanDetailResponse;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MealPlanDtoMapper {

	private final MealDtoMapper mealDtoMapper;

	public MealPlanDetailResponse toDetailResponse(MealPlan mealPlan) {
		return MealPlanDetailResponse.builder()
			.mealPlanId(mealPlan.getMealPlanId().toString())
			.name(mealPlan.getName())
			.description(mealPlan.getDescription())
			.meals(mealPlan.getMeals()
				.stream()
				.map(mealDtoMapper::toDetailResponse)
				.toList())
			.createdAt(mealPlan.getCreatedAt())
			.build();
	}
}
