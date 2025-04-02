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

export async function getIngredient(ingredientId: string): Promise<DetailedIngredient | null> {
  try {
    // Make the API call for all ingredients, including showcase ones
    const response = await APIServerFetcher.get(`/ingredients/${ingredientId}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null; // Return null when ingredient is not found
    }
    throw error; // Re-throw other errors
  }
}

export async function insertIngredient(ingredient: Ingredient, memberId: string): Promise<void> {
  return APIServerFetcher.post(`/ingredients`, {
    member_id: memberId,
    inbound_ingredient_request_list: [ingredient],
  });
}

export async function deleteIngredient(
  ingredientId: string,
  memberId: string
): Promise<{ message: string }> {
  const response = await APIServerFetcher.delete(`/ingredients`, {
    data: {
      member_id: memberId,
      ingredient_id_list: [ingredientId],
    },
  });

  // 응답 데이터 구조가 content 또는 message로 반환되면 해당 값을 사용
  return { message: response.data.content || response.data }; // message 반환
}
