import tableImage from "@/assets/table.png";
import Ingredient from "@/interfaces/Ingredient";
import { useOptimisticIngredientUpdates } from "@/queries/showcaseIngredients";
import { DragEvent } from "react";
import ShowcaseIngredient from "./ShowcaseIngredient";
interface TableProps {
  outsideIngredients: Ingredient[];
}

export default function Table({ outsideIngredients }: TableProps) {
  const { removeIngredient } = useOptimisticIngredientUpdates();

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDropEvent = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      const source = e.dataTransfer.getData("application/x-source");
      // Only handle drops from fridge
      if (source === "fridge") {
        const ingredientData = e.dataTransfer.getData("application/x-ingredient");
        if (!ingredientData) return;

        const ingredient = JSON.parse(ingredientData);
        if (!ingredient) return;

        removeIngredient.mutate(ingredient.ingredient_id);
      }
    } catch (error) {
      console.error("Failed to handle drop on table:", error);
    }
  };

  return (
    <div className="absolute bottom-0 right-0 w-2/5 h-1/3 overflow-hidden pointer-events-auto">
      {/* Table image */}
      <img
        src={tableImage}
        alt="Table surface"
        className="absolute bottom-0 left-0 h-full w-auto min-w-full object-cover object-left"
      />

      {/* Ingredients container */}
      <div
        className="absolute inset-0 flex flex-wrap justify-start items-end p-[5%] pb-[13%]"
        onDragOver={handleDragOver}
        onDrop={handleDropEvent}
      >
        {outsideIngredients.map((ingredient) => (
          <ShowcaseIngredient
            key={ingredient.ingredient_id}
            ingredient={ingredient}
            className="table"
          />
        ))}
      </div>
    </div>
  );
}
