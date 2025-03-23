import BottomNavigation, { PageType } from "@/components/layout/BottomNavigation";
import Header from "@/components/layout/Header";
import ExamplePage from "@/components/pages/ExamplePage";
import MainPage from "@/components/pages/MainPage";
import MealPage from "@/components/pages/MealPage";
import { cn } from "@/lib/utils";
import { DialogContextProvider } from "@/providers/DialogContextProvider";
import { useRef, useState, type RefObject } from "react";

interface FridgeDisplayProps {
  containerRef?: RefObject<HTMLElement>;
  className?: string;
  targetWidth?: number;
  targetHeight?: number;
}

function FridgeDisplay({
  containerRef,
  className = "",
  targetWidth = 375,
  targetHeight = 667,
}: FridgeDisplayProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const fridgeDisplayRef = containerRef || localRef;
  const [currentPage, setCurrentPage] = useState<PageType>("main");

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page);
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
          <div className="px-1">
            {(() => {
              switch (currentPage) {
                case "main":
                  return <MainPage />;
                case "example":
                  return <ExamplePage />;
                case "meal":
                  return <MealPage />;
                default:
                  return <MainPage />;
              }
            })()}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 w-full bg-white border-t">
          <BottomNavigation currentPage={currentPage} onNavigate={handleNavigate} isFixed={false} />
        </div>
      </DialogContextProvider>
    </div>
  );
}

export default FridgeDisplay;
