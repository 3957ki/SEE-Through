import { getMealsByDate, getTodayMeals } from "@/api/meals";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const meals = createQueryKeys("meals", {
  today: (memberId: string) => ({
    queryKey: [memberId],
    queryFn: () => getTodayMeals(memberId),
  }),
  byDate: (memberId: string, date: Date) => ({
    queryKey: [memberId, date],
    queryFn: () => getMealsByDate(memberId, date),
  }),
});
