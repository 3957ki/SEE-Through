import { fetchMonitoringUsers, updateMonitoring } from "@/api/monitoring";
import type { MonitoringUser } from "@/interfaces/Monitoring";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const monitoring = createQueryKeys("monitoring", {
  users: {
    queryKey: null,
    queryFn: fetchMonitoringUsers,
  },
});

export function useMonitoringUsers() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: monitoring.users.queryKey,
    queryFn: monitoring.users.queryFn,
  });

  return {
    users: data as MonitoringUser[],
    isLoading,
    isError,
    error,
  };
}

export function useUpdateMonitoring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: { userId: string }) => updateMonitoring({ userId }),
    onSuccess: () => {
      queryClient.invalidateQueries(monitoring.users);
    },
    onMutate: async ({ userId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(monitoring.users);

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(monitoring.users.queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData(monitoring.users.queryKey, (old: MonitoringUser[] | undefined) => {
        if (!old) return old;
        return old.map((user) =>
          user.member_id === userId ? { ...user, is_monitored: !user.is_monitored } : user
        );
      });

      return { previousUsers };
    },
    onError: (_, __, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(monitoring.users.queryKey, context.previousUsers);
      }
    },
  });
}
