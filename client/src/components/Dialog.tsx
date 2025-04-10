import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";

interface DialogProps {
  content: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  danger?: boolean;
}

export function Dialog({ content, isOpen, onClose, danger = false }: DialogProps) {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (danger) {
      setIsBlinking(true);
      const interval = setInterval(() => {
        setIsBlinking((prev) => !prev);
      }, 500);

      return () => {
        clearInterval(interval);
        setIsBlinking(false);
      };
    }
  }, [danger]);

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center"
      style={{ backgroundColor: isBlinking ? "rgba(255, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className={cn(
          "w-5/6 p-6 rounded-lg shadow-xl bg-background text-foreground border border-border",
          "transform transition-all duration-300 ease-out flex flex-col"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close dialog"
        >
          <IoClose className="w-6 h-6 text-gray-500" />
        </button>
        <div className="w-full flex justify-center items-center">{content}</div>
      </div>
    </div>
  );
}
