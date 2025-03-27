import { getMember, getMembers } from "@/api/members";
import { CurrentMemberContext } from "@/contexts/CurrentMemberContext";
import { MembersContext } from "@/contexts/MembersContext";
import type { DetailedMember, Member } from "@/interfaces/Member";
import { useEffect, useMemo, useState, type ReactNode } from "react";

export function MemberContextsProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [currentMember, setCurrentMember] = useState<DetailedMember | null>(null);

  // initialization
  useEffect(() => {
    (async () => {
      try {
        const fetchedMembers = await getMembers();
        setMembers(fetchedMembers);
        if (fetchedMembers.length > 0) {
          const firstMember = await getMember(fetchedMembers[0].member_id);
          setCurrentMember(firstMember);
        }
      } catch (error) {
        console.error("Failed to initialize members:", error);
      }
    })();
  }, []);

  const membersValue = useMemo(
    () => ({
      members,
      setMembers,
    }),
    [members]
  );

  const currentMemberValue = useMemo(
    () => ({
      currentMember,
      setCurrentMember,
    }),
    [currentMember]
  );

  return (
    <MembersContext value={membersValue}>
      <CurrentMemberContext value={currentMemberValue}>{children}</CurrentMemberContext>
    </MembersContext>
  );
}

export default MemberContextsProvider;
