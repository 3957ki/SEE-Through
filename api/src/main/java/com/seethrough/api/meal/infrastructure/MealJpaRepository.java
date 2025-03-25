package com.seethrough.api.meal.infrastructure;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seethrough.api.meal.domain.Meal;

public interface MealJpaRepository extends JpaRepository<Meal, UUID> {

	List<Meal> findByMemberIdAndServingDate(UUID memberId, LocalDate servingDate);

	List<Meal> findMealsByMemberIdAndServingDateBetweenOrderByServingDateAscServingTimeAsc(UUID memberId, LocalDate startDate, LocalDate endDate);
}
