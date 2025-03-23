package com.seethrough.api.mealplan.presentation;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.seethrough.api.common.exception.ErrorResponse;
import com.seethrough.api.mealplan.application.service.MealPlanService;
import com.seethrough.api.mealplan.presentation.dto.response.MealPlanDetailResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/meal-plans")
@Tag(name = "식단 관리", description = "식단 정보를 관리하는 API")
public class MealPlanController {

	private final MealPlanService mealPlanService;

	@GetMapping("/{mealPlanId}")
	@Operation(
		summary = "식단 조회",
		description = "UUID로 작성된 식단의 키를 활용해 시스템에 등록된 특정 식단을 반환합니다.<br>" +
			"해당 ID에 매칭되는 식단이 없는 경우 MealPlanNotFoundException이 발생합니다.<br><br>" +
			"응답으로는 식단의 기본 정보(ID, 이름, 설명, 식사 리스트 등)가 포함됩니다."
	)
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "식단 조회 성공"),
		@ApiResponse(responseCode = "404", description = "식단을 찾을 수 없음",
			content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
	})
	public ResponseEntity<MealPlanDetailResponse> getMealPlanDetail(@PathVariable String mealPlanId) {
		log.info("[Controller - GET /api/meal-plans/{mealPlanId}] 식단 조회 요청: mealPlanId={}", mealPlanId);

		MealPlanDetailResponse response = mealPlanService.getMealPlanDetail(mealPlanId);

		log.debug("[Controller] 식단 조회 응답: {}", response);

		return ResponseEntity.ok(response);
	}
}