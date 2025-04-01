import { getLogs } from "@/api/logs";
import { LogsResponse } from "@/interfaces/Log";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useInfiniteQuery } from "@tanstack/react-query";

export const logs = createQueryKeys("logs", {
  all: (pageSize: number = 10, memberId?: string) => ({
    queryKey: [pageSize, memberId],
    queryFn: () => getLogs(1, pageSize, memberId),
  }),
});

export function useLogs(pageSize: number = 10, memberId?: string) {
  return useInfiniteQuery({
    queryKey: logs.all(pageSize, memberId).queryKey,
    queryFn: ({ pageParam }) => getLogs(pageParam as number, pageSize, memberId),
    getNextPageParam: (lastPage: LogsResponse) => {
      if (!lastPage.slice_info.has_next) return undefined;
      return lastPage.slice_info.current_page + 1;
    },
    initialPageParam: 1,
  });
}
