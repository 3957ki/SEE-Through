import { cn } from "@/lib/utils";

interface PinInputProps {
  pin: string;
  error?: boolean;
  onNumberClick: (number: number) => void;
  onDelete: () => void;
  disabled?: boolean;
}

export default function PinInput({ pin, error, onNumberClick, onDelete, disabled }: PinInputProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* PIN Display */}
      <div className="flex gap-3 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-200",
              error ? "animate-shake" : "",
              pin[i] ? "bg-primary" : "bg-border"
            )}
          />
        ))}
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "delete"].map((num) => {
          if (num === null) return <div key="empty" />;

          return (
            <button
              type="button"
              key={num}
              onClick={() => (num === "delete" ? onDelete() : onNumberClick(num as number))}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center text-xl font-medium",
                "transition-colors duration-200 bg-background text-foreground border border-border",
                error ? "animate-shake" : ""
              )}
              disabled={disabled}
            >
              {num === "delete" ? "←" : num}
            </button>
          );
        })}
      </div>
    </div>
  );
}
