package com.seethrough.api.mealplan.presentation.dto.response;

import java.time.LocalDate;
import java.util.List;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString
public class MealDetailResponse {
	private String mealId;
	private LocalDate servingDate;
	private String servingDay;
	private int servingTime;
	private List<String> menu;
}
