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
