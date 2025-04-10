package com.seethrough.api.meal.presentation.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString
public class DailyMealResponse {
	private MealDetailResponse breakfast;
	private MealDetailResponse lunch;
	private MealDetailResponse dinner;
}
