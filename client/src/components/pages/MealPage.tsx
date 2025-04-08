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
import { useEffect, useRef, useState } from "react";
import { BsArrowClockwise, BsHandThumbsDown, BsHandThumbsUp } from "react-icons/bs";

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
}: {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}) {
  return (
    <div className="p-4">
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

  // State for managing loading visibility
  const [showLoading, setShowLoading] = useState(false);
  const loadStartTime = useRef<number>(0);
  const minLoadingTime = 300; // Shorter minimum display time (300ms)

  // Keep track of the last successfully loaded meal data
  const [lastMeals, setLastMeals] = useState(meals);

  // Update lastMeals whenever we get new meal data
  useEffect(() => {
    if (meals) {
      setLastMeals(meals);
    }
  }, [meals]);

  // Effect to handle loading state with smart timing
  useEffect(() => {
    if (isMealsLoading) {
      // Record when loading started
      loadStartTime.current = Date.now();
      setShowLoading(true);
    } else if (showLoading) {
      // Calculate how long the loading has been visible
      const loadingDuration = Date.now() - loadStartTime.current;

      // If loading was visible for less than our minimum time, add a small delay
      // This prevents quick flashes but doesn't add unnecessary delay for longer operations
      if (loadingDuration < minLoadingTime) {
        const remainingTime = minLoadingTime - loadingDuration;
        setTimeout(() => setShowLoading(false), remainingTime);
      } else {
        // If it was already visible long enough, hide immediately
        setShowLoading(false);
      }
    }
  }, [isMealsLoading, showLoading]);

  const handleRefreshMeal = (mealId: string) => {
    refreshMutation.mutate(mealId);
  };

  if (!currentMember) return null;

  // Determine which meal data to display - current or last loaded
  const displayMeals = meals || lastMeals;
  const showNoDataMessage = !displayMeals && !isMealsLoading && !showLoading;

  return (
    <div>
      <DateSelectorSection selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

      <div className="relative">
        {/* Loading spinner with fast fade-in, slightly slower fade-out */}
        <div
          className={`flex flex-col items-center justify-center py-8 absolute w-full
            transition-opacity duration-150 ease-in-out
            ${showLoading ? "opacity-100 z-10" : "opacity-0 z-0"}
          `}
        >
          <BsArrowClockwise className="text-4xl text-primary animate-spin mb-2" />
          <span className="text-sm font-medium text-muted-foreground">
            식단을 불러오는 중입니다...
          </span>
        </div>

        {/* Content with conditional opacity based on loading state */}
        <div
          className={`transition-opacity duration-200 
            ${showLoading ? "opacity-0" : "opacity-100"}
          `}
        >
          {displayMeals ? (
            <div className="space-y-4 p-4">
              <MealSection
                title="아침"
                items={displayMeals.breakfast.menu}
                reason={displayMeals.breakfast.reason}
                mealId={displayMeals.breakfast.meal_id}
                onRefresh={handleRefreshMeal}
                isRefreshing={
                  refreshMutation.isPending &&
                  refreshMutation.variables === displayMeals.breakfast.meal_id
                }
                memberId={currentMember.member_id}
              />
              <MealSection
                title="점심"
                items={displayMeals.lunch.menu}
                reason={displayMeals.lunch.reason}
                mealId={displayMeals.lunch.meal_id}
                onRefresh={handleRefreshMeal}
                isRefreshing={
                  refreshMutation.isPending &&
                  refreshMutation.variables === displayMeals.lunch.meal_id
                }
                memberId={currentMember.member_id}
              />
              <MealSection
                title="저녁"
                items={displayMeals.dinner.menu}
                reason={displayMeals.dinner.reason}
                mealId={displayMeals.dinner.meal_id}
                onRefresh={handleRefreshMeal}
                isRefreshing={
                  refreshMutation.isPending &&
                  refreshMutation.variables === displayMeals.dinner.meal_id
                }
                memberId={currentMember.member_id}
              />
            </div>
          ) : (
            showNoDataMessage && (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <p className="text-muted-foreground">식단 정보가 없습니다.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
