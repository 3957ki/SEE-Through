import { useState } from "react";

interface PinModalProps {
  correctPin: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const PinModal: React.FC<PinModalProps> = ({ correctPin, onSuccess, onClose }) => {
  const [pin, setPin] = useState<string>("");

  // Handle number button click
  const handleNumberClick = (number: number) => {
    if (pin.length < 4) {
      const newPin = pin + number;
      setPin(newPin);

      // Check if PIN is complete and validate
      if (newPin.length === 4) {
        validatePin(newPin);
      }
    }
  };

  // Validate the entered PIN
  const validatePin = (enteredPin: string) => {
    if (enteredPin === correctPin) {
      // PIN is correct
      setTimeout(() => {
        onSuccess && onSuccess();
      }, 200);
    } else {
      // PIN is incorrect, reset after a short delay
      setTimeout(() => {
        setPin("");
      }, 200);
    }
  };

  // Handle close button click
  const handleClose = () => {
    onClose && onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex justify-center items-center backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-xl p-6 w-[300px] flex flex-col items-center shadow-lg">
        <h2 className="text-[#FF9933] text-xl font-semibold mb-6">PIN 입력</h2>

        {/* PIN display */}
        <div className="flex justify-center gap-3 mb-6 w-full">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="w-[30px] h-[30px] border-b-2 border-gray-400 flex justify-center items-center text-2xl"
            >
              {pin.length > index ? "•" : ""}
            </div>
          ))}
        </div>

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              className="w-[60px] h-[60px] rounded-full bg-gray-600 text-white text-2xl border-none cursor-pointer flex justify-center items-center hover:bg-gray-500"
              onClick={() => handleNumberClick(num)}
            >
              {num}
            </button>
          ))}
          <div className="col-span-1"></div>
          <button
            className="w-[60px] h-[60px] rounded-full bg-gray-600 text-white text-2xl border-none cursor-pointer flex justify-center items-center hover:bg-gray-500"
            onClick={() => handleNumberClick(0)}
          >
            0
          </button>
        </div>

        {/* Close button */}
        <button
          className="bg-[#FF9933] text-white border-none rounded-lg px-6 py-2.5 text-base cursor-pointer mt-2 hover:bg-[#e88a2a]"
          onClick={handleClose}
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default PinModal;
