import Fridge from "@/components/showcase/Fridge";
import FridgeDisplay from "@/components/FridgeDisplay";
import UserInfoCard from "@/components/showcase/UserInfoCard";
import WebcamView from "@/components/showcase/WebcamView";
import React, { useState } from "react";
import Material from "@/interfaces/Material";
import MaterialProvider from "@/providers/MaterialContextProvider";
import { useMaterialContext } from "@/contexts/MaterialContext";

// 드래그 가능한 재료 컴포넌트 (Material 객체 기반)
interface DraggableIngredientProps {
  material: Material;
}
function DraggableIngredient({ material }: DraggableIngredientProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Material 객체를 JSON 문자열로 dataTransfer에 저장 (키: "material")
    e.dataTransfer.setData("material", JSON.stringify(material));
  };
  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="p-2 bg-blue-300 rounded cursor-grab"
    >
      {material.name}
    </div>
  );
}

function ShowcaseContent() {
  const [isShowingInfoScreen, setIsShowingInfoScreen] = useState(true);
  const [leftDoorOpen, setLeftDoorOpen] = useState(false);
  // 재료 식탁에 표시되는 로컬 available 재료 목록
  const [availableIngredients, setAvailableIngredients] = useState<Material[]>([
    { ingredient_id: "tomato", name: "토마토", image_path: "/src/assets/tomato.jpg" },
    { ingredient_id: "lettuce", name: "양상추", image_path: "/src/assets/lettuce.jpg" },
    { ingredient_id: "chicken", name: "치킨", image_path: "/src/assets/chicken.jpg" },
    { ingredient_id: "peanut", name: "땅콩", image_path: "/src/assets/peanut.jpg" },
    { ingredient_id: "corn", name: "옥수수", image_path: "/src/assets/corn.jpg" },
  ]);

  // Context에서 draggedMaterials 및 액션 함수들을 가져옴
  const { draggedMaterials, addDraggedMaterial, removeDraggedMaterial } = useMaterialContext();

  // 드롭 이벤트 핸들러
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("material");
    if (!data) return;
    const material: Material = JSON.parse(data);
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    await addDraggedMaterial(material, offsetX, offsetY);
    // 식탁 available에서 제거
    setAvailableIngredients((prev) => prev.filter((item) => item.ingredient_id !== material.ingredient_id));
  };

  // 재료 제거 시, dragged에서 제거하고 available에 추가하는 핸들러
  const handleRemoveFromDragged = async (material: Material) => {
    await removeDraggedMaterial(material.ingredient_id);
    setAvailableIngredients((prev) => [...prev, material]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-blue-50">
      <div className="flex relative w-full h-[100vh] gap-4 md:gap-8 p-5">
        {/* 왼쪽 영역 - 냉장고와 드롭존 */}
        <div className="w-2/3 h-full relative">
          <Fridge
            leftDoorOpen={leftDoorOpen}
            toggleDoor={() => setLeftDoorOpen(!leftDoorOpen)}
            handleDrop={handleDrop}
            // Fridge에서는 draggedMaterials를 표시합니다.
            droppedIngredients={draggedMaterials}
            removeIngredient={handleRemoveFromDragged}
          >
            <div className="w-full h-full overflow-hidden flex items-center justify-center bg-gray-50">
              {isShowingInfoScreen ? (
                <div className="flex items-center justify-center">
                  <FridgeDisplay targetWidth={375} targetHeight={667} />
                </div>
              ) : (
                <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                  냉장고 내부 카메라 화면
                </div>
              )}
            </div>
          </Fridge>
        </div>
        {/* 오른쪽 영역 - 컨트롤 및 재료 식탁 */}
        <div className="w-1/4 h-full flex flex-col gap-4 md:gap-6 relative">
          <div className="h-1/3">
            <WebcamView />
          </div>
          <button
            onClick={() => setIsShowingInfoScreen(!isShowingInfoScreen)}
            className="w-full py-2 md:py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition text-sm md:text-base"
          >
            {isShowingInfoScreen ? "내부 카메라 화면 보기" : "정보 화면 보기"}
          </button>
          <div className="h-1/5">
            <UserInfoCard />
          </div>
        </div>
        {/* 재료 식탁: availableIngredients를 표시 */}
        <div
            className="absolute bottom-0 right-0 w-2/5 flex-1 p-4 md:p-6 bg-cover bg-center"
            style={{
              backgroundImage: "url('/src/assets/table.jpg')",
              clipPath: "polygon(20% 0, 100% 0, 100% 100%, 10% 100%)",
            }}
          >
            <div className="flex flex-wrap flex-row-reverse gap-2 w-3/4 ml-auto mr-auto">
              {availableIngredients.map((material) => (
                <DraggableIngredient key={material.ingredient_id} material={material} />
              ))}
            </div>
          </div>
      </div>
    </div>
  );
}

function ShowcaseScreen() {
  return (
    <MaterialProvider>
      <ShowcaseContent />
    </MaterialProvider>
  );
}

export default ShowcaseScreen;
