import { type ReactNode } from "react";

interface CustomDialogProps {
  content: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function Dialog({ content, isOpen, onClose }: CustomDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 flex items-start justify-center z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div
        className="relative z-10 bg-white rounded-lg p-6 max-w-[350px] shadow-lg mx-4 mt-20"
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </div>
    </div>
  );
}
