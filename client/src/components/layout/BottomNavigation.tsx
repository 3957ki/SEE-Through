import PinDialog from "@/components/dialog/PinDialog";
import { useDialog } from "@/contexts/DialogContext";
import { usePage } from "@/contexts/PageContext";
import { PageType } from "@/interfaces/PageType";
import { cn } from "@/lib/utils";
import { BsCameraVideo, BsClockHistory, BsHouseDoor, BsPerson } from "react-icons/bs";
import { IoFastFoodOutline } from "react-icons/io5";

interface BottomNavigationProps {
  currentPin: string;
  currentPage: PageType;
}

export default function BottomNavigation({ currentPin, currentPage }: BottomNavigationProps) {
  const { navigateTo } = usePage();
  const { showDialog } = useDialog();

  const handleNavigate = (page: PageType) => {
    if (page === "monitoring") {
      showDialog(<PinDialog correctPin={currentPin} onSuccess={() => navigateTo("monitoring")} />);
    } else {
      navigateTo(page);
    }
  };

  const navItems = [
    {
      icon: <BsPerson className="w-6 h-6" />,
      label: "내 정보",
      page: "my" as PageType,
    },
    {
      icon: <IoFastFoodOutline className="w-6 h-6" />,
      label: "식단",
      page: "meal" as PageType,
    },
    {
      icon: <BsHouseDoor className="w-6 h-6" />,
      label: "홈",
      page: "main" as PageType,
    },
    {
      icon: <BsClockHistory className="w-6 h-6" />,
      label: "로그",
      page: "logs" as PageType,
    },
    {
      icon: <BsCameraVideo className="w-6 h-6" />,
      label: "모니터링",
      page: "monitoring" as PageType,
    },
  ];

  return (
    <nav className="w-full h-full flex items-center justify-around bg-background/95 shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
      {navItems.map((item) => (
        <button
          type="button"
          key={item.page}
          onClick={() => handleNavigate(item.page)}
          className={cn(
            "flex flex-col items-center justify-center gap-1 flex-1 h-full",
            "transition-colors duration-200",
            currentPage === item.page ? "text-primary" : "text-foreground"
          )}
        >
          {item.icon}
          <span className="text-xs">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
