import ttsmp3 from "@/assets/jeongwoo_tts.mp3";
import tableImage from "@/assets/table.png";
import CommentDialog from "@/components/dialog/CommentDialog";
import ShowcaseIngredient from "@/components/showcase/ShowcaseIngredient";
import { useDialog } from "@/contexts/DialogContext";
import Ingredient from "@/interfaces/Ingredient";
import { useCurrentMember } from "@/queries/members";
import { useOptimisticIngredientUpdates } from "@/queries/showcaseIngredients";
import { DragEvent, useState } from "react";
interface TableProps {
  outsideIngredients: Ingredient[];
}

export default function Table({ outsideIngredients }: TableProps) {
  const { removeIngredient } = useOptimisticIngredientUpdates();
  const { showDialog } = useDialog();
  const { data: currentMember } = useCurrentMember();
  const [hideSelectedIngredients, setHideSelectedIngredients] = useState(false);

  // 숨길 재료 ID 목록 (두부, 계란, 돼지고기의 ID)
  const ingredientsToHide = [
    "01960e59-db82-7c6c-9f99-9a4a43040ddc", // 두부
    "01960e59-db82-7c6c-9f9f-4be039992361", // 계란
    "01960e59-db82-7c6c-9fa9-6cf9339d17ab", // 돼지고기
  ];

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
            console.log(data);
            const messageText =
              typeof data.comment === "string"
                ? data.comment
                : (data.comment as { comment?: string })?.comment || "재료가 제거되었습니다.";

            // 김정우와 땅콩버터 조건 체크
            if (currentMember?.name === "홍정우" && ingredient.name === "땅콩버터") {
              // jungwoo.mp3 재생 로직 (HTML5 Audio API 사용)
              const audio = new Audio(ttsmp3);
              audio.play().catch((err) => console.error("Failed to play audio:", err));

              showDialog(
                <CommentDialog
                  message="땅콩버터에는 땅콩이 들어있어! 땅콩을 먹으면 피부 발진이나 호흡곤란 같은 심각한 반응이 나타날 수 있으니, 절대로 먹지 않는 게 좋아."
                  danger={true}
                />,
                true
              );
            } else {
              // 다른 모든 경우에 응답 메시지를 CommentDialog에 표시
              showDialog(<CommentDialog message={messageText} danger={data.danger === true} />);
            }
          },
        });
      }
    } catch (error) {
      console.error("Failed to handle drop on table:", error);
    }
  };

  const toggleSelectedIngredients = () => {
    setHideSelectedIngredients(!hideSelectedIngredients);
  };

  // 필터링된 재료 목록 계산
  const filteredIngredients = hideSelectedIngredients
    ? outsideIngredients.filter(
        (ingredient) => !ingredientsToHide.includes(ingredient.ingredient_id)
      )
    : outsideIngredients;

  return (
    <div
      className="absolute bottom-0 right-0 overflow-hidden pointer-events-auto"
      style={{
        width: "40vw", // Using viewport width instead of percentage
        height: "33.33vh", // Using viewport height instead of percentage
        fontSize: "16px", // Set absolute font size to prevent inheritance
      }}
    >
      {/* 장보기 버튼을 이모지로 대체하고 위치 변경 */}
      <button
        onClick={toggleSelectedIngredients}
        className="absolute bottom-4 right-28 z-10 bg-white hover:bg-gray-100 text-blue-500 font-bold p-3 rounded-full shadow-lg transition-colors duration-200 flex items-center justify-center"
        style={{
          fontSize: "24px",
          width: "48px",
          height: "48px",
        }}
        aria-label={hideSelectedIngredients ? "모든 재료 보기" : "일부 재료 숨기기"}
      >
        🛒
      </button>

      {/* Table image */}
      <img
        src={tableImage}
        alt="Table surface"
        className="absolute bottom-0 left-0 h-full w-auto min-w-full object-cover object-left"
        style={{ fontSize: "16px" }} // Prevent font-size inheritance
      />

      {/* Ingredients container */}
      <div
        className="absolute inset-0 flex flex-wrap justify-start items-end"
        style={{
          padding: "5% 5% 13% 5%",
          fontSize: "16px", // Prevent font-size inheritance
        }}
        onDragOver={handleDragOver}
        onDrop={handleDropEvent}
      >
        {filteredIngredients.map((ingredient) => (
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
