import { useDialog } from "@/contexts/DialogContext";
import { AlertCircle } from "lucide-react";

function CommentDialog({ message, danger = false }: { message: string; danger?: boolean }) {
  const { hideDialog } = useDialog();

  const iconColor = danger ? "text-red-600" : "text-orange-500";
  const iconBg = danger ? "bg-red-100" : "bg-orange-100";
  const buttonColor = danger ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600";

  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-md max-w-md mx-auto border border-gray-200">
      <div className={`${iconBg} rounded-full p-3 mb-4`}>
        <AlertCircle className={`w-8 h-8 ${iconColor}`} />
      </div>

      <h3 className={`text-xl font-semibold mb-2 ${danger ? "text-red-700" : "text-gray-800"}`}>
        {danger ? "⚠️ 위험 알림" : "알림"}
      </h3>

      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{message}</p>

      <button
        type="button"
        onClick={hideDialog}
        className={`mt-6 w-full ${buttonColor} text-white py-2 rounded-md transition-colors font-semibold`}
      >
        닫기
      </button>
    </div>
  );
}

export default CommentDialog;
