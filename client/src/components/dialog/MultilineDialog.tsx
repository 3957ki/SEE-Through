import { Button } from "@/components/ui/button";
import { useDialog } from "@/contexts/DialogContext";
import { ReactNode } from "react";

interface MultilineDialogProps {
  content: ReactNode;
  isError?: boolean;
}

export function MultilineDialog({ content, isError = false }: MultilineDialogProps) {
  const { hideDialog } = useDialog();

  return (
    <div className="p-4 space-y-4 text-center">
      <div className={`text-lg font-medium ${isError ? "text-red-500" : ""}`}>{content}</div>
      <div className="flex justify-center">
        <Button onClick={hideDialog}>확인</Button>
      </div>
    </div>
  );
}
