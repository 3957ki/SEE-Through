import FridgeDisplay from "@/components/FridgeDisplay";
import ShowcaseScreen from "@/components/ShowcaseScreen";
import { Button } from "@/components/ui/button";
import { CurrentMemberIdProvider } from "@/contexts/CurrentMemberIdContext";
import { DialogProvider } from "@/contexts/DialogContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useRef, useState } from "react";

function ShowcaseToggleButton({ onClick, title }: { onClick: () => void; title: string }) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      className="fixed z-50 flex items-center justify-center"
      style={{
        bottom: "2vh",
        right: "7vh",
        width: "4vh",
        height: "4vh",
        fontSize: "2vh",
      }}
      title={title}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          width: "2vh",
          height: "2vh",
        }}
      >
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
    </Button>
  );
}

function App() {
  const [isShowcase, setIsShowcase] = useState(true);
  const fridgeDisplayRef = useRef<HTMLDivElement>(null);

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <CurrentMemberIdProvider>
        <AppContent
          isShowcase={isShowcase}
          setIsShowcase={setIsShowcase}
          fridgeDisplayRef={fridgeDisplayRef}
        />
      </CurrentMemberIdProvider>
    </QueryClientProvider>
  );
}

function AppContent({
  isShowcase,
  setIsShowcase,
  fridgeDisplayRef,
}: {
  isShowcase: boolean;
  setIsShowcase: React.Dispatch<React.SetStateAction<boolean>>;
  fridgeDisplayRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <DialogProvider>
      {isShowcase ? (
        <ShowcaseScreen />
      ) : (
        <div className="w-screen h-screen bg-background flex items-center justify-center overflow-hidden">
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
              <FridgeDisplay ref={fridgeDisplayRef} />
            </div>
          </div>
        </div>
      )}
      {/* <ShowcaseToggleButton
        onClick={() => setIsShowcase((prev) => !prev)}
        title="toggle showcase"
      /> */}
    </DialogProvider>
  );
}

export default App;
