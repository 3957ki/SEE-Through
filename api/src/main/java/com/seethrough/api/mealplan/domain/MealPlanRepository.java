package com.seethrough.api.mealplan.domain;

import java.util.Optional;
import java.util.UUID;

public interface MealPlanRepository {

	Optional<MealPlan> findByMealPlanId(UUID mealPlanIdObj);
}
