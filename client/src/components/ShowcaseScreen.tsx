import Fridge from "@/components/showcase/Fridge";
import Table from "@/components/showcase/Table";
import UserInfoCard from "@/components/showcase/UserInfoCard";
import Ingredient from "@/interfaces/Ingredient";
import { useCurrentMember } from "@/queries/members";
import {
  useOptimisticIngredientUpdates,
  useShowcaseIngredients,
} from "@/queries/showcaseIngredients";
import { type DragEvent } from "react";

function ShowcaseScreen() {
  const { data: currentMember } = useCurrentMember();
  const { insideIngredients, outsideIngredients, isLoading } = useShowcaseIngredients();
  const { addIngredient, removeIngredient } = useOptimisticIngredientUpdates();

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    let ingredient: Ingredient | null = null;

    try {
      const ingredientData = e.dataTransfer.getData("application/x-ingredient");
      if (!ingredientData || !currentMember) return;

      ingredient = JSON.parse(ingredientData);
      if (!ingredient) return;

      // Use the mutation for optimistic updates
      addIngredient.mutate(ingredient);
    } catch (error) {
      // Log the error for debugging
      console.error("Failed to handle drop:", error);
    }
  };

  const takeoutIngredient = async (ingredient: Ingredient): Promise<void> => {
    if (!currentMember) return;

    try {
      // Use the mutation for optimistic updates
      removeIngredient.mutate(ingredient.ingredient_id);
    } catch (error) {
      // Log the error for debugging
      console.error("Error occurred while removing ingredient:", error);
    }
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
            handleDrop={handleDrop}
            insideIngredients={insideIngredients}
            ingredientOnClick={takeoutIngredient}
          />
        </div>

        {/* Right Area - Controls and Ingredient Table */}
        <div className="w-1/3 h-full flex flex-col gap-4 md:gap-6 relative">
          <div className="h-1/3">{/* <WebcamView /> */}</div>
          <div className="h-1/3">
            <UserInfoCard />
          </div>
        </div>
      </div>

      {/* Table positioned outside the flex container */}
      <div className="absolute bottom-0 right-0 w-full h-full pointer-events-none">
        <Table outsideIngredients={outsideIngredients} />
      </div>
    </div>
  );
}

export default ShowcaseScreen;
