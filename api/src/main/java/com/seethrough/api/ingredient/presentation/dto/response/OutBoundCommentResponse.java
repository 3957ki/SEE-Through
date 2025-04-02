package com.seethrough.api.ingredient.presentation.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString
public class OutBoundCommentResponse {
	private String comment;
	private boolean isDanger;
}
