import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCurrentMemberId } from "@/contexts/CurrentMemberIdContext";
import type { GroupedLogs } from "@/interfaces/Log";
import { useLogs } from "@/queries/logs";
import { ChevronDown, Package } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BsPerson } from "react-icons/bs";

export default function LogPage() {
  const [groupedLogs, setGroupedLogs] = useState<GroupedLogs>({});
  const [myLogsOnly, setMyLogsOnly] = useState(false);
  const { currentMemberId } = useCurrentMemberId();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const pageSize = 10;
  const [firstLoad, setFirstLoad] = useState(true);

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

    // After first data load, we're not in first load state anymore
    if (firstLoad) setFirstLoad(false);
  }, [data?.pages, firstLoad]);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    // Set up the intersection observer only if we have a loadMoreRef
    if (!loadMoreRef.current) return;

    const loadMoreElement = loadMoreRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          console.log("Intersection detected, fetching next page");
          fetchNextPage();
        }
      },
      {
        root: null, // use viewport as root
        rootMargin: "0px 0px 500px 0px", // trigger earlier
        threshold: 0.1, // trigger when 10% visible
      }
    );

    observer.observe(loadMoreElement);

    // Cleanup
    return () => {
      if (loadMoreElement) {
        observer.unobserve(loadMoreElement);
      }
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Force trigger first fetch if hasNextPage is true and we can't see the loadMore element
  useEffect(() => {
    if (firstLoad && hasNextPage && !isFetchingNextPage) {
      console.log("Force triggering first fetch");
      fetchNextPage();
    }
  }, [firstLoad, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle toggle for "my logs only"
  const handleToggleMyLogs = () => {
    setMyLogsOnly(!myLogsOnly);
    // Reset firstLoad state when filter changes
    setFirstLoad(true);
  };

  if (isLoading) {
    return <div className="text-center">로딩 중...</div>;
  }

  if (isError) {
    return (
      <div className="text-center text-destructive">
        {error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다"}
      </div>
    );
  }

  // No logs to display
  if (Object.keys(groupedLogs).length === 0) {
    return (
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-end mb-4">
          <span className="text-sm mr-2">내 로그만 보기</span>
          <Switch checked={myLogsOnly} onCheckedChange={handleToggleMyLogs} />
        </div>
        <div className="text-center">입출고 기록이 없습니다</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
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
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <div key={`${date}-${index}`} className="bg-card rounded-lg p-3 shadow-sm">
                <div className="flex items-center mb-2">
                  {/* 재료 이미지 - 왼쪽 */}
                  <Avatar className="h-14 w-14 mr-3 bg-background">
                    <AvatarImage
                      src={entry.ingredient_image}
                      alt={entry.ingredient}
                      className="object-contain"
                    />
                    <AvatarFallback>
                      <Package className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    {/* 재료 이름만 표시 */}
                    <div className="flex flex-col">
                      <span className="text-base font-medium">{entry.ingredient}</span>

                      {/* 시간과 입출고 표시를 같이 배치 */}
                      <div className="flex items-center">
                        <span
                          className={`text-sm font-medium ${entry.type === "입고" ? "text-blue-500" : "text-orange-500"}`}
                        >
                          {entry.type}
                        </span>
                        <span className="mx-1 text-muted-foreground/70">•</span>
                        <span className="text-xs text-muted-foreground">{entry.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* 오른쪽 영역: 사용자 정보 */}
                  <div className="flex items-center">
                    <span className="text-base text-gray-600 mr-1">{entry.user_name}</span>

                    <Avatar className="h-10 w-10 ml-1">
                      <AvatarImage src={entry.user_image} alt={entry.user_name} />
                      <AvatarFallback>
                        <BsPerson className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Infinite scroll loading trigger */}
      <div ref={loadMoreRef} className="text-center py-2" style={{ minHeight: "50px" }}>
        {isFetchingNextPage ? (
          <div className="text-sm text-muted-foreground">로딩 중...</div>
        ) : hasNextPage ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchNextPage()}
            className="flex items-center gap-1"
          >
            더 보기 <ChevronDown className="h-4 w-4" />
          </Button>
        ) : (
          <div className="text-sm text-muted-foreground">모든 데이터를 불러왔습니다</div>
        )}
      </div>
    </div>
  );
}
