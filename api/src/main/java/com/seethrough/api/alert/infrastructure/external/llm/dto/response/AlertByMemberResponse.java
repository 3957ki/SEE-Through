package com.seethrough.api.alert.infrastructure.external.llm.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
public class AlertByMemberResponse {
	@JsonProperty("ingredient_id")
	private String ingredientId;

	@JsonProperty("name")
	private String ingredientName;

	@JsonProperty("comment")
	private String comment;
}
