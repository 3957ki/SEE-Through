import { createContext, type ReactNode, use, useCallback, useMemo, useState } from "react";

interface DialogContextType {
  showDialog: (content: ReactNode, danger?: boolean) => void;
  hideDialog: () => void;
  dialogContent: ReactNode | null;
  isDanger?: boolean;
}

export const DialogContext = createContext<DialogContextType | null>(null);

export function useDialog() {
  const context = use(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialogContent, setDialogContent] = useState<ReactNode | null>(null);
  const [isDanger, setIsDanger] = useState(false);

  const showDialog = useCallback((content: ReactNode, danger = false) => {
    setDialogContent(content);
    setIsDanger(danger);
  }, []);

  const hideDialog = useCallback(() => {
    setDialogContent(null);
    setIsDanger(false);
  }, []);

  const value = useMemo(
    () => ({ showDialog, hideDialog, dialogContent, isDanger }),
    [showDialog, hideDialog, dialogContent, isDanger]
  );

  return <DialogContext value={value}>{children}</DialogContext>;
}
