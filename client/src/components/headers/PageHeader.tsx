import React from "react";
import { IconType } from "react-icons";

interface PageHeaderProps {
  icon?: IconType;
  title?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ icon: Icon, title, children }: PageHeaderProps) {
  return (
    <div className="w-full h-full flex items-center justify-between px-4 bg-background/95 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
      {title && (
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-6 h-6 text-muted-foreground" />}
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
        </div>
      )}
      {children}
    </div>
  );
}
