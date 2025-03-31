import Ingredient, { DetailedIngredient, IngredientListResponse } from "@/interfaces/Ingredient";
import { APIServerFetcher } from "@/lib/fetchers";

export async function getIngredients(
  memberId?: string,
  page: number = 1,
  size: number = 10
): Promise<IngredientListResponse> {
  const url = memberId
    ? `/ingredients?memberId=${memberId}&page=${page}&size=${size}&sortBy=inboundAt&sortDirection=ASC`
    : `/ingredients?page=${page}&size=${size}&sortBy=inboundAt&sortDirection=ASC`;

  const response = await APIServerFetcher.get(url);
  return response.data;
}

export async function getIngredient(ingredientId: string): Promise<DetailedIngredient> {
  const response = await APIServerFetcher.get(`/ingredients/${ingredientId}`);
  return response.data;
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
