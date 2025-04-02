import { type ReactNode } from "react";

interface CustomDialogProps {
  content: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function Dialog({ content, isOpen, onClose }: CustomDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div
        className="relative z-10 bg-white rounded-lg p-6 shadow-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </div>
    </div>
  );
}
