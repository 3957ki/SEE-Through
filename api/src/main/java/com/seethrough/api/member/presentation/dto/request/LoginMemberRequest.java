package com.seethrough.api.member.presentation.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
@AllArgsConstructor
public class LoginMemberRequest {
	@NotNull(message = "ID는 필수 입력값입니다")
	private String memberId;

	@Min(value = 0, message = "나이는 0보다 커야 합니다")
	@Max(value = 150, message = "나이는 150보다 작아야 합니다")
	private Integer age;

	@NotNull(message = "이미지 경로는 필수 입력값입니다")
	private String imagePath;
}
