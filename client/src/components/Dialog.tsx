import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { IoClose } from "react-icons/io5";

interface DialogProps {
  content: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function Dialog({ content, isOpen, onClose }: DialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className={cn(
          "w-11/12 max-w-[350px] p-6 rounded-lg shadow-xl bg-background text-foreground border border-border",
          "transform transition-all duration-300 ease-out flex flex-col"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
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
