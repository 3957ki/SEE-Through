import { createContext, type ReactNode, use } from "react";

interface DialogContextType {
  showDialog: (content: ReactNode) => void;
  hideDialog: () => void;
}

export const DialogContext = createContext<DialogContextType | null>(null);

export function useDialog() {
  const context = use(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}
