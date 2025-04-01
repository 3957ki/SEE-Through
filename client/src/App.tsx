import FridgeDisplay from "@/components/FridgeDisplay";
import { PageType } from "@/components/layout/BottomNavigation";
import ShowcaseScreen from "@/components/ShowcaseScreen";
import { Button } from "@/components/ui/button";
import IngredientsProivder from "@/providers/IngredientsContextProvider";
import MemberContextsProvider from "@/providers/MemberContextsProvider";
import { disconnectLocalServer, initLocalServerWebSocket } from "@/services/websocketService";
import { useEffect, useState } from "react";

// Extend PageType to include a showcase option
export type ExtendedPageType = PageType | "showcase";

// ShowcaseToggleButton component
function ShowcaseToggleButton({ onClick, title }: { onClick: () => void; title: string }) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      className="fixed bottom-4 right-4 z-50 flex items-center justify-center"
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
  const [isShowcase, setIsShowcase] = useState(true);

  // Initialize WebSocket connection when the app starts
  useEffect(() => {
    initLocalServerWebSocket();

    return () => {
      disconnectLocalServer();
    };
  }, []);

  return (
    <MemberContextsProvider>
      <IngredientsProivder>
        {isShowcase ? (
          <ShowcaseScreen />
        ) : (
          <div className="w-screen h-screen bg-gray-100 flex items-center justify-center overflow-hidden">
            <div className="relative w-full h-full max-w-screen max-h-screen flex items-center justify-center">
              <div
                style={{
                  width: "min(100vw, calc(100vh * 720/1280))",
                  height: "min(100vh, calc(100vw * 1280/720))",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  position: "relative",
                }}
              >
                <FridgeDisplay />
              </div>
            </div>
          </div>
        )}
        <ShowcaseToggleButton
          onClick={() => setIsShowcase((prev) => !prev)}
          title="toggle showcase"
        />
      </IngredientsProivder>
    </MemberContextsProvider>
  );
}

export default App;
