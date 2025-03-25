package com.seethrough.api.meal.domain;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.seethrough.api.meal.exception.InvalidDailyMealException;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
public class DailyMeal {
	public static final int DAILY_MEAL_SIZE = 3;

	private final LocalDate servingDate;
	private final Meal breakfast;
	private final Meal lunch;
	private final Meal dinner;

	@Builder
	private DailyMeal(LocalDate servingDate, Meal breakfast, Meal lunch, Meal dinner) {
		validate(breakfast, lunch, dinner);

		this.servingDate = servingDate;
		this.breakfast = breakfast;
		this.lunch = lunch;
		this.dinner = dinner;
	}

	public static List<DailyMeal> createDailyMealsFrom(List<Meal> mealsList) {
		Map<LocalDate, List<Meal>> mealsByDate = mealsList.stream()
			.collect(Collectors.groupingBy(Meal::getServingDate));

		return mealsByDate.values()
			.stream()
			.map(DailyMeal::createDailyMealFrom)
			.toList();
	}

	public static DailyMeal createDailyMealFrom(List<Meal> meals) {
		Map<ServingTime, Meal> mealsByTime = meals.stream()
			.collect(Collectors.toMap(Meal::getServingTime, meal -> meal));

		validate(mealsByTime.size(), mealsByTime.get(ServingTime.BREAKFAST), mealsByTime.get(ServingTime.LUNCH), mealsByTime.get(ServingTime.DINNER));

		return DailyMeal.builder()
			.servingDate(mealsByTime.get(ServingTime.BREAKFAST).getServingDate())
			.breakfast(mealsByTime.get(ServingTime.BREAKFAST))
			.lunch(mealsByTime.get(ServingTime.LUNCH))
			.dinner(mealsByTime.get(ServingTime.DINNER))
			.build();
	}

	private static void validate(int size, Meal breakfast, Meal lunch, Meal dinner) {
		if (size != DAILY_MEAL_SIZE)
			throw new InvalidDailyMealException("하루 식단을 구성하기 위해서는 아침, 저녁, 저녁 식사가 모두 필요합니다.");

		validate(breakfast, lunch, dinner);
	}

	private static void validate(Meal breakfast, Meal lunch, Meal dinner) {
		if (breakfast == null || lunch == null || dinner == null) {
			throw new InvalidDailyMealException("하루 식단을 구성하기 위해서는 아침, 점심, 저녁 식사가 모두 필요합니다.");
		}

		if (!breakfast.getServingDate().equals(lunch.getServingDate()) || !lunch.getServingDate().equals(dinner.getServingDate())) {
			throw new InvalidDailyMealException("하루 식단의 아침, 점심, 저녁은 모두 동일한 날짜여야 합니다.");
		}
	}
}
