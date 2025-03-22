package com.seethrough.api.ingredient.infrastructure.external.llm.dto.request;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
@Builder
@AllArgsConstructor
public class IngredientEmbeddingListRequest {
	@JsonProperty("ingredients")
	private List<IngredientEmbeddingRequest> ingredients;

	public static IngredientEmbeddingListRequest from(List<IngredientEmbeddingRequest> ingredients) {
		return IngredientEmbeddingListRequest.builder()
			.ingredients(ingredients)
			.build();
	}
}
