package com.seethrough.api.ingredient.infrastructure.external.llm.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
public class CommentResponse {
	@JsonProperty("ingredient_id")
	private String ingredientId;

	@JsonProperty("name")
	private String name;

	@JsonProperty("category")
	private int category;

	@JsonProperty("category_name")
	private String categoryName;

	@JsonProperty("comment")
	private String comment;
}
