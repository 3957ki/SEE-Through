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

  // snake_case를 camelCase로 변환
  const data = response.data;
  return {
    content: data.content,
    sliceInfo: {
      currentPage: data.slice_info.current_page,
      pageSize: data.slice_info.page_size,
      hasNext: data.slice_info.has_next,
    },
  };
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
): Promise<{ comment: string; danger: boolean }> {
  const response = await APIServerFetcher.delete(`/ingredients`, {
    data: {
      member_id: memberId,
      ingredient_id_list: [ingredientId],
    },
  });

  return {
    comment: response.data.comment,
    danger: response.data.danger,
  };
}
