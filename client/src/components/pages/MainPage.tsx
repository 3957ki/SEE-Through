import { getMealsByDate, refreshMeal } from "@/api/meals";
import { Section, SectionContent, SectionDivider, SectionTitle } from "@/components/ui/section";
import { useCurrentMember } from "@/contexts/CurrentMemberContext";
import { useIngredientsContext } from "@/contexts/IngredientsContext";
import Ingredient from "@/interfaces/Ingredient";
import type { MealPlanResponse } from "@/interfaces/Meal";
import { useEffect, useState } from "react";
import { BsArrowClockwise, BsCalendarEvent } from "react-icons/bs";

function IngredientBlock({ ingredient }: { ingredient: Ingredient }) {
  return (
    <div className="aspect-square bg-white rounded-md overflow-hidden border">
      <img
        src={ingredient.image_path ?? "/placeholder.svg"}
        alt={ingredient.name ?? "Ingredient image"}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function IngredientsSection({ ingredients }: { ingredients: Ingredient[] }) {
  const MAX_COUNT = 10;

  return (
    <Section>
      <SectionTitle>재료 목록</SectionTitle>
      <SectionContent>
        <div className="grid grid-cols-5 gap-1">
          {ingredients.slice(0, MAX_COUNT).map((ingredient) => (
            <IngredientBlock key={ingredient.ingredient_id} ingredient={ingredient} />
          ))}
        </div>
      </SectionContent>
    </Section>
  );
}

function Meals({ onShowMealPage }: { onShowMealPage?: () => void }) {
  const { currentMember } = useCurrentMember();
  const [mealsToday, setMealsToday] = useState<MealPlanResponse | null>(null);
  const [mealsTomorrow, setMealsTomorrow] = useState<MealPlanResponse | null>(null);
  const [refreshingMealId, setRefreshingMealId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeals = async () => {
      if (!currentMember) return;

      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      const [todayMeals, tomorrowMeals] = await Promise.all([
        getMealsByDate(currentMember.member_id, today),
        getMealsByDate(currentMember.member_id, tomorrow),
      ]);

      setMealsToday(todayMeals);
      setMealsTomorrow(tomorrowMeals);
    };

    fetchMeals();
  }, [currentMember]);

  const handleRefresh = async (mealId: string) => {
    if (!currentMember || refreshingMealId) return;

    setRefreshingMealId(mealId);
    try {
      const updated = await refreshMeal(mealId);

      // 업데이트 대상이 오늘 식단인지 내일 식단인지 판단
      const setMealsFn =
        [mealsToday, mealsTomorrow].find(
          (meals) =>
            meals?.breakfast.meal_id === mealId ||
            meals?.lunch.meal_id === mealId ||
            meals?.dinner.meal_id === mealId
        ) === mealsToday
          ? setMealsToday
          : setMealsTomorrow;

      setMealsFn((prev) => {
        if (!prev) return prev;
        const updatedMeals = { ...prev };
        if (updated.serving_time === "아침") updatedMeals.breakfast = updated;
        else if (updated.serving_time === "점심") updatedMeals.lunch = updated;
        else if (updated.serving_time === "저녁") updatedMeals.dinner = updated;
        return updatedMeals;
      });
    } catch (err) {
      console.error("식단 새로고침 실패", err);
    } finally {
      setRefreshingMealId(null);
    }
  };

  if (!mealsToday || !mealsTomorrow) return null;

  const hour = new Date().getHours();

  // 조건에 따라 어떤 식단 보여줄지 결정
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
          className={`relative w-full rounded-2xl shadow-md min-h-[160px] text-white cursor-pointer overflow-hidden ${color} flex flex-col justify-center p-4`}
          onClick={() => onShowMealPage?.()}
        >
          {/* AI 생성 중 오버레이 */}
          {refreshingMealId === data.meal_id && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="w-36 h-36 bg-white/95 rounded-xl shadow flex flex-col items-center justify-center">
                <div className="text-4xl mb-2">🤖</div>
                <p className="text-sm font-semibold text-gray-800">식단 새로고침 중</p>
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
              {refreshingMealId === data.meal_id ? (
                <div className="flex items-center gap-1 text-white/80 animate-pulse">
                  <BsArrowClockwise className="w-4 h-4 animate-spin" />
                  <span className="text-xs">AI 생성 중...</span>
                </div>
              ) : (
                <BsArrowClockwise className="w-5 h-5 text-white" />
              )}
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
  const { currentMember } = useCurrentMember();
  const { ingredients } = useIngredientsContext();

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
      <IngredientsSection ingredients={ingredients} />
    </div>
  );
}

export default MainPage;
