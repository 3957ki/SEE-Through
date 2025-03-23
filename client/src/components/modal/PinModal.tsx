import { useState } from "react";

interface PinModalProps {
  correctPin: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const PinModal: React.FC<PinModalProps> = ({
  correctPin = "1234", // Default PIN, should be overridden with props
  onSuccess,
  onClose,
}) => {
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
        alert("PIN이 일치합니다!"); // Alert that PIN matches
        onSuccess && onSuccess();
      }, 300);
    } else {
      // PIN is incorrect, reset after a short delay
      setTimeout(() => {
        setPin("");
      }, 500);
    }
  };

  // Handle close button click
  const handleClose = () => {
    onClose && onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-[300px] flex flex-col items-center">
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
