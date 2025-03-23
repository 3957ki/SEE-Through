import { fetchMonitoringUsers, updateMonitoring } from "@/api/monitoring";
import type { MonitoringUser } from "@/interfaces/Monitoring";
import { Lock, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function MonitoringPage() {
  // 상태 관리
  const [users, setUsers] = useState<MonitoringUser[]>([]);
  const [originalUsers, setOriginalUsers] = useState<MonitoringUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // 사용자 데이터 로드
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMonitoringUsers();
      setUsers(data);
      setOriginalUsers(JSON.parse(JSON.stringify(data))); // 깊은 복사
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

  // 변경사항 감지
  useEffect(() => {
    if (originalUsers.length === 0) return;

    const changed = users.some((user) => {
      const original = originalUsers.find((o) => o.id === user.id);
      return original?.isMonitoring !== user.isMonitoring;
    });

    setHasChanges(changed);
  }, [users, originalUsers]);

  // 사용자 선택 토글 함수
  const toggleUserSelection = (userId: number) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, isMonitoring: !user.isMonitoring } : user
      )
    );
  };

  // 변경사항 저장
  const saveChanges = async () => {
    setSaving(true);
    try {
      // 모니터링 대상 사용자 ID 목록
      const monitoringUserIds = users.filter((user) => user.isMonitoring).map((user) => user.id);

      const success = await updateMonitoring({ userIds: monitoringUserIds });

      if (success) {
        // 저장 성공 시 원본 데이터 업데이트
        setOriginalUsers(JSON.parse(JSON.stringify(users)));
        setHasChanges(false);
        alert("모니터링 설정이 저장되었습니다.");
      } else {
        alert("저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
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
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => toggleUserSelection(user.id)}
                className={`
                  p-4 rounded-lg flex flex-col items-center justify-center cursor-pointer
                  ${user.isMonitoring ? "border-2 border-orange-400" : "border border-gray-300"}
                `}
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <div className="w-6 h-6 bg-black rounded-full relative">
                    <div className="absolute w-3 h-3 bg-black rounded-full -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                  </div>
                </div>
                <span className="text-center">{user.name}</span>
              </div>
            ))}
          </div>

          {hasChanges && (
            <div className="fixed bottom-4 left-0 right-0 flex justify-center">
              <button
                onClick={saveChanges}
                disabled={saving}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg shadow-lg transition-colors"
              >
                <Save className="w-5 h-5" />
                {saving ? "저장 중..." : "저장하기"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
