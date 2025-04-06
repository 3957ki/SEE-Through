import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface DialogProps {
  content: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function Dialog({ content, isOpen, onClose }: DialogProps) {
  const theme = useTheme();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full max-w-md p-6 rounded-lg shadow-xl",
          "transform transition-all duration-300 ease-out"
        )}
        style={{
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
          color: theme.colors.text,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </div>
    </div>
  );
}
