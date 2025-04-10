package com.seethrough.api.meal.infrastructure.external.llm.dto.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
@Builder
@AllArgsConstructor
public class ScheduleMealListResponse {
	@JsonProperty("member_id")
	private String memberId;

	@JsonProperty("schedules")
	private List<ScheduleMealResponse> schedules;

	@JsonProperty("required_ingredients")
	private List<String> requiredIngredients;

	public void addSchedules(ScheduleMealListResponse scheduleMealListResponse) {
		this.schedules.addAll(scheduleMealListResponse.schedules);
	}
}
