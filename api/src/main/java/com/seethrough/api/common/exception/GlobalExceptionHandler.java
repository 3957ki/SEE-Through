package com.seethrough.api.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;

import com.seethrough.api.ingredient.exception.IngredientNotFoundException;
import com.seethrough.api.meal.exception.InvalidDailyMealException;
import com.seethrough.api.member.exception.MemberNotFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(MemberNotFoundException.class)
	public ResponseEntity<ErrorResponse> handleMemberNotFoundException(
		MemberNotFoundException e,
		ServletWebRequest request) {

		String path = request.getRequest().getRequestURI();

		ErrorResponse errorResponse = new ErrorResponse(
			HttpStatus.NOT_FOUND.value(),
			HttpStatus.NOT_FOUND.getReasonPhrase(),
			e.getMessage(),
			path
		);

		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
	}

	@ExceptionHandler(IngredientNotFoundException.class)
	public ResponseEntity<ErrorResponse> handleIngredientNotFoundException(
		IngredientNotFoundException e,
		ServletWebRequest request) {

		String path = request.getRequest().getRequestURI();

		ErrorResponse errorResponse = new ErrorResponse(
			HttpStatus.NOT_FOUND.value(),
			HttpStatus.NOT_FOUND.getReasonPhrase(),
			e.getMessage(),
			path
		);

		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
	}

	@ExceptionHandler(InvalidDailyMealException.class)
	public ResponseEntity<ErrorResponse> handleInvalidException(
		InvalidDailyMealException e,
		ServletWebRequest request) {

		String path = request.getRequest().getRequestURI();

		ErrorResponse errorResponse = new ErrorResponse(
			HttpStatus.NOT_FOUND.value(),
			HttpStatus.NOT_FOUND.getReasonPhrase(),
			e.getMessage(),
			path
		);

		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
	}
}
