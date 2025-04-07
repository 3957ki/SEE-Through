import { Spinner } from "@/components/ui/spinner";
import { useDialog } from "@/contexts/DialogContext";
import { useIngredient } from "@/queries/ingredients";

interface IngredientDialogProps {
  ingredientId: string;
}

function IngredientDialog({ ingredientId }: IngredientDialogProps) {
  const { data: ingredient, isLoading, error } = useIngredient(ingredientId);
  const { hideDialog } = useDialog();

  if (isLoading) {
    return (
      <div className="bg-background rounded-lg p-4 w-80 max-w-md mx-auto text-center">
        <div className="flex justify-center items-center h-48">
          <Spinner size={24} />
        </div>
      </div>
    );
  }

  if (error || !ingredient) {
    return (
      <div className="bg-background rounded-lg p-4 w-80 max-w-md mx-auto text-center">
        <div className="flex justify-center items-center h-48">
          <p className="text-destructive">데이터를 불러오는데 실패했습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg p-4 w-80 max-w-md mx-auto">
      <div className="flex flex-col gap-4 items-center">
        <div className="relative w-full">
          <div className="w-full aspect-[2/1] rounded-md overflow-hidden flex justify-center">
            <img
              src={ingredient.image_path ?? "/src/assets/no-ingredient.png"}
              alt={ingredient.name ?? "Ingredient image"}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="w-full text-center">
          <h3 className="font-bold text-2xl">{ingredient.name}</h3>
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 py-2 border-b border-border">
              <span className="text-primary font-medium whitespace-nowrap">소유자</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={ingredient.member_image_path}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-muted-foreground">
                  {ingredient.member_name ?? "정보 없음"}
                </span>
              </div>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">입고일</span>
              <span className="text-foreground font-medium">
                {ingredient.inbound_at
                  ? new Date(ingredient.inbound_at).toLocaleDateString()
                  : "정보 없음"}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">유통기한</span>
              <span className="text-foreground font-medium">
                {ingredient.expiration_at
                  ? new Date(ingredient.expiration_at).toLocaleDateString()
                  : "정보 없음"}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full">
          <button
            type="button"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md w-full font-medium"
            onClick={hideDialog}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export default IngredientDialog;
