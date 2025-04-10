import screensaverImage from "@/assets/screen-saver.png";
import { Dialog } from "@/components/Dialog";
import { MemberSwitcherDialog } from "@/components/dialog/MemberSwitcherDialog";
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
import { BsPersonCircle, BsSun, BsSunrise } from "react-icons/bs";

interface FridgeDisplayProps {
  className?: string;
  ref?: React.RefObject<HTMLDivElement | null>;
  isScreensaverActive?: boolean;
}

// Mockup Components
function MockupGreetingSection() {
  const { showDialog } = useDialog();

  return (
    <div className="py-4">
      <div className="flex items-center gap-4 px-4">
        <div
          className="h-16 w-16 bg-muted rounded-full overflow-hidden animate-pulse [animation-duration:1.5s] cursor-pointer"
          onClick={() => showDialog(<MemberSwitcherDialog />)}
        >
          <BsPersonCircle className="w-full h-full text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <div className="h-7 w-32 bg-muted rounded animate-pulse [animation-duration:1.5s]"></div>
          <div className="h-7 w-24 bg-muted rounded animate-pulse [animation-duration:1.5s]"></div>
        </div>
      </div>
    </div>
  );
}

function MockupMealSection() {
  const meals = [
    { title: "아침", icon: BsSunrise, color: "text-orange-500" },
    { title: "점심", icon: BsSun, color: "text-amber-500" },
  ];

  return (
    <div className="py-4">
      <div className="flex items-center gap-1 px-4 mb-3">
        <div className="h-4 w-4 bg-muted rounded animate-pulse [animation-duration:1.5s]"></div>
        <div className="h-5 w-32 bg-muted rounded animate-pulse [animation-duration:1.5s]"></div>
      </div>
      <div className="px-4 flex gap-4">
        {meals.map((meal, index) => (
          <div
            key={index}
            className={`relative w-full rounded-xl shadow-lg cursor-pointer overflow-hidden flex flex-col justify-between p-4 ${
              index === 0 ? "bg-primary" : "bg-secondary"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <meal.icon className={`${index === 0 ? "text-white" : "text-black"} mr-2`} />
                <div
                  className={`h-5 w-16 rounded animate-pulse [animation-duration:1.5s] ${
                    index === 0 ? "bg-white/20" : "bg-black/20"
                  }`}
                ></div>
              </div>
              <div
                className={`h-7 w-7 rounded-full animate-pulse [animation-duration:1.5s] ${
                  index === 0 ? "bg-white/20" : "bg-black/20"
                }`}
              ></div>
            </div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`h-4 w-full rounded animate-pulse [animation-duration:1.5s] ${
                    index === 0 ? "bg-white/20" : "bg-black/20"
                  }`}
                ></div>
              ))}
            </div>
            <div className="absolute bottom-0 right-0 w-16 h-16 rounded-full bg-white/10 -mr-8 -mb-8"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupIngredientsSection() {
  return (
    <div className="py-3">
      <div className="flex items-center px-3 mb-2">
        <div className="w-1 h-5 bg-muted rounded mr-2 animate-pulse [animation-duration:1.5s]"></div>
        <div className="h-5 w-24 bg-muted rounded animate-pulse [animation-duration:1.5s]"></div>
      </div>
      <div className="px-2">
        <div className="grid grid-cols-4 gap-2">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="aspect-square bg-muted rounded-lg animate-pulse [animation-duration:1.5s]"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
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
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [currentPage]);

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
  }, [isScreensaverActive, hideDialog]);

  const headers = {
    main: <MainHeader />,
    logs: <LogHeader />,
    monitoring: <MonitoringHeader />,
    meal: <MealHeader />,
    my: <MyHeader />,
  };

  const pages = {
    main: currentMember ? (
      <MainPage />
    ) : (
      <div className="pb-16 relative">
        <MockupGreetingSection />
        <MockupMealSection />
        <MockupIngredientsSection />
      </div>
    ),
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
            <div ref={contentRef} className="flex-1 overflow-auto">
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
