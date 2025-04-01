import { useEffect, useState } from "react";

interface CommentDialogProps {
  message: string;
  onClose: () => void;
  isLoading?: boolean;
}

function CommentDialog({ message, onClose, isLoading = false }: CommentDialogProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Add animation effect on mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-4 w-80 max-w-md">
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`bg-white rounded-lg p-4 w-80 max-w-md transition-all duration-300 ${
          isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform -translate-y-4"
        }`}
      >
        <div className="flex flex-col gap-4">
          <div className="mt-2">
            <h3 className="font-bold text-xl text-center">알림</h3>
            <div className="mt-4 p-4 text-center border-t border-b border-gray-100">
              <p className="text-gray-700">{message}</p>
            </div>
          </div>

          <button
            type="button"
            className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-md w-full font-medium"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommentDialog;
