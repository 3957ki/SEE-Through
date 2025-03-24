package com.seethrough.api.member.presentation;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.seethrough.api.common.exception.ErrorResponse;
import com.seethrough.api.common.pagination.SliceResponseDto;
import com.seethrough.api.member.application.dto.LoginMemberResult;
import com.seethrough.api.member.application.service.MemberService;
import com.seethrough.api.member.presentation.dto.request.DislikedFoodsRequest;
import com.seethrough.api.member.presentation.dto.request.LoginMemberRequest;
import com.seethrough.api.member.presentation.dto.request.PreferredFoodsRequest;
import com.seethrough.api.member.presentation.dto.request.UpdateMemberRequest;
import com.seethrough.api.member.presentation.dto.response.MemberDetailResponse;
import com.seethrough.api.member.presentation.dto.response.MemberListResponse;
import com.seethrough.api.member.presentation.dto.response.MemberMonitoringListResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/members")
@Tag(name = "구성원 관리", description = "구성원 정보를 관리하는 API")
public class MemberController {

	private final MemberService memberService;

	@PostMapping()
	@Operation(
		summary = "구성원 로그인 또는 생성",
		description = "UUID로 작성된 구성원의 키를 활용해 기존 구성원으로 로그인하거나 새로운 구성원을 생성합니다.<br>" +
			"기존 구성원인 경우, 나이와 이미지 경로를 업데이트하고 인식 횟수를 증가시킵니다.<br>" +
			"신규 구성원인 경우, 외부 API를 통해 랜덤 닉네임을 생성하고 새로운 구성원을 등록합니다.<br>" +
			"응답으로는 구성원의 상세 정보가 포함된 MemberResponse가 반환됩니다.<br>" +
			"기존 구성원은 200 OK 상태 코드와 함께, 신규 구성원은 201 Created 상태 코드와 함께 응답됩니다."
	)
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "기존 구성원 로그인 성공"),
		@ApiResponse(responseCode = "201", description = "신규 구성원 생성 성공")
	})
	public ResponseEntity<MemberDetailResponse> login(@Valid @RequestBody LoginMemberRequest request) {
		log.info("[Controller - POST /api/members] 구성원 식별 요청: request={}", request);

		LoginMemberResult result = memberService.login(request);

		log.debug("[Controller] 로그인 응답: {}", result);

		return result.isNewMember() ?
			ResponseEntity.status(HttpStatus.CREATED).body(result.getResponse()) :
			ResponseEntity.ok(result.getResponse());
	}

	@GetMapping()
	@Operation(
		summary = "구성원 목록 조회",
		description = "탈퇴하지 않은 모든 사용자의 목록을 페이지네이션을 적용하여 반환합니다.<br>" +
			"기본적으로 생성일 기준 내림차순으로 정렬되며, 페이지당 최대 100명의 구성원 정보를 제공합니다.<br>" +
			"정렬 기준과 방향을 변경할 수 있으며, 추가 페이지 존재 여부를 함께 반환합니다."
	)
	public ResponseEntity<SliceResponseDto<MemberListResponse>> getMemberList(
		@Parameter(description = "조회할 페이지 번호 (1부터 시작)")
		@RequestParam(defaultValue = "1") Integer page,

		@Parameter(description = "페이지당 항목 수 (최대 100)")
		@RequestParam(defaultValue = "10") Integer size,

		@Parameter(description = "정렬 기준 필드 (createdAt, name, isRegistered, recognitionTimes 등)")
		@RequestParam(defaultValue = "createdAt") String sortBy,

		@Parameter(description = "정렬 방향 (ASC: 오름차순, DESC: 내림차순)")
		@RequestParam(defaultValue = "DESC") String sortDirection
	) {
		log.info("[Controller - GET /api/members] 구성원 목록 조회 요청: page={}, size={}, sortBy={}, sortDirection={}", page, size, sortBy, sortDirection);

		SliceResponseDto<MemberListResponse> responseList = memberService.getMemberList(page, size, sortBy, sortDirection);

		if (!responseList.getContent().isEmpty()) {
			log.debug("[Controller] 첫 번째 응답 상세 정보:{}", responseList.getContent().get(0));
		}

		log.info("[Controller] 구성원 목록 조회 응답: 총 {}개 항목, 현재 페이지: {}, 마지막 페이지 여부: {}",
			responseList.getContent().size(),
			responseList.getSliceInfo().getCurrentPage(),
			responseList.getSliceInfo().getHasNext());

		return ResponseEntity.ok(responseList);
	}

	@GetMapping("/{memberId}")
	@Operation(
		summary = "구성원 조회",
		description = "UUID로 작성된 구성원의 키를 활용해 시스템에 등록된 특정 사용자를 반환합니다.<br>" +
			"해당 ID에 매칭되는 구성원이 없거나 탈퇴한 구성원인 경우 MemberNotFoundException이 발생합니다.<br>" +
			"응답으로는 구성원의 기본 정보(ID, 이름, 등록 상태 등)가 포함됩니다."
	)
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "구성원 조회 성공"),
		@ApiResponse(responseCode = "404", description = "구성원을 찾을 수 없음",
			content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
	})
	public ResponseEntity<MemberDetailResponse> getMemberDetail(@PathVariable String memberId) {
		log.info("[Controller - GET /api/members/{memberId}] 구성원 조회 요청: memberId={}", memberId);

		MemberDetailResponse response = memberService.getMemberDetail(memberId);

		log.debug("[Controller] 구성원 조회 응답: {}", response);

		return ResponseEntity.ok(response);
	}

	@PutMapping
	@Operation(
		summary = "구성원 수정",
		description = "UUID로 식별되는 구성원의 정보를 수정합니다.<br>" +
			"해당 ID에 매칭되는 구성원이 없는 경우 MemberNotFoundException이 발생합니다.<br>" +
			"응답으로는 204 No Content 상태 코드가 반환됩니다."
	)
	@ApiResponses(value = {
		@ApiResponse(responseCode = "204", description = "구성원 수정 성공"),
		@ApiResponse(responseCode = "404", description = "구성원을 찾을 수 없음",
			content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
	})
	public ResponseEntity<Void> updateMember(@Valid @RequestBody UpdateMemberRequest request) {
		log.info("[Controller - PUT /api/members] 구성원 수정 요청: request={}", request);

		memberService.updateMember(request);

		log.debug("[Controller] 구성원 수정 성공");

		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}

	@DeleteMapping("/{memberId}")
	@Operation(
		summary = "구성원 삭제",
		description = "UUID로 작성된 구성원의 키를 활용해 시스템에 등록된 특정 사용자를 삭제합니다.<br>" +
			"해당 ID에 매칭되는 구성원이 없는 경우 MemberNotFoundException이 발생합니다.<br>" +
			"응답으로는 204 No Content 상태 코드가 반환됩니다."
	)
	@ApiResponses(value = {
		@ApiResponse(responseCode = "204", description = "구성원 삭제 성공"),
		@ApiResponse(responseCode = "404", description = "구성원을 찾을 수 없음",
			content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
	})
	public ResponseEntity<Void> deleteMember(@PathVariable String memberId) {
		log.info("[Controller - DELETE /api/members/{memberId}] 구성원 삭제 요청: memberId={}", memberId);

		memberService.deleteMember(memberId);

		log.debug("[Controller] 구성원 삭제 성공");

		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}

	@PostMapping("/{memberId}/preferred-foods")
	@Operation(
		summary = "선호 음식 추가",
		description = "UUID로 식별되는 구성원의 선호 음식을 추가합니다.<br>" +
			"해당 ID에 매칭되는 구성원이 없는 경우 MemberNotFoundException이 발생합니다.<br>" +
			"응답으로는 204 No Content 상태 코드가 반환됩니다."
	)
	@ApiResponses(value = {
		@ApiResponse(responseCode = "204", description = "선호 음식 추가 성공"),
		@ApiResponse(responseCode = "404", description = "구성원을 찾을 수 없음",
			content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
	})
	public ResponseEntity<Void> addPreferredFoods(@PathVariable String memberId, @Valid @RequestBody PreferredFoodsRequest request) {
		log.info("[Controller - POST /api/members/{memberId}/preferred-foods] 선호 음식 추가 요청: memberId={}, request={}", memberId, request);

		memberService.addPreferredFoods(memberId, request);

		log.debug("[Controller] 선호 음식 추가 성공");

		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}

	@DeleteMapping("/{memberId}/preferred-foods")
	@Operation(
		summary = "선호 음식 삭제",
		description = "UUID로 식별되는 구성원의 선호 음식을 삭제합니다.<br>" +
			"해당 ID에 매칭되는 구성원이 없는 경우 MemberNotFoundException이 발생합니다.<br>" +
			"응답으로는 204 No Content 상태 코드가 반환됩니다."
	)
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "선호 음식 삭제 성공"),
		@ApiResponse(responseCode = "404", description = "구성원을 찾을 수 없음",
			content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
	})
	public ResponseEntity<Void> removePreferredFoods(@PathVariable String memberId, @Valid @RequestBody PreferredFoodsRequest request) {
		log.info("[Controller - DELETE /api/members/{memberId}/preferred-foods] 선호 음식 삭제 요청: memberId={}, request={}", memberId, request);

		memberService.removePreferredFoods(memberId, request);

		log.debug("[Controller] 선호 음식 삭제 성공");

		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}

	@PostMapping("/{memberId}/disliked-foods")
	@Operation(
		summary = "비선호 음식 추가",
		description = "UUID로 식별되는 구성원의 비선호 음식을 추가합니다.<br>" +
			"해당 ID에 매칭되는 구성원이 없는 경우 MemberNotFoundException이 발생합니다.<br>" +
			"응답으로는 204 No Content 상태 코드가 반환됩니다."
	)
	@ApiResponses(value = {
		@ApiResponse(responseCode = "204", description = "비선호 음식 추가 성공"),
		@ApiResponse(responseCode = "404", description = "구성원을 찾을 수 없음",
			content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
	})
	public ResponseEntity<Void> addDislikedFoods(@PathVariable String memberId, @Valid @RequestBody DislikedFoodsRequest request) {
		log.info("[Controller - POST /api/members/{memberId}/disliked-foods] 비선호 음식 추가 요청: memberId={}, request={}", memberId, request);

		memberService.addDislikedFoods(memberId, request);

		log.debug("[Controller] 비선호 음식 추가 성공");

		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}

	@DeleteMapping("/{memberId}/disliked-foods")
	@Operation(
		summary = "비선호 음식 삭제",
		description = "UUID로 식별되는 구성원의 비선호 음식을 삭제합니다.<br>" +
			"해당 ID에 매칭되는 구성원이 없는 경우 MemberNotFoundException이 발생합니다.<br>" +
			"응답으로는 204 No Content 상태 코드가 반환됩니다."
	)
	@ApiResponses(value = {
		@ApiResponse(responseCode = "204", description = "비선호 음식 삭제 성공"),
		@ApiResponse(responseCode = "404", description = "구성원을 찾을 수 없음",
			content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
	})
	public ResponseEntity<Void> removeDislikedFoods(@PathVariable String memberId, @Valid @RequestBody DislikedFoodsRequest request) {
		log.info("[Controller - DELETE /api/members/{memberId}/disliked-foods] 비선호 음식 삭제 요청: memberId={}, request={}", memberId, request);

		memberService.removeDislikedFoods(memberId, request);

		log.debug("[Controller] 비선호 음식 삭제 성공");

		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}

	@GetMapping("/monitoring")
	@Operation(
		summary = "구성원 모니터링 여부 목록 조회",
		description = "탈퇴하지 않은 모든 사용자의 모니터링 여부 목록을 페이지네이션을 적용하여 반환합니다.<br>" +
			"기본적으로 생성일 기준 내림차순으로 정렬되며, 페이지당 최대 100명의 구성원 정보를 제공합니다.<br>" +
			"정렬 기준과 방향을 변경할 수 있으며, 추가 페이지 존재 여부를 함께 반환합니다."
	)
	public ResponseEntity<SliceResponseDto<MemberMonitoringListResponse>> getMemberMonitoringList(
		@Parameter(description = "조회할 페이지 번호 (1부터 시작)")
		@RequestParam(defaultValue = "1") Integer page,

		@Parameter(description = "페이지당 항목 수 (최대 100)")
		@RequestParam(defaultValue = "10") Integer size,

		@Parameter(description = "정렬 기준 필드 (createdAt, name, isRegistered, recognitionTimes 등)")
		@RequestParam(defaultValue = "createdAt") String sortBy,

		@Parameter(description = "정렬 방향 (ASC: 오름차순, DESC: 내림차순)")
		@RequestParam(defaultValue = "DESC") String sortDirection
	) {
		log.info("[Controller - GET /api/members/monitoring] 구성원 모니터링 여부 목록 조회 요청: page={}, size={}, sortBy={}, sortDirection={}", page, size, sortBy,
			sortDirection);

		SliceResponseDto<MemberMonitoringListResponse> responseList = memberService.getMemberMonitoringList(page, size, sortBy, sortDirection);

		if (!responseList.getContent().isEmpty()) {
			log.debug("[Controller] 첫 번째 응답 상세 정보:{}", responseList.getContent().get(0));
		}

		log.info("[Controller] 구성원 모니터링 여부 목록 조회 응답: 총 {}개 항목, 현재 페이지: {}, 마지막 페이지 여부: {}",
			responseList.getContent().size(),
			responseList.getSliceInfo().getCurrentPage(),
			responseList.getSliceInfo().getHasNext());

		return ResponseEntity.ok(responseList);
	}

	@PatchMapping("/{memberId}/monitoring")
	@Operation(
		summary = "모니터링 여부 수정",
		description = "UUID로 식별되는 구성원의 모니터링 정보를 수정합니다.<br>" +
			"해당 ID에 매칭되는 구성원이 없는 경우 MemberNotFoundException이 발생합니다.<br>" +
			"응답으로는 200 Ok 상태 코드와 수정된 모니터링 여부가 반환됩니다."
	)
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "모니터링 여부 수정 성공"),
		@ApiResponse(responseCode = "404", description = "구성원을 찾을 수 없음",
			content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
	})
	public ResponseEntity<Boolean> updateMemberMonitoring(@PathVariable String memberId) {
		log.info("[Controller - PATCH /api/members/{memberId}/monitoring] 모니터링 여부 수정 요청: memberId={}", memberId);

		boolean result = memberService.updateMemberMonitoring(memberId);

		log.debug("[Controller] 모니터링 여부 수정 성공");

		return ResponseEntity.ok(result);
	}
}
