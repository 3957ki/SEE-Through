import BottomNavigation, { PageType } from "@/components/layout/BottomNavigation";
import Header from "@/components/layout/Header";
import ExamplePage from "@/pages/ExamplePage";
import MainPage from "@/pages/MainPage";
import ShowcaseScreen from "@/pages/ShowcaseScreen";
import { DialogContextProvider } from "@/providers/DialogContextProvider";
import MemberContextsProvider from "@/providers/MemberContextsProvider";
import { useEffect, useRef, useState, type RefObject } from "react";

// Extend PageType to include a showcase option
export type ExtendedPageType = PageType | "showcase";

// For regular app display
function InternalFridgeDisplay() {
  const fridgeDisplayRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState<PageType>("main");

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-full h-full bg-white">
      <div ref={fridgeDisplayRef}>
        <DialogContextProvider
          portalTargetContainerRef={fridgeDisplayRef as RefObject<HTMLElement>}
        >
          <Header />
          {currentPage === "main" ? <MainPage /> : <ExamplePage />}
          <BottomNavigation currentPage={currentPage} onNavigate={handleNavigate} />
        </DialogContextProvider>
      </div>
    </div>
  );
}

// Main App with option to show showcase
function App() {
  // For development/demo purposes, use this to toggle showcase view
  const [showShowcase, setShowShowcase] = useState(false);

  // Add keyboard shortcut to toggle showcase view (Alt+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "s") {
        setShowShowcase((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleExitShowcase = () => {
    setShowShowcase(false);
  };

  return (
    <MemberContextsProvider>
      {showShowcase ? <ShowcaseScreen onExit={handleExitShowcase} /> : <InternalFridgeDisplay />}
    </MemberContextsProvider>
  );
}

export default App;
