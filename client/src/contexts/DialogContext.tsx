import { Dialog } from "@/components/Dialog";
import {
  createContext,
  type ReactNode,
  RefObject,
  use,
  useCallback,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";

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

export function DialogProvider({
  children,
  portalTargetContainerRef,
}: {
  children: ReactNode;
  portalTargetContainerRef: RefObject<HTMLElement>;
}) {
  const [dialogContent, setDialogContent] = useState<ReactNode | null>(null);

  const showDialog = useCallback((content: ReactNode) => {
    setDialogContent(content);
  }, []);

  const hideDialog = useCallback(() => {
    setDialogContent(null);
  }, []);

  const value = useMemo(() => ({ showDialog, hideDialog }), [showDialog, hideDialog]);

  return (
    <DialogContext value={value}>
      {children}
      {portalTargetContainerRef.current &&
        dialogContent !== null &&
        createPortal(
          <Dialog content={dialogContent} isOpen={dialogContent !== null} onClose={hideDialog} />,
          portalTargetContainerRef.current
        )}
    </DialogContext>
  );
}
