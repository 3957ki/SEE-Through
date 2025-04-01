import { getIngredients } from "@/api/ingredients";
import { useCurrentMember } from "@/contexts/CurrentMemberContext";
import { IngredientsContext, IngredientsContextType } from "@/contexts/IngredientsContext";
import Ingredient from "@/interfaces/Ingredient";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";

// API 호출 함수는 insertMaterial, deleteMaterial, getMaterials를 그대로 사용합니다.

export const IngredientsProivder = ({ children }: { children: ReactNode }) => {
  const { currentMember } = useCurrentMember();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadMoreIngredients = useCallback(async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const response = await getIngredients(currentMember?.member_id, page);
      // 새로운 재료들을 기존 재료들과 합치되, 중복 제거
      const newIngredients = [...ingredients];
      response.content.forEach((newIngredient) => {
        if (
          !newIngredients.some((existing) => existing.ingredient_id === newIngredient.ingredient_id)
        ) {
          newIngredients.push(newIngredient);
        }
      });
      setIngredients(newIngredients);
      setPage((prev) => prev + 1);
      setHasMore(response.slice_info.has_next);
    } catch (error) {
      console.error("Failed to fetch more ingredients:", error);
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, ingredients, page, currentMember?.member_id]);

  useEffect(() => {
    const fetchInitialIngredients = async () => {
      try {
        const response = await getIngredients(currentMember?.member_id, 1);
        setIngredients(response.content);
        setPage(2); // 다음 페이지는 2부터 시작
        setHasMore(response.slice_info.has_next);
      } catch (error) {
        console.error("Failed to fetch ingredients:", error);
      }
    };

    fetchInitialIngredients();
  }, [currentMember]);

  const value: IngredientsContextType = useMemo(
    () => ({
      ingredients,
      setIngredients,
      loadMoreIngredients,
      hasMore,
      isLoading,
      page,
    }),
    [ingredients, setIngredients, loadMoreIngredients, hasMore, isLoading, page]
  );

  return <IngredientsContext value={value}>{children}</IngredientsContext>;
};

export default IngredientsProivder;
