import { useCurrentMember } from "@/queries/members";
import { createContext, ReactNode, use, useMemo } from "react";

// Define theme types
interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  border: string;
}

interface Theme {
  colors: ThemeColors;
  fontSize: string;
}

interface ThemeContextType {
  theme: Theme;
}

// Create the context
const ThemeContext = createContext<ThemeContextType | null>(null);

// Define color schemes
const normalColors: ThemeColors = {
  primary: "#FF6B00",
  secondary: "#FFB800",
  background: "#FFFFFF",
  text: "#1A1A1A",
  border: "#E5E5E5",
};

// Deuteranopia (red-green color blindness) friendly colors
const colorBlindColors: ThemeColors = {
  primary: "#0077BB", // Blue - easily distinguishable
  secondary: "#DDAA00", // Yellow - visible to most colorblind people
  background: "#FFFFFF",
  text: "#1A1A1A",
  border: "#E5E5E5",
};

// Theme provider component
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data: currentMember } = useCurrentMember();

  const theme = useMemo(() => {
    const isColorBlind = currentMember?.color === "색맹";
    const colors = isColorBlind ? colorBlindColors : normalColors;
    const fontSize = currentMember?.font_size || "16px";

    return {
      colors,
      fontSize,
    };
  }, [currentMember]);

  return <ThemeContext value={{ theme }}>{children}</ThemeContext>;
}

// Custom hook to use theme
export function useTheme() {
  const context = use(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context.theme;
}
