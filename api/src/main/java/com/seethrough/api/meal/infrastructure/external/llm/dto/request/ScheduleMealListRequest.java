package com.seethrough.api.meal.infrastructure.external.llm.dto.request;

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
public class ScheduleMealListRequest {
	@JsonProperty("member_id")
	private String memberId;

	@JsonProperty("schedules")
	private List<ScheduleMealRequest> schedules;

	public static ScheduleMealListRequest of(String memberId, List<ScheduleMealRequest> schedules) {
		return ScheduleMealListRequest.builder()
			.memberId(memberId)
			.schedules(schedules)
			.build();
	}
}
