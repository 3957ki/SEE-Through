package com.seethrough.api.ingredient.application.mapper;

import org.springframework.stereotype.Component;

import com.seethrough.api.ingredient.domain.IngredientLog;
import com.seethrough.api.ingredient.presentation.dto.response.IngredientLogListResponse;

@Component
public class IngredientLogDtoMapper {

	public IngredientLogListResponse toListResponse(IngredientLog ingredientLog) {
		return IngredientLogListResponse.builder()
			.ingredientLogId(ingredientLog.getIngredientLogId().toString())
			.ingredientName(ingredientLog.getIngredientName())
			.ingredientImagePath(ingredientLog.getIngredientImagePath())
			.memberId(ingredientLog.getMemberId().toString())
			.memberName(ingredientLog.getMember().getName())
			.memberImagePath(ingredientLog.getMember().getImagePath())
			.movementName(ingredientLog.getMovementType().getName())
			.createdAt(ingredientLog.getCreatedAt())
			.build();
	}
}
