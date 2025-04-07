import { SimpleDialog } from "@/components/dialog/SimpleDialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDialog } from "@/contexts/DialogContext";
import { useCurrentMember, useUpdateMember } from "@/queries/members";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";

const MEASUREMENT_TYPES = ["선호 음식", "비선호 음식", "질병", "알러지"] as const;

type MeasurementType = (typeof MEASUREMENT_TYPES)[number];

export default function MyPage() {
  const { data: currentMember } = useCurrentMember();
  const { mutate: updateMember } = useUpdateMember();
  const { showDialog, hideDialog } = useDialog();
  const [measurementType, setMeasurementType] = useState<MeasurementType>("선호 음식");
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState<Date | undefined>();
  const [isColorBlind, setIsColorBlind] = useState(false);
  const [fontSize, setFontSize] = useState("");
  const [preferredFoods, setPreferredFoods] = useState<string[]>([]);
  const [dislikedFoods, setDislikedFoods] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [diseases, setDiseases] = useState<string[]>([]);

  useEffect(() => {
    if (!currentMember) return;

    setName(currentMember.name || "");
    setBirthday(currentMember.birth ? new Date(currentMember.birth) : undefined);
    setIsColorBlind(currentMember.color === "색맹");
    setFontSize(currentMember.font_size);
    setPreferredFoods(currentMember.preferred_foods || []);
    setDislikedFoods(currentMember.disliked_foods || []);
    setAllergies(currentMember.allergies || []);
    setDiseases(currentMember.diseases || []);
  }, [currentMember]);

  const isModified = useMemo(() => {
    if (!currentMember) return false;

    const birthdayString = birthday ? format(birthday, "yyyy-MM-dd") : null;
    const currentColor = isColorBlind ? "색맹" : "정상";

    const areArraysEqual = (arr1: string[], arr2: string[]) => {
      if (arr1.length !== arr2.length) return false;
      return arr1.every((item, index) => item === arr2[index]);
    };

    return (
      name !== (currentMember.name || "") ||
      birthdayString !== currentMember.birth ||
      currentColor !== (currentMember.color || "정상") ||
      fontSize !== (currentMember.font_size || "") ||
      !areArraysEqual(preferredFoods, currentMember.preferred_foods || []) ||
      !areArraysEqual(dislikedFoods, currentMember.disliked_foods || []) ||
      !areArraysEqual(allergies, currentMember.allergies || []) ||
      !areArraysEqual(diseases, currentMember.diseases || [])
    );
  }, [
    currentMember,
    name,
    birthday,
    isColorBlind,
    fontSize,
    preferredFoods,
    dislikedFoods,
    allergies,
    diseases,
  ]);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentMember) return;

    try {
      updateMember(
        {
          member_id: currentMember.member_id,
          name,
          birth: birthday ? format(birthday, "yyyy-MM-dd") : "",
          color: isColorBlind ? "색맹" : "정상",
          font_size: fontSize,
          preferred_foods: preferredFoods,
          disliked_foods: dislikedFoods,
          allergies,
          diseases,
        },
        {
          onSuccess: () => {
            showDialog(<SimpleDialog title="회원 정보가 수정되었습니다." />);
          },
          onError: (error) => {
            console.error("Error updating member:", error);
            showDialog(<SimpleDialog title="회원 정보 수정에 실패했습니다." isError />);
          },
        }
      );
    } catch (error) {
      console.error("Error updating member:", error);
      showDialog(<SimpleDialog title="회원 정보 수정에 실패했습니다." isError />);
    }
  };

  if (!currentMember) return null;

  return (
    <div className="pb-16 relative">
      <div className="p-4 flex flex-col gap-4">
        {/* User Info Section */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="text-sm text-muted-foreground mb-1">이름</div>
            <Input
              placeholder="이름을 입력하세요"
              value={name}
              onChange={(e) => handleInputChange(e, setName)}
            />
          </div>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground mb-1">생일</div>
            <Button
              variant="outline"
              onClick={handleShowCalendar}
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {birthday ? (
                format(birthday, "yyyy.MM.dd", { locale: ko })
              ) : (
                <span className="text-muted-foreground/70">생일을 알려주세요!</span>
              )}
            </Button>
          </div>
        </div>

        {/* Color Blindness and Font Size Section */}
        <div className="flex gap-4">
          <div className="flex-1 flex items-center gap-2">
            <label htmlFor="colorBlind" className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-muted-foreground mb-1">색맹 여부</span>
              <Checkbox
                id="colorBlind"
                checked={isColorBlind}
                onCheckedChange={(checked) => setIsColorBlind(checked as boolean)}
              />
            </label>
          </div>

          <div className="flex-1 flex items-center gap-2">
            <span className="text-sm text-muted-foreground mb-1">폰트 크기</span>
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger className="w-[80px] h-9">
                <SelectValue placeholder="폰트 크기" className="text-sm" />
              </SelectTrigger>
              <SelectContent sideOffset={0} align="center">
                <SelectItem value="작게" className="text-sm text-center">
                  작게
                </SelectItem>
                <SelectItem value="보통" className="text-sm text-center">
                  보통
                </SelectItem>
                <SelectItem value="크게" className="text-sm text-center">
                  크게
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Measurement Type Selection */}
        <div className="flex border-b">
          {MEASUREMENT_TYPES.map((type) => (
            <button
              type="button"
              key={type}
              className={`py-2 px-2 text-sm ${
                measurementType === type
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
              style={{ flex: type.length }}
              onClick={() => setMeasurementType(type)}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <Button variant="outline" className="w-full" onClick={handleShowAddDialog}>
            {measurementType} 추가
          </Button>
          <div className="grid grid-cols-2 gap-4">
            {getCurrentList().map((item, index) => (
              <div
                key={index}
                className="flex-1 py-2 px-3 border rounded-md bg-card flex items-center justify-between gap-2"
              >
                <div className="break-words flex-1">{item}</div>
                <button
                  type="button"
                  className="text-muted hover:text-foreground p-1 rounded-full hover:bg-muted"
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
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setName(currentMember.name || "");
              setBirthday(currentMember.birth ? new Date(currentMember.birth) : undefined);
              setIsColorBlind(currentMember.color === "색맹");
              setFontSize(currentMember.font_size);
              setPreferredFoods(currentMember.preferred_foods || []);
              setDislikedFoods(currentMember.disliked_foods || []);
              setAllergies(currentMember.allergies || []);
              setDiseases(currentMember.diseases || []);
            }}
            disabled={!isModified}
          >
            취소
          </Button>
          <Button
            className="flex-1 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            disabled={!isModified}
            onClick={handleSubmit}
          >
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}
