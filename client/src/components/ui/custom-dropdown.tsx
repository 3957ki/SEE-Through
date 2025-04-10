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
  const selectedOptionRef = useRef<HTMLButtonElement>(null);
  const dropdownListRef = useRef<HTMLDivElement>(null);

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

  // Scroll to selected option when dropdown opens
  useEffect(() => {
    if (isOpen && selectedOptionRef.current && dropdownListRef.current) {
      const dropdownList = dropdownListRef.current;
      const selectedOption = selectedOptionRef.current;

      // Calculate the scroll position to center the selected option
      const scrollTop =
        selectedOption.offsetTop - dropdownList.clientHeight / 2 + selectedOption.clientHeight / 2;

      dropdownList.scrollTop = Math.max(0, scrollTop);
    }
  }, [isOpen]);

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
          "flex items-center justify-between w-full px-2 py-1 text-sm font-medium bg-background hover:bg-accent hover:text-accent-foreground rounded-md",
          buttonClassName
        )}
      >
        <span>{value || placeholder}</span>
        <ChevronDown className="h-4 w-4 ml-1" />
      </button>

      {isOpen && (
        <div
          ref={dropdownListRef}
          className={cn(
            "absolute z-50 mt-1 w-full bg-popover text-popover-foreground rounded-md shadow-md max-h-60 overflow-auto",
            dropdownClassName
          )}
        >
          {options.map((option) => (
            <button
              key={option}
              ref={option === value ? selectedOptionRef : null}
              type="button"
              onClick={() => handleOptionSelect(option)}
              className={cn(
                "w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                option === value && "bg-accent text-accent-foreground font-medium",
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
