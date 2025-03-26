package com.seethrough.api.meal.exception;

public class MealNotFoundException extends RuntimeException {

	public MealNotFoundException(String message) {
		super(message);
	}
}
