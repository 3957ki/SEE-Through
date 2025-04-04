import { members } from "@/queries/members";
import { useQueryClient } from "@tanstack/react-query";
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

  return <CurrentMemberIdContext value={currentMemberIdValue}>{children}</CurrentMemberIdContext>;
}
