import BottomNavigation, { PageType } from "@/components/layout/BottomNavigation";
import Header from "@/components/layout/Header";
import ExamplePage from "@/pages/ExamplePage";
import MainPage from "@/pages/MainPage";
import { DialogContextProvider } from "@/providers/DialogContextProvider";
import MemberContextsProvider from "@/providers/MemberContextsProvider";
import { useRef, useState, type RefObject } from "react";

function FridgeDisplay() {
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

function App() {
  return (
    <MemberContextsProvider>
      <FridgeDisplay />
    </MemberContextsProvider>
  );
}

export default App;
