"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Theme = "dark" | "light";

// --- theme tokens (CSS variables, swapped on the root) ----------------------
export const THEMES: Record<Theme, Record<string, string>> = {
  dark: {
    "--bg": "#0A0B0D",
    "--panel": "#101216",
    "--panel-2": "#15171C",
    "--line": "#23262E",
    "--fg": "#FFFFFF",
    "--fg-2": "rgba(255,255,255,0.72)",
    "--fg-3": "rgba(255,255,255,0.48)",
    "--fg-4": "rgba(255,255,255,0.30)",
    "--accent": "#FFC93C",
    "--accent-ink": "#0A0B0D",
    "--accent-text": "#FFD66B",
    "--coral": "#FF5C46",
    "--err-bg": "#1E1311",
    "--err-line": "#43201A",
    "--err-fg": "#FF9E80",
  },
  light: {
    "--bg": "#F6F4EE",
    "--panel": "#FFFFFF",
    "--panel-2": "#F1EEE5",
    "--line": "#E5E1D6",
    "--fg": "#141519",
    "--fg-2": "rgba(20,21,25,0.74)",
    "--fg-3": "rgba(20,21,25,0.54)",
    "--fg-4": "rgba(20,21,25,0.40)",
    "--accent": "#FFC93C",
    "--accent-ink": "#0A0B0D",
    "--accent-text": "#A86A00",
    "--coral": "#E0452F",
    "--err-bg": "#FCEDEA",
    "--err-line": "#F3C9BF",
    "--err-fg": "#B23A1E",
  },
};

type Ctx = { theme: Theme; toggle: () => void };
const ThemeCtx = createContext<Ctx>({ theme: "dark", toggle: () => {} });

export const useTheme = () => useContext(ThemeCtx);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>("dark");

  // restore saved / system preference after mount (avoids hydration mismatch)
  useEffect(() => {
    const saved = localStorage.getItem("mw-theme");
    if (saved === "light" || saved === "dark") setTheme(saved);
    else if (window.matchMedia?.("(prefers-color-scheme: light)").matches)
      setTheme("light");
  }, []);

  const toggle = useCallback(
    () =>
      setTheme((t) => {
        const next = t === "dark" ? "light" : "dark";
        localStorage.setItem("mw-theme", next);
        return next;
      }),
    [],
  );

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      <div
        className="flex min-h-screen flex-col overflow-x-hidden antialiased transition-colors duration-300"
        style={
          {
            ...THEMES[theme],
            background: "var(--bg)",
            color: "var(--fg)",
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </ThemeCtx.Provider>
  );
};
