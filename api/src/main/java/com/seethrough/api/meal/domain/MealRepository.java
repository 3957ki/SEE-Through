package com.seethrough.api.meal.domain;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface MealRepository {

	List<Meal> findMealsByMemberIdAndDate(UUID memberId, LocalDate servingDate);
}
