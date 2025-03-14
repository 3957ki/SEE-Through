import Header from "@/components/layout/Header";
import CurrentMemberContext from "@/contexts/CurrentMemberContext";
import { MembersProvider } from "@/contexts/MembersContext";
import Member from "@/interfaces/Member";
import MainPage from "@/pages/MainPage";
import { useMemo, useState } from "react";

function App() {
  // TODO: 추후 로컬 서버에서 가져오는 데이터로 변경
  const initialMember: Member = {
    id: "1",
    name: "Gwon Hong",
    avatar: "https://avatars.githubusercontent.com/gwonhong",
  };

  // TODO: 로컬 서버와 websocket 통신을 통해 지속적으로 현재 멤버 상태를 업데이트 하는 로직 추가

  const [currentMember, setCurrentMember] = useState<Member | null>(initialMember);
  const value = useMemo(() => ({ currentMember, setCurrentMember }), [currentMember]);

  return (
    <MembersProvider>
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <CurrentMemberContext value={value}>
          <Header />
          <MainPage />
        </CurrentMemberContext>
      </div>
    </MembersProvider>
  );
}

export default App;
