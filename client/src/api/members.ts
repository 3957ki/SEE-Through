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

export async function updateMember(data: {
  member_id: string;
  name: string;
  birth: string;
  color: string;
  font_size: string;
  preferred_foods: string[];
  disliked_foods: string[];
  allergies: string[];
  diseases: string[];
}): Promise<void> {
  await APIServerFetcher.put(`/members`, data);
}

export async function createAndGetMember(data: {
  member_id: string;
  age: number;
  image_path: string;
}): Promise<DetailedMember> {
  const response = await APIServerFetcher.post<DetailedMember>("/members", data);
  return response.data;
}

export async function addPreferredFood(memberId: string, food: string): Promise<void> {
  await APIServerFetcher.post(`/members/${memberId}/preferred-foods`, {
    preferred_foods: [food],
  });
}

export async function addDislikedFood(memberId: string, food: string): Promise<void> {
  await APIServerFetcher.post(`/members/${memberId}/disliked-foods`, {
    disliked_foods: [food],
  });
}

export async function removePreferredFood(memberId: string, food: string): Promise<void> {
  await APIServerFetcher.delete(`/members/${memberId}/preferred-foods`, {
    data: { preferred_foods: [food] },
  });
}

export async function removeDislikedFood(memberId: string, food: string): Promise<void> {
  await APIServerFetcher.delete(`/members/${memberId}/disliked-foods`, {
    data: { disliked_foods: [food] },
  });
}
