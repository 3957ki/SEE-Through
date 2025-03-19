import Member from "@/interfaces/Member";

interface MembersResponse {
  members: Member[];
  currentMember: Member;
}

export async function getMembers(): Promise<Member[]> {
  // try {
  //   const response = await ServerMembersFetcher().get("/");
  //   return response.data;
  // } catch (error) {
  //   console.error("Failed to fetch members:", error);
  //   return [];
  // }
  return [
    {
      id: "1",
      name: "Gwon Hong",
      avatar: "https://avatars.githubusercontent.com/gwonhong",
    },
    {
      id: "2",
      name: "shadcn",
      avatar: "https://avatars.githubusercontent.com/shadcn",
    },
  ];
}

export async function getMembersAndCurrentMember(uuid: string): Promise<MembersResponse> {
  // try {
  //   const response = await ServerMembersFetcher().get("/");
  //   const members = response.data;
  //   const currentMember = uuid
  //     ? members.find(m => m.id === uuid) ?? members[0]
  //     : members[0];
  //   return { members, currentMember };
  // } catch (error) {
  //   console.error("Failed to fetch members:", error);
  //   return { members: [], currentMember: null };
  // }

  const members = [
    {
      id: "1",
      name: "Gwon Hong",
      avatar: "https://avatars.githubusercontent.com/gwonhong",
    },
    {
      id: "2",
      name: "shadcn",
      avatar: "https://avatars.githubusercontent.com/shadcn",
    },
  ];

  const currentMember = members.find((m) => m.id === uuid) ?? members[0];

  return { members, currentMember };
}
