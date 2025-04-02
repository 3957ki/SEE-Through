import tableImage from "@/assets/table.png";
import Ingredient from "@/interfaces/Ingredient";
import { DragEvent } from "react";
import ShowcaseIngredient from "./ShowcaseIngredient";

interface TableProps {
  outsideIngredients: Ingredient[];
  handleDrop: (e: DragEvent<HTMLDivElement>) => void;
}

export default function Table({ outsideIngredients, handleDrop }: TableProps) {
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    console.log("Table: Drag over");
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDropEvent = (e: DragEvent<HTMLDivElement>) => {
    console.log("Table: Drop event received");
    handleDrop(e);
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
        className="absolute inset-0 flex flex-wrap justify-center items-center gap-4 p-4"
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
