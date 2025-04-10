package com.seethrough.api.ingredient.infrastructure.external.llm.dto.request;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
@Builder
@AllArgsConstructor
public class IngredientEmbeddingRequest {
	@JsonProperty("ingredient_id")
	private String ingredientId;

	@JsonProperty("name")
	private String name;

	public static IngredientEmbeddingRequest from(UUID ingredientId, String name) {
		return IngredientEmbeddingRequest.builder()
			.ingredientId(ingredientId.toString())
			.name(name)
			.build();
	}
}
