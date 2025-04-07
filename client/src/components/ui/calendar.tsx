import { cn } from "@/lib/utils";
import { addMonths, format, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { CustomDropdown } from "./custom-dropdown";

type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ ...props }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(props.defaultMonth || new Date());

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

  const handleMonthSelect = (monthStr: string) => {
    const monthIndex = months.findIndex((m) => format(m, "MMMM", { locale: ko }) === monthStr);
    if (monthIndex !== -1) {
      const newMonth = new Date(currentMonth);
      newMonth.setMonth(monthIndex);
      setCurrentMonth(newMonth);
      if (props.onMonthChange) {
        props.onMonthChange(newMonth);
      }
    }
  };

  const handleYearSelect = (yearStr: string) => {
    const year = parseInt(yearStr.replace("년", ""), 10);
    if (!isNaN(year)) {
      const newMonth = new Date(currentMonth);
      newMonth.setFullYear(year);
      setCurrentMonth(newMonth);
      if (props.onMonthChange) {
        props.onMonthChange(newMonth);
      }
    }
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
        <CustomDropdown
          value={format(currentMonth, "yyyy년", { locale: ko })}
          options={years.map((year) => `${year}년`)}
          onChange={handleYearSelect}
          className="w-24"
          buttonClassName="px-2 py-1 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
          dropdownClassName="w-24"
        />

        {/* Month Dropdown */}
        <CustomDropdown
          value={format(currentMonth, "MMMM", { locale: ko })}
          options={months.map((month) => format(month, "MMMM", { locale: ko }))}
          onChange={handleMonthSelect}
          className="w-32"
          buttonClassName="px-2 py-1 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
          dropdownClassName="w-32"
        />
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
