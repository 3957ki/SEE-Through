import { getLogs } from "@/api/logs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCurrentMember } from "@/contexts/CurrentMemberContext";
import type { GroupedLogs, LogsResponse } from "@/interfaces/Log";
import { ChevronLeft, ChevronRight, Package, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function LogPage() {
  const [groupedLogs, setGroupedLogs] = useState<GroupedLogs>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myLogsOnly, setMyLogsOnly] = useState(false);
  const { currentMember } = useCurrentMember();

  // 페이지네이션 상태 추가
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const pageSize = 10; // 페이지당 항목 수

  // 백엔드에서 로그 데이터 가져오기
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);

        // 페이지네이션 파라미터 추가 및 필요시 멤버 ID 추가 (숫자가 원래는 currentMember.member_id)
        const memberId = myLogsOnly && currentMember ? currentMember.member_id : undefined;
        const response: LogsResponse = await getLogs(currentPage, pageSize, memberId);
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

          // 로그 데이터 형식 변환 - 이미지 경로 추가
          acc[date].push({
            ingredient: log.ingredient_name,
            ingredient_image: log.ingredient_image_path,
            user_name: log.member_name,
            user_image: log.member_image_path,
            type: log.movement_name,
            time: new Date(log.created_at).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
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
  }, [currentPage, pageSize, myLogsOnly, currentMember]); // 필터 변경 시에도 데이터 다시 로드

  // 필터 토글 처리
  const handleToggleMyLogs = () => {
    setMyLogsOnly(!myLogsOnly);
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 돌아가기
  };

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
    return (
      <div className="max-w-md mx-auto p-4">
        {/* 내 로그만 보기 토글 */}
        <div className="flex items-center justify-end mb-4">
          <span className="text-sm mr-2">내 로그만 보기</span>
          <Switch checked={myLogsOnly} onCheckedChange={handleToggleMyLogs} />
        </div>
        <div className="p-4 text-center">입출고 기록이 없습니다</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      {/* 내 로그만 보기 토글 */}
      <div className="flex items-center justify-end mb-4">
        <span className="text-sm mr-2">내 로그만 보기</span>
        <Switch checked={myLogsOnly} onCheckedChange={handleToggleMyLogs} />
      </div>

      {/* 페이지네이션 컨트롤 */}
      <div className="flex justify-between items-center px-4 mb-4">
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

      {Object.entries(groupedLogs).map(([date, entries]) => (
        <div key={date} className="mb-6">
          {/* 날짜 헤더 */}
          <h2 className="text-xl font-bold text-center mb-4">{date}</h2>

          {/* 로그 항목들 */}
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center mb-2">
                  {/* 재료 이미지 */}
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={entry.ingredient_image} alt={entry.ingredient} />
                    <AvatarFallback>
                      <Package className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    {/* 재료 이름과 시간 */}
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium">{entry.ingredient}</span>
                      <span className="text-sm text-gray-500">{entry.time}</span>
                    </div>

                    <div className="flex items-center mt-1">
                      {/* 사용자 이미지와 이름 */}
                      <div className="flex items-center">
                        <Avatar className="h-5 w-5 mr-1">
                          <AvatarImage src={entry.user_image} alt={entry.user_name} />
                          <AvatarFallback>
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">{entry.user_name}</span>
                      </div>

                      {/* 구분자 */}
                      <span className="mx-2 text-gray-400">•</span>

                      {/* 입고/출고 표시 (색상 구분) */}
                      <span
                        className={`text-sm font-medium ${entry.type === "입고" ? "text-blue-500" : "text-orange-500"}`}
                      >
                        {entry.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 구분선 제거하고 카드 스타일로 변경 */}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
