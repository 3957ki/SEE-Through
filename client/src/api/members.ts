import Member from "@/interfaces/Member";

// Mock data for testing
const mockMembers: Member[] = [
  {
    id: "0",
    name: "김삼성",
    avatar: "", // Empty string to test fallback
  },
  {
    id: "1",
    name: "김철수",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "2",
    name: "이영희",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "3",
    name: "박지민",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    id: "4",
    name: "정태식",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
  },
];

// Simulated API calls
export async function getMembers(): Promise<Member[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockMembers;
}

export async function getMembersAndCurrentMember(
  uuid: string
): Promise<{ members: Member[]; currentMember: Member | null }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const currentMember = mockMembers.find((member) => member.id === uuid) || mockMembers[0];

  return {
    members: mockMembers,
    currentMember,
  };
}
