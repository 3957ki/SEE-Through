import React from "react";

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="w-full h-full flex items-center justify-between px-4 py-2">
      <h1 className="text-xl font-bold text-foreground">{title}</h1>
      {children}
    </div>
  );
}
