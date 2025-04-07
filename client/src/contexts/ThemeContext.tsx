import { useCurrentMember } from "@/queries/members";
import React, { createContext, use, useEffect, useState } from "react";

// Define theme types
export type ThemeType = "default" | "orange-theme" | "colorblind-theme";

// Theme context type
type ThemeContextType = {
  theme: ThemeType;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
};

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Get current member's color preference
  const { data: currentMember } = useCurrentMember();

  // Initialize theme based on currentMember's color attribute
  const [theme, setTheme] = useState<ThemeType>(() => {
    // Default to localStorage if no currentMember
    if (!currentMember?.color) {
      const savedTheme = localStorage.getItem("theme");
      return (savedTheme as ThemeType) || "default";
    }

    // Map member color preference to theme
    return currentMember.color === "색맹" ? "colorblind-theme" : "orange-theme";
  });

  // Initialize to light mode, but keep the dark mode toggle functionality
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Update theme when currentMember changes
  useEffect(() => {
    if (currentMember?.color) {
      setTheme(currentMember.color === "색맹" ? "colorblind-theme" : "orange-theme");
    }
  }, [currentMember?.color]);

  // Update the theme class on the document element
  useEffect(() => {
    // Remove all theme classes
    document.documentElement.classList.remove("default", "orange-theme", "colorblind-theme");

    // Add the current theme class
    if (theme !== "default") {
      document.documentElement.classList.add(theme);
    }

    // Save to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Update dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Save to localStorage
    localStorage.setItem("darkMode", isDarkMode.toString());
  }, [isDarkMode]);

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return <ThemeContext value={{ theme, isDarkMode, toggleDarkMode }}>{children}</ThemeContext>;
}

// Hook for using theme context
export function useTheme() {
  const context = use(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
