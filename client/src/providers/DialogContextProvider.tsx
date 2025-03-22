import { Dialog, DialogContent, DialogPortal } from "@/components/ui/dialog";
import { DialogContext } from "@/contexts/DialogContext";
import { useCallback, useMemo, useState, type ReactNode } from "react";

export function DialogContextProvider({
  children,
  portalTargetContainerRef,
}: {
  children: ReactNode;
  portalTargetContainerRef: HTMLElement;
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
      <Dialog open={dialogContent !== null} onOpenChange={(open) => !open && hideDialog()}>
        <DialogPortal container={portalTargetContainerRef}>
          <DialogContent className="sm:max-w-[425px] origin-top-left" style={{ transform: "none" }}>
            {dialogContent}
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </DialogContext>
  );
}
