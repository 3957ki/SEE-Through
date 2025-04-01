import { deleteIngredient, insertIngredient } from "@/api/ingredients";
import FridgeDisplay from "@/components/FridgeDisplay";
import Fridge from "@/components/showcase/Fridge";
import Table from "@/components/showcase/Table";
import UserInfoCard from "@/components/showcase/UserInfoCard";
import WebcamView from "@/components/showcase/WebcamView";
import { useCurrentMember } from "@/contexts/CurrentMemberContext";
import { useIngredientsContext } from "@/contexts/IngredientsContext";
import Ingredient from "@/interfaces/Ingredient";
import { useEffect, useState, type DragEvent } from "react";

const showcaseIngredients = [
  {
    ingredient_id: "99999999-0000-0000-0000-000000000001",
    name: "두부",
    image_path: "showcase1",
  },
  {
    ingredient_id: "99999999-0000-0000-0000-000000000002",
    name: "showcase2",
    image_path: "showcase2",
  },
  {
    ingredient_id: "99999999-0000-0000-0000-000000000003",
    name: "showcase3",
    image_path: "showcase3",
  },
  {
    ingredient_id: "99999999-0000-0000-0000-000000000004",
    name: "showcase4",
    image_path: "showcase4",
  },
  {
    ingredient_id: "99999999-0000-0000-0000-000000000005",
    name: "showcase5",
    image_path: "showcase5",
  },
];

function ShowcaseScreen() {
  const { ingredients, setIngredients } = useIngredientsContext();
  const { currentMember } = useCurrentMember();

  const [insideIngredients, setInsideIngredients] = useState<Ingredient[]>([]);
  const [outsideIngredients, setOutsideIngredients] = useState<Ingredient[]>([]);

  const [dialogMessage, setDialogMessage] = useState<string>(""); // Message to show in dialog
  const [showDialog, setShowDialog] = useState<boolean>(false); // Whether the dialog is visible

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  useEffect(() => {
    const newInsideIngredients: Ingredient[] = [];
    const newOutsideIngredients: Ingredient[] = [];

    for (const showcaseIngredient of showcaseIngredients) {
      const ingredient = ingredients.find(
        (ingredient) => ingredient.ingredient_id === showcaseIngredient.ingredient_id
      );
      if (ingredient) {
        newInsideIngredients.push(ingredient);
      } else {
        newOutsideIngredients.push(showcaseIngredient);
      }
    }

    setInsideIngredients(newInsideIngredients);
    setOutsideIngredients(newOutsideIngredients);
  }, [ingredients]);

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    let ingredient: Ingredient | null = null;

    try {
      const ingredientData = e.dataTransfer.getData("application/x-ingredient");
      if (!ingredientData || !currentMember) return;

      ingredient = JSON.parse(ingredientData);
      if (!ingredient) return;

      // Optimistic UI update - update state before API call
      setOutsideIngredients((prev) =>
        prev.filter((item) => item.ingredient_id !== ingredient!.ingredient_id)
      );
      setInsideIngredients((prev) => [...prev, ingredient!]);
      setIngredients([...ingredients, ingredient!]);

      // Call API to insert ingredient
      await insertIngredient(ingredient, currentMember.member_id);
    } catch (error) {
      // If API call fails, revert the optimistic update
      console.error("Failed to handle drop:", error);
      if (ingredient) {
        setOutsideIngredients((prev) => [...prev, ingredient!]);
        setInsideIngredients((prev) =>
          prev.filter((item) => item.ingredient_id !== ingredient!.ingredient_id)
        );
        setIngredients(
          ingredients.filter((item) => item.ingredient_id !== ingredient!.ingredient_id)
        );
      }
    }
  };

  const takeoutIngredient = async (ingredient: Ingredient): Promise<void> => {
    if (!currentMember) return;

    try {
      // Optimistic UI update - update state before API call
      setInsideIngredients((prev) =>
        prev.filter((item) => item.ingredient_id !== ingredient.ingredient_id)
      );
      setOutsideIngredients((prev) => [...prev, ingredient]);
      setIngredients(ingredients.filter((item) => item.ingredient_id !== ingredient.ingredient_id));

      // API 호출로 재료 삭제
      const response = await deleteIngredient(ingredient.ingredient_id, currentMember.member_id);

      console.log("response: ", response);

      // 응답에서 받은 메시지 사용
      const successMessage = response.message || "Ingredient successfully removed from the fridge!";

      // API 응답을 받은 후에 다이얼로그를 띄우기
      setDialogMessage(successMessage);
      setShowDialog(true);
    } catch (error) {
      // Log the error for debugging
      console.error("Error occurred while removing ingredient:", error);

      // If API call fails, revert the optimistic update
      setInsideIngredients((prev) => [...prev, ingredient]);
      setOutsideIngredients((prev) =>
        prev.filter((item) => item.ingredient_id !== ingredient.ingredient_id)
      );
      setIngredients([...ingredients, ingredient]);

      // Show error message in dialog after failure
      setDialogMessage("Failed to remove ingredient. Please try again.");
      setShowDialog(true);
    }
  };

  return (
    <div className="min-h-screen relative bg-blue-50">
      <div className="flex w-full h-[100vh] gap-4 md:gap-8 p-5">
        {/* Left Area - Fridge and Drop Zone */}
        <div className="w-2/3 h-full relative">
          <Fridge
            handleDrop={handleDrop}
            insideIngredients={insideIngredients}
            ingredientOnClick={takeoutIngredient}
          >
            <div
              className="w-full h-full overflow-hidden flex items-center justify-center bg-gray-50"
              style={{ background: "none", fill: "none" }}
            >
              <div className="flex items-center justify-center">
                <FridgeDisplay
                  targetWidth={375}
                  targetHeight={667}
                  showDialog={showDialog}
                  dialogMessage={dialogMessage}
                  onCloseDialog={handleCloseDialog}
                />
              </div>
            </div>
          </Fridge>
        </div>

        {/* Right Area - Controls and Ingredient Table */}
        <div className="w-1/3 h-full flex flex-col gap-4 md:gap-6 relative">
          <div className="h-1/3">
            <WebcamView />
          </div>
          <div className="h-1/3">
            <UserInfoCard />
          </div>
        </div>
      </div>

      {/* Table positioned outside the flex container */}
      <div className="absolute bottom-0 right-0 w-full h-full pointer-events-none">
        <Table outsideIngredients={outsideIngredients} />
      </div>
    </div>
  );
}

export default ShowcaseScreen;
