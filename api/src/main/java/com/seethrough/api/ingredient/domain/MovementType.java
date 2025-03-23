package com.seethrough.api.ingredient.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MovementType {
	INBOUND("입고"),
	OUTBOUND("출고");

	private final String name;
}
