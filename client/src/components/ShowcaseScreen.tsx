import FridgeDisplay from "@/components/FridgeDisplay";
import Fridge from "@/components/showcase/Fridge";
import UserInfoCard from "@/components/showcase/UserInfoCard";
import WebcamView from "@/components/showcase/WebcamView";
import React, { useState } from "react";
import { DroppedMaterial } from "@/interfaces/DroppedMaterial";
import Material from "@/interfaces/Material";

// 드래그 가능한 재료 컴포넌트 (Material 객체를 전달)
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

function ShowcaseScreen() {
  const [isShowingInfoScreen, setIsShowingInfoScreen] = useState(true);
  const [leftDoorOpen, setLeftDoorOpen] = useState(false);

  // availableIngredients를 Material 객체 배열로 관리
  const [availableIngredients, setAvailableIngredients] = useState<Material[]>([
    { id: "tomato", name: "토마토", image: "/src/assets/tomato.jpg" },
    { id: "lettuce", name: "양상추", image: "/src/assets/lettuce.jpg" },
    { id: "chicken", name: "치킨", image: "/src/assets/chicken.jpg" },
    { id: "peanut", name: "땅콩", image: "/src/assets/peanut.jpg" },
    { id: "corn", name: "옥수수", image: "/src/assets/corn.jpg" },
  ]);
  // droppedIngredients는 DroppedMaterial 객체 배열로 관리
  const [droppedIngredients, setDroppedIngredients] = useState<DroppedMaterial[]>([]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("material");
    if (!data) return;
    const material: Material = JSON.parse(data);
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    // 드롭된 재료 추가
    setDroppedIngredients((prev) => [
      ...prev,
      { material, x: offsetX, y: offsetY },
    ]);
    // availableIngredients에서 해당 재료 제거
    setAvailableIngredients((prev) =>
      prev.filter((item) => item.id !== material.id)
    );
  };

  const removeIngredient = (materialId: string) => {
    const removed = droppedIngredients.find(
      (item) => item.material.id === materialId
    );
    if (removed) {
      setAvailableIngredients((prev) => [...prev, removed.material]);
      setDroppedIngredients((prev) =>
        prev.filter((item) => item.material.id !== materialId)
      );
    }
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
            droppedIngredients={droppedIngredients}
            removeIngredient={removeIngredient}
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

        {/* 오른쪽 영역 - 컨트롤 및 정보, 재료 식탁 */}
        <div className="w-1/4 h-full flex flex-col gap-4 md:gap-6 relative">
          {/* 웹캠 뷰 */}
          <div className="h-1/3">
            <WebcamView />
          </div>
          <button
            onClick={() => setIsShowingInfoScreen(!isShowingInfoScreen)}
            className="w-full py-2 md:py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition text-sm md:text-base"
          >
            {isShowingInfoScreen ? "내부 카메라 화면 보기" : "정보 화면 보기"}
          </button>
          {/* 사용자 정보 카드 */}
          <div className="h-1/5">
            <UserInfoCard />
          </div>
        </div>
        {/* 재료 식탁 */}
        <div
            className="absolute bottom-0 right-0 flex-1 w-2/5 p-4 md:p-6 bg-cover bg-center"
            style={{
              backgroundImage: "url('/src/assets/table.jpg')",
              clipPath: "polygon(20% 0, 100% 0, 100% 100%, 10% 100%)",
            }}
          >
            <div className="flex flex-wrap flex-row-reverse gap-2 w-3/4 ml-auto mr-auto">
              {availableIngredients.map((material) => (
                <DraggableIngredient key={material.id} material={material} />
              ))}
            </div>
          </div>
      </div>
    </div>
  );
}

export default ShowcaseScreen;
