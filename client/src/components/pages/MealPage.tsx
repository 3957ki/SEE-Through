import { Section, SectionDivider, SectionTitle } from "@/components/ui/section";
import { useCurrentMember } from "@/contexts/CurrentMemberContext";
import { useState } from "react";
import { BsCalendarEvent, BsHandThumbsDown, BsHandThumbsUp } from "react-icons/bs";

// 식단 카드 컴포넌트
function MealCard({ title, color, items }: { title: string; color: string; items: string[] }) {
  return (
    <div className={`${color} rounded-xl p-4 w-full text-white`}>
      <h3 className="font-medium mb-2 text-lg">{title}</h3>
      {items.map((item, index) => (
        <p key={index} className="text-sm">
          {item}
        </p>
      ))}
    </div>
  );
}

// 피드백 버튼
function FeedbackButtons() {
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);

  return (
    <div className="px-4 py-4 text-center">
      <p className="text-sm mb-2">이 식단은 도움이 되나요?</p>
      <div className="flex justify-center gap-6">
        <button
          className={`p-2 transition-all ${feedback === "like" ? "bg-orange-100 rounded-full scale-110" : ""}`}
          onClick={() => setFeedback("like")}
        >
          <BsHandThumbsUp
            className={`w-6 h-6 ${feedback === "like" ? "text-orange-500" : "text-gray-700"}`}
          />
        </button>
        <button
          className={`p-2 transition-all ${feedback === "dislike" ? "bg-orange-100 rounded-full scale-110" : ""}`}
          onClick={() => setFeedback("dislike")}
        >
          <BsHandThumbsDown
            className={`w-6 h-6 ${feedback === "dislike" ? "text-orange-500" : "text-gray-700"}`}
          />
        </button>
      </div>
    </div>
  );
}

// 식단 전체 섹션
function TodaysDietSection() {
  return (
    <Section>
      <SectionTitle icon={<BsCalendarEvent className="w-4 h-4" />}>오늘의 추천 식단</SectionTitle>
      <div className="px-4 flex flex-col gap-3">
        <MealCard title="아침" color="bg-orange-400" items={["삼각김밥", "바나나"]} />
        <MealCard
          title="점심"
          color="bg-gray-600"
          items={["닭가슴살볶음밥", "토마토", "오렌지주스 150ml"]}
        />
        <MealCard
          title="저녁"
          color="bg-emerald-500"
          items={["현미밥", "미역국", "불고기", "김치"]}
        />
      </div>
      <FeedbackButtons />
    </Section>
  );
}

function MealPage() {
  const { currentMember } = useCurrentMember();

  return (
    <div className="pb-16 relative">
      <TodaysDietSection />
      <SectionDivider />
    </div>
  );
}

export default MealPage;
