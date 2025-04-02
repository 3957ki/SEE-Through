import Fridge from "@/components/showcase/Fridge";
import Table from "@/components/showcase/Table";
import UserInfoCard from "@/components/showcase/UserInfoCard";
import WebcamView from "@/components/showcase/WebcamView";
import Ingredient from "@/interfaces/Ingredient";
import { useCurrentMember } from "@/queries/members";
import {
  useOptimisticIngredientUpdates,
  useShowcaseIngredients,
} from "@/queries/showcaseIngredients";
import { useState } from "react";

function ShowcaseScreen() {
  const { data: currentMember } = useCurrentMember();
  const { insideIngredients, outsideIngredients, isLoading } = useShowcaseIngredients();
  const { addIngredient, removeIngredient } = useOptimisticIngredientUpdates();
  const [commentMessage, setCommentMessage] = useState<string | null>(null);

  const handleFridgeDrop = async (ingredient: Ingredient) => {
    if (!currentMember) return;
    try {
      addIngredient.mutate(ingredient);
    } catch (error) {
      console.error("Failed to add ingredient to fridge:", error);
    }
  };

  const handleTableDrop = async (ingredient: Ingredient) => {
    if (!currentMember) return;
    try {
      removeIngredient.mutate(ingredient.ingredient_id);
    } catch (error) {
      console.error("Failed to remove ingredient from fridge:", error);
    }
  };

  const takeoutIngredient = async (ingredient: Ingredient): Promise<void> => {
    if (!currentMember) return;

    removeIngredient.mutate(ingredient.ingredient_id, {
      onSuccess: ({ message }) => {
        setCommentMessage(message || `${ingredient.name} 재료가 출고되었습니다.`);
      },
      onError: () => {
        setCommentMessage("재료 출고 중 오류가 발생했습니다.");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading ingredients...</div>
    );
  }

  return (
    <div className="min-h-screen relative bg-blue-50">
      <div className="flex w-full h-[100vh] gap-4 md:gap-8 p-5">
        {/* Left Area - Fridge and Drop Zone */}
        <div className="w-2/3 h-full relative">
          <Fridge
            onDrop={handleFridgeDrop}
            insideIngredients={insideIngredients}
            ingredientOnClick={takeoutIngredient}
            commentMessage={commentMessage}
            onCloseComment={() => setCommentMessage(null)}
          />
        </div>

        {/* Right Area - Controls and Ingredient Table */}
        <div className="w-1/3 h-full flex flex-col gap-4 md:gap-6 relative">
          <div className="h-1/3">
            <WebcamView />
          </div>
          <div className="h-1/3">
            <UserInfoCard />
          </div>
        </div>
      </div>

      {/* Table positioned outside the flex container */}
      <div className="absolute bottom-0 right-0 w-full h-full pointer-events-none">
        <Table outsideIngredients={outsideIngredients} onDrop={handleTableDrop} />
      </div>
    </div>
  );
}

export default ShowcaseScreen;
