import { DetailedMember } from "@/interfaces/Member";
import { createContext, use } from "react";

interface CurrentMemberContextType {
  currentMember: DetailedMember | null;
  setCurrentMember: (member: DetailedMember | null) => void;
}

export const CurrentMemberContext = createContext<CurrentMemberContextType | null>(null);

export function useCurrentMember() {
  const context = use(CurrentMemberContext);
  if (!context) {
    throw new Error("useCurrentMember must be used within a CurrentMemberContext");
  }
  return context;
}
