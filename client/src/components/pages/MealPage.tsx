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
import { useEffect, useState } from "react";
import {
  BsArrowClockwise,
  BsHandThumbsDown,
  BsHandThumbsUp,
  BsMoonStars,
  BsSun,
  BsSunrise,
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
    <div className="flex items-center justify-between w-full max-w-3xl mx-auto px-2 py-1 font-small:py-0.5 font-large:py-2">
      <button
        type="button"
        onClick={handlePrev}
        className="p-1.5 font-small:p-1 font-large:p-2 hover:bg-muted rounded-full transition-colors shrink-0"
        disabled={offset === 0}
      >
        <ChevronLeft
          className={`w-5 h-5 font-small:w-4 font-small:h-4 font-large:w-6 font-large:h-6 ${offset === 0 ? "text-gray-300" : "text-gray-500"}`}
        />
      </button>
      <div className="flex-1 grid grid-cols-7 gap-1">
        {visibleDates.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          const dayOfWeek = format(date, "EEE", { locale: ko });
          const day = format(date, "d");
          return (
            <div
              key={date.toDateString()}
              className={`flex flex-col items-center px-1 py-1.5 font-small:py-1 font-large:py-2 rounded-lg cursor-pointer transition-all hover:bg-primary/10 ${
                isSelected ? "bg-primary text-primary-foreground" : "text-foreground"
              }`}
              onClick={() => onSelect(date)}
            >
              <span className="text-xs font-small:text-[10px] font-large:text-sm font-medium">
                {dayOfWeek}
              </span>
              <span className="text-base font-small:text-sm font-large:text-lg font-semibold mt-0.5">
                {day}
              </span>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={handleNext}
        className="p-1.5 font-small:p-1 font-large:p-2 hover:bg-muted rounded-full transition-colors shrink-0"
        disabled
      >
        <ChevronRight className="w-5 h-5 font-small:w-4 font-small:h-4 font-large:w-6 font-large:h-6 text-gray-300" />
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
    <div className="w-full overflow-x-hidden">
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
      className={`flex items-center justify-between px-3 py-2 font-small:py-1.5 font-large:py-2.5 font-small:px-2 font-large:px-4 rounded-md transition-all duration-300 ease-out group ${
        isLiked
          ? "bg-emerald-50/80 hover:bg-emerald-100/90 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/20 hover:translate-x-0.5"
          : isDisliked
            ? "bg-destructive/5 hover:bg-destructive/10 hover:translate-x-0.5"
            : "hover:bg-muted/10 hover:translate-x-0.5"
      }`}
    >
      <span
        className={`text-sm font-medium transition-colors duration-300 ${
          isLiked
            ? "text-emerald-600 dark:text-emerald-400"
            : isDisliked
              ? "text-destructive"
              : "group-hover:text-foreground/80"
        }`}
      >
        {name}
      </span>

      <div className="flex items-center gap-3 opacity-70 group-hover:opacity-100 transition-all duration-300">
        <BsHandThumbsUp
          className={`w-4 h-4 transition-all duration-300 hover:scale-110 ${
            isLiked
              ? "text-emerald-600 fill-emerald-600 dark:text-emerald-400 dark:fill-emerald-400"
              : "text-muted-foreground/50 hover:text-emerald-500/90"
          } cursor-pointer`}
          onClick={handleLike}
          title="선호 토글"
        />

        <BsHandThumbsDown
          className={`w-4 h-4 transition-all duration-300 hover:scale-110 ${
            isDisliked
              ? "text-destructive fill-destructive"
              : "text-muted-foreground/50 hover:text-destructive/90"
          } cursor-pointer`}
          onClick={handleDislike}
          title="비선호 토글"
        />
      </div>
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
  // Get the appropriate icon based on the meal title
  const getMealIcon = () => {
    switch (title) {
      case "아침":
        return <BsSunrise className="text-orange-500 mr-2" />;
      case "점심":
        return <BsSun className="text-amber-500 mr-2" />;
      case "저녁":
        return <BsMoonStars className="text-indigo-500 mr-2" />;
      default:
        return null;
    }
  };

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
        <h3 className="text-primary text-lg font-bold mb-3 flex items-center">
          {getMealIcon()}
          {title}
        </h3>
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
      <div className="space-y-1">
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

  // Simple state for initial loading
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Keep track of the last successfully loaded meal data
  const [lastMeals, setLastMeals] = useState(meals);

  // Update lastMeals whenever we get new meal data
  useEffect(() => {
    if (meals) {
      setLastMeals(meals);
    }
  }, [meals]);

  // Handle initial loading state
  useEffect(() => {
    if (!isMealsLoading && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isMealsLoading, isInitialLoad]);

  const handleRefreshMeal = (mealId: string) => {
    refreshMutation.mutate(mealId);
  };

  if (!currentMember) return null;

  // Determine which meal data to display - current or last loaded
  const displayMeals = meals || lastMeals;
  const showNoDataMessage = !displayMeals && !isMealsLoading && !isInitialLoad;

  return (
    <div>
      <DateSelectorSection selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

      <div className="relative">
        {/* Loading spinner with fade transition */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center py-8 transition-opacity duration-300 ease-in-out
            ${isMealsLoading && isInitialLoad ? "opacity-100" : "opacity-0 pointer-events-none"}
          `}
        >
          <BsArrowClockwise className="text-4xl text-primary animate-spin mb-2" />
          <span className="text-sm font-medium text-muted-foreground">
            식단을 불러오는 중입니다...
          </span>
        </div>

        {/* Content */}
        <div className="space-y-4 p-4">
          {displayMeals ? (
            <>
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
            </>
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
