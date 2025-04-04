import { getIngredients } from "@/api/ingredients";
import { getMealsByDate, refreshMeal } from "@/api/meals";
import { getMember, getMembers } from "@/api/members";
import { useCurrentMemberId } from "@/contexts/CurrentMemberIdContext";
import type { MealPlanResponse } from "@/interfaces/Meal";
import Member, { DetailedMember } from "@/interfaces/Member";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export const members = createQueryKeys("members", {
  all: {
    queryKey: null,
  },
  list: {
    queryKey: null,
    queryFn: () => getMembers(),
  },
  current: {
    queryKey: null,
    queryFn: () => null, // This will be overridden by the actual query
    contextQueries: {
      detail: (memberId: string) => ({
        queryKey: [memberId],
        queryFn: () => getMember(memberId),
        contextQueries: {
          meals: (date: Date) => ({
            queryKey: [date],
            queryFn: () => getMealsByDate(memberId, date),
          }),
          ingredients: {
            queryKey: null,
            queryFn: () => getIngredients(memberId),
          },
        },
      }),
    },
  },
});

export function useMembers() {
  const { data } = useQuery(members.list);

  return { data: data as Member[] };
}

export function useCurrentMember() {
  const { currentMemberId } = useCurrentMemberId();

  const { data, isLoading } = useQuery({
    queryKey: currentMemberId ? members.current._ctx.detail(currentMemberId).queryKey : [],
    queryFn: () => getMember(currentMemberId!),
    enabled: !!currentMemberId,
  });

  return {
    data: data as DetailedMember | null,
    isLoading: isLoading || !currentMemberId,
  };
}

export function useCurrentMemberMealsOf(date: Date) {
  const { currentMemberId } = useCurrentMemberId();
  const queryClient = useQueryClient();

  // Check the global creation flag we created in meals.ts
  const globalCreationKey = "meals_creation_in_progress";
  const creationInProgress = queryClient.getQueryData([globalCreationKey]) === true;

  if (!currentMemberId || currentMemberId === "") {
    throw new Error("Current member ID is not set or is empty");
  }

  const {
    data,
    isLoading: queryLoading,
    isError,
    error,
  } = useQuery(members.current._ctx.detail(currentMemberId)._ctx.meals(date));

  // Include the global creation flag in the loading state
  const isLoading = queryLoading || creationInProgress;

  return {
    data: data as MealPlanResponse,
    isLoading,
    isError,
    error,
  };
}

export function useMutateRefreshMeal(date: Date) {
  const queryClient = useQueryClient();
  const { currentMemberId } = useCurrentMemberId();

  if (!currentMemberId || currentMemberId === "") {
    throw new Error("Current member ID is not set or is empty");
  }

  // Generate consistent date string key
  const dateString = date.toISOString().split("T")[0];

  return useMutation({
    mutationFn: (mealId: string) => refreshMeal(mealId),
    onSuccess: (refreshedMeal) => {
      // Get the current cached meals - update both query systems

      // Update the members context query data
      queryClient.setQueryData(
        members.current._ctx.detail(currentMemberId)._ctx.meals(date).queryKey,
        (oldData: MealPlanResponse | undefined) => {
          if (!oldData) return oldData;

          // Create a copy of the old data
          const newData = { ...oldData };

          // Update the specific meal that was refreshed based on serving_time
          if (refreshedMeal.serving_time === "아침") {
            newData.breakfast = refreshedMeal;
          } else if (refreshedMeal.serving_time === "점심") {
            newData.lunch = refreshedMeal;
          } else if (refreshedMeal.serving_time === "저녁") {
            newData.dinner = refreshedMeal;
          }

          return newData;
        }
      );

      // Also update the direct key format used in meals.ts
      queryClient.setQueryData(
        [currentMemberId, dateString],
        (oldData: MealPlanResponse | undefined) => {
          if (!oldData) return oldData;

          // Create a copy of the old data
          const newData = { ...oldData };

          // Update the specific meal that was refreshed based on serving_time
          if (refreshedMeal.serving_time === "아침") {
            newData.breakfast = refreshedMeal;
          } else if (refreshedMeal.serving_time === "점심") {
            newData.lunch = refreshedMeal;
          } else if (refreshedMeal.serving_time === "저녁") {
            newData.dinner = refreshedMeal;
          }

          return newData;
        }
      );
    },
  });
}

export function useCurrentMemberIngredients() {
  const { currentMemberId } = useCurrentMemberId();

  // Call hooks unconditionally
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: members.current._ctx.detail(currentMemberId || "")._ctx.ingredients.queryKey,
      queryFn: async ({ pageParam = 1 }) => {
        // Throw an error early if there's no member ID
        if (!currentMemberId || currentMemberId === "") {
          throw new Error("Current member ID is not set or is empty");
        }

        try {
          const result = await getIngredients(currentMemberId, pageParam);
          return result;
        } catch (err) {
          console.error("Error fetching ingredients:", err);
          throw err;
        }
      },
      getNextPageParam: (lastPage) => {
        // Safely handle possible undefined values
        if (!lastPage || !lastPage.sliceInfo) return undefined;
        return lastPage.sliceInfo.hasNext ? lastPage.sliceInfo.currentPage + 1 : undefined;
      },
      initialPageParam: 1,
      // Disable the query if there's no member ID
      enabled: !!currentMemberId && currentMemberId !== "",
    });

  // Process the pages into a flat array of ingredients
  const ingredients = data?.pages.flatMap((page) => page?.content || []) || [];

  // Stable function reference for loadMoreIngredients (called unconditionally)
  const loadMoreIngredients = useCallback(() => {
    if (!currentMemberId || currentMemberId === "") return;
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, currentMemberId]);

  // Return appropriate data based on whether we have a member ID
  if (!currentMemberId || currentMemberId === "") {
    return {
      ingredients: [],
      isLoading: false,
      isError: true,
      error: new Error("Current member ID is not set or is empty"),
      loadMoreIngredients,
      hasMore: false,
      isFetchingNextPage: false,
    };
  }

  return {
    ingredients,
    isLoading,
    isError,
    error,
    loadMoreIngredients,
    hasMore: !!hasNextPage,
    isFetchingNextPage,
  };
}
