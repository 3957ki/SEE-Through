import BottomNavigation, { PageType } from "@/components/layout/BottomNavigation";
import Header from "@/components/layout/Header";
import LogPage from "@/components/pages/LogPage";
import MainPage from "@/components/pages/MainPage";
import MealPage from "@/components/pages/MealPage";
import MonitoringPage from "@/components/pages/MonitoringPage";
import MyPage from "@/components/pages/MyPage";
import { useDialog } from "@/contexts/DialogContext";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Dialog } from "./Dialog";

interface FridgeDisplayProps {
  className?: string;
}

const FridgeDisplay = ({
  ref,
  className = "",
}: FridgeDisplayProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
  const [currentPage, setCurrentPage] = useState<PageType>("main");
  const [currentPin, setCurrentPin] = useState<string>("0000"); // 기본 비밀번호 0000
  const { dialogContent, hideDialog } = useDialog();

  // 각 페이지
  const pages = {
    main: <MainPage onShowMealPage={() => handleNavigate("meal")} />,
    logs: <LogPage />,
    monitoring: <MonitoringPage currentPin={currentPin} onPinChange={setCurrentPin} />,
    meal: <MealPage />,
    my: <MyPage />,
  };

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page);
  };

  // Pin 번호 성공시 모니터링 페이지로 이동
  const handlePinSuccess = () => {
    handleNavigate("monitoring");
  };

  return (
    <div ref={ref} className={cn("w-full h-full flex items-center justify-center", className)}>
      <div
        className="bg-white overflow-hidden flex flex-col rounded shadow border border-gray-300 relative"
        style={{
          width: "100%",
          height: "100%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          fontSize: "calc(16px * 0.3)", // Scale down font size
        }}
      >
        <div className="w-full shrink-0">
          <Header />
        </div>

        <div
          className="flex-1 overflow-auto relative"
          style={{ height: `calc(100% - 56px - 56px)` }}
        >
          <div className="px-1">{pages[currentPage]}</div>
        </div>

        <div className="w-full bg-white border-t">
          <BottomNavigation
            currentPin={currentPin}
            onSuccess={handlePinSuccess}
            currentPage={currentPage}
            onNavigate={handleNavigate}
            isFixed={false}
          />
        </div>
        <Dialog content={dialogContent} isOpen={dialogContent !== null} onClose={hideDialog} />
      </div>
    </div>
  );
};

FridgeDisplay.displayName = "FridgeDisplay";

export default FridgeDisplay;
