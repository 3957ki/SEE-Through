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
public class IngredientLogEmbeddingListRequest {
	@JsonProperty("logs")
	private List<IngredientLogEmbeddingRequest> ingredientLogs;

	public static IngredientLogEmbeddingListRequest from(List<IngredientLogEmbeddingRequest> ingredientLogs) {
		return IngredientLogEmbeddingListRequest.builder()
			.ingredientLogs(ingredientLogs)
			.build();
	}
}
