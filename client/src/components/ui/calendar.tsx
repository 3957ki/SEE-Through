import { cn } from "@/lib/utils";
import { addMonths, format, isSameMonth, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ ...props }: CalendarProps) {
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(props.defaultMonth || new Date());

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
        setIsMonthDropdownOpen(false);
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
        setIsYearDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Generate months for dropdown
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentMonth.getFullYear(), i, 1);
    return date;
  });

  // Generate years for dropdown (current year ± 10 years)
  const currentYear = currentMonth.getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const handlePrevMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    if (props.onMonthChange) {
      props.onMonthChange(newMonth);
    }
  };

  const handleNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    if (props.onMonthChange) {
      props.onMonthChange(newMonth);
    }
  };

  const handleMonthSelect = (month: Date) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(month.getMonth());
    setCurrentMonth(newMonth);
    if (props.onMonthChange) {
      props.onMonthChange(newMonth);
    }
    setIsMonthDropdownOpen(false);
  };

  const handleYearSelect = (year: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setFullYear(year);
    setCurrentMonth(newMonth);
    if (props.onMonthChange) {
      props.onMonthChange(newMonth);
    }
    setIsYearDropdownOpen(false);
  };

  // Custom caption component
  const CustomCaption = () => (
    <div className="flex items-center justify-between px-1">
      <button
        type="button"
        onClick={handlePrevMonth}
        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex gap-1">
        {/* Year Dropdown */}
        <div className="relative" ref={yearDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setIsYearDropdownOpen(!isYearDropdownOpen);
              setIsMonthDropdownOpen(false);
            }}
            className="px-2 py-1 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
          >
            {format(currentMonth, "yyyy년", { locale: ko })}
          </button>

          {isYearDropdownOpen && (
            <div className="absolute z-50 mt-1 w-24 bg-white dark:bg-slate-900 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 max-h-60 overflow-auto">
              {years.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => handleYearSelect(year)}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800",
                    year === currentYear && "bg-slate-100 dark:bg-slate-800 font-medium"
                  )}
                >
                  {year}년
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Month Dropdown */}
        <div className="relative" ref={monthDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setIsMonthDropdownOpen(!isMonthDropdownOpen);
              setIsYearDropdownOpen(false);
            }}
            className="px-2 py-1 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
          >
            {format(currentMonth, "MMMM", { locale: ko })}
          </button>

          {isMonthDropdownOpen && (
            <div className="absolute z-50 mt-1 w-32 bg-white dark:bg-slate-900 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 max-h-60 overflow-auto">
              {months.map((month) => (
                <button
                  key={month.toISOString()}
                  type="button"
                  onClick={() => handleMonthSelect(month)}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800",
                    isSameMonth(month, currentMonth) && "bg-slate-100 dark:bg-slate-800 font-medium"
                  )}
                >
                  {format(month, "MMMM", { locale: ko })}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleNextMonth}
        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="flex justify-center">
      <DayPicker
        animate
        locale={ko}
        showOutsideDays
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        formatters={{
          formatCaption: (date) => {
            return format(date, "yyyy년 MMMM", { locale: ko });
          },
        }}
        classNames={{
          month: "space-y-4",
          day: cn(
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
          ),
          caption: "hidden", // Hide the default caption
        }}
        components={{
          CaptionLabel: CustomCaption,
        }}
        {...props}
      />
    </div>
  );
}
