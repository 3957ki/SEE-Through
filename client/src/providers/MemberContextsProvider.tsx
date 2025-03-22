import { getMembers, getMembersAndCurrentMember } from "@/api/members";
import { CurrentMemberContext } from "@/contexts/CurrentMemberContext";
import { MembersContext } from "@/contexts/MembersContext";
import Member from "@/interfaces/Member";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export function MemberContextsProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const currentMemberIdRef = useRef<string | null>(null);

  async function updateMembers() {
    const members = await getMembers();
    setMembers(members);
  }

  async function updateMembersAndCurrentMember(uuid: string) {
    const { members, currentMember } = await getMembersAndCurrentMember(uuid);
    setMembers(members);
    setCurrentMember(currentMember);
    currentMemberIdRef.current = currentMember?.id ?? null;
  }

  // 초기 멤버 업데이트
  useEffect(() => {
    updateMembersAndCurrentMember("0"); // only for the first time
  }, []);

  // // 메시지 수신 시 멤버 목록 & 현재 멤버 업데이트
  // useEffect(() => {
  //   const handleMessage = (event: MessageEvent) => {
  //     if (event.data.type === "MEMBER_UPDATE" && event.data.uuid) {
  //       if (currentMemberIdRef.current === event.data.uuid) return;
  //       updateMembersAndCurrentMember(event.data.uuid);
  //     }
  //   };

  //   window.addEventListener("message", handleMessage);
  //   return () => window.removeEventListener("message", handleMessage);
  // }, []);

  const membersValue = useMemo(() => ({ members, fetchMembers: () => updateMembers() }), [members]);
  const currentMemberValue = useMemo(
    () => ({
      currentMember,
      setCurrentMember: (uuid: string) => updateMembersAndCurrentMember(uuid),
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
