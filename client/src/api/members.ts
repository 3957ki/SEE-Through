import Member from "@/interfaces/Member";

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
