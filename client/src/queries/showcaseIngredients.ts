import { deleteIngredient, getIngredient, insertIngredient } from "@/api/ingredients";
import { getLogs } from "@/api/logs";
import { Ingredient } from "@/interfaces/Ingredient";
import { logs } from "@/queries/logs";
import { useCurrentMember } from "@/queries/members";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";

export const showcaseIngredients = [
  {
    ingredient_id: "99999999-0000-0000-0000-000000000001",
    name: "두부",
    image_path: "https://see-through002.s3.ap-northeast-2.amazonaws.com/ingredient/tofu.png",
  },
  {
    ingredient_id: "99999999-0000-0000-0000-000000000002",
    name: "showcase2",
    image_path: "showcase2",
  },
  {
    ingredient_id: "99999999-0000-0000-0000-000000000003",
    name: "showcase3",
    image_path: "showcase3",
  },
  {
    ingredient_id: "99999999-0000-0000-0000-000000000004",
    name: "showcase4",
    image_path: "showcase4",
  },
  {
    ingredient_id: "99999999-0000-0000-0000-000000000005",
    name: "showcase5",
    image_path: "showcase5",
  },
];

export const showcaseIngredientsKeys = createQueryKeys("showcaseIngredients", {
  all: null,
  ingredient: (ingredientId: string) => ({
    queryKey: [ingredientId],
    queryFn: () => getIngredient(ingredientId),
  }),
});

export function useShowcaseIngredients() {
  const queries = useQueries({
    queries: showcaseIngredients.map((ingredient) => ({
      queryKey: showcaseIngredientsKeys.ingredient(ingredient.ingredient_id).queryKey,
      queryFn: () => getIngredient(ingredient.ingredient_id),
      retry: false,
    })),
  });

  const insideIngredients = showcaseIngredients.filter(
    (_, index) => queries[index].data !== null && queries[index].data !== undefined
  );

  const outsideIngredients = showcaseIngredients.filter(
    (_, index) => queries[index].data === null || queries[index].data === undefined
  );

  return {
    isLoading: queries.some((query) => query.isLoading),
    insideIngredients,
    outsideIngredients,
  };
}

export function useOptimisticIngredientUpdates() {
  const queryClient = useQueryClient();
  const { data: currentMember } = useCurrentMember();

  // Helper function to update logs for a specific member ID
  const updateLogsForMember = async (memberId?: string) => {
    try {
      const freshLogs = await getLogs(1, 10, memberId);

      // Get the existing infinite query data
      const existingData = queryClient.getQueryData(logs.all(10, memberId).queryKey);

      if (existingData) {
        // If there's existing data, update the first page
        queryClient.setQueryData(logs.all(10, memberId).queryKey, {
          ...existingData,
          pages: [freshLogs, ...(existingData as any).pages.slice(1)],
        });
      } else {
        // If no existing data, set as new infinite query data
        queryClient.setQueryData(logs.all(10, memberId).queryKey, {
          pages: [freshLogs],
          pageParams: [1],
        });
      }
    } catch (error) {
      console.error(
        `Failed to fetch updated logs for ${memberId ? "member " + memberId : "all users"}:`,
        error
      );
    }
  };

  const addIngredient = useMutation({
    mutationFn: async (ingredient: Ingredient) => {
      if (!currentMember) {
        throw new Error("No current member found");
      }

      // Make the actual API call to insert the ingredient, including showcase ingredients
      await insertIngredient(ingredient, currentMember.member_id);
      return ingredient;
    },
    onMutate: async (ingredient) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({
        queryKey: showcaseIngredientsKeys.ingredient(ingredient.ingredient_id).queryKey,
      });

      // Store previous value
      const previousValue = queryClient.getQueryData(
        showcaseIngredientsKeys.ingredient(ingredient.ingredient_id).queryKey
      );

      // Optimistically update the cache
      queryClient.setQueryData(
        showcaseIngredientsKeys.ingredient(ingredient.ingredient_id).queryKey,
        ingredient
      );

      return { previousValue };
    },
    onError: (err, ingredient, context) => {
      // Rollback on error
      queryClient.setQueryData(
        showcaseIngredientsKeys.ingredient(ingredient.ingredient_id).queryKey,
        context?.previousValue
      );
    },
    onSettled: async (_, __, ingredient) => {
      // Refetch to ensure cache is in sync with server
      queryClient.invalidateQueries({
        queryKey: showcaseIngredientsKeys.ingredient(ingredient.ingredient_id).queryKey,
      });

      // Update logs immediately for active views
      if (currentMember) {
        // First invalidate any existing log queries
        queryClient.invalidateQueries({
          predicate: (query) => {
            const queryKey = query.queryKey as Array<unknown>;
            return queryKey[0] === "logs";
          },
        });

        // Then explicitly fetch fresh data
        await updateLogsForMember(currentMember.member_id); // User's own logs
        await updateLogsForMember(undefined); // All users' logs
      }
    },
  });

  const removeIngredient = useMutation({
    mutationFn: async (ingredientId: string) => {
      if (!currentMember) {
        throw new Error("No current member found");
      }

      // Make the actual API call to delete the ingredient, including showcase ingredients
      await deleteIngredient(ingredientId, currentMember.member_id);
      return ingredientId;
    },
    onMutate: async (ingredientId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: showcaseIngredientsKeys.ingredient(ingredientId).queryKey,
      });

      // Store previous value
      const previousValue = queryClient.getQueryData(
        showcaseIngredientsKeys.ingredient(ingredientId).queryKey
      );

      // Set the data to null to indicate the ingredient doesn't exist
      queryClient.setQueryData(showcaseIngredientsKeys.ingredient(ingredientId).queryKey, null);

      return { previousValue };
    },
    onError: (err, ingredientId, context) => {
      // Rollback on error
      queryClient.setQueryData(
        showcaseIngredientsKeys.ingredient(ingredientId).queryKey,
        context?.previousValue
      );
    },
    onSettled: async (_, __, ingredientId) => {
      // Refetch to ensure cache is in sync with server
      queryClient.invalidateQueries({
        queryKey: showcaseIngredientsKeys.ingredient(ingredientId).queryKey,
      });

      // Update logs immediately for active views
      if (currentMember) {
        // First invalidate any existing log queries
        queryClient.invalidateQueries({
          predicate: (query) => {
            const queryKey = query.queryKey as Array<unknown>;
            return queryKey[0] === "logs";
          },
        });

        // Then explicitly fetch fresh data
        await updateLogsForMember(currentMember.member_id); // User's own logs
        await updateLogsForMember(undefined); // All users' logs
      }
    },
  });

  return {
    addIngredient,
    removeIngredient,
  };
}
