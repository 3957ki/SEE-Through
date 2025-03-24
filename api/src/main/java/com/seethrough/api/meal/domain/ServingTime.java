package com.seethrough.api.meal.domain;

import lombok.Getter;

@Getter
public enum ServingTime {
	BREAKFAST("아침"),
	LUNCH("점심"),
	DINNER("저녁");

	private final String name;

	ServingTime(String name) {
		this.name = name;
	}
}
