import { getMembers } from "@/api/members";
import Member from "@/interfaces/Member";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CurrentMemberContext } from "./contexts/CurrentMemberContext";
import { MembersContext } from "./contexts/MembersContext";

export function Providers({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);

  const fetchMembers = async () => {
    const members = await getMembers();
    setMembers(members);
  };

  useEffect(() => {
    fetchMembers();
    setCurrentMember(members[0]);
  }, []);

  const membersValue = useMemo(() => ({ members, fetchMembers }), [members]);
  const currentMemberValue = useMemo(() => ({ currentMember, setCurrentMember }), [currentMember]);

  return (
    <MembersContext value={membersValue}>
      <CurrentMemberContext value={currentMemberValue}>{children}</CurrentMemberContext>
    </MembersContext>
  );
}

export default Providers;
