export interface IngredientListItem {
  ingredient_id: string;
  name?: string;
  image_path?: string;
  inbound_at?: string;
  expiration_at?: string;
}

export interface IngredientListResponse {
  content: IngredientListItem[];
  sliceInfo: {
    currentPage: number;
    pageSize: number;
    hasNext: boolean;
  };
}

export interface DetailedIngredient extends IngredientListItem {
  member_id: string;
  member_name: string;
  member_image_path: string;
}

export type Ingredient = IngredientListItem | DetailedIngredient;

export default Ingredient;
