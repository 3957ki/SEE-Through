import { getIngredient } from "@/api/ingredients";
import { DetailedIngredient } from "@/interfaces/Ingredient";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useQuery } from "@tanstack/react-query";

export const ingredients = createQueryKeys("ingredients", {
  detail: (ingredientId: string) => ({
    queryKey: [ingredientId],
    queryFn: () => getIngredient(ingredientId),
  }),
});

export function useIngredient(ingredientId: string) {
  const { data } = useQuery(ingredients.detail(ingredientId));

  return { data: data as DetailedIngredient };
}
