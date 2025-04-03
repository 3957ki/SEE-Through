import { createContext, type ReactNode, use, useCallback, useMemo, useState } from "react";

interface DialogContextType {
  showDialog: (content: ReactNode) => void;
  hideDialog: () => void;
  dialogContent: ReactNode | null;
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

  const showDialog = useCallback((content: ReactNode) => {
    console.log("showDialog", content);
    setDialogContent(content);
  }, []);

  const hideDialog = useCallback(() => {
    setDialogContent(null);
  }, []);

  const value = useMemo(
    () => ({ showDialog, hideDialog, dialogContent }),
    [showDialog, hideDialog, dialogContent]
  );

  return <DialogContext value={value}>{children}</DialogContext>;
}
