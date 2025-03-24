import { SectionTitle } from "@/components/ui/section";
import { addDays, format, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  BsArrowClockwise,
  BsCalendarEvent,
  BsHandThumbsDown,
  BsHandThumbsUp,
} from "react-icons/bs";

function generateDateRange(center: Date): Date[] {
  const range: Date[] = [];
  for (let i = -7; i <= 7; i++) {
    range.push(addDays(center, i));
  }
  return range;
}

function DateSelector({
  selectedDate,
  onSelect,
}: {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}) {
  const today = new Date();
  const [offset, setOffset] = useState(0); // -7 ~ +7 중 어떤 범위 볼지

  const visibleDates = generateDateRange(addDays(today, offset)).slice(5, 12); // 7일만 보이게

  const handlePrev = () => setOffset(offset - 1);
  const handleNext = () => setOffset(offset + 1);

  return (
    <div className="flex items-center px-4 py-2 border-b gap-2">
      <button onClick={handlePrev} className="p-1">
        <ChevronLeft className="w-5 h-5 text-gray-500" />
      </button>

      <div className="flex-1 flex justify-around">
        {visibleDates.map((date, index) => {
          const isSelected = isSameDay(date, selectedDate);
          const dayOfWeek = format(date, "EEE", { locale: ko });
          const day = format(date, "d");

          return (
            <div
              key={index}
              className={`flex flex-col items-center px-2 py-1 rounded-full cursor-pointer ${
                isSelected ? "bg-orange-400 text-white" : "text-gray-700"
              }`}
              onClick={() => onSelect(date)}
            >
              <span className="text-xs">{dayOfWeek}</span>
              <span className="text-base font-medium">{day}</span>
            </div>
          );
        })}
      </div>

      <button onClick={handleNext} className="p-1">
        <ChevronRight className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  );
}

function MealItem({ name }: { name: string }) {
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);

  return (
    <div className="flex items-center justify-start px-4 py-1 gap-2">
      <span className="text-sm">{name}</span>
      <BsHandThumbsUp
        className={`w-4 h-4 cursor-pointer ${
          feedback === "like" ? "text-orange-500" : "text-gray-400"
        }`}
        onClick={() => setFeedback("like")}
      />
      <BsHandThumbsDown
        className={`w-4 h-4 cursor-pointer ${
          feedback === "dislike" ? "text-orange-500" : "text-gray-400"
        }`}
        onClick={() => setFeedback("dislike")}
      />
    </div>
  );
}

function MealSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="py-4">
      <div className="flex justify-between items-stretch px-4">
        <div>
          <h3 className="text-orange-600 text-lg font-bold">{title}</h3>
          <div className="mt-2 space-y-1">
            {items.map((item, index) => (
              <MealItem key={index} name={item} />
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-400">💡 여기다 추천 이유?</div>
        </div>

        <button className="self-center pl-4">
          <BsArrowClockwise className="text-4xl text-gray-600 cursor-pointer" />
        </button>
      </div>

      {/* 진한 구분선 + 여백 있는 스타일 */}
      <div className="mt-4 border-t-2 border-orange-500 mx-4" />
    </div>
  );
}

function MealPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleGoToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="pb-24 relative">
      <div className="flex justify-between items-center px-4 mt-4">
        <SectionTitle icon={<BsCalendarEvent className="w-4 h-4" />}>식단 캘린더</SectionTitle>
        <button
          onClick={handleGoToday}
          className="text-sm text-orange-500 border border-orange-300 rounded-full px-3 py-1 hover:bg-orange-50"
        >
          오늘
        </button>
      </div>

      <DateSelector selectedDate={selectedDate} onSelect={setSelectedDate} />

      <MealSection title="아침" items={["삼각김밥", "바나나"]} />
      <MealSection title="점심" items={["닭가슴살볶음밥", "토마토", "오렌지주스 150ml"]} />
    </div>
  );
}

export default MealPage;
