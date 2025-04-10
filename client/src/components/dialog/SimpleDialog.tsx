import { Button } from "@/components/ui/button";
import { useDialog } from "@/contexts/DialogContext";

interface SimpleDialogProps {
  title: string;
  isError?: boolean;
}

export function SimpleDialog({ title, isError = false }: SimpleDialogProps) {
  const { hideDialog } = useDialog();

  return (
    <div className="p-4 space-y-4 text-center">
      <h2 className={`text-lg font-medium ${isError ? "text-red-500" : ""}`}>{title}</h2>
      <div className="flex justify-center">
        <Button onClick={hideDialog}>확인</Button>
      </div>
    </div>
  );
}
