package com.seethrough.api.member.application.mapper;

import org.springframework.stereotype.Component;

import com.seethrough.api.member.domain.Member;
import com.seethrough.api.member.presentation.dto.response.MemberDetailResponse;
import com.seethrough.api.member.presentation.dto.response.MemberListResponse;

@Component
public class MemberDtoMapper {

	public MemberListResponse toListResponse(Member member) {
		return MemberListResponse.builder()
			.memberId(member.getMemberId().toString())
			.name(member.getName())
			.imagePath(member.getImagePath())
			.isRegistered(member.isRegistered())
			.build();
	}

	public MemberDetailResponse toDetailResponse(Member member) {
		return MemberDetailResponse.builder()
			.memberId(member.getMemberId().toString())
			.name(member.getName())
			.birth(member.getBirth())
			.age(member.getAge())
			.imagePath(member.getImagePath())
			.preferredFoods(member.getPreferredFoods())
			.dislikedFoods(member.getDislikedFoods())
			.allergies(member.getAllergies())
			.diseases(member.getDiseases())
			.isRegistered(member.isRegistered())
			.createdAt(member.getCreatedAt())
			.build();
	}
}
