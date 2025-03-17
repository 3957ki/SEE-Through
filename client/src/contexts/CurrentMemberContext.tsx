import Member from "@/interfaces/Member";
import { createContext, use, useMemo, useState, type ReactNode } from "react";

interface CurrentMemberContextType {
  currentMember: Member | null;
  setCurrentMember: (member: Member | null) => void;
}

const CurrentMemberContext = createContext<CurrentMemberContextType>({
  currentMember: null,
  setCurrentMember: () => {},
});

export function CurrentMemberProvider({ children }: { children: ReactNode }) {
  // TODO: 추후 로컬 서버에서 가져오는 데이터로 변경
  const initialMember: Member = {
    id: "1",
    name: "Gwon Hong",
    avatar: "https://avatars.githubusercontent.com/gwonhong",
  };

  const [currentMember, setCurrentMember] = useState<Member | null>(initialMember);
  const memo = useMemo(() => ({ currentMember, setCurrentMember }), [currentMember]);

  return <CurrentMemberContext value={memo}>{children}</CurrentMemberContext>;
}

export function useCurrentMember() {
  const context = use(CurrentMemberContext);
  if (!context) {
    throw new Error("useCurrentMember must be used within a CurrentMemberProvider");
  }
  return context;
}
