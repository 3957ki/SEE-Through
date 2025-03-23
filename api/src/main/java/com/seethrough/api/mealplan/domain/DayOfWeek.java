package com.seethrough.api.mealplan.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum DayOfWeek {
	MONDAY("월"),
	TUESDAY("화"),
	WEDNESDAY("수"),
	THURSDAY("목"),
	FRIDAY("금"),
	SATURDAY("토"),
	SUNDAY("일");

	private final String name;
}
