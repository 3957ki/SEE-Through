import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CustomDropdownProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  optionClassName?: string;
}

export function CustomDropdown({
  value,
  options,
  onChange,
  placeholder = "선택",
  className = "",
  buttonClassName = "",
  dropdownClassName = "",
  optionClassName = "",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-2 py-1 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md",
          buttonClassName
        )}
      >
        <span>{value || placeholder}</span>
        <ChevronDown className="h-4 w-4 ml-1" />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-full bg-white dark:bg-slate-900 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 max-h-60 overflow-auto",
            dropdownClassName
          )}
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleOptionSelect(option)}
              className={cn(
                "w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800",
                option === value && "bg-slate-100 dark:bg-slate-800 font-medium",
                optionClassName
              )}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
