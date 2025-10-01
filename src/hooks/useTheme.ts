import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'habit-tracker-theme';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return (stored as Theme) || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
};
