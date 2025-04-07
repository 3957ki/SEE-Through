import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ ...props }: CalendarProps) {
  return (
    <div className="flex justify-center">
      <DayPicker
        animate
        locale={ko}
        showOutsideDays
        captionLayout="dropdown"
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
        }}
        {...props}
      />
    </div>
  );
}
