import { useDialog } from "@/contexts/DialogContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";
import PinInput from "./PinInput";

interface ChangePinDialogProps {
  currentPin: string;
  onPinChange: (newPin: string) => Promise<boolean>;
}

enum PinChangeStep {
  VERIFY_CURRENT = 0,
  ENTER_NEW = 1,
  CONFIRM_NEW = 2,
}

function ChangePinDialog({ currentPin, onPinChange }: ChangePinDialogProps) {
  const { hideDialog } = useDialog();
  const theme = useTheme();

  const [step, setStep] = useState<PinChangeStep>(PinChangeStep.VERIFY_CURRENT);
  const [inputPin, setInputPin] = useState<string>("");
  const [newPin, setNewPin] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Handle number button click
  const handleNumberClick = (digit: number) => {
    if (isProcessing) return;

    setError("");

    if (step === PinChangeStep.VERIFY_CURRENT) {
      if (inputPin.length < 4) {
        const updatedPin = inputPin + digit;
        setInputPin(updatedPin);

        // Verify current PIN when 4 digits are entered
        if (updatedPin.length === 4) {
          if (updatedPin === currentPin) {
            setTimeout(() => {
              setInputPin("");
              setStep(PinChangeStep.ENTER_NEW);
            }, 300);
          } else {
            setError("현재 PIN이 일치하지 않습니다.");
            setTimeout(() => setInputPin(""), 300);
          }
        }
      }
    } else if (step === PinChangeStep.ENTER_NEW) {
      if (inputPin.length < 4) {
        const updatedPin = inputPin + digit;
        setInputPin(updatedPin);

        // Move to confirmation step when 4 digits are entered
        if (updatedPin.length === 4) {
          setTimeout(() => {
            setNewPin(updatedPin);
            setInputPin("");
            setStep(PinChangeStep.CONFIRM_NEW);
          }, 300);
        }
      }
    } else if (step === PinChangeStep.CONFIRM_NEW) {
      if (inputPin.length < 4) {
        const updatedPin = inputPin + digit;
        setInputPin(updatedPin);

        // Confirm new PIN when 4 digits are entered
        if (updatedPin.length === 4) {
          if (updatedPin === newPin) {
            handleSaveNewPin(updatedPin);
          } else {
            setError("새 PIN이 일치하지 않습니다. 다시 시도해주세요.");
            setTimeout(() => {
              setInputPin("");
              setNewPin("");
              setStep(PinChangeStep.ENTER_NEW);
            }, 300);
          }
        }
      }
    }
  };

  // Handle delete button click
  const handleDelete = () => {
    if (inputPin.length > 0) {
      setInputPin(inputPin.slice(0, -1));
    }
  };

  // Save the new PIN
  const handleSaveNewPin = async (confirmedPin: string) => {
    setIsProcessing(true);
    try {
      const success = await onPinChange(confirmedPin);
      if (success) {
        setTimeout(() => {
          hideDialog();
        }, 200);
      } else {
        setError("PIN 변경에 실패했습니다. 다시 시도해주세요.");
        setStep(PinChangeStep.VERIFY_CURRENT);
        setInputPin("");
        setNewPin("");
      }
    } catch (error) {
      setError(
        `PIN 변경 중 오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Get title based on current step
  const getStepTitle = () => {
    switch (step) {
      case PinChangeStep.VERIFY_CURRENT:
        return "현재 PIN 입력";
      case PinChangeStep.ENTER_NEW:
        return "새 PIN 입력";
      case PinChangeStep.CONFIRM_NEW:
        return "새 PIN 확인";
      default:
        return "PIN 변경";
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.text }}>
        {getStepTitle()}
      </h2>

      {error && (
        <p className="text-red-500 mb-4 text-center text-sm" style={{ color: theme.colors.text }}>
          {error}
        </p>
      )}

      <PinInput
        pin={inputPin}
        error={!!error}
        onNumberClick={handleNumberClick}
        onDelete={handleDelete}
        disabled={isProcessing}
      />

      {/* Action buttons */}
      <div className="flex gap-3 mt-2">
        <button
          type="button"
          className="px-6 py-2.5 text-base rounded-lg transition-colors"
          style={{
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            borderColor: theme.colors.border,
            borderWidth: 1,
          }}
          onClick={hideDialog}
          disabled={isProcessing}
        >
          취소
        </button>
      </div>
    </div>
  );
}

export default ChangePinDialog;
