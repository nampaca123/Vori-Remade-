'use client';
import { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';
type Layout = 'compact' | 'comfortable' | 'expanded';

interface ThemeContextType {
  theme: Theme;
  layout: Layout;
  setTheme: (theme: Theme) => void;
  setLayout: (layout: Layout) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [layout, setLayout] = useState<Layout>('comfortable');

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    } else {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }

    root.classList.remove('layout-compact', 'layout-comfortable', 'layout-expanded');
    root.classList.add(`layout-${layout}`);
  }, [theme, layout]);

  return (
    <ThemeContext.Provider value={{ theme, layout, setTheme, setLayout }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 