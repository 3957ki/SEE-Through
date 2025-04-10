package com.seethrough.api.ingredient.application.mapper;

import org.springframework.stereotype.Component;

import com.seethrough.api.ingredient.domain.Ingredient;
import com.seethrough.api.ingredient.presentation.dto.response.IngredientDetailResponse;
import com.seethrough.api.ingredient.presentation.dto.response.IngredientListResponse;

@Component
public class IngredientDtoMapper {

	public IngredientListResponse toListResponse(Ingredient ingredient) {
		return IngredientListResponse.builder()
			.ingredientId(ingredient.getIngredientId().toString())
			.name(ingredient.getName())
			.imagePath(ingredient.getImagePath())
			.inboundAt(ingredient.getInboundAt())
			.expirationAt(ingredient.getExpirationAt())
			.build();
	}

	public IngredientDetailResponse toDetailResponse(Ingredient ingredient) {
		return IngredientDetailResponse.builder()
			.ingredientId(ingredient.getIngredientId().toString())
			.name(ingredient.getName())
			.imagePath(ingredient.getImagePath())
			.memberId(ingredient.getMember().getMemberId().toString())
			.memberName(ingredient.getMember().getName())
			.memberImagePath(ingredient.getMember().getImagePath())
			.inboundAt(ingredient.getInboundAt())
			.expirationAt(ingredient.getExpirationAt())
			.build();
	}
}
