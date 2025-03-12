import MaterialsCard from "@/components/MaterialsCard";
import NotificationsCard from "@/components/NotificationsCard";
import CurrentMemberContext from "@/contexts/CurrentMemberContext";
import { use } from "react";

function MainPage() {
  const { currentMember } = use(CurrentMemberContext);

  return (
    <>
      {/* Greeting */}
      <div className="px-4 py-2">
        <p className="text-2xl font-medium">좋은 아침입니다,</p>
        <p className="text-2xl font-medium">{currentMember?.name}님!</p>
      </div>

      <NotificationsCard
        title="알림"
        notifications={[
          {
            messages: ["오늘 물 두 잔을 마셨네요!", "물은 하루에 여덟 잔 마시는 것을 추천합니다!"],
            bgColor: "bg-blue-300",
          },
          {
            messages: ["오늘의 운동을 완료했습니다!", "30분 걷기 - 완료", "스트레칭 - 완료"],
            bgColor: "bg-green-300",
          },
        ]}
      />

      <MaterialsCard
        materials={Array.from({ length: 10 }, (_, i) => ({
          id: i.toString(),
          image: "/placeholder.svg",
          name: "Empty material",
        }))}
      />
    </>
  );
}

export default MainPage;
