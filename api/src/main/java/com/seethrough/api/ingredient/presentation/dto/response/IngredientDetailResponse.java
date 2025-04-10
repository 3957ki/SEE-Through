package com.seethrough.api.ingredient.presentation.dto.response;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString
public class IngredientDetailResponse {
	private String ingredientId;
	private String name;
	private String imagePath;
	private String memberId;
	private String memberName;
	private String memberImagePath;
	private LocalDateTime inboundAt;
	private LocalDateTime expirationAt;
}
