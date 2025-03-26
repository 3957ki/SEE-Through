import { Section, SectionContent, SectionDivider, SectionTitle } from "@/components/ui/section";
import { useCurrentMember } from "@/contexts/CurrentMemberContext";
import Material from "@/interfaces/Material";
import { useEffect, useState } from "react";
import { useMaterialContext } from "@/contexts/MaterialContext";
import { BsCalendarEvent, BsHandThumbsDown, BsHandThumbsUp } from "react-icons/bs";

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

function MealCard({ title, color, items }: { title: string; color: string; items: string[] }) {
  return (
    <div className={`${color} rounded-xl p-4 w-full text-white`}>
      <h3 className="font-medium mb-2 text-lg">{title}</h3>
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
  return (
    <div className="mt-2">
      <div className="px-4 flex gap-3">
        <MealCard title="아침" color="bg-orange-400" items={["삼각김밥", "바나나"]} />
        <MealCard
          title="점심"
          color="bg-gray-600"
          items={["닭가슴살볶음밥", "토마토", "오렌지주스 150ml"]}
        />
      </div>
      <FeedbackButtons />
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
