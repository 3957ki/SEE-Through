package com.seethrough.api.ingredient.presentation.dto.response;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString
public class IngredientListResponse {
	private String ingredientId;
	private String name;
	private String imagePath;
	private LocalDateTime inboundAt;
	private LocalDateTime expirationAt;
}
