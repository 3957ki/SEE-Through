import { useState, type FC } from "react";

interface ChangePinModalProps {
  currentPin: string;
  onPinChange: (newPin: string) => Promise<boolean>;
  onClose: () => void;
}

enum PinChangeStep {
  VERIFY_CURRENT = 0,
  ENTER_NEW = 1,
  CONFIRM_NEW = 2,
}

const ChangePinModal: FC<ChangePinModalProps> = ({ currentPin, onPinChange, onClose }) => {
  const [step, setStep] = useState<PinChangeStep>(PinChangeStep.VERIFY_CURRENT);
  const [enteredPin, setEnteredPin] = useState<string>("");
  const [newPin, setNewPin] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Handle number button click
  const handleNumberClick = (number: number) => {
    if (isProcessing) return;

    setError("");

    if (step === PinChangeStep.VERIFY_CURRENT) {
      if (enteredPin.length < 4) {
        const updatedPin = enteredPin + number;
        setEnteredPin(updatedPin);

        // Verify current PIN when 4 digits are entered
        if (updatedPin.length === 4) {
          if (updatedPin === currentPin) {
            setTimeout(() => {
              setEnteredPin("");
              setStep(PinChangeStep.ENTER_NEW);
            }, 300);
          } else {
            setError("현재 PIN이 일치하지 않습니다.");
            setTimeout(() => setEnteredPin(""), 300);
          }
        }
      }
    } else if (step === PinChangeStep.ENTER_NEW) {
      if (enteredPin.length < 4) {
        const updatedPin = enteredPin + number;
        setEnteredPin(updatedPin);

        // Move to confirmation step when 4 digits are entered
        if (updatedPin.length === 4) {
          setTimeout(() => {
            setNewPin(updatedPin);
            setEnteredPin("");
            setStep(PinChangeStep.CONFIRM_NEW);
          }, 300);
        }
      }
    } else if (step === PinChangeStep.CONFIRM_NEW) {
      if (enteredPin.length < 4) {
        const updatedPin = enteredPin + number;
        setEnteredPin(updatedPin);

        // Confirm new PIN when 4 digits are entered
        if (updatedPin.length === 4) {
          if (updatedPin === newPin) {
            handleSaveNewPin(updatedPin);
          } else {
            setError("새 PIN이 일치하지 않습니다. 다시 시도해주세요.");
            setTimeout(() => {
              setEnteredPin("");
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
    if (enteredPin.length > 0) {
      setEnteredPin(enteredPin.slice(0, -1));
    }
  };

  // Save the new PIN
  const handleSaveNewPin = async (confirmedPin: string) => {
    setIsProcessing(true);
    try {
      const success = await onPinChange(confirmedPin);
      if (success) {
        setTimeout(() => {
          onClose();
        }, 200);
      } else {
        setError("PIN 변경에 실패했습니다. 다시 시도해주세요.");
        setStep(PinChangeStep.VERIFY_CURRENT);
        setEnteredPin("");
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
      <h2 className="text-[#FF9933] text-xl font-semibold mb-4">{getStepTitle()}</h2>

      {error && <p className="text-red-500 mb-4 text-center text-sm">{error}</p>}

      {/* PIN display */}
      <div className="flex justify-center gap-3 mb-6 w-full">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="w-[30px] h-[30px] border-b-2 border-gray-400 flex justify-center items-center text-2xl"
          >
            {enteredPin.length > index ? "•" : ""}
          </div>
        ))}
      </div>

      {/* Number pad */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            className="w-[60px] h-[60px] rounded-full bg-gray-600 text-white text-2xl border-none cursor-pointer flex justify-center items-center hover:bg-gray-500 transition-colors"
            onClick={() => handleNumberClick(num)}
            disabled={isProcessing}
          >
            {num}
          </button>
        ))}
        <button
          className="w-[60px] h-[60px] rounded-full bg-gray-600 text-white text-xl border-none cursor-pointer flex justify-center items-center hover:bg-gray-500 transition-colors"
          onClick={handleDelete}
          disabled={isProcessing}
        >
          ←
        </button>
        <button
          className="w-[60px] h-[60px] rounded-full bg-gray-600 text-white text-2xl border-none cursor-pointer flex justify-center items-center hover:bg-gray-500 transition-colors"
          onClick={() => handleNumberClick(0)}
          disabled={isProcessing}
        >
          0
        </button>
        <div className="col-span-1"></div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-2">
        <button
          className="bg-gray-300 text-gray-800 border-none rounded-lg px-6 py-2.5 text-base cursor-pointer hover:bg-gray-400 transition-colors"
          onClick={onClose}
          disabled={isProcessing}
        >
          취소
        </button>
      </div>
    </div>
  );
};

export default ChangePinModal;
