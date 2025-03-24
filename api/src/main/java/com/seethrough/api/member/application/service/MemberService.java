package com.seethrough.api.member.application.service;

import java.util.UUID;

import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.seethrough.api.common.pagination.SliceRequestDto;
import com.seethrough.api.common.pagination.SliceResponseDto;
import com.seethrough.api.member.application.dto.LoginMemberResult;
import com.seethrough.api.member.application.mapper.MemberDtoMapper;
import com.seethrough.api.member.domain.Member;
import com.seethrough.api.member.domain.MemberRepository;
import com.seethrough.api.member.exception.MemberNotFoundException;
import com.seethrough.api.member.infrastructure.nickname.NicknameApiService;
import com.seethrough.api.member.presentation.dto.request.DislikedFoodsRequest;
import com.seethrough.api.member.presentation.dto.request.LoginMemberRequest;
import com.seethrough.api.member.presentation.dto.request.PreferredFoodsRequest;
import com.seethrough.api.member.presentation.dto.request.UpdateMemberRequest;
import com.seethrough.api.member.presentation.dto.response.MemberDetailResponse;
import com.seethrough.api.member.presentation.dto.response.MemberListResponse;
import com.seethrough.api.member.presentation.dto.response.MemberMonitoringListResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MemberService {

	private final MemberRepository memberRepository;
	private final MemberDtoMapper memberDtoMapper;
	private final NicknameApiService nicknameApiService;

	@Transactional
	public LoginMemberResult login(LoginMemberRequest request) {
		log.debug("[Service] login 호출");

		UUID memberIdObj = UUID.fromString(request.getMemberId());

		boolean isNewMember = false;
		Member member;

		try {
			member = findMember(memberIdObj);

			log.info("[Service] 기존 구성원 식별");

			member.login(request.getAge(), request.getImagePath());
		} catch (MemberNotFoundException e) {
			log.info("[Service] 신규 구성원 생성");

			isNewMember = true;

			Member.MemberBuilder newMemberBuilder = Member.builder()
				.memberId(UUID.fromString(request.getMemberId()))
				.age(request.getAge())
				.imagePath(request.getImagePath())
				.recognitionTimes(1);

			String name = nicknameApiService.getNicknameSync();

			if (name != null) {
				log.debug("[Service] 랜덤 닉네임 생성 완료: {}", name);
				newMemberBuilder.name(name);
			}

			member = newMemberBuilder.build();

			memberRepository.save(member);
		}

		return LoginMemberResult.builder()
			.isNewMember(isNewMember)
			.response(memberDtoMapper.toDetailResponse(member))
			.build();
	}

	public SliceResponseDto<MemberListResponse> getMemberList(
		Integer page, Integer size, String sortBy, String sortDirection
	) {
		log.debug("[Service] getMemberList 호출");

		SliceRequestDto sliceRequestDto = SliceRequestDto.builder()
			.page(page)
			.size(size)
			.sortBy(sortBy)
			.sortDirection(sortDirection)
			.build();

		Slice<Member> members = memberRepository.findMembers(sliceRequestDto.toPageable());

		return SliceResponseDto.of(members.map(memberDtoMapper::toListResponse));
	}

	public MemberDetailResponse getMemberDetail(String memberId) {
		log.debug("[Service] getMemberDetail 호출");

		UUID memberIdObj = UUID.fromString(memberId);

		Member member = findMember(memberIdObj);

		return memberDtoMapper.toDetailResponse(member);
	}

	@Transactional
	public void updateMember(UpdateMemberRequest request) {
		log.debug("[Service] updateMember 호출");

		UUID memberIdObj = UUID.fromString(request.getMemberId());

		Member member = findMember(memberIdObj);

		member.update(
			request.getName(),
			request.getBirth(),
			request.getPreferredFoods(),
			request.getDislikedFoods(),
			request.getAllergies(),
			request.getDiseases()
		);

		// TODO: 질병이나 알러지 수정 여부를 파악하여 llm 통해 경고 테이블 생성하기
	}

	@Transactional
	public void deleteMember(String memberId) {
		log.debug("[Service] deleteMember 호출");

		UUID memberIdObj = UUID.fromString(memberId);

		Member member = findMember(memberIdObj);

		member.delete();
	}

	@Transactional
	public void addPreferredFoods(String memberId, PreferredFoodsRequest request) {
		log.debug("[Service] addPreferredFoods 호출");

		UUID memberIdObj = UUID.fromString(memberId);

		Member member = findMember(memberIdObj);

		member.addPreferredFoods(request.getPreferredFoods());
	}

	@Transactional
	public void removePreferredFoods(String memberId, PreferredFoodsRequest request) {
		log.debug("[Service] removePreferredFoods 호출");

		UUID memberIdObj = UUID.fromString(memberId);

		Member member = findMember(memberIdObj);

		member.removePreferredFoods(request.getPreferredFoods());
	}

	@Transactional
	public void addDislikedFoods(String memberId, DislikedFoodsRequest request) {
		log.debug("[Service] addDislikedFoods 호출");

		UUID memberIdObj = UUID.fromString(memberId);

		Member member = findMember(memberIdObj);

		member.addDislikedFoods(request.getDislikedFoods());
	}

	@Transactional
	public void removeDislikedFoods(String memberId, DislikedFoodsRequest request) {
		log.debug("[Service] removeDislikedFoods 호출");

		UUID memberIdObj = UUID.fromString(memberId);

		Member member = findMember(memberIdObj);

		member.removeDislikedFoods(request.getDislikedFoods());
	}

	public UUID checkMemberExists(String memberId) {
		if (memberId == null) {
			throw new MemberNotFoundException("구성원 ID가 존재하지 않습니다.");
		}

		UUID memberIdObj = UUID.fromString(memberId);

		boolean result = memberRepository.existsByMemberId(memberIdObj);

		if (!result) {
			throw new MemberNotFoundException("구성원을 찾을 수 없습니다.");
		}

		return memberIdObj;
	}

	public SliceResponseDto<MemberMonitoringListResponse> getMemberMonitoringList(Integer page, Integer size, String sortBy, String sortDirection) {
		log.debug("[Service] getMemberMonitoringList 호출");

		SliceRequestDto sliceRequestDto = SliceRequestDto.builder()
			.page(page)
			.size(size)
			.sortBy(sortBy)
			.sortDirection(sortDirection)
			.build();

		Slice<Member> members = memberRepository.findMembers(sliceRequestDto.toPageable());

		return SliceResponseDto.of(members.map(memberDtoMapper::toMonitoringListResponse));
	}

	@Transactional
	public boolean updateMemberMonitoring(String memberId) {
		log.debug("[Service] updateMemberMonitoring 호출");

		UUID memberIdObj = UUID.fromString(memberId);

		Member member = findMember(memberIdObj);

		member.changeMonitoring();

		return member.isMonitored();
	}

	private Member findMember(UUID memberId) {
		return memberRepository.findByMemberId(memberId)
			.orElseThrow(() ->
				new MemberNotFoundException("구성원을 찾을 수 없습니다.")
			);
	}
}
