import tableImage from "@/assets/table.png";
import Ingredient from "@/interfaces/Ingredient";
import { DragEvent } from "react";

// 드래그 가능한 재료 컴포넌트 (Ingredient 객체 기반)
interface DraggableIngredientProps {
  ingredient: Ingredient;
}
function DraggableIngredient({ ingredient }: DraggableIngredientProps) {
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    try {
      // Set a custom MIME type for better type safety
      e.dataTransfer.setData("application/x-ingredient", JSON.stringify(ingredient));
      // Add a fallback text representation for better accessibility
      e.dataTransfer.setData("text/plain", ingredient.name || "Unnamed ingredient");

      // Create a custom drag image
      const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
      dragImage.style.width = `${e.currentTarget.offsetWidth}px`;
      dragImage.style.height = `${e.currentTarget.offsetHeight}px`;
      dragImage.style.position = "absolute";
      dragImage.style.top = "-1000px";
      dragImage.style.opacity = "0.8";
      dragImage.style.transform = "rotate(2deg)";
      dragImage.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
      dragImage.style.zIndex = "1000";

      // Add the clone to the document temporarily
      document.body.appendChild(dragImage);

      // Set the drag image with offset to center it on the cursor
      e.dataTransfer.setDragImage(
        dragImage,
        e.currentTarget.offsetWidth / 2,
        e.currentTarget.offsetHeight / 2
      );

      // Clean up the temporary element after a short delay
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    } catch (error) {
      console.error("Failed to set drag data:", error);
      // Fallback to just the name if serialization fails
      e.dataTransfer.setData("text/plain", ingredient.name || "Unnamed ingredient");
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="p-2 bg-blue-300 rounded cursor-grab hover:shadow-lg transition-shadow duration-200"
      role="button"
      aria-label={`Drag ${ingredient.name || "Unnamed ingredient"}`}
    >
      <img
        src={ingredient.image_path}
        alt={ingredient.name || "Unnamed ingredient"}
        className="w-16 h-16 object-contain"
      />
      <span className="block text-center mt-1">{ingredient.name}</span>
    </div>
  );
}

export default function Table({ outsideIngredients }: { outsideIngredients: Ingredient[] }) {
  return (
    <div className="absolute bottom-0 right-0 w-2/5 h-1/3 overflow-hidden pointer-events-auto">
      {/* Table image */}
      <img
        src={tableImage}
        alt="Table surface"
        className="absolute bottom-0 left-0 h-full w-auto min-w-full object-cover object-left"
      />

      {/* Ingredients container */}
      <div className="absolute inset-0 flex flex-wrap justify-center items-center gap-4 p-4">
        {outsideIngredients.map((ingredient) => (
          <DraggableIngredient key={ingredient.ingredient_id} ingredient={ingredient} />
        ))}
      </div>
    </div>
  );
}
