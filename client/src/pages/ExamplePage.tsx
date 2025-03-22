import { Section, SectionContent, SectionDivider, SectionTitle } from "@/components/ui/section";
import { useState } from "react";
import { BsCalendarEvent, BsClockHistory, BsGear, BsPlus } from "react-icons/bs";

// Example notification item
function NotificationItem({
  title,
  time,
  description,
}: {
  title: string;
  time: string;
  description: string;
}) {
  return (
    <div className="border-b border-gray-100 py-3">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">{title}</h3>
        <span className="text-xs text-gray-500">{time}</span>
      </div>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
  );
}

// Example section with notifications
function NotificationsSection() {
  return (
    <Section>
      <SectionTitle
        icon={<BsClockHistory />}
        action={<button className="text-orange-500 text-sm">모두 보기</button>}
      >
        활동 알림
      </SectionTitle>
      <SectionContent className="space-y-1">
        <NotificationItem
          title="냉장고 문 열림"
          time="10분 전"
          description="냉장고 문이 3분 이상 열려있었습니다."
        />
        <NotificationItem
          title="새로운 식재료 추가"
          time="1시간 전"
          description="토마토 3개가 냉장고에 추가되었습니다."
        />
        <NotificationItem
          title="식재료 유통기한 임박"
          time="3시간 전"
          description="우유의 유통기한이 내일까지입니다."
        />
      </SectionContent>
    </Section>
  );
}

// Example section with settings
function SettingsSection() {
  const [autoDetect, setAutoDetect] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <Section>
      <SectionTitle icon={<BsGear />}>설정</SectionTitle>
      <SectionContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">자동 식재료 감지</h3>
            <p className="text-sm text-gray-600">식재료를 자동으로 인식합니다</p>
          </div>
          <button
            className={`w-12 h-6 rounded-full relative transition-colors ${
              autoDetect ? "bg-orange-400" : "bg-gray-300"
            }`}
            onClick={() => setAutoDetect(!autoDetect)}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                autoDetect ? "left-7" : "left-1"
              }`}
            />
          </button>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">알림 설정</h3>
            <p className="text-sm text-gray-600">앱 알림을 받습니다</p>
          </div>
          <button
            className={`w-12 h-6 rounded-full relative transition-colors ${
              notifications ? "bg-orange-400" : "bg-gray-300"
            }`}
            onClick={() => setNotifications(!notifications)}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                notifications ? "left-7" : "left-1"
              }`}
            />
          </button>
        </div>
      </SectionContent>
    </Section>
  );
}

// Example section with calendar
function CalendarSection() {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const today = new Date().getDate();

  return (
    <Section>
      <SectionTitle
        icon={<BsCalendarEvent />}
        action={<BsPlus className="w-5 h-5 text-orange-500" />}
      >
        식단 캘린더
      </SectionTitle>
      <SectionContent>
        <div className="flex justify-between mb-2">
          {days.map((day, i) => (
            <div key={i} className="text-center w-8">
              <p className="text-xs text-gray-500">{day}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          {Array.from({ length: 7 }, (_, i) => {
            const date = today - 3 + i;
            const isToday = i === 3;
            return (
              <div key={i} className="text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isToday ? "bg-orange-400 text-white" : ""
                  }`}
                >
                  {date}
                </div>
              </div>
            );
          })}
        </div>
      </SectionContent>
    </Section>
  );
}

function ExamplePage() {
  return (
    <div className="pb-16">
      <Section className="py-4">
        <SectionContent>
          <h1 className="text-2xl font-bold">컴포넌트 예시</h1>
          <p className="text-gray-600">섹션 컴포넌트 활용 예시입니다</p>
        </SectionContent>
      </Section>

      <CalendarSection />

      <SectionDivider />

      <NotificationsSection />

      <SectionDivider />

      <SettingsSection />
    </div>
  );
}

export default ExamplePage;
