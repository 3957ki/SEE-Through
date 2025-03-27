import Member from "@/interfaces/Member";
import { createContext, use } from "react";

interface MembersContextType {
  members: Member[];
  setMembers: (members: Member[]) => void;
}

export const MembersContext = createContext<MembersContextType | null>(null);

export function useMembers() {
  const context = use(MembersContext);
  if (!context) {
    throw new Error("useMembers must be used within a MembersContext");
  }
  return context;
}
