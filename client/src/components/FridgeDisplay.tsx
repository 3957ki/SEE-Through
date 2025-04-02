import BottomNavigation, { PageType } from "@/components/layout/BottomNavigation";
import Header from "@/components/layout/Header";
import MainPage from "@/components/pages/MainPage";
import MealPage from "@/components/pages/MealPage";
import MyPage from "@/components/pages/MyPage";
import { DialogProvider } from "@/contexts/DialogContext";
import { cn } from "@/lib/utils";
import { useRef, useState, type RefObject } from "react";
import LogPage from "./pages/LogPage";
import MonitoringPage from "./pages/MonitoringPage";

interface FridgeDisplayProps {
  className?: string;
}

function FridgeDisplay({ className = "" }: FridgeDisplayProps) {
  const displayRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState<PageType>("main");
  const [currentPin, setCurrentPin] = useState<string>("0000"); // 기본 비밀번호 0000

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
    <div
      ref={displayRef}
      className={cn("w-full h-full flex items-center justify-center", className)}
    >
      <div
        className="bg-white overflow-hidden flex flex-col rounded shadow border border-gray-300 relative"
        style={{
          width: "100%",
          height: "100%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          fontSize: "calc(16px * 0.3)", // Scale down font size
        }}
      >
        <DialogProvider portalTargetContainerRef={displayRef as RefObject<HTMLElement>}>
          <div className="w-full shrink-0">
            <Header />
          </div>

          <div className="flex-1 overflow-auto" style={{ height: `calc(100% - 56px - 56px)` }}>
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
        </DialogProvider>
      </div>
    </div>
  );
}

export default FridgeDisplay;
