import { useDialog } from "@/contexts/DialogContext";

function CommentDialog({ message }: { message: string }) {
  const { hideDialog } = useDialog();
  return (
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
        onClick={hideDialog}
      >
        닫기
      </button>
    </div>
  );
}

export default CommentDialog;
