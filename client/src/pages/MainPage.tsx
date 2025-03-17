import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/main-card";
import { useCurrentMember } from "@/contexts/CurrentMemberContext";
import Material from "@/interfaces/Material";

function MaterialBlock({ material }: { material: Material }) {
  return (
    <div className="aspect-square bg-white rounded-md overflow-hidden">
      <img
        src={material.image ?? "/placeholder.svg"}
        alt={material.name ?? "Material image"}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function MaterialsCard({ materials }: { materials: Material[] }) {
  const MAX_MATERIALS = 10;

  return (
    <Card>
      <CardHeader>
        <CardTitle>재료 목록</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-1">
          {materials
            ?.slice(0, MAX_MATERIALS)
            .map((material) => <MaterialBlock key={material.id} material={material} />)}
        </div>
      </CardContent>
    </Card>
  );
}

interface Notification {
  messages: string[];
  bgColor?: string;
}

function NotificationBlock({ notification }: { notification: Notification }) {
  return (
    <div className={`${notification.bgColor || "bg-blue-300"} text-white p-4 rounded-xl`}>
      {notification.messages.map((message, messageIndex) => (
        <p key={messageIndex}>{message}</p>
      ))}
    </div>
  );
}

function NotificationsCard({
  title,
  notifications,
}: {
  title: string;
  notifications: Notification[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notification, blockIndex) => (
            <NotificationBlock key={blockIndex} notification={notification} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MainPage() {
  const { currentMember } = useCurrentMember();

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
