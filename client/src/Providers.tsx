import { getMembers } from "@/api/members";
import Member from "@/interfaces/Member";
import { useEffect, useState, type ReactNode } from "react";
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

  return (
    <MembersContext value={{ members, fetchMembers }}>
      <CurrentMemberContext value={{ currentMember, setCurrentMember }}>
        {children}
      </CurrentMemberContext>
    </MembersContext>
  );
}

export default Providers;
