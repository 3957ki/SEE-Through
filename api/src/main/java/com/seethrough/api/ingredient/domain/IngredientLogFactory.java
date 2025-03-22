package com.seethrough.api.ingredient.domain;

import java.time.LocalDateTime;
import java.util.UUID;

public class IngredientLogFactory {

	public static IngredientLog create(
		UUID ingredientLogId,
		String ingredientName,
		String ingredientImagePath,
		UUID memberId,
		MovementType movementType,
		LocalDateTime createdAt
	) {
		return IngredientLog.builder()
			.ingredientLogId(ingredientLogId)
			.ingredientName(ingredientName)
			.ingredientImagePath(ingredientImagePath)
			.memberId(memberId)
			.movementType(movementType)
			.createdAt(createdAt)
			.build();
	}
}
