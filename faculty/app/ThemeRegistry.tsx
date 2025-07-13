'use client';

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { useServerInsertedHTML } from 'next/navigation';
import { useEffect, useState } from 'react';
import theme, { getTheme } from '../theme';

import { createContext, useContext } from 'react';

interface ThemeContextType {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

export const ThemeContext = createContext<ThemeContextType>({
  toggleTheme: () => {},
  isDarkMode: false,
});

export const useThemeToggle = () => useContext(ThemeContext);

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(theme);

  // Initialize the theme based on localStorage or system preference
  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode');
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;

    const shouldUseDarkMode =
      savedMode === 'dark' || (!savedMode && prefersDark);

    if (shouldUseDarkMode) {
      setIsDarkMode(true);
      setCurrentTheme(getTheme('dark'));
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem('theme-mode', newMode ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', newMode);
      setCurrentTheme(getTheme(newMode ? 'dark' : 'light'));
      return newMode;
    });
  };

  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: 'mui' });
    cache.compat = true;

    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };

    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };

    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }

    let styles = '';
    for (const name of names) {
      styles += cache.inserted[name];
    }

    return (
      <style
        key="emotion-style"
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  // Provide the theme context with toggle function
  const themeContextValue = {
    toggleTheme,
    isDarkMode,
  };

  return (
    <CacheProvider value={cache}>
      <ThemeContext.Provider value={themeContextValue}>
        <ThemeProvider theme={currentTheme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ThemeContext.Provider>
    </CacheProvider>
  );
}
