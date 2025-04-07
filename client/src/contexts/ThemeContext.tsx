import { useCurrentMember } from "@/queries/members";
import { createContext, use, useEffect, useMemo, useState, type ReactNode } from "react";

// Define theme types
export type ThemeType = "default" | "orange-theme" | "colorblind-theme";

// Define font size types
export type FontSizeType = "font-small" | "font-regular" | "font-large";

// Theme context type
type ThemeContextType = {
  theme: ThemeType;
  fontSize: FontSizeType;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
};

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Get current member's preferences
  const { data: currentMember } = useCurrentMember();

  useEffect(() => {
    if (currentMember) {
      console.log("[ThemeProvider] currentMember updated:", currentMember);
    }
  }, [currentMember]);

  // Initialize to light mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Calculate theme based on currentMember color
  const theme = useMemo<ThemeType>(() => {
    console.log("[ThemeProvider] Calculating theme for:", currentMember?.color);
    if (currentMember?.color === "색맹") return "colorblind-theme";
    if (currentMember?.color) return "orange-theme";
    return "default";
  }, [currentMember]);

  // Calculate font size based on currentMember font_size
  const fontSize = useMemo<FontSizeType>(() => {
    console.log("[ThemeProvider] Calculating fontSize for:", currentMember?.font_size);
    if (!currentMember?.font_size) return "font-regular";

    switch (currentMember.font_size) {
      case "작게":
        return "font-small";
      case "크게":
        return "font-large";
      default:
        return "font-regular"; // "보통" is the default
    }
  }, [currentMember]);

  // Apply theme class to document root
  useEffect(() => {
    // Remove all theme classes first
    document.documentElement.classList.remove("default", "orange-theme", "colorblind-theme");

    // Add current theme class if not default
    if (theme !== "default") {
      document.documentElement.classList.add(theme);
    }
  }, [theme]);

  // Apply font size class to document root
  useEffect(() => {
    // Remove all font size classes first
    document.documentElement.classList.remove("font-small", "font-regular", "font-large");

    // Add current font size class
    document.documentElement.classList.add(fontSize);
  }, [fontSize]);

  // Apply dark mode class to document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Toggle dark mode function
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Create context value
  const contextValue = useMemo(
    () => ({
      theme,
      fontSize,
      isDarkMode,
      toggleDarkMode,
    }),
    [theme, fontSize, isDarkMode]
  );

  // Use React 19 context syntax
  return <ThemeContext value={contextValue}>{children}</ThemeContext>;
}

// Custom hook for using theme context with React 19 'use' function
export function useTheme() {
  const context = use(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
