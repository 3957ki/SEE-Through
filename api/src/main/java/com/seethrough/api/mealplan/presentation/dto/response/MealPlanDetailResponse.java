package com.seethrough.api.mealplan.presentation.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString
public class MealPlanDetailResponse {
	private String mealPlanId;
	private String name;
	private String description;
	private List<MealDetailResponse> meals;
	private LocalDateTime createdAt;
}
