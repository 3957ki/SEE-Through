import { getMealsByDate, refreshMeal } from "@/api/meals";
import { Section, SectionContent, SectionDivider, SectionTitle } from "@/components/ui/section";
import { useCurrentMember } from "@/contexts/CurrentMemberContext";
import { useMaterialContext } from "@/contexts/MaterialContext";
import Material from "@/interfaces/Material";
import type { MealPlanResponse } from "@/interfaces/Meal";
import { useEffect, useState } from "react";
import {
  BsArrowClockwise,
  BsCalendarEvent,
  BsHandThumbsDown,
  BsHandThumbsUp,
} from "react-icons/bs";

// Material Grid Section Components
function MaterialBlock({ material }: { material: Material }) {
  return (
    <div className="aspect-square bg-white rounded-md overflow-hidden border">
      <img
        src={material.image_path ?? "/placeholder.svg"}
        alt={material.name ?? "Material image"}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function MaterialsSection({ materials }: { materials: Material[] }) {
  const MAX_MATERIALS = 10;

  return (
    <Section>
      <SectionTitle>재료 목록</SectionTitle>
      <SectionContent>
        <div className="grid grid-cols-5 gap-1">
          {materials.slice(0, MAX_MATERIALS).map((material) => (
            <MaterialBlock key={material.ingredient_id} material={material} />
          ))}
        </div>
      </SectionContent>
    </Section>
  );
}

function MealCard({
  title,
  color,
  items,
  onRefresh,
  isRefreshing,
}: {
  title: string;
  color: string;
  items: string[];
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  return (
    <div className={`${color} rounded-xl p-4 w-64 min-w-64 text-white relative`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-lg">{title}</h3>
        <button onClick={onRefresh} disabled={isRefreshing}>
          <BsArrowClockwise
            className={`w-5 h-5 ${isRefreshing ? "animate-spin text-white/70" : "text-white"}`}
          />
        </button>
      </div>
      {items.map((item, index) => (
        <p key={index} className="text-sm">
          {item}
        </p>
      ))}
    </div>
  );
}

function FeedbackButtons() {
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);

  return (
    <div className="px-4 py-4 text-center">
      <p className="text-sm mb-2">이 식단은 도움이 되나요?</p>
      <div className="flex justify-center gap-6">
        <button
          className={`p-2 transition-all ${feedback === "like" ? "bg-orange-100 rounded-full scale-110" : ""}`}
          onClick={() => setFeedback("like")}
        >
          <BsHandThumbsUp
            className={`w-6 h-6 ${feedback === "like" ? "text-orange-500" : "text-gray-700"}`}
          />
        </button>
        <button
          className={`p-2 transition-all ${feedback === "dislike" ? "bg-orange-100 rounded-full scale-110" : ""}`}
          onClick={() => setFeedback("dislike")}
        >
          <BsHandThumbsDown
            className={`w-6 h-6 ${feedback === "dislike" ? "text-orange-500" : "text-gray-700"}`}
          />
        </button>
      </div>
    </div>
  );
}

function Meals() {
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
        <div key={data.meal_id} className={`rounded-xl p-4 w-full text-white relative ${color}`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-lg">{title}</h3>
            <button
              onClick={() => handleRefresh(data.meal_id)}
              disabled={refreshingMealId === data.meal_id}
            >
              <BsArrowClockwise
                className={`w-5 h-5 ${refreshingMealId === data.meal_id ? "animate-spin text-white/70" : "text-white"}`}
              />
            </button>
          </div>
          {data.menu.map((item, index) => (
            <p key={index} className="text-sm">
              {item}
            </p>
          ))}
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
function TodaysDietSection() {
  return (
    <Section>
      <SectionTitle icon={<BsCalendarEvent className="w-4 h-4" />}>오늘의 추천 식단</SectionTitle>
      <Meals />
    </Section>
  );
}

function MainPage() {
  const { currentMember } = useCurrentMember();
  const { mainMaterials, fetchMainMaterials } = useMaterialContext();

  useEffect(() => {
    if (currentMember) {
      console.log(currentMember);
    }
  }, [currentMember, fetchMainMaterials]);

  return (
    <div className="pb-16 relative">
      <GreetingSection name={currentMember?.name} />
      <TodaysDietSection />
      <SectionDivider />
      <MaterialsSection materials={mainMaterials} />
    </div>
  );
}

export default MainPage;
