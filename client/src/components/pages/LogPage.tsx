import { getLogs } from "@/api/logs";
import { GroupedLogs } from "@/interfaces/Log";
import { useEffect, useState } from "react";

export default function LogPage() {
  const [groupedLogs, setGroupedLogs] = useState<GroupedLogs>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 백엔드에서 로그 데이터 가져오기
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);

        const data = await getLogs();

        // 날짜별로 로그 그룹화
        const grouped = data.reduce<GroupedLogs>((acc, log) => {
          if (!acc[log.date]) {
            acc[log.date] = [];
          }
          acc[log.date].push(log);
          return acc;
        }, {} as GroupedLogs); // 초기값에 타입 어노테이션 추가

        setGroupedLogs(grouped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (isLoading) {
    return <div className="p-4 text-center">로딩 중...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  // 날짜가 없는 경우
  if (Object.keys(groupedLogs).length === 0) {
    return <div className="p-4 text-center">입출고 기록이 없습니다</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      {Object.entries(groupedLogs).map(([date, entries]) => (
        <div key={date} className="mb-6">
          {/* 날짜 헤더 */}
          <h2 className="text-xl font-bold text-center mb-4">{date}</h2>

          {/* 로그 항목들 */}
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div key={index}>
                <div className="flex items-center mb-2">
                  {/* 재료 이름과 시간 */}
                  <span className="text-base font-medium">
                    {entry.material} {entry.time}
                  </span>

                  {/* 사용자 이름 */}
                  <span className="ml-2"> {entry.userName}</span>

                  {/* 구분자 */}
                  <span className="mx-2">•</span>

                  {/* 입고/출고 표시 (색상 구분) */}
                  <span
                    className={`font-medium ${entry.type === "입고" ? "text-blue-500" : "text-orange-500"}`}
                  >
                    {entry.type}
                  </span>
                </div>

                {/* 구분선 (마지막 항목이 아닌 경우에만) */}
                {index < entries.length - 1 && <hr className="border-gray-200 my-2" />}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
