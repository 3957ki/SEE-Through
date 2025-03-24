import { fetchMonitoringUsers, updateMonitoring } from "@/api/monitoring";
import type { MonitoringUser } from "@/interfaces/Monitoring";
import { Lock } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function MonitoringPage() {
  // 상태 관리
  const [users, setUsers] = useState<MonitoringUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingUsers, setSavingUsers] = useState<number[]>([]); // 저장 중인 사용자 ID 추적

  // 사용자 데이터 로드
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

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // 사용자 선택 토글 및 즉시 저장 함수
  const toggleUserSelection = async (userId: number) => {
    // 현재 토글 중인 사용자를 저장 중 상태로 표시
    setSavingUsers((prev) => [...prev, userId]);

    // 사용자 상태 업데이트
    const updatedUsers = users.map((user) =>
      user.id === userId ? { ...user, isMonitoring: !user.isMonitoring } : user
    );

    // UI 상태 즉시 업데이트
    setUsers(updatedUsers);

    try {
      // 모니터링 대상 사용자 ID 목록
      const monitoringUserIds = updatedUsers
        .filter((user) => user.isMonitoring)
        .map((user) => user.id);

      // 저장 요청 보내기
      const success = await updateMonitoring({ userIds: monitoringUserIds });

      if (!success) {
        // 저장 실패 시 상태 롤백
        setUsers(users);
        alert("저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("저장 실패:", error);
      // 저장 실패 시 상태 롤백
      setUsers(users);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      // 저장 중 상태 제거
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
            const isSaving = savingUsers.includes(user.id);

            return (
              <div
                key={user.id}
                onClick={() => !isSaving && toggleUserSelection(user.id)}
                className={`
                  p-4 rounded-lg flex flex-col items-center justify-center 
                  ${isSaving ? "opacity-70" : "cursor-pointer"}
                  ${user.isMonitoring ? "border-2 border-orange-400" : "border border-gray-300"}
                `}
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <div className="w-6 h-6 bg-black rounded-full relative">
                    <div className="absolute w-3 h-3 bg-black rounded-full -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                  </div>
                </div>
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
