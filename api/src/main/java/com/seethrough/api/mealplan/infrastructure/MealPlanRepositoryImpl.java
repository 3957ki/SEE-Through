package com.seethrough.api.mealplan.infrastructure;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import com.seethrough.api.mealplan.domain.MealPlan;
import com.seethrough.api.mealplan.domain.MealPlanRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Repository
@RequiredArgsConstructor
public class MealPlanRepositoryImpl implements MealPlanRepository {

	private final MealPlanJpaRepository mealPlanJpaRepository;

	@Override
	public Optional<MealPlan> findByMealPlanId(UUID mealPlanIdObj) {
		log.debug("[Repository] findByMealPlanId 호출");

		Optional<MealPlan> entity = mealPlanJpaRepository.findByMealPlanId(mealPlanIdObj);

		log.debug("[Repository] 조회된 식단: {}", entity);

		return entity;
	}
}
