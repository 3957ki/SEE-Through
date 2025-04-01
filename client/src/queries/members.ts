import { getMember, getMembers } from "@/api/members";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const members = createQueryKeys("members", {
  list: {
    queryKey: ["members", "list"],
    queryFn: () => getMembers(),
  },
  detail: (memberId: string) => ({
    queryKey: ["members", "detail", memberId],
    queryFn: () => getMember(memberId),
  }),
});
