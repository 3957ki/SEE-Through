import { useDialog } from "@/contexts/DialogContext";
import { useEffect, useState } from "react";
import PinInput from "./PinInput";

interface PinDialogProps {
  correctPin: string;
  onSuccess: () => void;
}

export default function PinDialog({ correctPin, onSuccess }: PinDialogProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const { hideDialog } = useDialog();

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === correctPin) {
        onSuccess();
        hideDialog();
      } else {
        setError(true);
        setPin("");
        setError(false);
      }
    }
  }, [pin, correctPin, onSuccess, hideDialog]);

  const handleNumberClick = (number: number) => {
    if (pin.length < 4) {
      setPin((prev) => prev + number);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div>
        <h2 className="text-lg font-semibold mb-1 text-foreground">PIN 번호 입력</h2>
        <p className="text-sm text-foreground">모니터링 페이지 접근을 위해 PIN을 입력하세요</p>
      </div>

      <PinInput pin={pin} error={error} onNumberClick={handleNumberClick} onDelete={handleDelete} />
    </div>
  );
}
