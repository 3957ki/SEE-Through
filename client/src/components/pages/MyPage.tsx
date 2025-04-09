import { MultilineDialog } from "@/components/dialog/MultilineDialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { Input } from "@/components/ui/input";
import { useDialog } from "@/contexts/DialogContext";
import { useCurrentMember, useUpdateMember } from "@/queries/members";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { LuChevronsLeft, LuChevronsRight } from "react-icons/lu";

const MEASUREMENT_TYPES = ["선호 음식", "비선호 음식", "질병", "알러지"] as const;

type MeasurementType = (typeof MEASUREMENT_TYPES)[number];

export default function MyPage() {
  const { data: currentMember } = useCurrentMember();
  const { mutate: updateMember } = useUpdateMember();
  const { showDialog, hideDialog } = useDialog();
  const [measurementType, setMeasurementType] = useState<MeasurementType>("선호 음식");
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState<Date | undefined>();
  const [colorVision, setColorVision] = useState("정상");
  const [fontSize, setFontSize] = useState("");
  const [preferredFoods, setPreferredFoods] = useState<string[]>([]);
  const [dislikedFoods, setDislikedFoods] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [diseases, setDiseases] = useState<string[]>([]);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [leftHintVisible, setLeftHintVisible] = useState(false);
  const [rightHintVisible, setRightHintVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  // Define options for dropdowns
  const colorVisionOptions = ["정상", "색맹"];
  const fontSizeOptions = ["작게", "보통", "크게"];

  useEffect(() => {
    if (!currentMember) return;

    setName(currentMember.name || "");
    setBirthday(currentMember.birth ? new Date(currentMember.birth) : undefined);
    setColorVision(currentMember.color || "정상");
    setFontSize(currentMember.font_size);
    setPreferredFoods(currentMember.preferred_foods || []);
    setDislikedFoods(currentMember.disliked_foods || []);
    setAllergies(currentMember.allergies || []);
    setDiseases(currentMember.diseases || []);
  }, [currentMember]);

  const isModified = useMemo(() => {
    if (!currentMember) return false;

    const birthdayString = birthday ? format(birthday, "yyyy-MM-dd") : null;

    const areArraysEqual = (arr1: string[], arr2: string[]) => {
      if (arr1.length !== arr2.length) return false;
      return arr1.every((item, index) => item === arr2[index]);
    };

    return (
      name !== (currentMember.name || "") ||
      birthdayString !== currentMember.birth ||
      colorVision !== (currentMember.color || "정상") ||
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
    colorVision,
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
      <div className="p-4 flex justify-center">
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
          color: colorVision,
          font_size: fontSize,
          preferred_foods: preferredFoods,
          disliked_foods: dislikedFoods,
          allergies,
          diseases,
        },
        {
          onSuccess: () => {
            showDialog(
              <MultilineDialog
                content={
                  <>
                    회원 정보가
                    <br />
                    수정되었습니다.
                  </>
                }
              />
            );
          },
          onError: (error) => {
            console.error("Error updating member:", error);
            showDialog(
              <MultilineDialog
                content={
                  <>
                    회원정보수정에
                    <br />
                    실패했습니다.
                  </>
                }
                isError
              />
            );
          },
        }
      );
    } catch (error) {
      console.error("Error updating member:", error);
      showDialog(
        <MultilineDialog
          content={
            <>
              회원정보수정에
              <br />
              실패했습니다.
            </>
          }
          isError
        />
      );
    }
  };

  // Check for scroll hints visibility with debounce
  const updateScrollHints = useCallback(() => {
    const container = tabsContainerRef.current;
    if (!container || isScrolling) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScroll = scrollWidth - clientWidth;

    // Add small threshold and safety checks
    const isAtStart = scrollLeft <= 1;
    const isAtEnd = maxScroll > 0 && Math.abs(maxScroll - scrollLeft) <= 1;
    const hasOverflow = scrollWidth > clientWidth;

    // Prevent unnecessary updates
    if (!hasOverflow) {
      setLeftHintVisible(false);
      setRightHintVisible(false);
      return;
    }

    // Use RAF to prevent rapid state updates
    requestAnimationFrame(() => {
      setLeftHintVisible(!isAtStart);
      setRightHintVisible(!isAtEnd);
    });
  }, [isScrolling]);

  // Set up scroll event listener with debounce
  useEffect(() => {
    const container = tabsContainerRef.current;
    if (!container) return;

    let timeoutId: number | null = null;
    let isUpdating = false;

    const debouncedUpdate = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      if (!isUpdating) {
        timeoutId = window.setTimeout(() => {
          isUpdating = true;
          updateScrollHints();
          isUpdating = false;
        }, 100);
      }
    };

    const handleScroll = () => {
      if (!isScrolling) {
        debouncedUpdate();
      }
    };

    updateScrollHints();
    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", debouncedUpdate, { passive: true });

    // Create observers for size and style changes
    const resizeObserver = new ResizeObserver(debouncedUpdate);

    const mutationObserver = new MutationObserver((mutations) => {
      const hasFontChange = mutations.some(
        (mutation) =>
          mutation.type === "attributes" &&
          (mutation.attributeName === "style" || mutation.attributeName === "class")
      );

      if (hasFontChange) {
        debouncedUpdate();
      }
    });

    // Start observing
    resizeObserver.observe(container);
    mutationObserver.observe(container, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ["style", "class"],
    });

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", debouncedUpdate);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [updateScrollHints, fontSize, isScrolling]);

  // Scroll handlers with animation states
  const scrollToStart = useCallback(() => {
    const container = tabsContainerRef.current;
    if (!container) return;

    setIsScrolling(true);
    container.scrollTo({ left: 0, behavior: "smooth" });

    // Update hints immediately
    setLeftHintVisible(false);
    setRightHintVisible(true);

    // Reset scrolling state after animation
    setTimeout(() => {
      setIsScrolling(false);
      updateScrollHints();
    }, 300); // Match this with the CSS transition duration
  }, [updateScrollHints]);

  const scrollToEnd = useCallback(() => {
    const container = tabsContainerRef.current;
    if (!container) return;

    setIsScrolling(true);
    container.scrollTo({ left: container.scrollWidth - container.clientWidth, behavior: "smooth" });

    // Update hints immediately
    setLeftHintVisible(true);
    setRightHintVisible(false);

    // Reset scrolling state after animation
    setTimeout(() => {
      setIsScrolling(false);
      updateScrollHints();
    }, 300); // Match this with the CSS transition duration
  }, [updateScrollHints]);

  if (!currentMember) return null;

  return (
    <div className="pb-16 relative">
      <div className="p-4 flex flex-col gap-6">
        {/* User Info Section */}
        <div className="space-y-4">
          {/* Name Input */}
          <div>
            <div className="text-base mb-2">이름</div>
            <Input
              placeholder="이름을 입력하세요"
              value={name}
              onChange={(e) => handleInputChange(e, setName)}
            />
          </div>

          {/* Birthday Input */}
          <div>
            <div className="text-base mb-2">생일</div>
            <Button
              variant="outline"
              onClick={handleShowCalendar}
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-5 w-5 shrink-0" />
              {birthday ? (
                format(birthday, "yyyy.MM.dd", { locale: ko })
              ) : (
                <span className="text-muted-foreground/70">생일을 알려주세요!</span>
              )}
            </Button>
          </div>
        </div>

        {/* Settings Section */}
        <div className="space-y-4">
          {/* Color Vision Setting */}
          <div className="flex flex-col gap-2">
            <span className="text-base">색맹/색약</span>
            <CustomDropdown
              value={colorVision}
              options={colorVisionOptions}
              onChange={setColorVision}
              className="w-full h-10"
              buttonClassName="w-full h-10 flex items-center justify-between px-3 py-2 text-base border border-input bg-background rounded-md"
              dropdownClassName="w-full"
            />
          </div>

          {/* Font Size Setting */}
          <div className="flex flex-col gap-2">
            <span className="text-base">폰트 크기</span>
            <CustomDropdown
              value={fontSize}
              options={fontSizeOptions}
              onChange={setFontSize}
              className="w-full h-10"
              buttonClassName="w-full h-10 flex items-center justify-between px-3 py-2 text-base border border-input bg-background rounded-md"
              dropdownClassName="w-full"
            />
          </div>
        </div>

        {/* Measurement Type Selection - With bidirectional scroll hints */}
        <div className="flex flex-col gap-4">
          <div className="relative">
            {/* Remove rounded-lg from outer container and add padding to create space for hints */}
            <div className="px-[2px]">
              <div
                ref={tabsContainerRef}
                className={`
                  flex flex-row gap-2
                  overflow-x-auto
                  scrollbar-none
                  py-1
                  scroll-smooth
                  px-1
                  relative
                `}
              >
                {MEASUREMENT_TYPES.map((type) => (
                  <button
                    type="button"
                    key={type}
                    className={`
                      shrink-0 basis-auto
                      min-w-[5.5rem]
                      py-2.5 px-4
                      text-base rounded-lg transition-colors
                      ${
                        measurementType === type
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      }
                    `}
                    onClick={() => setMeasurementType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Left scroll hint */}
            <div
              className={`
                absolute left-0 top-0 bottom-0
                w-14
                transition-opacity duration-300
                z-20
                ${leftHintVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
              `}
            >
              <div className="absolute inset-0" aria-hidden="true" />
              <button
                type="button"
                onClick={scrollToStart}
                className={`
                  relative
                  w-full h-full
                  flex items-center justify-center
                  bg-gradient-to-r from-background/80 via-background/40 to-transparent
                  backdrop-blur-[1px]
                  text-muted-foreground hover:text-foreground
                  transition-colors
                `}
                aria-label="처음으로 스크롤"
              >
                <LuChevronsLeft className="w-5 h-5 animate-pulse" />
              </button>
            </div>

            {/* Right scroll hint */}
            <div
              className={`
                absolute right-0 top-0 bottom-0
                w-14
                transition-opacity duration-300
                z-20
                ${rightHintVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
              `}
            >
              <div className="absolute inset-0" aria-hidden="true" />
              <button
                type="button"
                onClick={scrollToEnd}
                className={`
                  relative
                  w-full h-full
                  flex items-center justify-center
                  bg-gradient-to-l from-background/80 via-background/40 to-transparent
                  backdrop-blur-[1px]
                  text-muted-foreground hover:text-foreground
                  transition-colors
                `}
                aria-label="끝으로 스크롤"
              >
                <LuChevronsRight className="w-5 h-5 animate-pulse" />
              </button>
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full py-3 text-base"
              onClick={handleShowAddDialog}
            >
              {measurementType} 추가
            </Button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {getCurrentList().map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 py-2.5 px-4 border rounded-lg bg-card"
                >
                  <div className="break-words flex-1 text-base">{item}</div>
                  <button
                    type="button"
                    className="text-muted hover:text-foreground p-1.5 rounded-full hover:bg-muted shrink-0"
                    onClick={() => {
                      const newList = getCurrentList().filter((_, i) => i !== index);
                      setCurrentList(newList);
                    }}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-2">
          <Button
            variant="outline"
            className="flex-1 py-3 text-base"
            onClick={() => {
              setName(currentMember.name || "");
              setBirthday(currentMember.birth ? new Date(currentMember.birth) : undefined);
              setColorVision(currentMember.color || "정상");
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
            className="flex-1 py-3 text-base bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
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
