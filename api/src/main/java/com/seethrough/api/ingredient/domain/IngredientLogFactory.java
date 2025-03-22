package com.seethrough.api.ingredient.domain;

import java.time.LocalDateTime;
import java.util.UUID;

public class IngredientLogFactory {

	public static IngredientLog create(
		UUID ingredientLogId,
		String ingredientName,
		UUID memberId,
		MovementType movementType,
		LocalDateTime createdAt
	) {
		return IngredientLog.builder()
			.ingredientLogId(ingredientLogId)
			.ingredientName(ingredientName)
			.memberId(memberId)
			.movementType(movementType)
			.createdAt(createdAt)
			.build();
	}
}
