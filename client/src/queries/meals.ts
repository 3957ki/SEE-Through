import { getMealsByDate, getTodayMeals, refreshMeal } from "@/api/meals";
import type { MealPlanResponse } from "@/interfaces/Meal";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export const meals = createQueryKeys("meals", {
  byDate: (memberId: string, date: Date) => ({
    queryKey: [memberId, date],
    queryFn: () => getMealsByDate(memberId, date),
  }),
  today: (memberId: string) => ({
    queryKey: [memberId, "today"],
    queryFn: () => getTodayMeals(memberId),
  }),
  creationAttempted: (memberId: string) => ({
    queryKey: [memberId, "creationAttempted"],
  }),
});

// Fallback empty meal response to avoid null checks
const emptyMealResponse: MealPlanResponse = {
  breakfast: {
    meal_id: "empty-breakfast",
    member_id: "",
    serving_date: "",
    serving_time: "아침",
    menu: ["식단을 생성해 주세요"],
    reason: "",
  },
  lunch: {
    meal_id: "empty-lunch",
    member_id: "",
    serving_date: "",
    serving_time: "점심",
    menu: ["식단을 생성해 주세요"],
    reason: "",
  },
  dinner: {
    meal_id: "empty-dinner",
    member_id: "",
    serving_date: "",
    serving_time: "저녁",
    menu: ["식단을 생성해 주세요"],
    reason: "",
  },
};

