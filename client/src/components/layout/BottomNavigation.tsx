import {
  BsCalendarEvent,
  BsEyeglasses,
  BsHouseDoor,
  BsPencilSquare,
  BsPersonCircle,
} from "react-icons/bs";

// Available pages for navigation
export type PageType = "main" | "example" | "logs" | "monitoring";

// Bottom Navigation Component
interface BottomNavigationProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  setShowPinModal: (isShown: boolean) => void;
  isFixed?: boolean; // New prop to control fixed vs relative positioning
}

function BottomNavigation({
  currentPage,
  onNavigate,
  setShowPinModal,
  isFixed = true, // Default to fixed positioning for backward compatibility
}: BottomNavigationProps) {
  // Common classes for the navigation bar
  const baseClasses = "bg-white border-t flex justify-around items-center h-14 px-4";

  // Add fixed positioning only when isFixed is true
  const positionClasses = isFixed ? "fixed bottom-0 left-0 right-0" : "w-full";

  return (
    <nav className={`${baseClasses} ${positionClasses}`}>
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
      {/* 입출고 로그 페이지 */}
      <button
        className="flex flex-col items-center justify-center p-2"
        onClick={() => onNavigate("logs")}
      >
        <BsPencilSquare
          className={`w-6 h-6 ${currentPage === "logs" ? "text-orange-500" : "text-gray-600"}`}
        />
      </button>
      {/* Pin 번호 입력 창 */}
      <button
        className="flex flex-col items-center justify-center p-2"
        onClick={() => setShowPinModal(true)}
      >
        <BsEyeglasses
          className={`w-6 h-6 ${currentPage === "monitoring" ? "text-orange-500" : "text-gray-600"}`}
        />
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

export default BottomNavigation;
