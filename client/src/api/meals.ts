import type { Meal, MealPlanResponse } from "@/interfaces/Meal";
import { APIServerFetcher } from "@/lib/fetchers";
import { format } from "date-fns";

export async function getTodayMeals(memberId: string): Promise<MealPlanResponse> {
  console.log(`Creating meals for member: ${memberId}`);
  try {
    const response = await APIServerFetcher.post<MealPlanResponse>(`/meals/${memberId}`, {});
    console.log("Meals created successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating meals:", error.response?.status, error.message);
    throw error;
  }
}

export async function getMealsByDate(memberId: string, date: Date): Promise<MealPlanResponse> {
  const servingDate = format(date, "yyyy-MM-dd");
  console.log(`Fetching meals for member: ${memberId}, date: ${servingDate}`);
  try {
    const response = await APIServerFetcher.get<MealPlanResponse>(
      `/meals?memberId=${memberId}&servingDate=${servingDate}`
    );
    console.log(`Meals for ${servingDate} fetched successfully:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error fetching meals for ${servingDate}:`,
      error.response?.status,
      error.message
    );
    throw error;
  }
}

export async function refreshMeal(mealId: string): Promise<Meal> {
  console.log(`Refreshing meal: ${mealId}`);
  try {
    const response = await APIServerFetcher.patch<Meal>(`/meals/refresh?mealId=${mealId}`);
    console.log("Meal refreshed successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error refreshing meal:", error.response?.status, error.message);
    throw error;
  }
}
