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

  // Generate years from 1900 to current year in ascending order
  const maxYear = new Date().getFullYear();
  const years = Array.from({ length: maxYear - 1900 + 1 }, (_, i) => 1900 + i);

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

  // Custom navigation component
  const CustomNavigation = () => (
    <div className="flex items-center justify-between px-1 mb-4 relative z-10">
      <button
        type="button"
        onClick={handlePrevMonth}
        className="p-1 hover:bg-accent hover:text-accent-foreground rounded-full"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex">
        {/* Year Dropdown */}
        <CustomDropdown
          value={format(currentMonth, "yyyy년", { locale: ko })}
          options={years.map((year) => `${year}년`)}
          onChange={handleYearSelect}
          className="w-24"
          buttonClassName="px-2 py-2 text-base font-bold bg-background hover:bg-accent hover:text-accent-foreground rounded-md flex items-center justify-center"
          dropdownClassName="w-24 bg-popover shadow-md max-h-[200px] overflow-y-auto"
          optionClassName="text-center text-base hover:bg-accent hover:text-accent-foreground"
        />

        {/* Month Dropdown */}
        <CustomDropdown
          value={format(currentMonth, "MMMM", { locale: ko })}
          options={months.map((month) => format(month, "MMMM", { locale: ko }))}
          onChange={handleMonthSelect}
          className="w-16"
          buttonClassName="px-2 py-2 text-base font-bold bg-background hover:bg-accent hover:text-accent-foreground rounded-md flex items-center justify-center"
          dropdownClassName="w-16 bg-popover shadow-md"
          optionClassName="text-center text-base hover:bg-accent hover:text-accent-foreground"
        />
      </div>

      <button
        type="button"
        onClick={handleNextMonth}
        className="p-1 hover:bg-accent hover:text-accent-foreground rounded-full"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      <CustomNavigation />
      <div className="mt-[-4rem]">
        <DayPicker
          animate
          locale={ko}
          showOutsideDays
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          formatters={{
            formatCaption: () => "", // Empty caption to hide the default one
          }}
          modifiersClassNames={{
            selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            today: "bg-accent text-accent-foreground",
          }}
          classNames={{
            month: "space-y-4",
            day: cn(
              "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors",
              "focus-visible:bg-accent focus-visible:text-accent-foreground",
              "[&:not(.[data-selected])]:hover:bg-accent [&:not(.[data-selected])]:hover:text-accent-foreground",
              "[&[data-selected]]:bg-primary [&[data-selected]]:text-primary-foreground"
            ),
            caption: "hidden", // Hide the default caption
            nav: "hidden", // Hide the default navigation
            nav_button: "hidden", // Hide the default navigation buttons
            nav_button_previous: "hidden", // Hide the previous button
            nav_button_next: "hidden", // Hide the next button,
            head_cell: "text-muted-foreground font-normal text-sm",
            cell: "p-0 relative [&:has([aria-selected])]:bg-transparent",
            day_today: "bg-accent text-accent-foreground",
            day_selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          }}
          {...props}
        />
      </div>
    </div>
  );
}
