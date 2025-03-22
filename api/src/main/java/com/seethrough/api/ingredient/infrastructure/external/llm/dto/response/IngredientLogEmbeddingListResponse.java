package com.seethrough.api.ingredient.infrastructure.external.llm.dto.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
public class IngredientLogEmbeddingListResponse {
	@JsonProperty("embeddings")
	private List<IngredientLogEmbeddingResponse> embeddings;
}
