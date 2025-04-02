import { getMembers } from "@/api/members";
import { members } from "@/queries/members";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, ReactNode, use, useEffect, useMemo, useState } from "react";

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
  const [isLoading, setIsLoading] = useState(true);

  // Fetch and set the first member ID on component mount
  useEffect(() => {
    const initializeMemberId = async () => {
      try {
        const members = await getMembers();
        if (members && members.length > 0) {
          setCurrentMemberId(members[0].member_id);
        }
      } catch (error) {
        console.error("Failed to fetch members:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeMemberId();
  }, []);

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
    return <div>Loading member data...</div>;
  }

  return <CurrentMemberIdContext value={currentMemberIdValue}>{children}</CurrentMemberIdContext>;
}
