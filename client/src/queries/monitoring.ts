import { fetchMonitoringUsers } from "@/api/monitoring";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const monitoring = createQueryKeys("monitoring", {
  list: {
    queryKey: null,
    queryFn: () => fetchMonitoringUsers(),
  },
});
