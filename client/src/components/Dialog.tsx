import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface DialogProps {
  content: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function Dialog({ content, isOpen, onClose }: DialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full max-w-md p-6 rounded-lg shadow-xl bg-background text-foreground border border-border",
          "transform transition-all duration-300 ease-out flex flex-col"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex justify-center items-center">{content}</div>
      </div>
    </div>
  );
}
