import { useDialog } from "@/contexts/DialogContext";
import { AlertCircle, Info } from "lucide-react";

function CommentDialog({ message, danger = false }: { message: string; danger?: boolean }) {
  const { hideDialog } = useDialog();

  const icon = danger ? (
    <AlertCircle className="w-8 h-8 text-red-600" />
  ) : (
    <Info className="w-8 h-8 text-blue-600" />
  );
  const iconBg = danger ? "bg-red-100" : "bg-blue-100";
  const buttonColor = danger ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600";
  const title = danger ? "⚠️ 위험 알림" : "ℹ️ 알림";
  const titleColor = danger ? "text-red-700" : "text-gray-800";

  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-md max-w-md mx-auto border border-gray-200">
      <div className={`${iconBg} rounded-full p-3 mb-4 flex items-center justify-center`}>
        {icon}
      </div>

      <h3 className={`text-xl font-semibold mb-2 ${titleColor}`}>{title}</h3>

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
