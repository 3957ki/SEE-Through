package com.seethrough.api.ingredient.infrastructure.external.llm.dto.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;

@Getter
public class IngredientLogEmbeddingResponse {
	@JsonProperty("ingredient_log_id")
	private String ingredientLogId;

	@JsonProperty("embedding")
	private List<Float> embedding;

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();

		sb.append("IngredientLogEmbeddingResponse(ingredientLogId=").append(ingredientLogId);
		sb.append(", embedding=[");

		if (embedding != null) {
			int showCount = Math.min(3, embedding.size());

			for (int i = 0; i < showCount; i++) {
				sb.append(embedding.get(i));

				if (i < showCount - 1) {
					sb.append(", ");
				}
			}

			if (embedding.size() > showCount) {
				sb.append(", ... (").append(embedding.size() - showCount).append(" more)");
			}
		}
		else {
			sb.append("null");
		}

		sb.append("])");
		return sb.toString();
	}
}
