package com.seethrough.api.ingredient.presentation;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.seethrough.api.common.exception.ErrorResponse;
import com.seethrough.api.common.pagination.SliceResponseDto;
import com.seethrough.api.ingredient.application.service.IngredientService;
import com.seethrough.api.ingredient.presentation.dto.request.InboundIngredientsRequest;
import com.seethrough.api.ingredient.presentation.dto.request.OutboundIngredientsRequest;
import com.seethrough.api.ingredient.presentation.dto.response.IngredientDetailResponse;
import com.seethrough.api.ingredient.presentation.dto.response.IngredientListResponse;

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
@RequestMapping("/api/ingredients")
@Tag(name = "식재료 관리", description = "식재료를 관리하는 API")
public class IngredientController {

	private final IngredientService ingredientService;

	@GetMapping()
	@Operation(
		summary = "식재료 목록 조회",
		description = "모든 식재료의 목록을 페이지네이션을 적용하여 반환합니다.<br>" +
			"기본적으로 생성일 기준 오름차순으로 정렬되며, 페이지당 최대 100명의 식재료 정보를 제공합니다.<br>" +
			"정렬 기준과 방향을 변경할 수 있으며, 추가 페이지 존재 여부를 함께 반환합니다."
	)
	public ResponseEntity<SliceResponseDto<IngredientListResponse>> getIngredientList(
		@Parameter(description = "조회할 페이지 번호 (1부터 시작)")
		@RequestParam(defaultValue = "1") Integer page,

		@Parameter(description = "페이지당 항목 수 (최대 100)")
		@RequestParam(defaultValue = "10") Integer size,

		@Parameter(description = "정렬 기준 필드 (inboundAt, expirationAt, name, member 등)")
		@RequestParam(defaultValue = "inboundAt") String sortBy,

		@Parameter(description = "정렬 방향 (ASC: 오름차순, DESC: 내림차순)")
		@RequestParam(defaultValue = "ASC") String sortDirection
	) {
		log.info("[Controller - GET /api/ingredients] 식재료 목록 조회 요청: page={}, size={}, sortBy={}, sortDirection={}", page, size, sortBy,
			sortDirection);

		SliceResponseDto<IngredientListResponse> responseList = ingredientService.getIngredientList(page, size, sortBy, sortDirection);

		if (!responseList.getContent().isEmpty()) {
			log.debug("[Controller] 첫 번째 응답 상세 정보:{}", responseList.getContent().get(0));
		}

		log.info("[Controller] 식재료 목록 조회 응답: 총 {}개 항목, 현재 페이지: {}, 마지막 페이지 여부: {}",
			responseList.getContent().size(),
			responseList.getSliceInfo().getCurrentPage(),
			responseList.getSliceInfo().getHasNext());

		return ResponseEntity.ok(responseList);
	}

	@GetMapping("/{ingredientId}")
	@Operation(
		summary = "식재료 조회",
		description = "UUID로 식별되는 식재료의 정보를 수정합니다.<br>" +
			"해당 ID에 매칭되는 식재료가 없는 경우 IngredientNotFoundException이 발생합니다.<br><br>" +
			"응답으로는 200 Ok 상태 코드와 함께 식재료의 기본 정보(ID, 이름, 주인 등)가 포함됩니다."
	)
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "식재료 조회 성공"),
		@ApiResponse(responseCode = "404", description = "식재료를 찾을 수 없음",
			content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
	})
	public ResponseEntity<IngredientDetailResponse> getIngredientDetail(@PathVariable String ingredientId) {
		log.info("[Controller - GET /api/ingredients/{ingredientId}] 식재료 조회 요청: ingredientId={}", ingredientId);

		IngredientDetailResponse response = ingredientService.getIngredientDetail(ingredientId);

		log.debug("[Controller] 식재료 조회 응답: {}", response);

		return ResponseEntity.ok(response);
	}

	@PostMapping()
	@Operation(
		summary = "식재료 입고",
		description = "새로운 식재료를 입고합니다.<br>" +
			"해당 구성원 ID에 매칭되는 구성원이 없는 경우 MemberNotFoundException이 발생합니다.<br>" +
			"입고 처리 시 시스템에 자동으로 입출고 로그가 기록됩니다. 로그에는 입출고 일시, 담당자, 식재료 이름, 입출고 형태가 포함됩니다.<br>" +
			"입고 요청 후 백그라운드에서 LLM API를 비동기적으로 호출하여 식재료에 입고 이벤트를 처리합니다.<br><br>" +
			"응답으로는 201 Created 상태 코드가 반환됩니다."
	)
	@ApiResponses(value = {
		@ApiResponse(responseCode = "201", description = "식재료 입고 성공"),
		@ApiResponse(responseCode = "404", description = "구성원을 찾을 수 없음",
			content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
	})
	public ResponseEntity<Void> inboundIngredients(@Valid @RequestBody InboundIngredientsRequest request) {
		log.info("[Controller - POST /api/ingredients] 식재료 입고 요청: request={}", request);

		ingredientService.inboundIngredients(request);

		log.debug("[Controller] 식재료 입고 성공");

		return ResponseEntity.status(HttpStatus.CREATED).build();
	}

	@DeleteMapping()
	@Operation(
		summary = "식재료 출고",
		description = "식재료를 출고합니다.<br>" +
			"해당 구성원 ID에 매칭되는 구성원이 없는 경우 MemberNotFoundException이 발생합니다.<br>" +
			"출고 요청 데이터가 1개인 경우 LLM API를 비동기적으로 호출하여 출고 이벤트를 처리합니다.<br>" +
			"출고 처리 시 시스템에 자동으로 입출고 로그가 기록됩니다. 로그에는 입출고 일시, 담당자, 식재료 이름, 입출고 형태가 포함됩니다.<br><br>" +
			"응답으로는 요청 데이터가 1개인 경우 200 Ok 상태 코드와 함께 LLM 맞춤 알림이 반환됩니다.<br>" +
			"요청 데이터가 여러 개인 경우 204 No Content 상태 코드가 반환됩니다."
	)
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "식재료 1개 출고 성공 및 LLM 맞춤 알람"),
		@ApiResponse(responseCode = "204", description = "식재료 여러개 출고 성공"),
		@ApiResponse(responseCode = "404", description = "구성원을 찾을 수 없음",
			content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
	})
	public ResponseEntity<String> outboundIngredients(@Valid @RequestBody OutboundIngredientsRequest request) {
		log.info("[Controller - DELETE /api/ingredients] 식재료 출고 요청: request={}", request);

		String result = ingredientService.outboundIngredients(request);

		log.debug("[Controller] 식재료 출고 성공");

		return result == null ?
			ResponseEntity.status(HttpStatus.NO_CONTENT).build() :
			ResponseEntity.ok(result);
	}
}
