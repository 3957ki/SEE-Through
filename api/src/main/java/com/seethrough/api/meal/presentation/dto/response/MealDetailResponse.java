package com.seethrough.api.meal.presentation.dto.response;

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
	private String memberId;
	private LocalDate servingDate;
	private String servingTime;
	private List<String> menu;
	private String reason;
}
