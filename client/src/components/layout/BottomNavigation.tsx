import { useDialog } from "@/contexts/DialogContext";
import {
  BsCalendarEvent,
  BsEyeglasses,
  BsHouseDoor,
  BsPencilSquare,
  BsPersonCircle,
} from "react-icons/bs";
import PinModal from "../modal/PinModal";

// Available pages for navigation
export type PageType = "main" | "logs" | "monitoring" | "meal" | "my";

// Bottom Navigation Component
interface BottomNavigationProps {
  currentPin: string;
  onSuccess: () => void;
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  isFixed?: boolean; // New prop to control fixed vs relative positioning
}

function BottomNavigation({
  currentPin,
  onSuccess,
  currentPage,
  onNavigate,
  isFixed = true, // Default to fixed positioning for backward compatibility
}: BottomNavigationProps) {
  const { showDialog, hideDialog } = useDialog();

  // Common classes for the navigation bar
  const baseClasses = "bg-white border-t flex justify-around items-center h-14 px-4";

  // Add fixed positioning only when isFixed is true
  const positionClasses = isFixed ? "fixed bottom-0 left-0 right-0" : "w-full";

  const handleMonitoringClick = () => {
    if (currentPage !== "monitoring") {
      showDialog(<PinModal correctPin={currentPin} onSuccess={onSuccess} onClose={hideDialog} />);
    }
  };

  return (
    <nav className={`${baseClasses} ${positionClasses}`}>
      <button
        type="button"
        className="flex flex-col items-center justify-center p-2"
        onClick={() => onNavigate("my")}
      >
        <BsPersonCircle
          className={`w-6 h-6 ${currentPage === "my" ? "text-orange-500" : "text-gray-600"}`}
        />
      </button>
      <button
        type="button"
        className="flex flex-col items-center justify-center p-2"
        onClick={() => onNavigate("meal")}
      >
        <BsCalendarEvent
          className={`w-6 h-6 ${currentPage === "meal" ? "text-orange-500" : "text-gray-600"}`}
        />
      </button>
      <button
        type="button"
        className="flex flex-col items-center justify-center p-2"
        onClick={() => onNavigate("main")}
      >
        <BsHouseDoor
          className={`w-6 h-6 ${currentPage === "main" ? "text-orange-500" : "text-gray-600"}`}
        />
      </button>
      {/* 입출고 로그 페이지 */}
      <button
        type="button"
        className="flex flex-col items-center justify-center p-2"
        onClick={() => onNavigate("logs")}
      >
        <BsPencilSquare
          className={`w-6 h-6 ${currentPage === "logs" ? "text-orange-500" : "text-gray-600"}`}
        />
      </button>
      {/* Pin 번호 입력 창 */}
      <button
        type="button"
        className="flex flex-col items-center justify-center p-2"
        onClick={handleMonitoringClick}
      >
        <BsEyeglasses
          className={`w-6 h-6 ${currentPage === "monitoring" ? "text-orange-500" : "text-gray-600"}`}
        />
      </button>
    </nav>
  );
}

export default BottomNavigation;
