import { PageType } from "@/interfaces/PageType";
import { createContext, use } from "react";

export interface PageContextType {
  currentPage: PageType;
  navigateTo: (page: PageType) => void;
}

export const PageContext = createContext<PageContextType | undefined>(undefined);

export function usePage() {
  const context = use(PageContext);
  if (context === undefined) {
    throw new Error("usePage must be used within a PageProvider");
  }
  return context;
}
