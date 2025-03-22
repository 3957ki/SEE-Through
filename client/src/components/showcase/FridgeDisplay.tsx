import BottomNavigation, { PageType } from "@/components/layout/BottomNavigation";
import Header from "@/components/layout/Header";
import ExamplePage from "@/pages/ExamplePage";
import MainPage from "@/pages/MainPage";
import { DialogContextProvider } from "@/providers/DialogContextProvider";
import { useRef, useState, type RefObject } from "react";

function FridgeDisplay() {
  const fridgeDisplayRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState<PageType>("main");

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-full h-full bg-white overflow-hidden flex flex-col rounded shadow scale-[0.95] transform-origin-center">
      <div ref={fridgeDisplayRef} className="flex-1 overflow-auto relative">
        <DialogContextProvider
          portalTargetContainerRef={fridgeDisplayRef as RefObject<HTMLElement>}
        >
          <div className="transform scale-[0.9] origin-top">
            <Header />
          </div>
          <div className="pb-12 px-1 text-sm">
            {currentPage === "main" ? <MainPage /> : <ExamplePage />}
          </div>
          <div className="absolute bottom-0 left-0 right-0 transform scale-[0.9] origin-bottom">
            <BottomNavigation
              currentPage={currentPage}
              onNavigate={handleNavigate}
              isFixed={false}
            />
          </div>
        </DialogContextProvider>
      </div>
    </div>
  );
}

export default FridgeDisplay;
