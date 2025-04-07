import ChangePinDialog from "@/components/dialog/ChangePinDialog";
import { Spinner } from "@/components/ui/spinner";
import { useDialog } from "@/contexts/DialogContext";
import { useMonitoringUsers, useUpdateMonitoring } from "@/queries/monitoring";
import { Button } from "../ui/button";

type MonitoringPageProps = {
  currentPin: string;
  onPinChange: (newPin: string) => void;
};

export default function MonitoringPage({ currentPin, onPinChange }: MonitoringPageProps) {
  const { users, isLoading } = useMonitoringUsers();
  const updateMutation = useUpdateMonitoring();
  const { showDialog } = useDialog();

  const toggleUserSelection = async (userId: string) => {
    updateMutation.mutate({ userId });
  };

  const handlePinChange = async (newPin: string): Promise<boolean> => {
    try {
      onPinChange(newPin);
      return true;
    } catch (error) {
      console.error("PIN 변경 실패:", error);
      return false;
    }
  };

  const handleLockClick = () => {
    showDialog(<ChangePinDialog currentPin={currentPin} onPinChange={handlePinChange} />);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="flex justify-center items-center mb-6">
        <Button
          onClick={handleLockClick}
          variant="outline"
          className="px-4 py-2 rounded-md font-medium hover:bg-primary/10 border-primary/20 text-primary"
        >
          PIN 번호 변경
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
          <Spinner size={36} />
          <p className="mt-2 text-sm">사용자 정보를 불러오는 중입니다...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {users.map((user) => {
            const isUpdating =
              updateMutation.isPending && updateMutation.variables?.userId === user.member_id;

            return (
              <div
                key={user.member_id}
                onClick={() => !isUpdating && toggleUserSelection(user.member_id)}
                className={`
                  p-4 rounded-lg flex flex-col items-center justify-center 
                  ${isUpdating ? "opacity-70" : "cursor-pointer"}
                  ${user.is_monitored ? "border-2 border-primary" : "border border-border"}
                `}
              >
                <img
                  src={user.image_path || "/placeholder.svg"}
                  alt={user.name}
                  className="w-16 h-16 rounded-full mb-2 object-cover"
                />
                <span className="text-center">{user.name}</span>
                {isUpdating && <span className="text-xs text-primary mt-1">저장 중...</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
