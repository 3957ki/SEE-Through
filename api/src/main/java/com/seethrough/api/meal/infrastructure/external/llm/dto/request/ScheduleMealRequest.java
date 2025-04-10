package com.seethrough.api.meal.infrastructure.external.llm.dto.request;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
@Builder
@AllArgsConstructor
public class ScheduleMealRequest {
	@JsonProperty("meal_id")
	private String mealId;

	@JsonProperty("serving_date")
	private LocalDate servingDate;

	@JsonProperty("serving_time")
	private String servingTime;

	public static ScheduleMealRequest of(String mealId, LocalDate servingDate, String servingTime) {
		return ScheduleMealRequest.builder()
			.mealId(mealId)
			.servingDate(servingDate)
			.servingTime(servingTime)
			.build();
	}
}
