import { Dialog } from "@/components/Dialog";
import MainHeader from "@/components/headers/MainHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import LogPage from "@/components/pages/LogPage";
import MainPage from "@/components/pages/MainPage";
import MealPage from "@/components/pages/MealPage";
import MonitoringPage from "@/components/pages/MonitoringPage";
import MyPage from "@/components/pages/MyPage";
import { useDialog } from "@/contexts/DialogContext";
import { PageContext } from "@/contexts/PageContext";
import { PageType } from "@/interfaces/PageType";
import { cn } from "@/lib/utils";
import React, { useMemo, useRef, useState } from "react";

interface FridgeDisplayProps {
  className?: string;
  ref?: React.RefObject<HTMLDivElement | null>;
}

function FridgeDisplay({ ref, className = "" }: FridgeDisplayProps) {
  const [currentPin, setCurrentPin] = useState<string>("0000"); // 기본 비밀번호 0000
  const { dialogContent, hideDialog } = useDialog();
  const displayRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState<PageType>("main");
  const navigateTo = (page: PageType) => {
    setCurrentPage(page);
  };

  const pageContextValue = useMemo(() => ({ currentPage, navigateTo }), [currentPage]);

  const headers = {
    main: <MainHeader />,
    logs: <MainHeader />,
    monitoring: <MainHeader />,
    meal: <MainHeader />,
    my: <MainHeader />,
  };

  const pages = {
    main: <MainPage />,
    logs: <LogPage />,
    monitoring: <MonitoringPage currentPin={currentPin} onPinChange={setCurrentPin} />,
    meal: <MealPage />,
    my: <MyPage />,
  };

  return (
    <div ref={ref} className={cn("w-full h-full flex items-center justify-center", className)}>
      <PageContext value={pageContextValue}>
        <div
          ref={displayRef}
          className="bg-white overflow-hidden flex flex-col rounded shadow border border-gray-300 relative"
          style={{
            width: "100%",
            height: "100%",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <div className="w-full shrink-0">{headers[currentPage]}</div>

          <div
            className="flex-1 overflow-auto relative"
            style={{ height: `calc(100% - 56px - 56px)` }}
          >
            <div className="px-1">{pages[currentPage]}</div>
          </div>

          <div className="w-full bg-white border-t">
            <BottomNavigation currentPin={currentPin} currentPage={currentPage} isFixed={false} />
          </div>
          <Dialog content={dialogContent} isOpen={dialogContent !== null} onClose={hideDialog} />
        </div>
      </PageContext>
    </div>
  );
}

FridgeDisplay.displayName = "FridgeDisplay";

export default FridgeDisplay;
