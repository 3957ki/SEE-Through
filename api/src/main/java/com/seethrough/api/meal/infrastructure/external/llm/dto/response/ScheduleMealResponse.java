package com.seethrough.api.meal.infrastructure.external.llm.dto.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
public class ScheduleMealResponse {
	@JsonProperty("meal_id")
	private String mealId;

	@JsonProperty("menu")
	private List<String> menu;

	@JsonProperty("reason")
	private String reason;
}
