package com.seethrough.api.member.presentation.dto.request;

import java.util.Set;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
@AllArgsConstructor
public class PreferredFoodsRequest {
	@NotNull
	private Set<String> preferredFoods;
}
