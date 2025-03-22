import { DialogContext } from "@/contexts/DialogContext";
import { RefObject, useCallback, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

// A custom dialog component that renders within the target container
const CustomDialog = ({
  content,
  isOpen,
  onClose,
}: {
  content: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative z-10 bg-white rounded-lg p-4 max-w-[425px] shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </div>
    </div>
  );
};

export function DialogContextProvider({
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
          <CustomDialog
            content={dialogContent}
            isOpen={dialogContent !== null}
            onClose={hideDialog}
          />,
          portalTargetContainerRef.current
        )}
    </DialogContext>
  );
}
