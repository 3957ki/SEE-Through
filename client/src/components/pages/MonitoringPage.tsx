import { fetchMonitoringUsers, updateMonitoring } from "@/api/monitoring";
import ChangePinDialog from "@/components/dialog/ChangePinDialog";
import { useDialog } from "@/contexts/DialogContext";
import type { MonitoringUser } from "@/interfaces/Monitoring";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";

type MonitoringPageProps = {
  currentPin: string;
  onPinChange: (newPin: string) => void;
};

export default function MonitoringPage({ currentPin, onPinChange }: MonitoringPageProps) {
  const [users, setUsers] = useState<MonitoringUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingUsers, setSavingUsers] = useState<string[]>([]); // UUID는 string
  const { showDialog } = useDialog();

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMonitoringUsers();
      setUsers(data);
    } catch (error) {
      console.error("사용자 데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const toggleUserSelection = async (userId: string) => {
    setSavingUsers((prev) => [...prev, userId]);

    // UI 업데이트 (토글)
    const updatedUsers = users.map((user) =>
      user.member_id === userId ? { ...user, is_monitored: !user.is_monitored } : user
    );
    setUsers(updatedUsers);

    try {
      const success = await updateMonitoring({ userId });

      if (!success) {
        setUsers(users); // 롤백
        alert("저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("저장 실패:", error);
      setUsers(users); // 롤백
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSavingUsers((prev) => prev.filter((id) => id !== userId));
    }
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

      {loading ? (
        <div className="text-center py-8">로딩 중...</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {users.map((user) => {
            const isSaving = savingUsers.includes(user.member_id);

            return (
              <div
                key={user.member_id}
                onClick={() => !isSaving && toggleUserSelection(user.member_id)}
                className={`
                  p-4 rounded-lg flex flex-col items-center justify-center 
                  ${isSaving ? "opacity-70" : "cursor-pointer"}
                  ${user.is_monitored ? "border-2 border-orange-400" : "border border-gray-300"}
                `}
              >
                <img
                  src={user.image_path || "/placeholder.svg"}
                  alt={user.name}
                  className="w-16 h-16 rounded-full mb-2 object-cover"
                />
                <span className="text-center">{user.name}</span>
                {isSaving && <span className="text-xs text-orange-500 mt-1">저장 중...</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
