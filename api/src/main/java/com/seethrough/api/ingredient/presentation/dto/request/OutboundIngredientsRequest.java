package com.seethrough.api.ingredient.presentation.dto.request;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
@AllArgsConstructor
public class OutboundIngredientsRequest {
	@NotNull(message = "ID는 필수 입력값입니다")
	private String memberId;

	@Valid
	@NotEmpty(message = "출고 목록은 최소 1개 이상이어야 합니다")
	private List<String> ingredientIdList;
}
