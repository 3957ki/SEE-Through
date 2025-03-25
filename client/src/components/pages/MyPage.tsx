import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { useCurrentMember } from "@/contexts/CurrentMemberContext";
import { useDialog } from "@/contexts/DialogContext";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";

const MEASUREMENT_TYPES = ["질병", "알러지", "선호 음식", "비선호 음식"] as const;

type MeasurementType = (typeof MEASUREMENT_TYPES)[number];

export default function MyPage() {
  const { currentMember } = useCurrentMember();
  const { showDialog, hideDialog } = useDialog();
  const [measurementType, setMeasurementType] = useState<MeasurementType>("선호 음식");
  const [name, setName] = useState(currentMember?.name || "");
  const [birthday, setBirthday] = useState<Date | undefined>(
    currentMember && "birth" in currentMember && currentMember.birth
      ? new Date(currentMember.birth)
      : undefined
  );
  const [preferredFoods, setPreferredFoods] = useState<string[]>(
    currentMember && "preferred_foods" in currentMember ? currentMember.preferred_foods : []
  );
  const [dislikedFoods, setDislikedFoods] = useState<string[]>(
    currentMember && "disliked_foods" in currentMember ? currentMember.disliked_foods : []
  );
  const [allergies, setAllergies] = useState<string[]>(
    currentMember && "allergies" in currentMember ? currentMember.allergies : []
  );
  const [diseases, setDiseases] = useState<string[]>(
    currentMember && "diseases" in currentMember ? currentMember.diseases : []
  );

  // Check if any changes were made
  const isModified = useMemo(() => {
    if (!currentMember) return false;

    const initialBirthday =
      currentMember && "birth" in currentMember && currentMember.birth
        ? new Date(currentMember.birth)
        : undefined;

    const memberPreferredFoods =
      "preferred_foods" in currentMember ? currentMember.preferred_foods : [];
    const memberDislikedFoods =
      "disliked_foods" in currentMember ? currentMember.disliked_foods : [];
    const memberAllergies = "allergies" in currentMember ? currentMember.allergies : [];
    const memberDiseases = "diseases" in currentMember ? currentMember.diseases : [];

    return (
      name !== currentMember.name ||
      birthday?.getTime() !== initialBirthday?.getTime() ||
      JSON.stringify(preferredFoods) !== JSON.stringify(memberPreferredFoods) ||
      JSON.stringify(dislikedFoods) !== JSON.stringify(memberDislikedFoods) ||
      JSON.stringify(allergies) !== JSON.stringify(memberAllergies) ||
      JSON.stringify(diseases) !== JSON.stringify(memberDiseases)
    );
  }, [currentMember, name, birthday, preferredFoods, dislikedFoods, allergies, diseases]);

  // Update state values when currentMember changes
  useEffect(() => {
    setName(currentMember?.name || "");
    setBirthday(
      currentMember && "birth" in currentMember && currentMember.birth
        ? new Date(currentMember.birth)
        : undefined
    );
    setPreferredFoods(
      currentMember && "preferred_foods" in currentMember ? currentMember.preferred_foods : []
    );
    setDislikedFoods(
      currentMember && "disliked_foods" in currentMember ? currentMember.disliked_foods : []
    );
    setAllergies(currentMember && "allergies" in currentMember ? currentMember.allergies : []);
    setDiseases(currentMember && "diseases" in currentMember ? currentMember.diseases : []);
  }, [currentMember]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    setter(e.target.value);
  };

  const handleShowCalendar = () => {
    showDialog(
      <div className="p-4">
        <Calendar
          mode="single"
          selected={birthday}
          onSelect={(date) => {
            setBirthday(date);
            hideDialog();
          }}
          initialFocus
        />
      </div>
    );
  };

  const getCurrentList = () => {
    switch (measurementType) {
      case "선호 음식":
        return preferredFoods;
      case "비선호 음식":
        return dislikedFoods;
      case "알러지":
        return allergies;
      case "질병":
        return diseases;
      default:
        return [];
    }
  };

  const setCurrentList = (newList: string[]) => {
    switch (measurementType) {
      case "선호 음식":
        setPreferredFoods(newList);
        break;
      case "비선호 음식":
        setDislikedFoods(newList);
        break;
      case "알러지":
        setAllergies(newList);
        break;
      case "질병":
        setDiseases(newList);
        break;
    }
  };

  return (
    <div className="pb-16 relative">
      <div className="p-4 flex flex-col gap-4">
        {/* User Info Section */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="text-sm text-gray-500 mb-1">이름</div>
            <Input
              placeholder="이름을 입력하세요"
              value={name}
              onChange={(e) => handleInputChange(e, setName)}
            />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500 mb-1">생일</div>
            <Button
              variant="outline"
              onClick={handleShowCalendar}
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {birthday ? format(birthday, "yyyy.MM.dd", { locale: ko }) : "생일을 알려주세요!"}
            </Button>
          </div>
        </div>

        {/* Title Section */}
        <h2 className="text-lg font-medium">선호 색상 및 폰트 크기</h2>
        <div className="text-sm text-gray-600">적록 색약 체크표시 및 폰트 크기 선택하기</div>

        {/* Measurement Type Selection */}
        <div className="flex gap-2 border-b">
          {MEASUREMENT_TYPES.map((type) => (
            <button
              key={type}
              className={`py-2 px-4 ${
                measurementType === type
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-500"
              }`}
              onClick={() => setMeasurementType(type)}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          {getCurrentList().map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder={`${measurementType} 입력`}
                value={item}
                onChange={(e) => {
                  const newList = [...getCurrentList()];
                  newList[index] = e.target.value;
                  setCurrentList(newList);
                }}
                className="flex-1"
              />
              <div
                className="text-gray-400 cursor-pointer"
                onClick={() => {
                  const newList = getCurrentList().filter((_, i) => i !== index);
                  setCurrentList(newList);
                }}
              >
                삭제
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Input
              placeholder={`${measurementType} 추가`}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  setCurrentList([...getCurrentList(), e.currentTarget.value.trim()]);
                  e.currentTarget.value = "";
                }
              }}
              className="flex-1"
            />
            <div className="text-gray-400">추가</div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setName(currentMember?.name || "");
              setBirthday(
                currentMember && "birth" in currentMember && currentMember.birth
                  ? new Date(currentMember.birth)
                  : undefined
              );
              setPreferredFoods(
                currentMember && "preferred_foods" in currentMember
                  ? currentMember.preferred_foods
                  : []
              );
              setDislikedFoods(
                currentMember && "disliked_foods" in currentMember
                  ? currentMember.disliked_foods
                  : []
              );
              setAllergies(
                currentMember && "allergies" in currentMember ? currentMember.allergies : []
              );
              setDiseases(
                currentMember && "diseases" in currentMember ? currentMember.diseases : []
              );
            }}
            disabled={!isModified}
          >
            취소
          </Button>
          <Button
            className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
            disabled={!isModified}
          >
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}
