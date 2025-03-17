import { getMembers } from "@/api/members";
import Member from "@/interfaces/Member";
import { createContext, use, useEffect, useMemo, useState, type ReactNode } from "react";

interface MembersContextType {
  members: Member[];
  isLoading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

const MembersContext = createContext<MembersContextType | null>(null);

export function MembersProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const memo = useMemo(
    () => ({ members, isLoading, error, reload: fetchMembers }),
    [members, isLoading, error]
  );
  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const membersList = await getMembers();
      setMembers(membersList);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch members"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return <MembersContext value={memo}>{children}</MembersContext>;
}

export function useMembers() {
  const context = use(MembersContext);
  if (!context) {
    throw new Error("useMembers must be used within a MembersProvider");
  }
  return context;
}
