package com.seethrough.api.meal.presentation;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.seethrough.api.common.exception.ErrorResponse;
import com.seethrough.api.meal.application.service.MealService;
import com.seethrough.api.meal.presentation.dto.response.DailyMealResponse;

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
@RequestMapping("/api/meals")
@Tag(name = "식단 관리", description = "식단 정보를 관리하는 API")
public class MealController {

	private final MealService mealService;

	@GetMapping()
	@Operation(
		summary = "특정 날짜 식단 조회",
		description = "UUID로 작성된 구성원의 키를 활용해 해당 구성원의 특정 날짜 식단을 반환합니다.<br>" +
			"해당 ID에 매칭되는 구성원이 없는 경우 MemberNotFoundException이 발생합니다.<br><br>" +
			"응답으로는 식단의 기본 정보(식단Id, 제공 날짜, 제공 시간, 메뉴, 선정 이유 등)가 포함됩니다."
	)
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "해당 날짜 식단 조회 성공"),
		@ApiResponse(responseCode = "404", description = "구성원을 찾을 수 없음",
			content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
	})
	public ResponseEntity<DailyMealResponse> getDailyMeal(
		@RequestParam String memberId,
		@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate servingDate
	) {
		log.info("[Controller - GET /api/meals?memberId={memberId}&date={date}] 특정 날짜 식단 조회 요청: memberId={}, servingDate={}", memberId, servingDate);

		DailyMealResponse response = mealService.getDailyMeal(memberId, servingDate);

		log.debug("[Controller] 특정 날짜 식단 조회 응답: {}", response);

		return ResponseEntity.ok(response);
	}
}