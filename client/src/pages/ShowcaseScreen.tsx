import FridgeComponent from "@/components/showcase/FridgeComponent";
import FridgeDisplay from "@/components/showcase/FridgeDisplay";
import UserInfoCard from "@/components/showcase/UserInfoCard";
import WebcamView from "@/components/showcase/WebcamView";
import { useState } from "react";

interface ShowcaseScreenProps {
  onExit?: () => void;
}

function ShowcaseScreen({ onExit }: ShowcaseScreenProps) {
  const [isShowingInfoScreen, setIsShowingInfoScreen] = useState(true);

  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="relative w-full max-w-7xl h-[85vh] bg-gray-100 rounded-lg p-4 overflow-hidden shadow-2xl">
        <header className="mb-4 flex justify-between items-center">
          <h2 className="text-lg text-gray-600">전체 시연화면</h2>
          {onExit && (
            <button
              onClick={onExit}
              className="px-4 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition text-sm"
            >
              일반 모드로 돌아가기
            </button>
          )}
        </header>

        <div className="flex h-[calc(100%-2rem)] gap-4">
          {/* Left side - Fridge with display */}
          <div className="w-2/3 h-full relative">
            <FridgeComponent>
              <div className="w-full h-full rounded-md overflow-hidden border border-gray-300 shadow-inner flex items-center justify-center bg-gray-50">
                <div className="w-[85%] h-[85%] max-w-md max-h-[600px] overflow-hidden">
                  {isShowingInfoScreen ? (
                    <FridgeDisplay />
                  ) : (
                    <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                      냉장고 내부 카메라 화면
                    </div>
                  )}
                </div>
              </div>
            </FridgeComponent>
          </div>

          {/* Right side - Controls and information */}
          <div className="w-1/3 h-full flex flex-col gap-4">
            {/* Webcam view */}
            <div className="h-1/3">
              <div className="h-full p-2 bg-gray-200 rounded-md shadow">
                <WebcamView />
              </div>
            </div>

            {/* User info */}
            <div className="h-1/5">
              <UserInfoCard />
            </div>

            {/* Controls */}
            <div className="flex-1 bg-white rounded-md p-4 shadow">
              <h3 className="font-bold mb-4">제어 패널</h3>

              <div className="space-y-4">
                <button
                  onClick={() => setIsShowingInfoScreen(!isShowingInfoScreen)}
                  className="w-full py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
                >
                  {isShowingInfoScreen ? "내부 카메라 화면 보기" : "정보 화면 보기"}
                </button>

                <div className="p-3 bg-gray-100 rounded-md">
                  <p className="text-sm text-gray-700">상태: 사용자 인식됨</p>
                  <p className="text-sm text-gray-700">
                    화면: {isShowingInfoScreen ? "정보 화면" : "내부 카메라"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShowcaseScreen;
