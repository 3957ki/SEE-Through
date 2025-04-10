import IngredientDialog from "@/components/dialog/IngredientDialog";
import { MemberSwitcherDialog } from "@/components/dialog/MemberSwitcherDialog";
import { useDialog } from "@/contexts/DialogContext";
import { usePage } from "@/contexts/PageContext";
import Ingredient from "@/interfaces/Ingredient";
import { useMemberMeals } from "@/queries/meals";
import { useCurrentMember, useCurrentMemberIngredients } from "@/queries/members";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BsArrowClockwise,
  BsCalendarEvent,
  BsMoonStars,
  BsPersonCircle,
  BsSun,
  BsSunrise,
} from "react-icons/bs";

// Custom hook to determine time of day and appropriate greeting
function useTimeOfDay() {
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "lunch" | "dinner">("morning");

  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();

      if (hour >= 0 && hour < 11) {
        setTimeOfDay("morning");
      } else if (hour >= 11 && hour < 16) {
        setTimeOfDay("lunch");
      } else {
        setTimeOfDay("dinner");
      }
    };

    // Update immediately
    updateTimeOfDay();

    // Set up interval to update every minute
    const intervalId = setInterval(updateTimeOfDay, 60000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return { timeOfDay };
}

function IngredientsContent() {
  const [error, setError] = useState<Error | null>(null);

  // Call the hook unconditionally at the top level
  const {
    ingredients,
    loadMoreIngredients,
    hasMore,
    isLoading,
    isFetchingNextPage,
    isError,
    error: hookError,
  } = useCurrentMemberIngredients();

  // Handle errors from the hook
  try {
    if (isError && hookError) {
      setError(hookError instanceof Error ? hookError : new Error(String(hookError)));
    }
  } catch (err) {
    console.error("Error in useCurrentMemberIngredients:", err);
    setError(err instanceof Error ? err : new Error(String(err)));
  }

  const { showDialog } = useDialog();
  const observer = useRef<IntersectionObserver | null>(null);
  const lastIngredientRef = useRef<HTMLDivElement | null>(null);

  // Use callback for stable identity
  const internalLoadMore = useCallback(() => {
    if (!isFetchingNextPage && hasMore) {
      loadMoreIngredients();
    }
  }, [isFetchingNextPage, hasMore, loadMoreIngredients]);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    if (isLoading) return;

    // Disconnect previous observer if it exists
    if (observer.current) {
      observer.current.disconnect();
    }

    // Create a new intersection observer
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isFetchingNextPage) {
          internalLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    // Start observing the last ingredient element
    if (lastIngredientRef.current) {
      observer.current.observe(lastIngredientRef.current);
    }

    // Clean up on unmount
    return () => {
      observer.current?.disconnect();
    };
  }, [isLoading, hasMore, isFetchingNextPage, internalLoadMore]);

  const handleIngredientClick = (ingredient: Ingredient) => {
    showDialog(<IngredientDialog ingredientId={ingredient.ingredient_id} />);
  };

  // Show error state
  if (error) {
    return (
      <div className="text-center py-4 text-red-500">재료를 불러오는 중 오류가 발생했습니다.</div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <BsArrowClockwise className="text-4xl text-primary animate-spin mb-2" />
        <span className="text-sm font-medium text-muted-foreground">재료를 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="px-2">
      <div className="grid grid-cols-4 gap-2">
        {ingredients.map((ingredient, index) => (
          <div
            key={ingredient.ingredient_id}
            ref={index === ingredients.length - 1 ? lastIngredientRef : undefined}
          >
            <div
              className="group relative aspect-square bg-gray-50 rounded-lg overflow-hidden cursor-pointer 
                border-2 border-gray-300 hover:border-black hover:shadow-md transition-all duration-200"
              onClick={() => handleIngredientClick(ingredient)}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-0 bg-gray-50 opacity-40"></div>
                <img
                  src={ingredient.image_path ?? "/src/assets/no-ingredient.png"}
                  alt={ingredient.name ?? "Ingredient image"}
                  className="w-full h-full object-cover relative z-10"
                />
                {/* 호버 시 효과 오버레이 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 z-20"></div>
              </div>
            </div>
          </div>
        ))}
        {isFetchingNextPage && (
          <div className="col-span-4 flex flex-col items-center justify-center py-3">
            <BsArrowClockwise className="text-2xl text-primary animate-spin mb-1" />
            <span className="text-xs font-medium text-muted-foreground">로딩 중...</span>
          </div>
        )}
      </div>
    </div>
  );
}

function IngredientsSection() {
  const { data: currentMember } = useCurrentMember();

  return (
    <div className="py-3">
      <h2 className="text-lg font-medium px-3 mb-2 flex items-center">
        <span className="w-1 h-5 bg-primary rounded mr-2"></span>
        재료 목록
      </h2>
      {currentMember ? (
        <IngredientsContent />
      ) : (
        <div className="text-center py-4">사용자 정보를 불러오는 중...</div>
      )}
    </div>
  );
}

function Meals() {
  const { data: currentMember } = useCurrentMember();
  const { navigateTo } = usePage();
  const { timeOfDay } = useTimeOfDay();

  const {
    mealsToday,
    mealsTomorrow,
    handleRefresh,
    refreshingMealId,
    mealError,
    createMeals,
    loading: isMealsLoading,
    isLoading,
    isError,
  } = useMemberMeals(currentMember?.member_id);

  // Only log once per state change to avoid console spam
  useEffect(() => {
    console.log("Meals component state:", {
      currentMemberId: currentMember?.member_id,
      mealsToday: mealsToday ? "data present" : "no data",
      mealsTomorrow: mealsTomorrow ? "data present" : "no data",
      isLoading,
      isMealsLoading,
      mealError,
      isError,
    });
  }, [
    currentMember?.member_id,
    mealsToday,
    mealsTomorrow,
    isLoading,
    isMealsLoading,
    mealError,
    isError,
  ]);

  if (isLoading || isMealsLoading) {
    return (
      <div className="mt-2 px-4">
        <div className="flex flex-col items-center justify-center py-8">
          <BsArrowClockwise className="text-4xl text-primary animate-spin mb-2" />
          <span className="text-sm font-medium text-muted-foreground">
            AI가 일주일 식단 생성중...
          </span>
        </div>
      </div>
    );
  }

  // Ensure meal data has the expected structure
  const hasValidMealData =
    mealsToday?.breakfast?.menu &&
    mealsToday?.lunch?.menu &&
    mealsToday?.dinner?.menu &&
    mealsTomorrow?.breakfast?.menu;

  // Error handling for all error cases
  if (mealError || isError || !mealsToday || !mealsTomorrow || !hasValidMealData) {
    // Determine the appropriate error message
    let errorMessage = null;

    if (!mealsToday || !mealsTomorrow) {
      errorMessage = "현재 식단 정보가 없습니다.";
    } else if (!hasValidMealData) {
      errorMessage = "식단 데이터 구조에 문제가 있습니다.";
    }

    // Log error details for debugging
    if (mealError || isError) {
      console.error("Meal error:", mealError || isError);
    } else if (!mealsToday || !mealsTomorrow) {
      console.log("Meals data is missing");
    } else if (!hasValidMealData) {
      console.log("Invalid meal data structure:", { mealsToday, mealsTomorrow });
    }

    return (
      <div className="mt-2 px-4">
        {errorMessage && <div className="py-4 text-center text-gray-500">{errorMessage}</div>}
        <button
          type="button"
          onClick={() => createMeals()}
          className="mt-2 w-full bg-primary text-primary-foreground rounded-lg py-2 px-4"
        >
          식단 생성하기
        </button>
      </div>
    );
  }

  const selectedMeals = (() => {
    if (timeOfDay === "morning") {
      return [
        { title: "아침", data: mealsToday.breakfast, color: "bg-primary" },
        { title: "점심", data: mealsToday.lunch, color: "bg-secondary" },
      ];
    } else if (timeOfDay === "lunch") {
      return [
        { title: "점심", data: mealsToday.lunch, color: "bg-secondary" },
        { title: "저녁", data: mealsToday.dinner, color: "bg-primary" },
      ];
    } else {
      return [
        { title: "저녁", data: mealsToday.dinner, color: "bg-secondary" },
        { title: "아침", data: mealsTomorrow.breakfast, color: "bg-primary" },
      ];
    }
  })();

  return (
    <div className="mt-2 px-4 flex gap-4">
      {selectedMeals.map(({ title, data, color }) => (
        <MealCard
          key={data.meal_id}
          title={title}
          data={data}
          color={color}
          refreshingMealId={refreshingMealId}
          isMealsLoading={isMealsLoading}
          onRefresh={handleRefresh}
          onCardClick={() => navigateTo("meal")}
        />
      ))}
    </div>
  );
}

// MealCard Component
interface MealCardProps {
  title: string;
  data: {
    meal_id: string;
    menu: string[];
  };
  color: string;
  refreshingMealId: string | null;
  isMealsLoading: boolean;
  onRefresh: (mealId: string) => void;
  onCardClick: () => void;
}

function MealCard({
  title,
  data,
  color,
  refreshingMealId,
  isMealsLoading,
  onRefresh,
  onCardClick,
}: MealCardProps) {
  const isRefreshing = refreshingMealId === data.meal_id;
  const isLoading = isRefreshing || isMealsLoading;

  // Determine text color based on background color
  const textColor = color === "bg-primary" ? "text-white" : "text-black";

  // Get the appropriate icon based on the meal title
  const getMealIcon = () => {
    switch (title) {
      case "아침":
        return <BsSunrise className={`${textColor} mr-2`} />;
      case "점심":
        return <BsSun className={`${textColor} mr-2`} />;
      case "저녁":
        return <BsMoonStars className={`${textColor} mr-2`} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`relative w-full rounded-xl shadow-lg ${textColor} cursor-pointer overflow-hidden ${color} flex flex-col justify-between p-4`}
      onClick={onCardClick}
    >
      {/* 제목 + 버튼 */}
      <div className="flex justify-between items-start mb-4">
        <h3 className={`text-base font-semibold flex items-center ${textColor}`}>
          {getMealIcon()}
          {title}
        </h3>
        {!isLoading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRefresh(data.meal_id);
            }}
            className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="새로고침"
          >
            <BsArrowClockwise className={`w-3.5 h-3.5 ${textColor}`} />
          </button>
        )}
      </div>

      {/* 메뉴 목록 또는 로딩 스피너 */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center py-8">
            <BsArrowClockwise className={`text-3xl ${textColor} animate-spin mb-2`} />
            <span className={`text-sm font-medium ${textColor} text-center`}>
              AI가 식단을 생성중입니다...
            </span>
          </div>
        ) : (
          <div className="w-full h-full overflow-y-auto scrollbar-hide">
            <ul className="space-y-0.5 list-disc pl-4">
              {data.menu.map((item) => (
                <li
                  key={`${data.meal_id}-${item}`}
                  className={`text-sm font-medium leading-tight ${textColor}`}
                >
                  <span className="truncate block">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 바닥 장식 */}
      <div className="absolute bottom-0 right-0 w-16 h-16 rounded-full bg-white/10 -mr-8 -mb-8"></div>
    </div>
  );
}

// Header Greeting Section
function GreetingSection({ name }: { name?: string }) {
  const { showDialog } = useDialog();
  const { data: currentMember } = useCurrentMember();
  const { timeOfDay } = useTimeOfDay();

  // Get appropriate greeting based on time of day
  const getGreeting = () => {
    switch (timeOfDay) {
      case "morning":
        return "좋은 아침입니다";
      case "lunch":
        return "좋은 오후입니다";
      case "dinner":
        return "좋은 저녁입니다";
      default:
        return "안녕하세요";
    }
  };

  return (
    <div className="py-4">
      <div className="flex items-center gap-4 px-4">
        <Avatar
          className="h-16 w-16 cursor-pointer bg-muted rounded-full overflow-hidden"
          onClick={() => showDialog(<MemberSwitcherDialog />)}
        >
          <AvatarImage
            src={currentMember?.image_path}
            alt="User avatar"
            className="rounded-full object-cover w-full h-full"
          />
          <AvatarFallback>
            <BsPersonCircle className="w-full h-full" />
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-2xl font-medium">{getGreeting()},</p>
          <p className="text-2xl font-medium">{name}님!</p>
        </div>
      </div>
    </div>
  );
}

// Today's Diet Recommendation Section
function TodaysDietSection() {
  return (
    <div className="py-4">
      <div className="flex items-center gap-1 px-4 mb-3">
        <BsCalendarEvent className="w-4 h-4 text-gray-600" />
        <h2 className="text-lg font-medium">오늘의 추천 식단</h2>
      </div>
      <Meals />
    </div>
  );
}

function MainPage() {
  const { data: currentMember } = useCurrentMember();

  return (
    <div className="pb-16 relative">
      <GreetingSection name={currentMember?.name} />
      <TodaysDietSection />
      <IngredientsSection />
    </div>
  );
}

export default MainPage;
