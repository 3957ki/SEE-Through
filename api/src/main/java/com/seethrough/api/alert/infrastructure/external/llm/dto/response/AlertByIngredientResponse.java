package com.seethrough.api.alert.infrastructure.external.llm.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
public class AlertByIngredientResponse {
	@JsonProperty("member_id")
	private String memberId;

	@JsonProperty("comment")
	private String comment;
}
