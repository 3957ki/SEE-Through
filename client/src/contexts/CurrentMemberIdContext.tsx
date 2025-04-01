import { createContext, ReactNode, use, useMemo, useState } from "react";

interface CurrentMemberIdContextType {
  currentMemberId: string | null;
  setCurrentMemberId: (memberId: string | null) => void;
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
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);

  const currentMemberIdValue = useMemo(
    () => ({
      currentMemberId,
      setCurrentMemberId,
    }),
    [currentMemberId]
  );

  return <CurrentMemberIdContext value={currentMemberIdValue}>{children}</CurrentMemberIdContext>;
}
