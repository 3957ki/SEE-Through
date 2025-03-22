import { PageType } from "@/components/layout/BottomNavigation";
import FridgeDisplay from "@/components/showcase/FridgeDisplay";
import { Button } from "@/components/ui/button";
import ShowcaseScreen from "@/pages/ShowcaseScreen";
import MemberContextsProvider from "@/providers/MemberContextsProvider";
import { useEffect, useState } from "react";

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

// Main App with option to show showcase
function App() {
  // Set showcase mode as default
  const [showShowcase, setShowShowcase] = useState(true);
  const [scale, setScale] = useState(1);

  const handleToggleShowcase = () => {
    setShowShowcase((prev) => !prev);
  };

  // Calculate appropriate scale based on viewport dimensions
  useEffect(() => {
    if (!showShowcase) {
      const handleResize = () => {
        const targetWidth = 375;
        const targetHeight = 667;
        const widthScale = (window.innerWidth * 0.85) / targetWidth;
        const heightScale = (window.innerHeight * 0.85) / targetHeight;
        setScale(Math.min(widthScale, heightScale));
      };

      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [showShowcase]);

  return (
    <MemberContextsProvider>
      {showShowcase ? (
        <>
          <ShowcaseScreen />
          <ShowcaseToggleButton onClick={handleToggleShowcase} title="일반 모드로 돌아가기" />
        </>
      ) : (
        <div className="w-screen h-screen flex items-center justify-center bg-gray-100 overflow-hidden">
          <div className="relative max-h-full max-w-full flex items-center justify-center">
            <div style={{ transform: `scale(${scale})` }}>
              <FridgeDisplay targetWidth={375} targetHeight={667} />
            </div>
          </div>
          <ShowcaseToggleButton onClick={handleToggleShowcase} title="시연 모드 보기" />
        </div>
      )}
    </MemberContextsProvider>
  );
}

export default App;
