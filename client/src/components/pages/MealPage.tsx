import {
  addDislikedFood,
  addPreferredFood,
  removeDislikedFood,
  removePreferredFood,
} from "@/api/members";
import { Spinner } from "@/components/ui/spinner";
import { useCurrentMember, useCurrentMemberMealsOf, useMutateRefreshMeal } from "@/queries/members";
import { addDays, format, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import {
  BsArrowClockwise,
  BsCalendarEvent,
  BsHandThumbsDown,
  BsHandThumbsUp,
} from "react-icons/bs";

function generateDateRange(start: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

function DateSelector({
  selectedDate,
  onSelect,
}: {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}) {
  const today = new Date();
  const [offset, setOffset] = useState(0);

  const currentStartDate = addDays(today, offset);
  const visibleDates = generateDateRange(currentStartDate);

  const handlePrev = () => {
    if (offset > 0) setOffset(offset - 1);
  };

  const handleNext = () => {
    if (offset + 1 <= 0) return;
    setOffset(offset + 1);
  };

  return (
    <div className="flex items-center border-b gap-2">
      <button type="button" onClick={handlePrev} className="p-1" disabled={offset === 0}>
        <ChevronLeft className={`w-5 h-5 ${offset === 0 ? "text-gray-300" : "text-gray-500"}`} />
      </button>
      <div className="flex-1 flex justify-around">
        {visibleDates.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          const dayOfWeek = format(date, "EEE", { locale: ko });
          const day = format(date, "d");
          return (
            <div
              key={date.toDateString()}
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
      <button type="button" onClick={handleNext} className="p-1" disabled>
        <ChevronRight className="w-5 h-5 text-gray-300" />
      </button>
    </div>
  );
}

function MealItem({
  name,
  feedback,
  setFeedbackMap,
  memberId,
}: {
  name: string;
  feedback: "like" | "dislike" | null;
  setFeedbackMap: Dispatch<SetStateAction<Record<string, "like" | "dislike" | null>>>;
  memberId: string;
}) {
  const handleLike = async () => {
    try {
      if (feedback === "like") {
        await removePreferredFood(memberId, name);
        setFeedbackMap((prev) => ({ ...prev, [name]: null }));
      } else {
        if (feedback === "dislike") await removeDislikedFood(memberId, name);
        await addPreferredFood(memberId, name);
        setFeedbackMap((prev) => ({ ...prev, [name]: "like" }));
      }
    } catch (err) {
      console.error("선호 처리 실패", err);
    }
  };

  const handleDislike = async () => {
    try {
      if (feedback === "dislike") {
        await removeDislikedFood(memberId, name);
        setFeedbackMap((prev) => ({ ...prev, [name]: null }));
      } else {
        if (feedback === "like") await removePreferredFood(memberId, name);
        await addDislikedFood(memberId, name);
        setFeedbackMap((prev) => ({ ...prev, [name]: "dislike" }));
      }
    } catch (err) {
      console.error("비선호 처리 실패", err);
    }
  };

  return (
    <div
      className={`flex items-center justify-start gap-2 rounded-md transition ${
        feedback === "like"
          ? "bg-orange-50 border-l-4 border-orange-400"
          : feedback === "dislike"
            ? "bg-gray-100 border-l-4 border-gray-400"
            : ""
      }`}
    >
      <span className="text-sm font-medium">{name}</span>

      <BsHandThumbsUp
        className={`w-4 h-4 ${
          feedback === "like" ? "text-orange-500" : "text-gray-400"
        } cursor-pointer`}
        onClick={handleLike}
        title="선호 토글"
      />

      <BsHandThumbsDown
        className={`w-4 h-4 ${
          feedback === "dislike" ? "text-gray-700" : "text-gray-400"
        } cursor-pointer`}
        onClick={handleDislike}
        title="비선호 토글"
      />
    </div>
  );
}

function MealSection({
  title,
  items,
  reason,
  mealId,
  onRefresh,
  isRefreshing,
  feedbackMap,
  setFeedbackMap,
  memberId,
}: {
  title: string;
  items: string[];
  reason?: string;
  mealId: string;
  onRefresh: (mealId: string) => void;
  isRefreshing: boolean;
  feedbackMap: Record<string, "like" | "dislike" | null>;
  setFeedbackMap: Dispatch<SetStateAction<Record<string, "like" | "dislike" | null>>>;
  memberId: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-stretch">
        <div>
          <h3 className="text-orange-600 text-lg font-bold">{title}</h3>
          <div className="mt-2 space-y-1">
            {items.map((item, index) => (
              <MealItem
                key={index}
                name={item}
                feedback={feedbackMap[item] ?? null}
                setFeedbackMap={setFeedbackMap}
                memberId={memberId}
              />
            ))}
          </div>
          {reason && <div className="mt-2 text-sm text-gray-400">💡 {reason}</div>}
        </div>
        <button
          type="button"
          className="self-center pl-4"
          onClick={() => onRefresh(mealId)}
          disabled={isRefreshing}
        >
          <BsArrowClockwise
            className={`text-4xl ${isRefreshing ? "animate-spin text-orange-400" : "text-gray-600"} cursor-pointer`}
          />
        </button>
      </div>
    </div>
  );
}

export default function MealPage() {
  const { data: currentMember } = useCurrentMember();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: meals, isLoading: isMealsLoading } = useCurrentMemberMealsOf(selectedDate);
  const refreshMutation = useMutateRefreshMeal(selectedDate);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, "like" | "dislike" | null>>({});
  const [isFeedbackInitialized, setIsFeedbackInitialized] = useState(false);

  useEffect(() => {
    if (!currentMember || isFeedbackInitialized) return;

    const preferred = currentMember.preferred_foods || [];
    const disliked = currentMember.disliked_foods || [];

    const initialFeedback: Record<string, "like" | "dislike"> = {};

    preferred.forEach((food: string) => {
      initialFeedback[food] = "like";
    });

    disliked.forEach((food: string) => {
      initialFeedback[food] = "dislike";
    });

    setFeedbackMap(initialFeedback);
    setIsFeedbackInitialized(true);
  }, [currentMember, isFeedbackInitialized]);

  const handleGoToday = () => {
    setSelectedDate(new Date());
  };

  const handleRefreshMeal = (mealId: string) => {
    refreshMutation.mutate(mealId);
  };

  if (!currentMember) return null;

  return (
    <div>
      <div className="flex justify-between items-center px-4">
        <div className="flex items-center gap-1">
          <BsCalendarEvent className="w-4 h-4 text-gray-600" />
          <h2 className="text-lg font-medium">식단 캘린더</h2>
        </div>
        <button
          type="button"
          onClick={handleGoToday}
          className="text-sm text-orange-500 border border-orange-300 rounded-full px-3 py-1 hover:bg-orange-50"
        >
          오늘
        </button>
      </div>

      <DateSelector selectedDate={selectedDate} onSelect={setSelectedDate} />

      {isMealsLoading ? (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
          <Spinner size={36} />
          <p className="mt-2 text-sm">식단을 불러오는 중입니다...</p>
        </div>
      ) : meals ? (
        <div className="px-4 space-y-4">
          <MealSection
            title="아침"
            items={meals.breakfast.menu}
            reason={meals.breakfast.reason}
            mealId={meals.breakfast.meal_id}
            onRefresh={handleRefreshMeal}
            isRefreshing={
              refreshMutation.isPending && refreshMutation.variables === meals.breakfast.meal_id
            }
            feedbackMap={feedbackMap}
            setFeedbackMap={setFeedbackMap}
            memberId={currentMember.member_id}
          />
          <MealSection
            title="점심"
            items={meals.lunch.menu}
            reason={meals.lunch.reason}
            mealId={meals.lunch.meal_id}
            onRefresh={handleRefreshMeal}
            isRefreshing={
              refreshMutation.isPending && refreshMutation.variables === meals.lunch.meal_id
            }
            feedbackMap={feedbackMap}
            setFeedbackMap={setFeedbackMap}
            memberId={currentMember.member_id}
          />
          <MealSection
            title="저녁"
            items={meals.dinner.menu}
            reason={meals.dinner.reason}
            mealId={meals.dinner.meal_id}
            onRefresh={handleRefreshMeal}
            isRefreshing={
              refreshMutation.isPending && refreshMutation.variables === meals.dinner.meal_id
            }
            feedbackMap={feedbackMap}
            setFeedbackMap={setFeedbackMap}
            memberId={currentMember.member_id}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
          <p className="text-gray-500">식단 정보가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
