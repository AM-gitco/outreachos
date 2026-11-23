"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light");
  const transitionTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Apply theme with smooth transition class
  const applyThemeToDOM = React.useCallback((targetTheme: Theme, withTransition: boolean = false) => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const isDark = targetTheme === "dark" || (targetTheme === "system" && media.matches);

    if (withTransition) {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
      root.classList.add("theme-transition");
      if (isDark) {
        root.classList.add("dark");
        setResolvedTheme("dark");
      } else {
        root.classList.remove("dark");
        setResolvedTheme("light");
      }
      transitionTimerRef.current = setTimeout(() => {
        root.classList.remove("theme-transition");
      }, 350);
    } else {
      if (isDark) {
        root.classList.add("dark");
        setResolvedTheme("dark");
      } else {
        root.classList.remove("dark");
        setResolvedTheme("light");
      }
    }
  }, []);

  // Initial load from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem("outreachos-theme") as Theme | null;
    const initial = saved || "system";
    setThemeState(initial);
    applyThemeToDOM(initial, false);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      const current = (localStorage.getItem("outreachos-theme") as Theme | null) || "system";
      if (current === "system") {
        applyThemeToDOM("system", true);
      }
    };
    media.addEventListener("change", listener);
    return () => {
      media.removeEventListener("change", listener);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, [applyThemeToDOM]);

  const setTheme = (newTheme: Theme) => {
    applyThemeToDOM(newTheme, true);
    setThemeState(newTheme);
    localStorage.setItem("outreachos-theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
