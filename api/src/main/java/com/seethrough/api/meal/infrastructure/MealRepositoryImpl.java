package com.seethrough.api.meal.infrastructure;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import com.seethrough.api.meal.domain.Meal;
import com.seethrough.api.meal.domain.MealRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Repository
@RequiredArgsConstructor
public class MealRepositoryImpl implements MealRepository {

	private final MealJpaRepository mealJpaRepository;

	@Override
	public List<Meal> findMealsByMemberIdAndDate(UUID memberId, LocalDate servingDate) {
		log.debug("[Repository] findMealsByMemberIdAndDate 호출: memberId={}, servingDate={}", memberId, servingDate);

		List<Meal> entities = mealJpaRepository.findByMemberIdAndServingDate(memberId, servingDate);

		if (!entities.isEmpty()) {
			log.debug("[Repository] 첫 번째 식단 상세 정보:{}", entities.get(0));
		}

		return entities;
	}
}
