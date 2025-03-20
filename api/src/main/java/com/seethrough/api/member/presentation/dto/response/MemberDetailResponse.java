package com.seethrough.api.member.presentation.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString
public class MemberDetailResponse {
	private String memberId;
	private String name;
	private LocalDate birth;
	private Integer age;
	private String imagePath;
	private Set<String> preferredFoods;
	private Set<String> dislikedFoods;
	private Set<String> allergies;
	private Boolean isRegistered;
	private LocalDateTime createdAt;
}
