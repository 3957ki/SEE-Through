import { getMembers, getMembersAndCurrentMember } from "@/api/members";
import { CurrentMemberContext } from "@/contexts/CurrentMemberContext";
import { MembersContext } from "@/contexts/MembersContext";
import type { DetailedMember, Member } from "@/interfaces/Member";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export function MemberContextsProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [currentMember, setCurrentMember] = useState<DetailedMember | null>(null);
  const currentMemberIdRef = useRef<string | null>(null);

  async function updateMembers() {
    try {
      const fetchedMembers = await getMembers();
      setMembers(fetchedMembers);
      return fetchedMembers;
    } catch (error) {
      console.error("Failed to fetch members:", error);
      return [];
    }
  }

  async function updateMembersAndCurrentMember(memberId: string) {
    try {
      const { members, currentMember } = await getMembersAndCurrentMember(memberId);
      setMembers(members);
      setCurrentMember(currentMember);
      currentMemberIdRef.current = currentMember?.member_id ?? null;
    } catch (error) {
      console.error("Failed to fetch members and current member:", error);
    }
  }

  // 초기 멤버 업데이트
  useEffect(() => {
    async function init() {
      const fetchedMembers = await updateMembers();
      if (fetchedMembers.length > 0) {
        updateMembersAndCurrentMember(fetchedMembers[0].member_id);
      }
    }
    init();
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

  const membersValue = useMemo(
    () => ({
      members,
      fetchMembers: async () => {
        await updateMembers();
      },
    }),
    [members]
  );
  const currentMemberValue = useMemo(
    () => ({
      currentMember,
      setCurrentMember: (memberId: string) => updateMembersAndCurrentMember(memberId),
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
