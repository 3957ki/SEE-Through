import IngredientDialog from "@/components/dialog/IngredientDialog";
import { MemberSwitcherDialog } from "@/components/dialog/MemberSwitcherDialog";
import { useDialog } from "@/contexts/DialogContext";
import { usePage } from "@/contexts/PageContext";
import Ingredient from "@/interfaces/Ingredient";
import { useMemberMeals } from "@/queries/meals";
import { useCurrentMember, useCurrentMemberIngredients } from "@/queries/members";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useCallback, useEffect, useRef, useState } from "react";
import { BsArrowClockwise, BsCalendarEvent, BsPersonCircle } from "react-icons/bs";

function IngredientsContent() {
  const [error, setError] = useState<Error | null>(null);

  // Use try-catch pattern for the hook
  let ingredients: Ingredient[] = [];
  let loadMoreIngredients = () => {};
  let hasMore = false;
  let isLoading = false;
  let isFetchingNextPage = false;

  try {
    const result = useCurrentMemberIngredients();
    ingredients = result.ingredients;
    loadMoreIngredients = result.loadMoreIngredients;
    hasMore = result.hasMore;
    isLoading = result.isLoading;
    isFetchingNextPage = result.isFetchingNextPage;

    // Handle error from the hook
    if (result.isError && result.error) {
      setError(result.error instanceof Error ? result.error : new Error(String(result.error)));
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
    return <div className="text-center py-4">재료를 불러오는 중...</div>;
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
      {isFetchingNextPage && <div className="text-center py-4">로딩 중...</div>}
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
          <div className="w-12 h-12 border-t-4 border-solid border-orange-500 rounded-full animate-spin mb-3"></div>
          <p className="text-base font-medium text-gray-700">AI가 일주일 식단 생성중</p>
          <p className="text-sm text-gray-500 mt-1">잠시만 기다려주세요...</p>
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
          className="w-full bg-orange-500 text-white rounded-lg py-2 px-4"
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
            className="mt-2 w-full bg-orange-500 text-white rounded-lg py-2 px-4"
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
            className="mt-2 w-full bg-orange-500 text-white rounded-lg py-2 px-4"
          >
            식단 다시 생성하기
          </button>
        </div>
      </div>
    );
  }

  const selectedMeals = (() => {
    if (hour >= 5 && hour < 11) {
      return [
        { title: "아침", data: mealsToday.breakfast, color: "bg-orange-400" },
        { title: "점심", data: mealsToday.lunch, color: "bg-gray-700" },
      ];
    } else if (hour >= 11 && hour < 16) {
      return [
        { title: "점심", data: mealsToday.lunch, color: "bg-gray-700" },
        { title: "저녁", data: mealsToday.dinner, color: "bg-orange-400" },
      ];
    } else {
      return [
        { title: "저녁", data: mealsToday.dinner, color: "bg-gray-700" },
        { title: "아침", data: mealsTomorrow.breakfast, color: "bg-orange-400" },
      ];
    }
  })();

  return (
    <div className="mt-2 px-4 flex gap-4">
      {selectedMeals.map(({ title, data, color }) => (
        <div
          key={data.meal_id}
          className={`relative w-full h-[160px] rounded-2xl shadow-md text-white cursor-pointer overflow-hidden ${color} flex flex-col justify-center p-4`}
          onClick={() => navigateTo("meal")}
        >
          {/* 새로고침 로딩 스피너 */}
          {refreshingMealId === data.meal_id && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="flex flex-col items-center justify-center space-y-2 p-4 bg-white bg-opacity-90 rounded-lg shadow-lg">
                <div className="w-12 h-12 border-t-4 border-solid border-green-500 rounded-full animate-spin"></div>
                <p className="text-base font-medium text-gray-800 text-center">AI 생성중</p>
              </div>
            </div>
          )}

          {/* 전체 로딩 스피너 */}
          {isMealsLoading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20">
              <div
                className="flex flex-col items-center justify-center space-y-4 p-6 bg-white bg-opacity-90 rounded-lg shadow-lg"
                role="alert"
                aria-live="assertive"
              >
                <div className="w-16 h-16 border-t-4 border-solid border-green-500 rounded-full animate-spin"></div>
                <p className="text-base font-medium text-gray-800 mt-4">AI 생성중</p>
              </div>
            </div>
          )}

          {/* 제목 + 버튼 */}
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-base font-semibold">{title}</h3>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRefresh(data.meal_id);
              }}
              disabled={refreshingMealId === data.meal_id}
              className="flex items-center gap-1"
            >
              <BsArrowClockwise className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* 메뉴 목록 */}
          <ul className="space-y-1 text-sm">
            {data.menu.map((item, index) => (
              <li key={index} className="truncate">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
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
          className="h-12 w-12 cursor-pointer bg-gray-100 rounded-full"
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

  // useEffect(() => {
  //   if (currentMember) {
  //     console.log(currentMember);
  //   }
  // }, [currentMember]);

  return (
    <div className="pb-16 relative">
      <GreetingSection name={currentMember?.name} />
      <TodaysDietSection />
      <div className="h-2 bg-gray-50 my-3 w-full" />
      <IngredientsSection />
    </div>
  );
}

export default MainPage;
