package com.seethrough.api.ingredient.domain;

import lombok.Getter;

@Getter
public enum MovementType {
	INBOUND("입고"),
	OUTBOUND("출고");

	private final String name;

	MovementType(String name) {
		this.name = name;
	}
}
