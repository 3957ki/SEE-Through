import FridgeDisplay from "@/components/FridgeDisplay";
import Fridge from "@/components/showcase/Fridge";
import UserInfoCard from "@/components/showcase/UserInfoCard";
import WebcamView from "@/components/showcase/WebcamView";
import { useState } from "react";

function ShowcaseScreen() {
  const [isShowingInfoScreen, setIsShowingInfoScreen] = useState(true);

  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="relative w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1800px] h-[85vh] bg-gray-100 rounded-lg p-4 md:p-8 overflow-hidden shadow-2xl">
        <div className="flex h-full gap-4 md:gap-8">
          {/* Left side - Fridge with display */}
          <div className="w-2/3 h-full relative">
            <Fridge>
              <div className="w-full h-full rounded-md overflow-hidden border border-gray-300 shadow-inner flex items-center justify-center bg-gray-50">
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

          {/* Right side - Controls and information */}
          <div className="w-1/3 h-full flex flex-col gap-4 md:gap-6">
            {/* Webcam view */}
            <div className="h-1/3">
              <div className="h-full p-2 md:p-3 bg-gray-200 rounded-md shadow">
                <WebcamView />
              </div>
            </div>

            {/* User info */}
            <div className="h-1/5">
              <UserInfoCard />
            </div>

            {/* Controls */}
            <div className="flex-1 bg-white rounded-md p-4 md:p-6 shadow">
              <h3 className="font-bold mb-4 text-lg md:text-xl">제어 패널</h3>

              <div className="space-y-4 md:space-y-6">
                <button
                  type="button"
                  onClick={() => setIsShowingInfoScreen(!isShowingInfoScreen)}
                  className="w-full py-2 md:py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition text-sm md:text-base"
                >
                  {isShowingInfoScreen ? "내부 카메라 화면 보기" : "정보 화면 보기"}
                </button>

                <div className="p-3 md:p-4 bg-gray-100 rounded-md">
                  <p className="text-sm md:text-base text-gray-700">상태: 사용자 인식됨</p>
                  <p className="text-sm md:text-base text-gray-700">
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
