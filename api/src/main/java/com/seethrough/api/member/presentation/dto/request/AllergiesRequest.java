package com.seethrough.api.member.presentation.dto.request;

import java.util.Set;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
@AllArgsConstructor
public class AllergiesRequest {
	@NotNull
	private Set<String> allergies;
}
