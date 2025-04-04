import PinDialog from "@/components/dialog/PinDialog";
import { useDialog } from "@/contexts/DialogContext";
import { usePage } from "@/contexts/PageContext";
import { PageType } from "@/interfaces/PageType";
import {
  BsCalendarEvent,
  BsEyeglasses,
  BsHouseDoor,
  BsPencilSquare,
  BsPersonCircle,
} from "react-icons/bs";

interface BottomNavigationProps {
  currentPin: string;
  currentPage: PageType;
}

function BottomNavigation({ currentPin, currentPage }: BottomNavigationProps) {
  const { showDialog } = useDialog();
  const { navigateTo } = usePage();

  // Common classes for the navigation bar
  const baseClasses = "bg-white border-t flex justify-around items-center h-full px-4";

  // Remove fixed positioning since we're using a dedicated space
  const positionClasses = "w-full";

  const handleMonitoringClick = () => {
    if (currentPage !== "monitoring") {
      showDialog(<PinDialog correctPin={currentPin} onSuccess={() => navigateTo("monitoring")} />);
    }
  };

  return (
    <nav className={`${baseClasses} ${positionClasses}`}>
      <button
        type="button"
        className="flex flex-col items-center justify-center p-2"
        onClick={() => navigateTo("my")}
      >
        <BsPersonCircle
          className={`w-6 h-6 ${currentPage === "my" ? "text-orange-500" : "text-gray-600"}`}
        />
      </button>
      <button
        type="button"
        className="flex flex-col items-center justify-center p-2"
        onClick={() => navigateTo("meal")}
      >
        <BsCalendarEvent
          className={`w-6 h-6 ${currentPage === "meal" ? "text-orange-500" : "text-gray-600"}`}
        />
      </button>
      <button
        type="button"
        className="flex flex-col items-center justify-center p-2"
        onClick={() => navigateTo("main")}
      >
        <BsHouseDoor
          className={`w-6 h-6 ${currentPage === "main" ? "text-orange-500" : "text-gray-600"}`}
        />
      </button>
      {/* 입출고 로그 페이지 */}
      <button
        type="button"
        className="flex flex-col items-center justify-center p-2"
        onClick={() => navigateTo("logs")}
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
