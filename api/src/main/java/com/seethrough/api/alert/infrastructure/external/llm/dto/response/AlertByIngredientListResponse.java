package com.seethrough.api.alert.infrastructure.external.llm.dto.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
public class AlertByIngredientListResponse {
	@JsonProperty("ingredient")
	private String ingredientName;

	@JsonProperty("risky_members")
	private List<AlertByIngredientResponse> riskyMembers;
}
