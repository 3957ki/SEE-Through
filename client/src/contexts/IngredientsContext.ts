import Ingredient from "@/interfaces/Ingredient";
import { createContext, use } from "react";

export interface IngredientsContextType {
  ingredients: Ingredient[];
  setIngredients: (ingredients: Ingredient[]) => void;
  loadMoreIngredients: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  page: number;
}

export const IngredientsContext = createContext<IngredientsContextType | null>(null);

export const useIngredientsContext = () => {
  const context = use(IngredientsContext);
  if (!context) {
    throw new Error("useIngredientsContext must be used within a IngredientsProvider");
  }
  return context;
};
