import { speakWithTTS } from "@/api/tts";
import tableImage from "@/assets/table.png";
import CommentDialog from "@/components/dialog/CommentDialog";
import ShowcaseIngredient from "@/components/showcase/ShowcaseIngredient";
import { useDialog } from "@/contexts/DialogContext";
import Ingredient from "@/interfaces/Ingredient";
import { useCurrentMember } from "@/queries/members";
import { useOptimisticIngredientUpdates } from "@/queries/showcaseIngredients";
import { DragEvent } from "react";
interface TableProps {
  outsideIngredients: Ingredient[];
}

export default function Table({ outsideIngredients }: TableProps) {
  const { removeIngredient } = useOptimisticIngredientUpdates();
  const { showDialog } = useDialog();
  const { data: currentMember } = useCurrentMember();

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

        removeIngredient.mutate(ingredient.ingredient_id, {
          onSuccess: (data) => {
            // Extract the string message from the object
            console.log(data);
            const messageText =
              typeof data.comment === "string"
                ? data.comment
                : (data.comment as { comment?: string })?.comment || "재료가 제거되었습니다.";

            showDialog(<CommentDialog message={messageText} />);
            // currentMember.age로 actor 분기
            // const age = currentMember?.age;
            // console.log("사용자 나이:", age);
            // const actorId =
            //   age !== undefined && age >= 0 && age < 13
            //     ? "619d7eb59233f1f0771197ed" // 어린이: 머루
            //     : "632293f759d649937b97f323"; // 어른: 진우
            // console.log("actorId: ", actorId);
            // speakWithTTS(messageText, actorId);
            speakWithTTS(messageText, "632293f759d649937b97f323");
          },
        });
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
