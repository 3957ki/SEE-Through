import { fetchMonitoringUsers, updateMonitoring } from "@/api/monitoring";
import type { MonitoringUser } from "@/interfaces/Monitoring";
import { Lock } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function MonitoringPage() {
  const [users, setUsers] = useState<MonitoringUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingUsers, setSavingUsers] = useState<string[]>([]); // UUID는 string

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

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">모니터링</h1>
        <Lock className="w-6 h-6" />
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
                  src={user.image_path}
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
