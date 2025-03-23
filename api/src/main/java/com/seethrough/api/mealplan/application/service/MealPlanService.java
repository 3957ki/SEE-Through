package com.seethrough.api.mealplan.application.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.seethrough.api.mealplan.application.mapper.MealPlanDtoMapper;
import com.seethrough.api.mealplan.domain.MealPlan;
import com.seethrough.api.mealplan.domain.MealPlanRepository;
import com.seethrough.api.mealplan.exception.MealPlanNotFoundException;
import com.seethrough.api.mealplan.presentation.dto.response.MealPlanDetailResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MealPlanService {

	private final MealPlanRepository mealPlanRepository;
	private final MealPlanDtoMapper mealPlanDtoMapper;

	public MealPlanDetailResponse getMealPlanDetail(String mealPlanId) {
		log.debug("[Service] getMemberDetail 호출");

		UUID mealPlanIdObj = UUID.fromString(mealPlanId);

		MealPlan mealPlan = findMealPlan(mealPlanIdObj);

		return mealPlanDtoMapper.toDetailResponse(mealPlan);
	}

	private MealPlan findMealPlan(UUID mealPlanIdObj) {
		return mealPlanRepository.findByMealPlanId(mealPlanIdObj)
			.orElseThrow(() ->
				new MealPlanNotFoundException("식단을 찾을 수 없습니다.")
			);
	}
}
