import { useState, type FC } from "react";

interface PinModalProps {
  correctPin: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const PinModal: FC<PinModalProps> = ({ correctPin, onSuccess, onClose }) => {
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
      onClose && onClose();
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

  // Handle delete button click
  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-[#FF9933] text-xl font-semibold mb-4">PIN 입력</h2>

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
            className="w-[60px] h-[60px] rounded-full bg-gray-600 text-white text-2xl border-none cursor-pointer flex justify-center items-center hover:bg-gray-500 transition-colors"
            onClick={() => handleNumberClick(num)}
          >
            {num}
          </button>
        ))}
        <button
          className="w-[60px] h-[60px] rounded-full bg-gray-600 text-white text-xl border-none cursor-pointer flex justify-center items-center hover:bg-gray-500 transition-colors"
          onClick={handleDelete}
        >
          ←
        </button>
        <button
          className="w-[60px] h-[60px] rounded-full bg-gray-600 text-white text-2xl border-none cursor-pointer flex justify-center items-center hover:bg-gray-500 transition-colors"
          onClick={() => handleNumberClick(0)}
        >
          0
        </button>
        <div className="col-span-1"></div>
      </div>

      {/* Close button */}
      <button
        className="bg-[#FF9933] text-white border-none rounded-lg px-6 py-2.5 text-base cursor-pointer mt-2 hover:bg-[#e88a2a]"
        onClick={handleClose}
      >
        닫기
      </button>
    </div>
  );
};

export default PinModal;
