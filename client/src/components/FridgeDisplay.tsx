import BottomNavigation, { PageType } from "@/components/layout/BottomNavigation";
import Header from "@/components/layout/Header";
import ExamplePage from "@/components/pages/ExamplePage";
import MainPage from "@/components/pages/MainPage";
import MealPage from "@/components/pages/MealPage";
import { cn } from "@/lib/utils";
import { DialogContextProvider } from "@/providers/DialogContextProvider";
import { useRef, useState, type RefObject } from "react";
import PinModal from "./modal/PinModal";
import LogPage from "./pages/LogPage";
import MonitoringPage from "./pages/MonitoringPage";

interface FridgeDisplayProps {
  containerRef?: RefObject<HTMLElement>;
  className?: string;
  targetWidth?: number;
  targetHeight?: number;
}

// 각 페이지
const pages = {
  main: <MainPage />,
  logs: <LogPage />,
  monitoring: <MonitoringPage />,
  example: <ExamplePage />,
  meal: <MealPage />,
};

function FridgeDisplay({
  containerRef,
  className = "",
  targetWidth = 375,
  targetHeight = 667,
}: FridgeDisplayProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const fridgeDisplayRef = containerRef || localRef;
  const [currentPage, setCurrentPage] = useState<PageType>("main");
  const [showPinModal, setShowPinModal] = useState(false); // 넘버 패드 모달 state

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page);
  };

  // 현재 모니터링 페이지가 아닐때만 Pin Modal 작동
  const handlePinModal = (isShown: boolean) => {
    if (currentPage !== "monitoring") {
      setShowPinModal(isShown);
    }
  };

  // Pin 번호 성공시 모니터링 페이지로 이동
  const handlePinSuccess = () => {
    setShowPinModal(false);
    handleNavigate("monitoring");
  };

  return (
    <div
      className={cn(
        "bg-white overflow-hidden flex flex-col rounded shadow border border-gray-300 relative",
        className
      )}
      style={{
        width: `${targetWidth}px`,
        height: `${targetHeight}px`,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <DialogContextProvider portalTargetContainerRef={fridgeDisplayRef as RefObject<HTMLElement>}>
        <div className="w-full shrink-0">
          <Header />
        </div>

        <div
          ref={localRef}
          className="flex-1 overflow-auto"
          style={{ height: `calc(100% - 56px - 56px)` }}
        >
          <div className="px-1">{pages[currentPage]}</div>
        </div>

        <div className="w-full bg-white border-t">
          <BottomNavigation
            currentPage={currentPage}
            onNavigate={handleNavigate}
            setShowPinModal={handlePinModal}
            isFixed={false}
          />
        </div>
        {/* Pin 번호 입력창 모달 */}
        {showPinModal && (
          <PinModal
            correctPin="0000" // 임시 비밀번호 0000으로 함
            onSuccess={handlePinSuccess}
            onClose={() => setShowPinModal(false)}
          />
        )}
      </DialogContextProvider>
    </div>
  );
}

export default FridgeDisplay;
