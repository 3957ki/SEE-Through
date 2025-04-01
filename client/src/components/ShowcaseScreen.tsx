import Fridge from "@/components/showcase/Fridge";
import Table from "@/components/showcase/Table";
import UserInfoCard from "@/components/showcase/UserInfoCard";
import Ingredient from "@/interfaces/Ingredient";
import { useCurrentMember } from "@/queries/members";
import {
  useOptimisticIngredientUpdates,
  useShowcaseIngredients,
} from "@/queries/showcaseIngredients";
import { useState, type DragEvent } from "react";

function ShowcaseScreen() {
  const { data: currentMember } = useCurrentMember();
  const { insideIngredients, outsideIngredients, isLoading } = useShowcaseIngredients();
  const { addIngredient, removeIngredient } = useOptimisticIngredientUpdates();

  const [dialogMessage, setDialogMessage] = useState<string>("");
  const [showDialog, setShowDialog] = useState<boolean>(false);

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

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

      // Show success message
      setDialogMessage("Ingredient successfully added to the fridge!");
      setShowDialog(true);
    } catch (error) {
      // Log the error for debugging
      console.error("Failed to handle drop:", error);

      // Show error message in dialog after failure
      setDialogMessage("Failed to add ingredient. Please try again.");
      setShowDialog(true);
    }
  };

  const takeoutIngredient = async (ingredient: Ingredient): Promise<void> => {
    if (!currentMember) return;

    try {
      // Use the mutation for optimistic updates
      removeIngredient.mutate(ingredient.ingredient_id);

      // Show success message
      setDialogMessage("Ingredient successfully removed from the fridge!");
      setShowDialog(true);
    } catch (error) {
      // Log the error for debugging
      console.error("Error occurred while removing ingredient:", error);

      // Show error message in dialog after failure
      setDialogMessage("Failed to remove ingredient. Please try again.");
      setShowDialog(true);
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

      {/* Simple Dialog for success/error messages */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg max-w-md">
            <p className="mb-4">{dialogMessage}</p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleCloseDialog}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShowcaseScreen;
