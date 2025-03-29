import { getIngredients } from "@/api/ingredients";
import { IngredientsContext, IngredientsContextType } from "@/contexts/IngredientsContext";
import Ingredient from "@/interfaces/Ingredient";
import { ReactNode, useEffect, useMemo, useState } from "react";

// API 호출 함수는 insertMaterial, deleteMaterial, getMaterials를 그대로 사용합니다.

export const IngredientsProivder = ({ children }: { children: ReactNode }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const ingredients = await getIngredients();
        setIngredients(ingredients);
        console.log("Fetched ingredients:", ingredients);
      } catch (error) {
        console.error("Failed to fetch ingredients:", error);
      }
    })();
  }, []);

  const value: IngredientsContextType = useMemo(
    () => ({
      ingredients,
      setIngredients,
    }),
    [ingredients, setIngredients]
  );

  return <IngredientsContext value={value}>{children}</IngredientsContext>;
};

export default IngredientsProivder;
