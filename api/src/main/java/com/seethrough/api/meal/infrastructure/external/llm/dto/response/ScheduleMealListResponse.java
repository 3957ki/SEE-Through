package com.seethrough.api.meal.infrastructure.external.llm.dto.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;

@Getter
public class ScheduleMealListResponse {
	@JsonProperty("member_id")
	private String memberId;

	@JsonProperty("schedules")
	private List<ScheduleMealResponse> schedules;

	@JsonProperty("required_ingredients")
	private List<String> requiredIngredients;
}
