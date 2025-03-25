package com.seethrough.api.meal.domain;

import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import lombok.Getter;

@Getter
public enum ServingTime {
	BREAKFAST("아침"),
	LUNCH("점심"),
	DINNER("저녁");

	private static final Map<String, ServingTime> nameToEnum = Stream.of(values())
		.collect(Collectors.toMap(ServingTime::getName, e -> e));

	private final String name;

	ServingTime(String name) {
		this.name = name;
	}

	public static ServingTime fromName(String name) {
		return nameToEnum.get(name);
	}
}
