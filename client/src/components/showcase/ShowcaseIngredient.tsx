import Ingredient from "@/interfaces/Ingredient";
import { DragEvent, useRef } from "react";

interface ShowcaseIngredientProps {
  ingredient: Ingredient;
  onClick?: (ingredient: Ingredient) => void;
  draggable?: boolean;
  className?: string;
  yOffset?: number;
  xOffset?: number;
  size?: number;
}

export default function ShowcaseIngredient({
  ingredient,
  draggable = true,
  className = "",
  yOffset = 0,
  xOffset = 0,
  size = 14.4,
}: ShowcaseIngredientProps) {
  const ingredientRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    console.log("ShowcaseIngredient: Drag start", ingredient.name);
    try {
      // Set a custom MIME type for better type safety
      e.dataTransfer.setData("application/x-ingredient", JSON.stringify(ingredient));
      // Add source information to help identify where the drag started
      e.dataTransfer.setData(
        "application/x-source",
        className.includes("fridge") ? "fridge" : "table"
      );

      // Use the native drag ghost
      e.dataTransfer.setDragImage(
        e.currentTarget,
        e.currentTarget.offsetWidth / 2,
        e.currentTarget.offsetHeight / 2
      );

      // Hide the original element while dragging
      if (ingredientRef.current) {
        ingredientRef.current.style.opacity = "0";
      }
    } catch (error) {
      console.error("Failed to set drag data:", error);
      e.dataTransfer.setData("text/plain", ingredient.name || "Unnamed ingredient");
    }
  };

  const handleDragEnd = () => {
    console.log("ShowcaseIngredient: Drag end", ingredient.name);
    // Restore the original element's opacity
    if (ingredientRef.current) {
      ingredientRef.current.style.opacity = "1";
    }
  };

  return (
    <div
      ref={ingredientRef}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`cursor-grab hover:scale-120 transition-all duration-200 ${className}`}
      role="button"
      aria-label={`${draggable ? "Drag " : ""}${ingredient.name || "Unnamed ingredient"}`}
      style={{
        fontSize: "1.5vh",
        transform: `translate(${xOffset}vh, ${yOffset}vh)`,
      }}
    >
      <img
        src={ingredient.image_path}
        alt={ingredient.name || "Unnamed ingredient"}
        className="object-contain"
        style={{
          width: `${ingredient.ingredient_id === "01960e59-db82-7c6c-9fa9-6cf9339d17ab" ? size * 0.75 : size}vh`,
          height: `${ingredient.ingredient_id === "01960e59-db82-7c6c-9fa9-6cf9339d17ab" ? size * 0.75 : size}vh`,
          minWidth: `${ingredient.ingredient_id === "01960e59-db82-7c6c-9fa9-6cf9339d17ab" ? size * 0.75 : size}vh`,
          minHeight: `${ingredient.ingredient_id === "01960e59-db82-7c6c-9fa9-6cf9339d17ab" ? size * 0.75 : size}vh`,
          marginLeft: `${ingredient.ingredient_id === "01960e59-db82-7c6c-9fa9-6cf9339d17ab" ? `${size * 0.125}vh` : "0"}`,
          marginRight: `${ingredient.ingredient_id === "01960e59-db82-7c6c-9fa9-6cf9339d17ab" ? `${size * 0.125}vh` : "0"}`,
        }}
      />
    </div>
  );
}
