import Ingredient from "@/interfaces/Ingredient";
import { APIServerFetcher } from "@/lib/fetchers";

export async function getIngredients(): Promise<Ingredient[]> {
  const response = await APIServerFetcher.get(
    "/ingredients?page=1&size=100&sortBy=inboundAt&sortDirection=ASC"
  );
  return response.data.content;
}

export async function insertIngredient(ingredient: Ingredient, memberId: string): Promise<void> {
  return APIServerFetcher.post(`/ingredients`, {
    member_id: memberId,
    inbound_ingredient_request_list: [ingredient],
  });
}

export async function deleteIngredient(ingredientId: string, memberId: string): Promise<string> {
  const response = await APIServerFetcher.delete(`/ingredients`, {
    data: {
      member_id: memberId,
      ingredient_id_list: [ingredientId],
    },
  });
  return response.data.content;
}
