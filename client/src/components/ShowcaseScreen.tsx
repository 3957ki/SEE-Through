import Fridge from "@/components/showcase/Fridge";
import Table from "@/components/showcase/Table";
import UserInfoCard from "@/components/showcase/UserInfoCard";
import WebcamView from "@/components/showcase/WebcamView";
import { useShowcaseIngredients } from "@/queries/showcaseIngredients";

function ShowcaseScreen() {
  const { insideIngredients, outsideIngredients, isLoading } = useShowcaseIngredients();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading ingredients...</div>
    );
  }

  return (
    <div className="min-h-screen relative bg-blue-50">
      <div className="flex w-full h-[100vh] gap-4 md:gap-8 p-5">
        {/* Left Area - Fridge and Drop Zone */}
        <div className="w-2/3 h-full relative">
          <Fridge insideIngredients={insideIngredients} />
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
