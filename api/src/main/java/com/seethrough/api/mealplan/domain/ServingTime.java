package com.seethrough.api.mealplan.domain;

import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import lombok.Getter;

@Getter
public enum ServingTime {
	HOUR_0(0), HOUR_1(1), HOUR_2(2), HOUR_3(3), HOUR_4(4), HOUR_5(5),
	HOUR_6(6), HOUR_7(7), HOUR_8(8), HOUR_9(9), HOUR_10(10), HOUR_11(11),
	HOUR_12(12), HOUR_13(13), HOUR_14(14), HOUR_15(15), HOUR_16(16), HOUR_17(17),
	HOUR_18(18), HOUR_19(19), HOUR_20(20), HOUR_21(21), HOUR_22(22), HOUR_23(23);

	private static final Map<Integer, ServingTime> integerToEnum = Stream.of(values())
		.collect(Collectors.toMap(ServingTime::getHour, e -> e));

	private final int hour;

	ServingTime(int hour) {
		this.hour = hour;
	}

	public static Optional<ServingTime> fromInt(int hour) {
		return Optional.ofNullable(integerToEnum.get(hour));
	}
}
