import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCurrentMemberId } from "@/contexts/CurrentMemberIdContext";
import type { GroupedLogs } from "@/interfaces/Log";
import { useLogs } from "@/queries/logs";
import { ChevronDown, Package, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function LogPage() {
  const [groupedLogs, setGroupedLogs] = useState<GroupedLogs>({});
  const [myLogsOnly, setMyLogsOnly] = useState(false);
  const { currentMemberId } = useCurrentMemberId();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const pageSize = 10;

  // Use the updated useLogs hook for infinite scrolling
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useLogs(pageSize, myLogsOnly && currentMemberId ? currentMemberId : undefined);

  // Process log data whenever it changes
  useEffect(() => {
    if (!data?.pages) return;

    // Merge all pages and group by date
    const newGroupedLogs = data.pages.reduce<GroupedLogs>((acc, page) => {
      page.content.forEach((log) => {
        // ISO date string to YYYY-MM-DD
        const date = new Date(log.created_at).toISOString().split("T")[0];

        if (!acc[date]) {
          acc[date] = [];
        }

        // Add log entry to the appropriate date group
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
      });

      return acc;
    }, {});

    setGroupedLogs(newGroupedLogs);
  }, [data?.pages]);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    if (!loadMoreRef.current) return;

    // Disconnect previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create a new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // If the load-more element is visible and we have more pages
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    // Start observing the load-more element
    observerRef.current.observe(loadMoreRef.current);

    // Cleanup observer on unmount
    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle toggle for "my logs only"
  const handleToggleMyLogs = () => {
    setMyLogsOnly(!myLogsOnly);
  };

  if (isLoading) {
    return <div className="p-4 text-center">로딩 중...</div>;
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-red-500">
        {error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다"}
      </div>
    );
  }

  // No logs to display
  if (Object.keys(groupedLogs).length === 0) {
    return (
      <div className="max-w-md mx-auto p-4">
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

      {/* Logs grouped by date */}
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
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Infinite scroll loading trigger */}
      <div ref={loadMoreRef} className="text-center py-4">
        {isFetchingNextPage ? (
          <div className="text-sm text-gray-500">로딩 중...</div>
        ) : hasNextPage ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchNextPage()}
            className="flex items-center gap-1"
          >
            더 보기 <ChevronDown className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
