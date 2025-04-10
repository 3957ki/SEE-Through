package com.seethrough.api.member.presentation.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString
public class MemberListResponse {
	private String memberId;
	private String name;
	private String imagePath;
	private Boolean isRegistered;
}
