import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  /**
   * Optional padding control
   * If true (default), section has standard padding
   * If false, no padding is applied
   */
  withPadding?: boolean;
}

export function Section({ children, className, id, withPadding = true, ...props }: SectionProps) {
  return (
    <section id={id} className={cn("relative", withPadding && "py-3", className)} {...props}>
      {children}
    </section>
  );
}

interface SectionTitleProps {
  children: ReactNode;
  className?: string;
  /**
   * Icon component to display next to the title
   */
  icon?: ReactNode;
  /**
   * Optional action component to display at the right side
   */
  action?: ReactNode;
  /**
   * Optional subtitle to display beneath the title
   */
  subtitle?: string;
}

export function SectionTitle({
  children,
  className,
  icon,
  action,
  subtitle,
  ...props
}: SectionTitleProps) {
  return (
    <div className={cn("px-4 mb-3 flex justify-between items-center", className)} {...props}>
      <div className="flex items-center gap-1">
        {icon && <span className="text-gray-600">{icon}</span>}
        <h2 className="text-lg font-medium flex items-center gap-1">{children}</h2>
      </div>

      {action && <div className="flex items-center">{action}</div>}
    </div>
  );
}

export function SectionContent({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-4", className)} {...props}>
      {children}
    </div>
  );
}

/**
 * A visual divider to separate sections
 */
export function SectionDivider({ className, ...props }: { className?: string }) {
  return <div className={cn("h-2 bg-gray-50 my-3 w-full", className)} {...props} />;
}
