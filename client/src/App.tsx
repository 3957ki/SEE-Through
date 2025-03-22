import Header from "@/components/layout/Header";
import ExamplePage from "@/pages/ExamplePage";
import MainPage from "@/pages/MainPage";
import { DialogContextProvider } from "@/providers/DialogContextProvider";
import MemberContextsProvider from "@/providers/MemberContextsProvider";
import { useRef, useState, type RefObject } from "react";
import {
  BsCalendarEvent,
  BsEyeglasses,
  BsHouseDoor,
  BsPencilSquare,
  BsPersonCircle,
} from "react-icons/bs";

// Available pages for navigation
type PageType = "main" | "example";

// Bottom Navigation Component
interface BottomNavigationProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

function BottomNavigation({ currentPage, onNavigate }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-14 px-4">
      <button className="flex flex-col items-center justify-center p-2">
        <BsPersonCircle className="w-6 h-6 text-gray-600" />
      </button>
      <button className="flex flex-col items-center justify-center p-2">
        <BsCalendarEvent className="w-6 h-6 text-gray-600" />
      </button>
      <button
        className="flex flex-col items-center justify-center p-2"
        onClick={() => onNavigate("main")}
      >
        <BsHouseDoor
          className={`w-6 h-6 ${currentPage === "main" ? "text-orange-500" : "text-gray-600"}`}
        />
      </button>
      <button className="flex flex-col items-center justify-center p-2">
        <BsPencilSquare className="w-6 h-6 text-gray-600" />
      </button>
      <button
        className="flex flex-col items-center justify-center p-2"
        onClick={() => onNavigate("example")}
      >
        <BsEyeglasses
          className={`w-6 h-6 ${currentPage === "example" ? "text-orange-500" : "text-gray-600"}`}
        />
      </button>
    </nav>
  );
}

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
