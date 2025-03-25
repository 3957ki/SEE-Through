import type { DetailedMember, Member, MemberListResponse } from "@/interfaces/Member";
import { APIServerFetcher } from "@/lib/fetchers";

export async function getMembers(): Promise<Member[]> {
  const response = await APIServerFetcher.get<MemberListResponse>("/members");
  return response.data.content;
}

export async function getMember(memberId: string): Promise<DetailedMember> {
  const response = await APIServerFetcher.get<DetailedMember>(`/members/${memberId}`);
  return response.data;
}

export async function getMembersAndCurrentMember(
  memberId: string
): Promise<{ members: Member[]; currentMember: DetailedMember | null }> {
  const [members, currentMember] = await Promise.all([
    getMembers(),
    getMember(memberId).catch(() => null),
  ]);

  return {
    members,
    currentMember,
  };
}

export async function updateMember(data: {
  memberId: string;
  name: string;
  birth: string;
  preferredFoods: string[];
  dislikedFoods: string[];
  allergies: string[];
  diseases: string[];
}): Promise<void> {
  await APIServerFetcher.put(`/members`, data);
}
