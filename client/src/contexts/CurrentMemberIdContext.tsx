import { Spinner } from "@/components/ui/spinner";
import { members } from "@/queries/members";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, ReactNode, use, useMemo, useState } from "react";

interface CurrentMemberIdContextType {
  currentMemberId: string;
  setCurrentMemberId: (memberId: string) => void;
}

export const CurrentMemberIdContext = createContext<CurrentMemberIdContextType | null>(null);

export function useCurrentMemberId() {
  const context = use(CurrentMemberIdContext);
  if (!context) {
    throw new Error("useCurrentMemberId must be used within a CurrentMemberIdContext");
  }
  return context;
}

export function CurrentMemberIdProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [currentMemberId, setCurrentMemberId] = useState<string>("");

  // Use TanStack Query to fetch members
  const { data: membersList, isLoading } = useQuery(members.list);

  // Set the first member ID when data is loaded
  useMemo(() => {
    if (membersList && membersList.length > 0 && !currentMemberId) {
      setCurrentMemberId(membersList[0].member_id);
    }
  }, [membersList, currentMemberId]);

  const currentMemberIdValue = useMemo(
    () => ({
      currentMemberId,
      setCurrentMemberId: (memberId: string) => {
        setCurrentMemberId(memberId);
        queryClient.invalidateQueries(members.all);
      },
    }),
    [currentMemberId, queryClient]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size={36} />
        <p className="ml-2">Loading member data...</p>
      </div>
    );
  }

  return <CurrentMemberIdContext value={currentMemberIdValue}>{children}</CurrentMemberIdContext>;
}
