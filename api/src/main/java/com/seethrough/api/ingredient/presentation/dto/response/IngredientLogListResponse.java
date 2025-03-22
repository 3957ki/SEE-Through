package com.seethrough.api.ingredient.presentation.dto.response;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString
public class IngredientLogListResponse {
	private String ingredientLogId;
	private String ingredientName;
	private String memberId;
	private String memberName;
	private String memberImagePath;
	private String movementName;
	private String imagePath;
	private LocalDateTime createdAt;
}
