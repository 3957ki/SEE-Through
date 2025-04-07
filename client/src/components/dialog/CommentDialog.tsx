import { useDialog } from "@/contexts/DialogContext";
import { AlertCircle, Info } from "lucide-react";

function CommentDialog({ message, danger = false }: { message: string; danger?: boolean }) {
  const { hideDialog } = useDialog();

  const icon = danger ? (
    <AlertCircle className="w-7 h-7 text-red-600" />
  ) : (
    <Info className="w-7 h-7 text-blue-600" />
  );

  const styles = {
    iconBg: danger ? "bg-red-100" : "bg-blue-100",
    title: danger ? "주의 알림" : "알림 메시지",
    titleColor: danger ? "text-red-700" : "text-gray-800",
    buttonColor: danger
      ? "bg-red-500 hover:bg-red-600 focus:ring-red-300"
      : "bg-blue-500 hover:bg-blue-600 focus:ring-blue-300",
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className={`${styles.iconBg} rounded-full p-3 mb-4 flex items-center justify-center`}>
        {icon}
      </div>

      <h3 className={`text-lg font-semibold mb-2 text-center ${styles.titleColor}`}>
        {styles.title}
      </h3>

      <p className="text-sm text-gray-700 text-center whitespace-pre-wrap leading-relaxed">
        {message}
      </p>

      <button
        type="button"
        onClick={hideDialog}
        className={`mt-6 w-full ${styles.buttonColor} text-white py-2.5 rounded-md font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2`}
      >
        닫기
      </button>
    </div>
  );
}

export default CommentDialog;
