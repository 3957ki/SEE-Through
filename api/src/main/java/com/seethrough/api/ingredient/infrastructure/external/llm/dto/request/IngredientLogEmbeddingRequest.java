package com.seethrough.api.ingredient.infrastructure.external.llm.dto.request;

import java.time.LocalDateTime;
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
public class IngredientLogEmbeddingRequest {
	@JsonProperty("ingredient_log_id")
	private String ingredientLogId;

	@JsonProperty("member_id")
	private String memberId;

	@JsonProperty("food")
	private String food;

	@JsonProperty("date")
	private LocalDateTime date;

	public static IngredientLogEmbeddingRequest from(UUID ingredientId, UUID memberId, String food, LocalDateTime date) {
		return IngredientLogEmbeddingRequest.builder()
			.ingredientLogId(ingredientId.toString())
			.memberId(memberId.toString())
			.food(food)
			.date(date)
			.build();
	}
}
