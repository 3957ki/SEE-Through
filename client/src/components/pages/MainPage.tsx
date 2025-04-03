import { getMealsByDate, getTodayMeals, refreshMeal } from "@/api/meals";
import IngredientDialog from "@/components/dialog/IngredientDialog";
import { Section, SectionContent, SectionDivider, SectionTitle } from "@/components/ui/section";
import { useDialog } from "@/contexts/DialogContext";
import Ingredient from "@/interfaces/Ingredient";
import type { MealPlanResponse } from "@/interfaces/Meal";
import { useCurrentMember, useCurrentMemberIngredients } from "@/queries/members";
import { useCallback, useEffect, useRef, useState } from "react";
import { BsArrowClockwise, BsCalendarEvent } from "react-icons/bs";

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
    <Section>
      <SectionTitle>재료 목록</SectionTitle>
      <SectionContent>
        {currentMember ? (
          <IngredientsContent />
        ) : (
          <div className="text-center py-4">사용자 정보를 불러오는 중...</div>
        )}
      </SectionContent>
    </Section>
  );
}

function useMeals(currentMember: any) {
  const [mealsToday, setMealsToday] = useState<MealPlanResponse | null>(null);
  const [mealsTomorrow, setMealsTomorrow] = useState<MealPlanResponse | null>(null);
  const [refreshingMealId, setRefreshingMealId] = useState<string | null>(null);
  const [mealError, setMealError] = useState(false); // 404 오류 상태 추가
  const [loading, setLoading] = useState(false); // 로딩 상태 추가

  useEffect(() => {
    const fetchMeals = async () => {
      if (!currentMember) return;

      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      try {
        const [todayMeals, tomorrowMeals] = await Promise.all([
          getMealsByDate(currentMember.member_id, today),
          getMealsByDate(currentMember.member_id, tomorrow),
        ]);

        setMealsToday(todayMeals);
        setMealsTomorrow(tomorrowMeals);
        setMealError(false); // 정상적으로 데이터가 오면 오류 상태 초기화
      } catch (err: any) {
        if (err.response?.status === 404) {
          setMealError(true); // 404 오류가 발생하면 오류 상태 설정
        } else {
          console.error("식단 요청 실패", err);
        }
      }
    };

    fetchMeals();
  }, [currentMember]);

  const handleRefresh = async (mealId: string) => {
    if (!currentMember || refreshingMealId) return;

    setRefreshingMealId(mealId);
    try {
      const updated = await refreshMeal(mealId);
      const targetMeals = [mealsToday, mealsTomorrow].find(
        (meals) =>
          meals?.breakfast.meal_id === mealId ||
          meals?.lunch.meal_id === mealId ||
          meals?.dinner.meal_id === mealId
      );

      const setMealsFn = targetMeals === mealsToday ? setMealsToday : setMealsTomorrow;

      setMealsFn((prev) => {
        if (!prev) return prev;
        const updatedMeals = { ...prev };
        if (updated.serving_time === "아침") updatedMeals.breakfast = updated;
        else if (updated.serving_time === "점심") updatedMeals.lunch = updated;
        else if (updated.serving_time === "저녁") updatedMeals.dinner = updated;
        return updatedMeals;
      });
    } catch (err: any) {
      console.error("식단 새로고침 실패", err);
    } finally {
      setRefreshingMealId(null);
    }
  };

  const createMeals = async () => {
    console.log("식단 생성 시작...");
    setLoading(true); // 식단 생성 시작 시 로딩 상태 활성화
    try {
      const createdMeals = await getTodayMeals(currentMember.member_id); // 식단 생성 요청
      console.log("식단 생성 완료:", createdMeals);
      setMealsToday(createdMeals); // 오늘 식단 상태 업데이트
      setMealError(false); // 식단 생성 성공시 오류 상태 초기화

      // 식단 생성 후 getMealsByDate로 다시 요청하여 최신 식단 정보를 가져옴
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      const [todayMeals, tomorrowMeals] = await Promise.all([
        getMealsByDate(currentMember.member_id, today),
        getMealsByDate(currentMember.member_id, tomorrow),
      ]);

      setMealsToday(todayMeals);
      setMealsTomorrow(tomorrowMeals);
    } catch (err: any) {
      console.error("식단 생성 실패", err);
    } finally {
      setLoading(false); // 식단 생성 완료 후 로딩 상태 비활성화
      console.log("로딩 상태 비활성화");
    }
  };

  return {
    mealsToday,
    mealsTomorrow,
    handleRefresh,
    refreshingMealId,
    mealError,
    createMeals,
    loading,
  };
}

function Meals({ onShowMealPage }: { onShowMealPage?: () => void }) {
  const { data: currentMember } = useCurrentMember();

  const {
    mealsToday,
    mealsTomorrow,
    handleRefresh,
    refreshingMealId,
    mealError,
    createMeals,
    loading,
  } = useMeals(currentMember);
  const hour = new Date().getHours();

  useEffect(() => {
    console.log("Meals 컴포넌트 렌더링, 로딩 상태:", loading);
  }, [loading]);

  if (mealError) {
    return (
      <div className="mt-2 px-4 flex gap-4">
        {/* "식단 생성하기" 버튼 */}
        {!loading ? (
          <button
            onClick={createMeals}
            className="w-full bg-orange-500 text-white rounded-lg py-2 px-4"
          >
            식단 생성하기
          </button>
        ) : (
          <div className="w-full flex justify-center items-center">
            {/* Tailwind로 로딩 스피너 및 메시지 표시 */}
            <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-white bg-opacity-90 rounded-lg shadow-lg">
              <div className="w-10 h-10 border-t-4 border-solid border-green-500 rounded-full animate-spin"></div>
              <p className="text-base font-medium text-gray-800">AI가 일주일 식단 생성중</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!mealsToday || !mealsTomorrow) return null;

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
          onClick={() => onShowMealPage?.()}
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
          {loading && (
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
  return (
    <Section className="py-4">
      <SectionContent>
        <p className="text-2xl font-medium">좋은 아침입니다,</p>
        <p className="text-2xl font-medium">{name}님!</p>
      </SectionContent>
    </Section>
  );
}

// Today's Diet Recommendation Section
function TodaysDietSection({ onShowMealPage }: { onShowMealPage?: () => void }) {
  return (
    <Section>
      <SectionTitle icon={<BsCalendarEvent className="w-4 h-4" />}>오늘의 추천 식단</SectionTitle>
      <Meals onShowMealPage={onShowMealPage} />
    </Section>
  );
}

function MainPage({ onShowMealPage }: { onShowMealPage?: () => void }) {
  const { data: currentMember } = useCurrentMember();

  useEffect(() => {
    if (currentMember) {
      console.log(currentMember);
    }
  }, [currentMember]);

  return (
    <div className="pb-16 relative">
      <GreetingSection name={currentMember?.name} />
      <TodaysDietSection onShowMealPage={onShowMealPage} />
      <SectionDivider />
      <IngredientsSection />
    </div>
  );
}

export default MainPage;
