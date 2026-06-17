"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  ThemeId,
  isThemeId,
} from "@/lib/themes";

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);

  // Beim Mount aus dem DOM/Storage übernehmen (das Inline-Script in layout
  // hat data-theme bereits vor dem Paint gesetzt).
  useEffect(() => {
    const fromDom = document.documentElement.dataset.theme;
    if (isThemeId(fromDom)) {
      setThemeState(fromDom);
      return;
    }
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (isThemeId(stored)) setThemeState(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  return { theme, setTheme };
}
