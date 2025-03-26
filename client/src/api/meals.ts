import type { Meal, MealPlanResponse } from "@/interfaces/Meal";
import { APIServerFetcher } from "@/lib/fetchers";
import { format } from "date-fns";

export async function getTodayMeals(memberId: string): Promise<MealPlanResponse> {
  const response = await APIServerFetcher.post<MealPlanResponse>(`/meals/${memberId}`, {});
  return response.data;
}

export async function getMealsByDate(memberId: string, date: Date): Promise<MealPlanResponse> {
  const servingDate = format(date, "yyyy-MM-dd");
  const response = await APIServerFetcher.get<MealPlanResponse>(
    `/meals?memberId=${memberId}&servingDate=${servingDate}`
  );
  return response.data;
}

export async function refreshMeal(mealId: string): Promise<Meal> {
  const response = await APIServerFetcher.patch<Meal>(`/meals/refresh?mealId=${mealId}`);
  return response.data;
}

export async function addPreferredFood(memberId: string, food: string): Promise<void> {
  await APIServerFetcher.post(`/api/members/${memberId}/preferred-foods`, {
    preferred_foods: [food],
  });
}

export async function addDislikedFood(memberId: string, food: string): Promise<void> {
  await APIServerFetcher.post(`/api/members/${memberId}/disliked-foods`, {
    disliked_foods: [food],
  });
}
