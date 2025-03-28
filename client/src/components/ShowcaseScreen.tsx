import FridgeDisplay from "@/components/FridgeDisplay";
import Fridge from "@/components/showcase/Fridge";
import Table from "@/components/showcase/Table";
import UserInfoCard from "@/components/showcase/UserInfoCard";
import WebcamView from "@/components/showcase/WebcamView";
import { useIngredientsContext } from "@/contexts/IngredientsContext";
import Ingredient from "@/interfaces/Ingredient";
import { useEffect, useState, type DragEvent } from "react";

const showcaseIngredients = [
  {
    ingredient_id: "showcase1",
    name: "showcase1",
    image_path: "showcase1",
  },
  {
    ingredient_id: "showcase2",
    name: "showcase2",
    image_path: "showcase2",
  },
  {
    ingredient_id: "showcase3",
    name: "showcase3",
    image_path: "showcase3",
  },
  {
    ingredient_id: "showcase4",
    name: "showcase4",
    image_path: "showcase4",
  },
  {
    ingredient_id: "showcase5",
    name: "showcase5",
    image_path: "showcase5",
  },
];

function ShowcaseScreen() {
  const { ingredients } = useIngredientsContext();

  const [insideIngredients, setInsideIngredients] = useState<Ingredient[]>([]);
  const [outsideIngredients, setOutsideIngredients] = useState<Ingredient[]>([]);

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

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      const ingredientData = e.dataTransfer.getData("application/x-ingredient");
      if (!ingredientData) return;

      const ingredient: Ingredient = JSON.parse(ingredientData);

      // Move ingredient from outside to inside
      setOutsideIngredients((prev) =>
        prev.filter((item) => item.ingredient_id !== ingredient.ingredient_id)
      );
      setInsideIngredients((prev) => [...prev, ingredient]);
    } catch (error) {
      console.error("Failed to handle drop:", error);
    }
  };

  const takeoutIngredient = (ingredient: Ingredient): void => {
    // Move ingredient from inside to outside
    setInsideIngredients((prev) =>
      prev.filter((item) => item.ingredient_id !== ingredient.ingredient_id)
    );
    setOutsideIngredients((prev) => [...prev, ingredient]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-blue-50">
      <div className="flex relative w-full h-[100vh] gap-4 md:gap-8 p-5">
        {/* 왼쪽 영역 - 냉장고와 드롭존 */}
        <div className="w-2/3 h-full relative">
          <Fridge
            handleDrop={handleDrop}
            insideIngredients={insideIngredients}
            removeIngredient={takeoutIngredient}
          >
            <div
              className="w-full h-full overflow-hidden flex items-center justify-center bg-gray-50"
              style={{ background: "none", fill: "none" }}
            >
              <div className="flex items-center justify-center">
                <FridgeDisplay targetWidth={375} targetHeight={667} />
              </div>
            </div>
          </Fridge>
        </div>

        {/* 오른쪽 영역 - 컨트롤 및 재료 식탁 */}
        <div className="w-1/3 h-full flex flex-col gap-4 md:gap-6 relative">
          <div className="h-1/3">
            <WebcamView />
          </div>
          <div className="h-1/3">
            <UserInfoCard />
          </div>
        </div>

        <Table outsideIngredients={outsideIngredients} />
      </div>
    </div>
  );
}

export default ShowcaseScreen;
