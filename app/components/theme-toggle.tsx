"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/app/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Flips only after client mount, to avoid an SSR/CSR hydration mismatch on the icon.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant bg-surface-container text-on-surface transition-colors duration-200 hover:bg-surface-container-high"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
