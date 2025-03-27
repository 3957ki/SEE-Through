package com.seethrough.api.alert.infrastructure.external.llm.dto.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
public class AlertByMemberListResponse {
	@JsonProperty("member_id")
	private String memberId;

	@JsonProperty("risky_ingredients")
	private List<AlertByMemberResponse> riskIngredients;
}
