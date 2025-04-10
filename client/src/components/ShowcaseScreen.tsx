import backgroundImage from "@/assets/background.png";
import Fridge from "@/components/showcase/Fridge";
import Table from "@/components/showcase/Table";
import UserInfoCard from "@/components/showcase/UserInfoCard";
import WebcamView from "@/components/showcase/WebcamView";
import { useShowcaseIngredients } from "@/queries/showcaseIngredients";
import { useState } from "react";

function ShowcaseScreen() {
  const { insideIngredients, outsideIngredients, isLoading } = useShowcaseIngredients();
  const [screensaverActive, setScreensaverActive] = useState(true);

  // 화면 보호기 활성화 함수
  const activateScreensaver = () => {
    setScreensaverActive(true);
  };

  // 화면 보호기 비활성화 함수
  const deactivateScreensaver = () => {
    setScreensaverActive(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading ingredients...</div>
    );
  }

  return (
    <div
      className="min-h-screen relative bg-blue-50"
      style={{
        position: "relative",
        overflow: "hidden",
        fontSize: "1.5vh", // Set base font size relative to viewport height
      }}
    >
      {/* 배경 이미지 컨테이너 */}
      <div
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.5, // 투명도 설정 (0.0 - 1.0)
          zIndex: 0,
        }}
      ></div>

      {/* 콘텐츠 컨테이너 */}
      <div
        className="flex w-full h-[100vh] relative z-10"
        style={{
          gap: "3vh",
          padding: "2vh",
        }}
      >
        {/* Left Area - Fridge and Drop Zone */}
        <div className="w-7/10 h-full relative">
          <Fridge insideIngredients={insideIngredients} isActive={screensaverActive} />
        </div>

        {/* Right Area - Controls and Ingredient Table */}
        <div className="w-1/5 h-full flex flex-col relative ml-auto" style={{ gap: "2.5vh" }}>
          <div className="h-1/">
            <WebcamView
              onActivateScreensaver={activateScreensaver}
              onDeactivateScreensaver={deactivateScreensaver}
            />
          </div>
          <div className="h-1/3">
            <UserInfoCard />
          </div>
        </div>
      </div>

      {/* Table positioned outside the flex container */}
      <div className="absolute bottom-[-1vh] right-[-16vh] w-full h-full pointer-events-none z-20">
        <Table outsideIngredients={outsideIngredients} />
      </div>
    </div>
  );
}

export default ShowcaseScreen;
