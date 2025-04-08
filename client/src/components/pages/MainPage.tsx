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
    <div className="grid grid-cols-5 gap-1">
      {ingredients.map((ingredient, index) => (
        <div
          key={ingredient.ingredient_id}
          ref={index === ingredients.length - 1 ? lastIngredientRef : undefined}
        >
          <div
            className="aspect-square bg-white rounded-md overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleIngredientClick(ingredient)}
          >
            <img
              src={ingredient.image_path ?? "/src/assets/no-ingredient.png"}
              alt={ingredient.name ?? "Ingredient image"}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      ))}
      {isFetchingNextPage && (
        <div className="col-span-5 flex flex-col items-center justify-center py-4">
          <BsArrowClockwise className="text-2xl text-primary animate-spin mb-1" />
          <span className="text-xs font-medium text-muted-foreground">로딩 중...</span>
        </div>
      )}
    </div>
  );
}

function IngredientsSection() {
  const { data: currentMember } = useCurrentMember();

  return (
    <div className="py-4">
      <h2 className="text-lg font-medium px-4 mb-3">재료 목록</h2>
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

  const hour = new Date().getHours();

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

  if (mealError || isError) {
    return (
      <div className="mt-2 px-4 flex gap-4">
        {/* "식단 생성하기" 버튼 */}
        <button
          type="button"
          onClick={() => createMeals()}
          className="w-full bg-primary text-primary-foreground rounded-lg py-2 px-4"
        >
          식단 생성하기
        </button>
      </div>
    );
  }

  if (!mealsToday || !mealsTomorrow) {
    console.log("Meals data is missing");
    return (
      <div className="mt-2 px-4">
        <div className="py-4 text-center text-gray-500">
          현재 식단 정보가 없습니다.
          <button
            type="button"
            onClick={() => createMeals()}
            className="mt-2 w-full bg-primary text-primary-foreground rounded-lg py-2 px-4"
          >
            식단 생성하기
          </button>
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

  if (!hasValidMealData) {
    console.log("Invalid meal data structure:", { mealsToday, mealsTomorrow });
    return (
      <div className="mt-2 px-4">
        <div className="py-4 text-center text-gray-500">
          식단 데이터 구조에 문제가 있습니다.
          <button
            type="button"
            onClick={() => createMeals()}
            className="mt-2 w-full bg-primary text-primary-foreground rounded-lg py-2 px-4"
          >
            식단 다시 생성하기
          </button>
        </div>
      </div>
    );
  }

  const selectedMeals = (() => {
    if (hour >= 0 && hour < 11) {
      return [
        { title: "아침", data: mealsToday.breakfast, color: "bg-primary" },
        { title: "점심", data: mealsToday.lunch, color: "bg-secondary" },
      ];
    } else if (hour >= 11 && hour < 16) {
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
      className={`relative w-full h-[180px] rounded-xl shadow-lg ${textColor} cursor-pointer overflow-hidden ${color} flex flex-col justify-between p-4`}
      onClick={onCardClick}
    >
      {/* 제목 + 버튼 */}
      <div className="flex justify-between items-start mb-2">
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
      <div className="flex-1 flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center">
            <BsArrowClockwise className={`text-3xl ${textColor} animate-spin mb-2`} />
            <span className={`text-sm font-medium ${textColor} text-center`}>
              AI가 식단을 생성중입니다...
            </span>
          </div>
        ) : (
          <div className="w-full h-full overflow-y-auto scrollbar-hide">
            <ul className="space-y-0.5">
              {data.menu.map((item, index) => (
                <li
                  key={index}
                  className={`flex items-center text-sm font-medium leading-tight ${textColor}`}
                >
                  <span className="truncate">• {item}</span>
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

  return (
    <div className="py-4">
      <div className="flex items-center gap-4 px-4">
        <Avatar
          className="h-12 w-12 cursor-pointer bg-muted rounded-full"
          onClick={() => showDialog(<MemberSwitcherDialog />)}
        >
          <AvatarImage src={currentMember?.image_path} alt="User avatar" />
          <AvatarFallback>
            <BsPersonCircle className="w-full h-full" />
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-2xl font-medium">좋은 아침입니다,</p>
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
