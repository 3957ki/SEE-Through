package com.seethrough.api.member.presentation.dto.request;

import java.time.LocalDate;
import java.util.Set;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
@AllArgsConstructor
public class UpdateMemberRequest {
	@NotNull(message = "ID는 필수 입력값입니다")
	private String memberId;

	@NotBlank(message = "이름은 필수 입력값입니다")
	@Size(min = 2, max = 15, message = "이름은 2자 이상 15자 이하로 입력해주세요")
	private String name;

	@PastOrPresent(message = "생일은 현재 또는 과거 날짜여야 합니다")
	private LocalDate birth;

	@NotBlank(message = "색상은 필수 입력값입니다")
	private String color;

	@NotBlank(message = "폰트 크기는 필수 입력값입니다")
	private String fontSize;

	@NotNull
	private Set<String> preferredFoods;

	@NotNull
	private Set<String> dislikedFoods;

	@NotNull
	private Set<String> allergies;

	@NotNull
	private Set<String> diseases;
}
