package com.seethrough.api.meal.application.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.github.f4b6a3.uuid.UuidCreator;
import com.seethrough.api.meal.application.mapper.DailyMealDtoMapper;
import com.seethrough.api.meal.application.mapper.MealDtoMapper;
import com.seethrough.api.meal.domain.DailyMeal;
import com.seethrough.api.meal.domain.Meal;
import com.seethrough.api.meal.domain.MealRepository;
import com.seethrough.api.meal.domain.ServingTime;
import com.seethrough.api.meal.exception.MealNotFoundException;
import com.seethrough.api.meal.infrastructure.external.llm.LlmApiMealService;
import com.seethrough.api.meal.infrastructure.external.llm.dto.request.ScheduleMealListRequest;
import com.seethrough.api.meal.infrastructure.external.llm.dto.request.ScheduleMealRequest;
import com.seethrough.api.meal.presentation.dto.response.DailyMealResponse;
import com.seethrough.api.meal.presentation.dto.response.MealDetailResponse;
import com.seethrough.api.member.application.service.MemberService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MealService {

	private final MealRepository mealRepository;
	private final DailyMealDtoMapper dailyMealDtoMapper;
	private final MemberService memberService;
	private final LlmApiMealService llmApiMealService;
	private final MealDtoMapper mealDtoMapper;

	public DailyMealResponse getDailyMeal(String memberId, LocalDate servingDate) {
		log.debug("[Service] getDailyMeal 호출");

		UUID memberIdObj = memberService.checkMemberExists(memberId);

		DailyMeal dailyMeal = findDailyMeal(memberIdObj, servingDate);

		return dailyMealDtoMapper.toDailyResponse(dailyMeal);
	}

	@Transactional
	public void createMeals(String memberId) {
		log.debug("[Service] createMeals 호출");

		UUID memberIdObj = memberService.checkMemberExists(memberId);

		LocalDate today = LocalDate.now();
		LocalDate endDate = today.plusDays(6);

		List<DailyMeal> dailyMealList = findDailyMeals(memberIdObj, today, endDate);

		List<LocalDate> missingDateList = findMissingDates(dailyMealList, today, endDate);

		if (!missingDateList.isEmpty()) {
			saveMeals(memberIdObj, missingDateList);
		}
	}

	@Transactional
	public MealDetailResponse refreshMeal(String mealId) {
		log.debug("[Service] refreshMeal 호출");

		UUID mealIdObj = UUID.fromString(mealId);

		Meal meal = findMeal(mealIdObj);

		Meal newMeal = createMeal(mealIdObj, meal.getMemberId(), meal.getServingDate(), meal.getServingTime());

		meal.update(newMeal.getMenu(), newMeal.getReason());

		return mealDtoMapper.toDetailResponse(meal);
	}

	private Meal findMeal(UUID mealIdObj) {
		log.debug("[Service] findMeal 호출");

		return mealRepository.findByMealId(mealIdObj)
			.orElseThrow(() ->
				new MealNotFoundException("식사를 찾을 수 없습니다.")
			);
	}

	private DailyMeal findDailyMeal(UUID memberIdObj, LocalDate servingDate) {
		log.debug("[Service] findDailyMeal 호출");

		List<Meal> meals = mealRepository.findMealsByMemberIdAndServingDate(memberIdObj, servingDate);

		return DailyMeal.createDailyMealFrom(meals);
	}

	private List<DailyMeal> findDailyMeals(UUID memberIdObj, LocalDate startDate, LocalDate endDate) {
		log.debug("[Service] findDailyMeals 호출");

		List<Meal> meals = mealRepository.findMealsByMemberIdAndServingDateBetweenOrderByDateServingTime(memberIdObj, startDate, endDate);

		return DailyMeal.createDailyMealsFrom(meals);
	}

	private List<LocalDate> findMissingDates(List<DailyMeal> dailyMeals, LocalDate startDate, LocalDate endDate) {
		log.debug("[Service] findMissingDates 호출");

		Set<LocalDate> dailyMealServingDateList = dailyMeals.stream()
			.map(DailyMeal::getServingDate)
			.collect(Collectors.toSet());

		List<LocalDate> missingDateList = new ArrayList<>();

		for (LocalDate currentDate = startDate; !currentDate.isAfter(endDate); currentDate = currentDate.plusDays(1)) {
			if (dailyMealServingDateList.contains(currentDate))
				continue;

			missingDateList.add(currentDate);
		}

		return missingDateList;
	}

	private void saveMeals(UUID memberIdObj, List<LocalDate> dateList) {
		log.debug("[Service] saveMeals 호출");

		List<Meal> meals = createMeals(memberIdObj, dateList);

		mealRepository.saveAll(meals);
	}

	private Meal createMeal(UUID mealIdObj, UUID memberIdObj, LocalDate servingDate, ServingTime servingTime) {
		ScheduleMealListRequest request = ScheduleMealListRequest.builder()
			.memberId(memberIdObj.toString())
			.schedules(
				List.of(ScheduleMealRequest.builder()
					.mealId(mealIdObj.toString())
					.servingDate(servingDate)
					.servingTime(servingTime.getName())
					.build()))
			.build();

		return llmApiMealService.createMealList(request)
			.getSchedules()
			.stream()
			.map(schedule -> Meal.builder()
				.mealId(mealIdObj)
				.memberId(memberIdObj)
				.servingDate(servingDate)
				.servingTime(servingTime)
				.menu(schedule.getMenu())
				.reason(schedule.getReason())
				.build())
			.findFirst()
			.orElse(null);
	}

	// TODO: 5일에 한 번씩 요청 보내도록 수정
	private List<Meal> createMeals(UUID memberIdObj, List<LocalDate> dateList) {
		Map<UUID, ScheduleMealRequest> requestMap = new HashMap<>();

		ScheduleMealListRequest request = ScheduleMealListRequest.builder()
			.memberId(memberIdObj.toString())
			.schedules(
				dateList.stream()
					.flatMap(date -> Arrays.stream(ServingTime.values())
						.map(servingTime -> {
							UUID mealId = UuidCreator.getTimeOrderedEpoch();

							ScheduleMealRequest mealRequest = ScheduleMealRequest.builder()
								.mealId(mealId.toString())
								.servingDate(date)
								.servingTime(servingTime.getName())
								.build();

							requestMap.put(mealId, mealRequest);
							return mealRequest;
						})
					)
					.toList()
			)
			.build();

		return llmApiMealService.createMealList(request)
			.getSchedules()
			.stream()
			.map(schedule -> {
				UUID mealId = UUID.fromString(schedule.getMealId());
				ScheduleMealRequest mealRequest = requestMap.get(mealId);

				return Meal.builder()
					.mealId(mealId)
					.memberId(memberIdObj)
					.servingDate(mealRequest.getServingDate())
					.servingTime(ServingTime.fromName(mealRequest.getServingTime()))
					.menu(schedule.getMenu())
					.reason(schedule.getReason())
					.build();
			})
			.toList();
	}
}
