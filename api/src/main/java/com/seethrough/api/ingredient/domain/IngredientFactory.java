package com.seethrough.api.ingredient.domain;

import java.time.LocalDateTime;
import java.util.UUID;

public class IngredientFactory {

	public static Ingredient create(
		UUID ingredientId,
		String name,
		String imagePath,
		UUID memberId,
		LocalDateTime inboundAt,
		LocalDateTime expirationAt
	) {
		return Ingredient.builder()
			.ingredientId(ingredientId)
			.name(name)
			.imagePath(imagePath)
			.memberId(memberId)
			.inboundAt(inboundAt)
			.expirationAt(expirationAt)
			.build();
	}
}
