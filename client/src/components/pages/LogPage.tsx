import { getLogs } from "@/api/logs";
import { Button } from "@/components/ui/button";
import type { GroupedLogs, LogsResponse } from "@/interfaces/Log";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function LogPage() {
  const [groupedLogs, setGroupedLogs] = useState<GroupedLogs>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 페이지네이션 상태 추가
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const pageSize = 10; // 페이지당 항목 수

  // 백엔드에서 로그 데이터 가져오기
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);

        // 페이지네이션 파라미터 추가
        const response: LogsResponse = await getLogs(currentPage, pageSize);
        const { content, slice_info } = response;

        // 페이지네이션 정보 업데이트
        setHasNextPage(slice_info.has_next);

        // 날짜별로 로그 그룹화
        const grouped = content.reduce<GroupedLogs>((acc, log) => {
          // ISO 날짜 문자열에서 날짜 부분만 추출 (YYYY-MM-DD)
          const date = new Date(log.created_at).toISOString().split("T")[0];

          if (!acc[date]) {
            acc[date] = [];
          }

          // 로그 데이터 형식 변환
          acc[date].push({
            material: log.ingredient_name,
            user_name: log.member_name,
            type: log.movement_name,
            time: new Date(log.created_at).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            // 추가 필드가 필요하면 여기에 매핑
          });

          return acc;
        }, {});

        setGroupedLogs(grouped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [currentPage, pageSize]); // 페이지 변경 시 데이터 다시 로드

  // 이전 페이지로 이동
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // 다음 페이지로 이동
  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

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
          {/* 페이지네이션 컨트롤 */}
          <div className="flex justify-between items-center px-4">
            <Button
              variant="outline"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              이전
            </Button>

            <span className="text-sm font-medium">페이지 {currentPage}</span>

            <Button
              variant="outline"
              onClick={goToNextPage}
              disabled={!hasNextPage}
              className="flex items-center gap-1"
            >
              다음
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
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
                  <span className="ml-2"> {entry.user_name}</span>

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
