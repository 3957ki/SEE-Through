package com.seethrough.api.ingredient.presentation;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.seethrough.api.common.pagination.SliceResponseDto;
import com.seethrough.api.ingredient.application.service.IngredientLogService;
import com.seethrough.api.ingredient.presentation.dto.response.IngredientLogListResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ingredient-logs")
@Tag(name = "입출고 로그 관리", description = "입출고 로그를 관리하는 API")
public class IngredientLogController {

	private final IngredientLogService ingredientLogService;

	@GetMapping()
	@Operation(
		summary = "입출고 로그 목록 조회",
		description = "모든 입출고 로그의 목록을 페이지네이션을 적용하여 반환합니다.<br>" +
			"기본적으로 생성일 기준 오름차순으로 정렬되며, 페이지당 최대 100명의 식재료 정보를 제공합니다.<br>" +
			"정렬 기준과 방향을 변경할 수 있으며, 추가 페이지 존재 여부를 함께 반환합니다."
	)
	public ResponseEntity<SliceResponseDto<IngredientLogListResponse>> getIngredientLogList(
		@Parameter(description = "조회할 페이지 번호 (1부터 시작)")
		@RequestParam(defaultValue = "1") Integer page,

		@Parameter(description = "페이지당 항목 수 (최대 100)")
		@RequestParam(defaultValue = "10") Integer size,

		@Parameter(description = "정렬 기준 필드 (createdAt, ingredientName 등)")
		@RequestParam(defaultValue = "createdAt") String sortBy,

		@Parameter(description = "정렬 방향 (ASC: 오름차순, DESC: 내림차순)")
		@RequestParam(defaultValue = "DESC") String sortDirection
	) {
		log.info("[Controller - GET /api/ingredient-logs] 입출고 로그 목록 조회 요청: page={}, size={}, sortBy={}, sortDirection={}", page, size, sortBy,
			sortDirection);

		SliceResponseDto<IngredientLogListResponse> responseList = ingredientLogService.getIngredientLogList(page, size, sortBy, sortDirection);

		if (!responseList.getContent().isEmpty()) {
			log.debug("[Controller] 첫 번째 응답 상세 정보:{}", responseList.getContent().get(0));
		}

		log.info("[Controller] 식재료 목록 조회 응답: 총 {}개 항목, 현재 페이지: {}, 마지막 페이지 여부: {}",
			responseList.getContent().size(),
			responseList.getSliceInfo().getCurrentPage(),
			responseList.getSliceInfo().getHasNext());

		return ResponseEntity.ok(responseList);
	}

}
