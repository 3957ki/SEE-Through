import type { MealPlanResponse } from "@/interfaces/Meal";
import { APIServerFetcher } from "@/lib/fetchers";

export async function getTodayMeals(memberId: string): Promise<MealPlanResponse> {
  const response = await APIServerFetcher.post<MealPlanResponse>(`/meals/${memberId}`, {});
  return response.data;
}
