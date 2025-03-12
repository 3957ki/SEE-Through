import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/main-card";

interface Notification {
  messages: string[];
  bgColor?: string;
}

interface NotificationBlockProps {
  notification: Notification;
}

interface NotificationsCardProps {
  title: string;
  notifications: Notification[];
}

function NotificationBlock({ notification }: NotificationBlockProps) {
  return (
    <div className={`${notification.bgColor || "bg-blue-300"} text-white p-4 rounded-xl`}>
      {notification.messages.map((message, messageIndex) => (
        <p key={messageIndex}>{message}</p>
      ))}
    </div>
  );
}

function NotificationsCard({ title, notifications }: NotificationsCardProps) {
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

export default NotificationsCard;
