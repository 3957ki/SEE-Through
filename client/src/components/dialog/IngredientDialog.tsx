import { getIngredient } from "@/api/ingredients";
import { DetailedIngredient } from "@/interfaces/Ingredient";
import { useEffect, useState } from "react";

interface IngredientDialogProps {
  ingredientId: string;
  onClose: () => void;
}

function IngredientDialog({ ingredientId, onClose }: IngredientDialogProps) {
  const [ingredient, setIngredient] = useState<DetailedIngredient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchIngredient = async () => {
      try {
        setIsLoading(true);
        const data = await getIngredient(ingredientId);
        setIngredient(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("알 수 없는 오류가 발생했습니다."));
      } finally {
        setIsLoading(false);
      }
    };

    fetchIngredient();
  }, [ingredientId]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-4 w-80 max-w-md">
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error || !ingredient) {
    return (
      <div className="bg-white rounded-lg p-4 w-80 max-w-md">
        <div className="flex justify-center items-center h-48">
          <p className="text-red-500">데이터를 불러오는데 실패했습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 w-80 max-w-md">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <div className="w-full aspect-[2/1] rounded-md overflow-hidden">
            <img
              src={ingredient.image_path ?? "/src/assets/no-ingredient.png"}
              alt={ingredient.name ?? "Ingredient image"}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div>
          <h3 className="font-bold text-2xl">{ingredient.name}</h3>
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 py-2 border-b border-gray-100">
              <span className="text-orange-500 font-medium whitespace-nowrap">소유자</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={ingredient.member_image_path}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-gray-600">{ingredient.member_name ?? "정보 없음"}</span>
              </div>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">입고일</span>
              <span className="text-gray-600 font-medium">
                {ingredient.inbound_at
                  ? new Date(ingredient.inbound_at).toLocaleDateString()
                  : "정보 없음"}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">유통기한</span>
              <span className="text-gray-600 font-medium">
                {ingredient.expiration_at
                  ? new Date(ingredient.expiration_at).toLocaleDateString()
                  : "정보 없음"}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-md w-full font-medium"
          onClick={onClose}
        >
          닫기
        </button>
      </div>
    </div>
  );
}

export default IngredientDialog;
