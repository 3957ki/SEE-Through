import BottomNavigation, { PageType } from "@/components/layout/BottomNavigation";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import ExamplePage from "@/pages/ExamplePage";
import MainPage from "@/pages/MainPage";
import ShowcaseScreen from "@/pages/ShowcaseScreen";
import { DialogContextProvider } from "@/providers/DialogContextProvider";
import MemberContextsProvider from "@/providers/MemberContextsProvider";
import { useRef, useState, type RefObject } from "react";

// Extend PageType to include a showcase option
export type ExtendedPageType = PageType | "showcase";

// ShowcaseToggleButton component
function ShowcaseToggleButton({ onClick, title }: { onClick: () => void; title: string }) {
  return (
    <Button
      variant="floating"
      size="floating"
      onClick={onClick}
      className="fixed bottom-20 right-4 z-50 flex items-center justify-center"
      title={title}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
    </Button>
  );
}

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
  // Set showcase mode as default
  const [showShowcase, setShowShowcase] = useState(true);

  const handleToggleShowcase = () => {
    setShowShowcase((prev) => !prev);
  };

  return (
    <MemberContextsProvider>
      {showShowcase ? (
        <>
          <ShowcaseScreen />
          <ShowcaseToggleButton onClick={handleToggleShowcase} title="일반 모드로 돌아가기" />
        </>
      ) : (
        <>
          <InternalFridgeDisplay />
          <ShowcaseToggleButton onClick={handleToggleShowcase} title="시연 모드 보기" />
        </>
      )}
    </MemberContextsProvider>
  );
}

export default App;