export function useMemberMeals(memberId?: string) {
  const queryClient = useQueryClient();
  const creationAttemptedRef = useRef(false);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Generate stable date strings for keys
  const todayString = today.toISOString().split("T")[0];
  const tomorrowString = tomorrow.toISOString().split("T")[0];

  // Use a global creation state key that persists across components and page switches
  const globalCreationKey = "meals_creation_in_progress";
  const creationInProgress = queryClient.getQueryData([globalCreationKey]) === true;

  // Check if we've already attempted creation for this member
  const creationAttempted =
    queryClient.getQueryData(meals.creationAttempted(memberId || "").queryKey) === true ||
    creationAttemptedRef.current;

  // Fetch today's meals
  const todayResult = useQuery({
    queryKey: [memberId || "", todayString],
    queryFn: async () => {
      if (!memberId) return emptyMealResponse;
      console.log("Fetching meals for member:", memberId, "date:", todayString);
      try {
        const result = await getMealsByDate(memberId, today);
        console.log(`Meals for ${todayString} fetched successfully`);
        return result;
      } catch (error: any) {
        // If 404, don't throw and return empty meals instead
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!memberId,
    retry: (failureCount, error: any) => {
      if (error.response?.status === 404) return false;
      return failureCount < 2;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Fetch tomorrow's meals
  const tomorrowResult = useQuery({
    queryKey: [memberId || "", tomorrowString],
    queryFn: async () => {
      if (!memberId) return emptyMealResponse;
      console.log("Fetching meals for member:", memberId, "date:", tomorrowString);
      try {
        const result = await getMealsByDate(memberId, tomorrow);
        console.log(`Meals for ${tomorrowString} fetched successfully`);
        return result;
      } catch (error: any) {
        // If 404, don't throw and return empty meals instead
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!memberId,
    retry: (failureCount, error: any) => {
      if (error.response?.status === 404) return false;
      return failureCount < 2;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Mutation for creating meals
  const createMealsMutation = useMutation({
    mutationFn: async () => {
      if (!memberId) return emptyMealResponse;

      // Set global creation in progress flag
      queryClient.setQueryData([globalCreationKey], true);

      creationAttemptedRef.current = true;
      queryClient.setQueryData(meals.creationAttempted(memberId).queryKey, true);

      console.log("Creating meals for member:", memberId);
      try {
        const result = await getTodayMeals(memberId);
        console.log("Meals created successfully");
        return result;
      } catch (error: any) {
        console.error("Error creating meals:", error);
        return emptyMealResponse; // Return empty meals as fallback
      } finally {
        // Clear global creation in progress flag
        queryClient.setQueryData([globalCreationKey], false);
      }
    },
    onSuccess: (data) => {
      if (memberId) {
        // Store the data with our custom keys
        queryClient.setQueryData([memberId, todayString], data);

        // Invalidate tomorrow's query to refetch it once
        queryClient.invalidateQueries({
          queryKey: [memberId, tomorrowString],
        });
      }
    },
  });

  // Mutation for refreshing a meal
  const refreshMealMutation = useMutation({
    mutationFn: (mealId: string) => refreshMeal(mealId),
    onSuccess: (refreshedMeal) => {
      if (!memberId) return;

      // Update both date queries if needed
      [
        [memberId, todayString],
        [memberId, tomorrowString],
      ].forEach((queryKey) => {
        queryClient.setQueryData(queryKey, (oldData: MealPlanResponse | undefined) => {
          if (!oldData) return oldData;

          const updatedMeals = { ...oldData };
          if (refreshedMeal.serving_time === "아침") {
            updatedMeals.breakfast = refreshedMeal;
          } else if (refreshedMeal.serving_time === "점심") {
            updatedMeals.lunch = refreshedMeal;
          } else if (refreshedMeal.serving_time === "저녁") {
            updatedMeals.dinner = refreshedMeal;
          }
          return updatedMeals;
        });
      });
    },
  });

  // Determine if there is an error (excluding 404s which are handled specially)
  const isError =
    (todayResult.isError && (todayResult.error as any)?.response?.status !== 404) ||
    (tomorrowResult.isError && (tomorrowResult.error as any)?.response?.status !== 404);

  // Determine if meals need to be created by the user
  const needsMealCreation =
    !!memberId &&
    ((todayResult.isSuccess && !todayResult.data) ||
      (todayResult.isError && (todayResult.error as any)?.response?.status === 404));

  // Determine if we're in a loading state
  // Use the global creation flag for cross-page persistence
  const isLoading =
    todayResult.isLoading ||
    tomorrowResult.isLoading ||
    createMealsMutation.isPending ||
    creationInProgress;

  // Always provide meal data, even if it's fallbacks
  const mealsToday = todayResult.data || emptyMealResponse;
  const mealsTomorrow = tomorrowResult.data || emptyMealResponse;

  // Debug info, but limit it to avoid console spam
  useEffect(() => {
    if (memberId && (todayResult.status === "success" || creationInProgress)) {
      console.log("Meals state:", {
        today: todayResult.data ? "has data" : "no data",
        tomorrow: tomorrowResult.data ? "has data" : "no data",
        creationAttempted,
        creationInProgress,
        isLoading,
        needsMealCreation,
      });
    }
  }, [
    memberId,
    todayResult.status,
    todayResult.data,
    tomorrowResult.data,
    creationAttempted,
    creationInProgress,
    isLoading,
    needsMealCreation,
  ]);

  return {
    mealsToday,
    mealsTomorrow,
    isLoading,
    isError,
    mealError: needsMealCreation,
    createMeals: () => {
      // Set global creation in progress flag before mutation starts
      queryClient.setQueryData([globalCreationKey], true);

      // Mark as attempted immediately to prevent UI glitches
      creationAttemptedRef.current = true;
      if (memberId) {
        queryClient.setQueryData(meals.creationAttempted(memberId).queryKey, true);
        // Also disable any ongoing queries
        queryClient.cancelQueries({ queryKey: [memberId, todayString] });
        queryClient.cancelQueries({ queryKey: [memberId, tomorrowString] });
      }
      return createMealsMutation.mutate();
    },
    handleRefresh: (mealId: string) => refreshMealMutation.mutate(mealId),
    refreshingMealId: refreshMealMutation.isPending ? refreshMealMutation.variables : null,
    loading: createMealsMutation.isPending || creationInProgress,
  };
}
