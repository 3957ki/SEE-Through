import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { useCurrentMember } from "@/contexts/CurrentMemberContext";
import { useDialog } from "@/contexts/DialogContext";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState, type ChangeEvent } from "react";

const MEASUREMENT_TYPES = ["절병", "알러지", "선호 음식", "비선호 음식"] as const;

type MeasurementType = (typeof MEASUREMENT_TYPES)[number];

export default function MyPage() {
  const { currentMember } = useCurrentMember();
  const { showDialog, hideDialog } = useDialog();
  const [measurementType, setMeasurementType] = useState<MeasurementType>("선호 음식");
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState<Date>();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");

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

  return (
    <div className="pb-16 relative">
      <div className="p-4 flex flex-col gap-4">
        {/* User Info Section */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="text-sm text-gray-500 mb-1">이름</div>
            <Input
              placeholder={currentMember?.name || "김삼성"}
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
              {birthday ? format(birthday, "yyyy.MM.dd", { locale: ko }) : "1998.11.05"}
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
          <div className="flex items-center gap-2">
            <Input
              placeholder="소주"
              value={height}
              onChange={(e) => handleInputChange(e, setHeight)}
              className="flex-1"
            />
            <div className="text-gray-400">삭제</div>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="피자"
              value={weight}
              onChange={(e) => handleInputChange(e, setWeight)}
              className="flex-1"
            />
            <div className="text-gray-400">삭제</div>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="초밥"
              value={targetWeight}
              onChange={(e) => handleInputChange(e, setTargetWeight)}
              className="flex-1"
            />
            <div className="text-gray-400">삭제</div>
          </div>
        </div>

        {/* Submit Button */}
        <Button className="w-full bg-orange-500 text-white hover:bg-orange-600 mt-4">수정</Button>
      </div>
    </div>
  );
}
