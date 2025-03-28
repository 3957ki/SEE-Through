import Ingredient from "@/interfaces/Ingredient";
import { createContext, use } from "react";

export interface IngredientsContextType {
  ingredients: Ingredient[]; // API로 받아온 재료 + 드래그로 추가된 재료
  setIngredients: (ingredients: Ingredient[]) => void;
}

export const IngredientsContext = createContext<IngredientsContextType | null>(null);

export const useIngredientsContext = () => {
  const context = use(IngredientsContext);
  if (!context) {
    throw new Error("useIngredientsContext must be used within a IngredientsProvider");
  }
  return context;
};
