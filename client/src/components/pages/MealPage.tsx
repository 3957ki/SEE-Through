import {
  addDislikedFood,
  addPreferredFood,
  removeDislikedFood,
  removePreferredFood,
} from "@/api/members";
import { useCurrentMember, useCurrentMemberMealsOf, useMutateRefreshMeal } from "@/queries/members";
import { useQueryClient } from "@tanstack/react-query";
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
  const visibleDates = Array.from({ length: 7 }, (_, i) => addDays(currentStartDate, i));

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
                isSelected ? "bg-primary text-primary-foreground" : "text-foreground"
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

function DateSelectorSection({
  selectedDate,
  setSelectedDate,
  handleGoToday,
}: {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  handleGoToday: () => void;
}) {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <BsCalendarEvent className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-lg font-medium">식단 캘린더</h2>
        </div>
        <button
          type="button"
          onClick={handleGoToday}
          className="text-sm text-primary border border-primary/30 rounded-full px-3 py-1 hover:bg-primary/10"
        >
          오늘
        </button>
      </div>

      <DateSelector selectedDate={selectedDate} onSelect={setSelectedDate} />
    </div>
  );
}

function MealItem({ name, memberId }: { name: string; memberId: string }) {
  const { data: currentMember } = useCurrentMember();
  const queryClient = useQueryClient();

  const isLiked = currentMember?.preferred_foods.includes(name) ?? false;
  const isDisliked = currentMember?.disliked_foods.includes(name) ?? false;

  const handleLike = async () => {
    try {
      if (isLiked) {
        await removePreferredFood(memberId, name);
      } else {
        if (isDisliked) await removeDislikedFood(memberId, name);
        await addPreferredFood(memberId, name);
      }

      // Invalidate the current member query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["members", "current"] });
    } catch (err) {
      console.error("선호 처리 실패", err);
    }
  };

  const handleDislike = async () => {
    try {
      if (isDisliked) {
        await removeDislikedFood(memberId, name);
      } else {
        if (isLiked) await removePreferredFood(memberId, name);
        await addDislikedFood(memberId, name);
      }

      // Invalidate the current member query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["members", "current"] });
    } catch (err) {
      console.error("비선호 처리 실패", err);
    }
  };

  return (
    <div
      className={`flex items-center justify-start gap-2 rounded-md transition ${
        isLiked
          ? "bg-primary/10 border-l-4 border-primary"
          : isDisliked
            ? "bg-muted border-l-4 border-muted-foreground"
            : ""
      }`}
    >
      <span className="text-sm font-medium">{name}</span>

      <BsHandThumbsUp
        className={`w-4 h-4 ${isLiked ? "text-primary" : "text-muted-foreground"} cursor-pointer`}
        onClick={handleLike}
        title="선호 토글"
      />

      <BsHandThumbsDown
        className={`w-4 h-4 ${isDisliked ? "text-foreground" : "text-muted-foreground"} cursor-pointer`}
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
  memberId,
}: {
  title: string;
  items: string[];
  reason?: string;
  mealId: string;
  onRefresh: (mealId: string) => void;
  isRefreshing: boolean;
  memberId: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 relative">
      {isRefreshing && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] rounded-xl flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <BsArrowClockwise className="text-4xl text-primary animate-spin mb-2" />
            <span className="text-sm font-medium text-muted-foreground">
              AI가 식단을 생성중입니다...
            </span>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h3 className="text-primary text-lg font-bold mb-3">{title}</h3>
        <button
          type="button"
          className="ml-4 p-2 rounded-full hover:bg-muted transition-colors"
          onClick={() => onRefresh(mealId)}
          disabled={isRefreshing}
          aria-label={`${title} 식단 새로고침`}
        >
          <BsArrowClockwise
            className={`text-2xl ${isRefreshing ? "animate-spin text-primary" : "text-muted-foreground hover:text-foreground"} cursor-pointer`}
          />
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <MealItem key={index} name={item} memberId={memberId} />
        ))}
      </div>
      {reason && (
        <div className="mt-3 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
          <span className="text-primary mr-1">💡</span> {reason}
        </div>
      )}
    </div>
  );
}

export default function MealPage() {
  const { data: currentMember } = useCurrentMember();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: meals, isLoading: isMealsLoading } = useCurrentMemberMealsOf(selectedDate);
  const refreshMutation = useMutateRefreshMeal(selectedDate);

  const handleGoToday = () => {
    setSelectedDate(new Date());
  };

  const handleRefreshMeal = (mealId: string) => {
    refreshMutation.mutate(mealId);
  };

  if (!currentMember) return null;

  return (
    <div>
      <DateSelectorSection
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        handleGoToday={handleGoToday}
      />

      {isMealsLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <BsArrowClockwise className="text-4xl text-primary animate-spin mb-2" />
          <span className="text-sm font-medium text-muted-foreground">
            식단을 불러오는 중입니다...
          </span>
        </div>
      ) : meals ? (
        <div className="space-y-4 p-4">
          <MealSection
            title="아침"
            items={meals.breakfast.menu}
            reason={meals.breakfast.reason}
            mealId={meals.breakfast.meal_id}
            onRefresh={handleRefreshMeal}
            isRefreshing={
              refreshMutation.isPending && refreshMutation.variables === meals.breakfast.meal_id
            }
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
            memberId={currentMember.member_id}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <p className="text-muted-foreground">식단 정보가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
