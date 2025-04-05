import { useDialog } from "@/contexts/DialogContext";
import { AlertCircle } from "lucide-react";

function CommentDialog({ message }: { message: string }) {
  const { hideDialog } = useDialog();

  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-md max-w-md mx-auto">
      <div className="bg-orange-100 rounded-full p-3 mb-4">
        <AlertCircle className="w-8 h-8 text-orange-500" />
      </div>

      <h3 className="text-xl font-semibold text-gray-800 mb-2">알림</h3>
      <p className="text-gray-600 leading-relaxed">{message}</p>

      <button
        type="button"
        onClick={hideDialog}
        className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md transition-colors font-semibold"
      >
        닫기
      </button>
    </div>
  );
}

export default CommentDialog;
