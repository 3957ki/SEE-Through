package com.seethrough.api.meal.infrastructure;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import com.seethrough.api.meal.domain.Meal;
import com.seethrough.api.meal.domain.MealRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Repository
@RequiredArgsConstructor
public class MealRepositoryImpl implements MealRepository {

	@PersistenceContext
	private final EntityManager entityManager;
	private final MealJpaRepository mealJpaRepository;

	@Override
	public List<Meal> findMealsByMemberIdAndServingDate(UUID memberId, LocalDate servingDate) {
		log.debug("[Repository] findMealsByMemberIdAndDate 호출: memberId={}, servingDate={}", memberId, servingDate);

		List<Meal> entities = mealJpaRepository.findByMemberIdAndServingDate(memberId, servingDate);

		if (!entities.isEmpty()) {
			log.debug("[Repository] 첫 번째 식단 상세 정보:{}", entities.get(0));
		}

		return entities;
	}

	@Override
	public List<Meal> findMealsByMemberIdAndServingDateBetweenOrderByDateServingTime(UUID memberId, LocalDate startDate, LocalDate endDate) {
		log.debug("[Repository] findMealsByMemberIdAndServingDateBetweenOrderByDateServingTime 호출: memberId={}, startDate={}, endDate{}",
			memberId, startDate, endDate);

		List<Meal> entities = mealJpaRepository.findMealsByMemberIdAndServingDateBetweenOrderByServingDateAscServingTimeAsc(
			memberId, startDate, endDate);

		if (!entities.isEmpty()) {
			log.debug("[Repository] 첫 번째 식단 상세 정보:{}", entities.get(0));
		}

		return entities;
	}

	@Override
	public void saveAll(List<Meal> meals) {
		log.debug("[Repository] saveAll 호출: {} 개의 로그", meals.size());

		meals.forEach(entityManager::persist);
	}

	@Override
	public Optional<Meal> findByMealId(UUID mealIdObj) {
		log.debug("[Repository] findByMealId 호출");

		Optional<Meal> entity = mealJpaRepository.findByMealId(mealIdObj);

		log.debug("[Repository] 조회된 식사: {}", entity);

		return entity;
	}
}
