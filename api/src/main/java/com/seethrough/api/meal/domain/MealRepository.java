package com.seethrough.api.meal.domain;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface MealRepository {

	List<Meal> findMealsByMemberIdAndServingDate(UUID memberId, LocalDate servingDate);

	List<Meal> findMealsByMemberIdAndServingDateBetweenOrderByDateServingTime(UUID memberId, LocalDate startDate, LocalDate endDate);

	void saveAll(List<Meal> meals);
}
