export interface Meal {
  meal_id: string;
  member_id: string;
  serving_date: string;
  serving_time: "아침" | "점심" | "저녁";
  menu: string[];
  reason: string;
}

export interface MealPlanResponse {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
}
