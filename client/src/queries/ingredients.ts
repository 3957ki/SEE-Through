import { getIngredient, getIngredients } from "@/api/ingredients";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const ingredients = createQueryKeys("ingredients", {
  all: (memberId?: string, page: number = 1, size: number = 10) => ({
    queryKey: [memberId, page, size],
    queryFn: () => getIngredients(memberId, page, size),
  }),
  detail: (ingredientId: string) => ({
    queryKey: [ingredientId],
    queryFn: () => getIngredient(ingredientId),
  }),
});
