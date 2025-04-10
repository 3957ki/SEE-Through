import FridgeDisplay from "@/components/FridgeDisplay";
import ShowcaseScreen from "@/components/ShowcaseScreen";
import { CurrentMemberIdProvider } from "@/contexts/CurrentMemberIdContext";
import { DialogProvider } from "@/contexts/DialogContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useRef } from "react";

function App() {
  // const [isShowcase, setIsShowcase] = useState(true);
  const fridgeDisplayRef = useRef<HTMLDivElement>(null);

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <CurrentMemberIdProvider>
        <AppContent isShowcase={true} fridgeDisplayRef={fridgeDisplayRef} />
      </CurrentMemberIdProvider>
    </QueryClientProvider>
  );
}

function AppContent({
  isShowcase,
  fridgeDisplayRef,
}: {
  isShowcase: boolean;
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
    </DialogProvider>
  );
}

export default App;
