import { deleteIngredient, getIngredient, insertIngredient } from "@/api/ingredients";
import { Ingredient } from "@/interfaces/Ingredient";
import { members, useCurrentMember } from "@/queries/members";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";

export const showcaseIngredients = [
  {
    ingredient_id: "01960e59-db82-7c6c-9fa6-b4a0cd4d044c",
    name: "땅콩버터",
    image_path:
      "https://see-through002.s3.ap-northeast-2.amazonaws.com/ingredient/peanut-butter.png",
  },
  {
    ingredient_id: "01960e59-db82-7c6c-9f9a-1e130b41e7f6",
    name: "딸기잼",
    image_path:
      "https://see-through002.s3.ap-northeast-2.amazonaws.com/ingredient/strawberry-jam.png",
  },
  {
    ingredient_id: "01960e59-db82-7c6c-9f99-9a4a43040ddc",
    name: "두부",
    image_path: "https://see-through002.s3.ap-northeast-2.amazonaws.com/ingredient/tofu.png",
  },
  {
    ingredient_id: "01960e59-db82-7c6c-9f9f-4be039992361",
    name: "계란",
    image_path: "https://see-through002.s3.ap-northeast-2.amazonaws.com/ingredient/eggs.png",
  },
  {
    ingredient_id: "01960e59-db82-7c6c-9fa9-6cf9339d17ab",
    name: "돼지고기",
    image_path: "https://see-through002.s3.ap-northeast-2.amazonaws.com/ingredient/pork.png",
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
    onError: (_, ingredient, context) => {
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

        // Invalidate the ingredients query for the current member
        queryClient.invalidateQueries({
          queryKey: members.current._ctx.detail(currentMember.member_id)._ctx.ingredients.queryKey,
        });
      }
    },
  });

  const removeIngredient = useMutation({
    mutationFn: async (ingredientId: string) => {
      if (!currentMember) {
        console.warn("[⚠️ currentMember 없음] 출고 불가");
        throw new Error("No current member found");
      }

      // Make the actual API call to delete the ingredient, including showcase ingredients
      console.log(`[📤 deleteIngredient 호출] ingredientId: ${ingredientId}`);
      const result = await deleteIngredient(ingredientId, currentMember.member_id);
      console.log("[✅ deleteIngredient 응답]", result);
      return { ingredientId, comment: result.comment, danger: result.danger };
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
    onError: (_, ingredientId, context) => {
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

        // Invalidate the ingredients query for the current member
        queryClient.invalidateQueries({
          queryKey: members.current._ctx.detail(currentMember.member_id)._ctx.ingredients.queryKey,
        });
      }
    },
  });

  return {
    addIngredient,
    removeIngredient,
  };
}
