import { deleteIngredient, getIngredient, insertIngredient } from "@/api/ingredients";
import { Ingredient } from "@/interfaces/Ingredient";
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
    name: "버섯",
    image_path: "https://see-through002.s3.ap-northeast-2.amazonaws.com/ingredient/mushroom.png",
  },
  {
    ingredient_id: "99999999-0000-0000-0000-000000000003",
    name: "오이",
    image_path: "https://see-through002.s3.ap-northeast-2.amazonaws.com/ingredient/cucumber.png",
  },
  {
    ingredient_id: "99999999-0000-0000-0000-000000000004",
    name: "계란",
    image_path: "https://see-through002.s3.ap-northeast-2.amazonaws.com/ingredient/eggs.png",
  },
  {
    ingredient_id: "99999999-0000-0000-0000-000000000005",
    name: "치즈",
    image_path: "https://see-through002.s3.ap-northeast-2.amazonaws.com/ingredient/cheese.png",
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
      }
    },
  });

  const removeIngredient = useMutation({
    mutationFn: async (ingredientId: string) => {
      if (!currentMember) {
        throw new Error("No current member found");
      }

      // Make the actual API call to delete the ingredient, including showcase ingredients
      const result = await deleteIngredient(ingredientId, currentMember.member_id);
      return { ingredientId, message: result.message };
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
      }
    },
  });

  return {
    addIngredient,
    removeIngredient,
  };
}
