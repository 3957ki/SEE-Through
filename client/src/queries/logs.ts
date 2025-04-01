import { getLogs } from "@/api/logs";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const logs = createQueryKeys("logs", {
  all: (page: number = 1, pageSize: number = 10, memberId?: string) => ({
    queryKey: [page, pageSize, memberId],
    queryFn: () => getLogs(page, pageSize, memberId),
  }),
});
