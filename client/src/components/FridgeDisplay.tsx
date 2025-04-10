import screensaverImage from "@/assets/screen-saver.png";
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
import React, { useEffect, useMemo, useRef, useState } from "react";

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
        top: -1,
        left: -1,
        right: -1,
        bottom: -1,
        pointerEvents: isActive ? "auto" : "none",
        zIndex: 10,
        borderRadius: "inherit",
        overflow: "hidden",
        background: "linear-gradient(145deg, #232323 0%, #171717 100%)",
        border: "none",
        outline: "none",
        transform: "translateZ(0)",
      }}
    >
      <div className="w-full h-full flex items-center justify-center relative">
        <img
          src={screensaverImage}
          alt="화면보호기"
          className="w-full h-full object-cover"
          style={{
            borderRadius: "inherit",
            border: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(145deg, rgba(249, 249, 249, 0.5) 0%, rgba(238, 238, 238, 0.5) 36%, rgba(201, 201, 201, 0.5) 100%)",
            mixBlendMode: "overlay",
            borderRadius: "inherit",
            border: "none",
          }}
        />
      </div>
    </div>
  );
}

function FridgeDisplay({ ref, className = "", isScreensaverActive = false }: FridgeDisplayProps) {
  const [currentPin, setCurrentPin] = useState<string>("0000"); // 기본 비밀번호 0000
  const { dialogContent, hideDialog, isDanger } = useDialog();
  const displayRef = useRef<HTMLDivElement>(null);
  const { data: currentMember } = useCurrentMember();

  const [currentPage, setCurrentPage] = useState<PageType>("main");
  const navigateTo = (page: PageType) => {
    setCurrentPage(page);
  };

  const pageContextValue = useMemo(() => ({ currentPage, navigateTo }), [currentPage]);

  const resetPageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isScreensaverActive == true) {
      // 화면 꺼짐
      resetPageTimerRef.current = setTimeout(() => {
        setCurrentPage("main");
        hideDialog();
      }, 1000);
    } else {
      // 화면 켜짐
      if (resetPageTimerRef.current != null) {
        clearTimeout(resetPageTimerRef.current);
        resetPageTimerRef.current = null;
      }
    }
  }, [isScreensaverActive]);

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
            className="overflow-hidden flex flex-col rounded border relative w-full h-full bg-background text-foreground border-border text-base"
            style={{
              transition:
                "transform 0.5s cubic-bezier(0.2, 0, 0, 1), filter 0.5s cubic-bezier(0.2, 0, 0, 1)",
              transform: isScreensaverActive ? "scale(0.98)" : "scale(1)",
              // filter: isScreensaverActive ? "brightness(0.7)" : "brightness(1.05)",
            }}
          >
            {/* Header Section */}
            <div className="w-full shrink-0 h-14 relative z-20">{headers[currentPage]}</div>

            {/* Content Section */}
            <div className="flex-1 overflow-auto">
              <div className="px-4 py-4">{pages[currentPage]}</div>
            </div>

            {/* Navigation Section */}
            <div className="w-full shrink-0 h-14 relative z-10">
              <BottomNavigation currentPin={currentPin} currentPage={currentPage} />
            </div>

            {/* Dialog should be positioned correctly relative to the container */}
            <Dialog
              content={dialogContent}
              isOpen={dialogContent !== null}
              onClose={hideDialog}
              danger={isDanger}
            />

            {/* Screensaver Overlay */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: isScreensaverActive ? 1 : 0,
                transition: isScreensaverActive
                  ? "opacity 0.25s cubic-bezier(0.4, 0, 1, 1)" // Quick fade to black
                  : "opacity 0.6s cubic-bezier(0.33, 1, 0.68, 1)", // Dramatic fade-out with emphasis
                pointerEvents: isScreensaverActive ? "auto" : "none",
                zIndex: 100,
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
