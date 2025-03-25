import { updateMember } from "@/api/members";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { useCurrentMember } from "@/contexts/CurrentMemberContext";
import { useDialog } from "@/contexts/DialogContext";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";

const MEASUREMENT_TYPES = ["질병", "알러지", "선호 음식", "비선호 음식"] as const;

type MeasurementType = (typeof MEASUREMENT_TYPES)[number];

// Interface for saved state
interface SavedState {
  name: string;
  birth?: string;
  preferred_foods: string[];
  disliked_foods: string[];
  allergies: string[];
  diseases: string[];
}

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

  // Track the last saved state
  const [savedState, setSavedState] = useState<SavedState>({
    name: currentMember?.name || "",
    birth: currentMember && "birth" in currentMember ? currentMember.birth : undefined,
    preferred_foods:
      currentMember && "preferred_foods" in currentMember ? currentMember.preferred_foods : [],
    disliked_foods:
      currentMember && "disliked_foods" in currentMember ? currentMember.disliked_foods : [],
    allergies: currentMember && "allergies" in currentMember ? currentMember.allergies : [],
    diseases: currentMember && "diseases" in currentMember ? currentMember.diseases : [],
  });

  // Check if any changes were made compared to the saved state
  const isModified = useMemo(() => {
    if (!currentMember) return false;

    const birthdayString = birthday ? birthday.toISOString().split("T")[0] : undefined;

    return (
      name !== savedState.name ||
      birthdayString !== savedState.birth ||
      JSON.stringify(preferredFoods) !== JSON.stringify(savedState.preferred_foods) ||
      JSON.stringify(dislikedFoods) !== JSON.stringify(savedState.disliked_foods) ||
      JSON.stringify(allergies) !== JSON.stringify(savedState.allergies) ||
      JSON.stringify(diseases) !== JSON.stringify(savedState.diseases)
    );
  }, [
    currentMember,
    name,
    birthday,
    preferredFoods,
    dislikedFoods,
    allergies,
    diseases,
    savedState,
  ]);

  // Update state values when currentMember changes
  useEffect(() => {
    if (!currentMember) return;

    setName(currentMember.name || "");
    setBirthday(
      "birth" in currentMember && currentMember.birth ? new Date(currentMember.birth) : undefined
    );
    setPreferredFoods("preferred_foods" in currentMember ? currentMember.preferred_foods : []);
    setDislikedFoods("disliked_foods" in currentMember ? currentMember.disliked_foods : []);
    setAllergies("allergies" in currentMember ? currentMember.allergies : []);
    setDiseases("diseases" in currentMember ? currentMember.diseases : []);

    // Update saved state when currentMember changes
    setSavedState({
      name: currentMember.name || "",
      birth: "birth" in currentMember ? currentMember.birth : undefined,
      preferred_foods: "preferred_foods" in currentMember ? currentMember.preferred_foods : [],
      disliked_foods: "disliked_foods" in currentMember ? currentMember.disliked_foods : [],
      allergies: "allergies" in currentMember ? currentMember.allergies : [],
      diseases: "diseases" in currentMember ? currentMember.diseases : [],
    });
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
          defaultMonth={birthday}
        />
      </div>
    );
  };

  const handleShowAddDialog = () => {
    showDialog(
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-medium">{measurementType} 추가</h2>
        <Input
          placeholder={`${measurementType} 입력`}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.currentTarget.value.trim()) {
              setCurrentList([...getCurrentList(), e.currentTarget.value.trim()]);
              hideDialog();
            }
          }}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => hideDialog()}>
            취소
          </Button>
          <Button
            onClick={(e) => {
              const input = (e.target as HTMLElement)
                .closest("div.p-4")
                ?.querySelector("input") as HTMLInputElement;
              if (input && input.value.trim()) {
                setCurrentList([...getCurrentList(), input.value.trim()]);
                hideDialog();
              }
            }}
          >
            추가
          </Button>
        </div>
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
          <div className="grid grid-cols-2 gap-4">
            {getCurrentList().map((item, index) => (
              <div
                key={index}
                className="flex-1 py-2 px-3 border rounded-md bg-gray-50 flex items-center justify-between gap-2"
              >
                <div className="break-words flex-1">{item}</div>
                <button
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    const newList = getCurrentList().filter((_, i) => i !== index);
                    setCurrentList(newList);
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full" onClick={handleShowAddDialog}>
            {measurementType} 추가
          </Button>
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
            onClick={async () => {
              if (!currentMember) return;

              try {
                await updateMember({
                  member_id: currentMember.member_id,
                  name,
                  birth: birthday ? birthday.toISOString().split("T")[0] : "",
                  preferred_foods: preferredFoods,
                  disliked_foods: dislikedFoods,
                  allergies,
                  diseases,
                });

                // Update the saved state after successful save
                setSavedState({
                  name,
                  birth: birthday ? birthday.toISOString().split("T")[0] : undefined,
                  preferred_foods: [...preferredFoods],
                  disliked_foods: [...dislikedFoods],
                  allergies: [...allergies],
                  diseases: [...diseases],
                });

                showDialog(
                  <div className="p-4 space-y-4">
                    <h2 className="text-lg font-medium">알림</h2>
                    <p>사용자 정보가 성공적으로 업데이트되었습니다.</p>
                    <div className="flex justify-end">
                      <Button onClick={() => hideDialog()}>확인</Button>
                    </div>
                  </div>
                );
              } catch (error) {
                console.error("업데이트 실패:", error);
                showDialog(
                  <div className="p-4 space-y-4">
                    <h2 className="text-lg font-medium">오류</h2>
                    <p>사용자 정보 업데이트 중 오류가 발생했습니다.</p>
                    <div className="flex justify-end">
                      <Button
                        className="bg-orange-500 text-white hover:bg-orange-600"
                        onClick={() => hideDialog()}
                      >
                        확인
                      </Button>
                    </div>
                  </div>
                );
              }
            }}
          >
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}
