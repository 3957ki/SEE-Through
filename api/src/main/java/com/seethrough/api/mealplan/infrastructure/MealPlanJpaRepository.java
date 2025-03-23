package com.seethrough.api.mealplan.infrastructure;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seethrough.api.mealplan.domain.MealPlan;

public interface MealPlanJpaRepository extends JpaRepository<MealPlan, UUID> {

	Optional<MealPlan> findByMealPlanId(UUID mealPlanIdObj);
}
