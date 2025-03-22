import Header from "@/components/layout/Header";
import MainPage from "@/pages/MainPage";
import { DialogContextProvider } from "@/providers/DialogContextProvider";
import MemberContextsProvider from "@/providers/MemberContextsProvider";
import { useRef, type RefObject } from "react";

function FridgeDisplay() {
  const fridgeDisplayRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full h-full bg-white">
      <div ref={fridgeDisplayRef}>
        <DialogContextProvider
          portalTargetContainerRef={fridgeDisplayRef as RefObject<HTMLElement>}
        >
          <Header />
          <MainPage />
        </DialogContextProvider>
      </div>
    </div>
  );
}

function App() {
  return (
    <MemberContextsProvider>
      <FridgeDisplay />
    </MemberContextsProvider>
  );
}

export default App;
