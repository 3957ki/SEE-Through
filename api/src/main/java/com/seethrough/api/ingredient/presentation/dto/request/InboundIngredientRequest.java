package com.seethrough.api.ingredient.presentation.dto.request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
@AllArgsConstructor
public class InboundIngredientRequest {
	@NotNull(message = "이름은 필수 입력값입니다")
	private String name;

	@NotNull(message = "이미지 경로는 필수 입력값입니다")
	private String imagePath;

	private String ingredientId;

	private LocalDateTime expirationAt;
}
