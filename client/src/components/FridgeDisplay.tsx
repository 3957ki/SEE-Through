import { Dialog } from "@/components/Dialog";
import LogHeader from "@/components/headers/LogHeader";
import MainHeader from "@/components/headers/MainHeader";
import MealHeader from "@/components/headers/MealHeader";
import MonitoringHeader from "@/components/headers/MonitoringHeader";
import MyHeader from "@/components/headers/MyHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import LogPage from "@/components/pages/LogPage";
import MainPage from "@/components/pages/MainPage";
import MealPage from "@/components/pages/MealPage";
import MonitoringPage from "@/components/pages/MonitoringPage";
import MyPage from "@/components/pages/MyPage";
import { useDialog } from "@/contexts/DialogContext";
import { PageContext } from "@/contexts/PageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PageType } from "@/interfaces/PageType";
import { cn } from "@/lib/utils";
import { useCurrentMember } from "@/queries/members";
import React, { useMemo, useRef, useState } from "react";

interface FridgeDisplayProps {
  className?: string;
  ref?: React.RefObject<HTMLDivElement | null>;
  isScreensaverActive?: boolean;
}

function Screensaver({ isActive }: { isActive: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#1c1c1c",
        opacity: isActive ? 1 : 0,
        transition: "opacity 0.25s cubic-bezier(0.4, 0, 1, 1)", // quick pop transition for both on/off
        pointerEvents: isActive ? "auto" : "none",
        zIndex: 10,
        borderRadius: "0.375rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        background: "linear-gradient(145deg, #232323 0%, #171717 100%)",
      }}
    >
      <div className="w-full h-full flex items-center justify-center" />
    </div>
  );
}

function FridgeDisplay({ ref, className = "", isScreensaverActive = false }: FridgeDisplayProps) {
  const [currentPin, setCurrentPin] = useState<string>("0000"); // 기본 비밀번호 0000
  const { dialogContent, hideDialog } = useDialog();
  const displayRef = useRef<HTMLDivElement>(null);
  const { data: currentMember } = useCurrentMember();

  const [currentPage, setCurrentPage] = useState<PageType>("main");
  const navigateTo = (page: PageType) => {
    setCurrentPage(page);
  };

  const pageContextValue = useMemo(() => ({ currentPage, navigateTo }), [currentPage]);

  const headers = {
    main: <MainHeader />,
    logs: <LogHeader />,
    monitoring: <MonitoringHeader />,
    meal: <MealHeader />,
    my: <MyHeader />,
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
      <ThemeProvider currentMember={currentMember}>
        <PageContext value={pageContextValue}>
          <div
            ref={displayRef}
            className="overflow-hidden flex flex-col rounded shadow border relative w-full h-full bg-background text-foreground border-border text-base"
            style={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            {/* Header Section */}
            <div className="w-full shrink-0 h-14">{headers[currentPage]}</div>

            {/* Content Section */}
            <div className="flex-1 overflow-auto">
              <div className="px-4 py-4">{pages[currentPage]}</div>
            </div>

            {/* Navigation Section */}
            <div className="w-full shrink-0 h-14 relative z-10">
              <BottomNavigation currentPin={currentPin} currentPage={currentPage} />
            </div>

            {/* Dialog should be positioned correctly relative to the container */}
            <Dialog content={dialogContent} isOpen={dialogContent !== null} onClose={hideDialog} />

            {/* Screensaver Overlay */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: isScreensaverActive ? 1 : 0,
                transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                pointerEvents: isScreensaverActive ? "auto" : "none",
              }}
            >
              <Screensaver isActive={isScreensaverActive} />
            </div>
          </div>
        </PageContext>
      </ThemeProvider>
    </div>
  );
}

FridgeDisplay.displayName = "FridgeDisplay";

export default FridgeDisplay;
