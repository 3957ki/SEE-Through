import { useCurrentMemberMealsOf, useMutateRefreshMeal } from "@/queries/members";
import { format } from "date-fns";
import { BsArrowClockwise } from "react-icons/bs";

function MealItem({
  title,
  meal,
  onRefresh,
  isRefreshing,
}: {
  title: string;
  meal?: any;
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  if (!meal) return null;

  return (
    <div className="py-4 border-b">
      <div className="flex justify-between items-start px-4">
        <div>
          <h3 className="text-orange-600 text-lg font-bold">{title}</h3>
          <div className="mt-2 space-y-1">
            {meal.menu.map((item: string, index: number) => (
              <div key={index} className="text-gray-700">
                {item}
              </div>
            ))}
          </div>
          {meal.reason && <div className="mt-2 text-sm text-gray-400">💡 {meal.reason}</div>}
        </div>
        <button className="self-center pl-4" onClick={onRefresh} disabled={isRefreshing}>
          <BsArrowClockwise
            className={`text-4xl ${isRefreshing ? "animate-spin text-orange-400" : "text-gray-600"} cursor-pointer`}
          />
        </button>
      </div>
    </div>
  );
}

export default function MealDay({ date }: { date: Date }) {
  // Get meals for the selected date with loading state
  const { data: meals, isLoading, isError } = useCurrentMemberMealsOf(date);

  // Use the mutation hook for refreshing meals with individual loading states
  const refreshMutation = useMutateRefreshMeal(date);

  const handleRefreshMeal = (mealId: string) => {
    refreshMutation.mutate(mealId);
  };

  if (isLoading) {
    return (
      <div className="py-6 text-center">
        <div className="w-10 h-10 border-t-4 border-orange-500 border-solid rounded-full animate-spin mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">식단을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-6 text-center">
        <p className="text-red-500">식단을 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  if (!meals) {
    return (
      <div className="py-6 text-center">
        <p className="text-gray-500">식단 정보가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <h2 className="text-lg font-bold mb-4 px-4">{format(date, "yyyy년 MM월 dd일")}의 식단</h2>

      <MealItem
        title="아침"
        meal={meals.breakfast}
        onRefresh={() => handleRefreshMeal(meals.breakfast.meal_id)}
        isRefreshing={
          refreshMutation.isPending && refreshMutation.variables === meals.breakfast.meal_id
        }
      />

      <MealItem
        title="점심"
        meal={meals.lunch}
        onRefresh={() => handleRefreshMeal(meals.lunch.meal_id)}
        isRefreshing={
          refreshMutation.isPending && refreshMutation.variables === meals.lunch.meal_id
        }
      />

      <MealItem
        title="저녁"
        meal={meals.dinner}
        onRefresh={() => handleRefreshMeal(meals.dinner.meal_id)}
        isRefreshing={
          refreshMutation.isPending && refreshMutation.variables === meals.dinner.meal_id
        }
      />
    </div>
  );
}
