import { getIngredients } from "@/api/ingredients";
import { getMealsByDate, refreshMeal } from "@/api/meals";
import { getMember, getMembers } from "@/api/members";
import { useCurrentMemberId } from "@/contexts/CurrentMemberIdContext";
import type { MealPlanResponse } from "@/interfaces/Meal";
import Member, { DetailedMember } from "@/interfaces/Member";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const members = createQueryKeys("members", {
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

  if (!currentMemberId || currentMemberId === "") {
    throw new Error("Current member ID is not set or is empty");
  }

  const { data } = useQuery(members.current._ctx.detail(currentMemberId));

  return { data: data as DetailedMember };
}

export function useCurrentMemberMealsOf(date: Date) {
  const { currentMemberId } = useCurrentMemberId();

  if (!currentMemberId || currentMemberId === "") {
    throw new Error("Current member ID is not set or is empty");
  }

  const { data, isLoading, isError, error } = useQuery(
    members.current._ctx.detail(currentMemberId)._ctx.meals(date)
  );

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

  return useMutation({
    mutationFn: (mealId: string) => refreshMeal(mealId),
    onSuccess: (refreshedMeal) => {
      // Get the current cached meals
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
    },
  });
}

export function useCurrentMemberIngredients() {
  const { currentMemberId } = useCurrentMemberId();

  if (!currentMemberId || currentMemberId === "") {
    throw new Error("Current member ID is not set or is empty");
  }

  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: members.current._ctx.detail(currentMemberId)._ctx.ingredients.queryKey,
      queryFn: ({ pageParam = 1 }) => getIngredients(currentMemberId, pageParam),
      getNextPageParam: (lastPage) => {
        if (!lastPage.sliceInfo.hasNext) return undefined;
        return lastPage.sliceInfo.currentPage + 1;
      },
      initialPageParam: 1,
    });

  // Process the pages into a flat array of ingredients
  const ingredients = data?.pages.flatMap((page) => page.content) || [];

  // Function to load more ingredients
  const loadMoreIngredients = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

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
