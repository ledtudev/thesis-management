'use client';

import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useEffect, useState } from 'react';

export function ThemeProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  // Check for saved theme preference or system preference
  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode');
    if (savedMode === 'dark' || savedMode === 'light') {
      setMode(savedMode);
      document.documentElement.classList.toggle('dark', savedMode === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setMode('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  //   // Toggle theme function
  //   const toggleTheme = () => {
  //     const newMode = mode === 'light' ? 'dark' : 'light';
  //     setMode(newMode);
  //     localStorage.setItem('theme-mode', newMode);
  //     document.documentElement.classList.toggle('dark', newMode === 'dark');
  //   };

  // Create theme based on mode
  const theme = createTheme({
    palette: {
      mode,
      ...(mode === 'dark'
        ? {
            // Dark mode palette
            primary: {
              main: '#90caf9', // Lighter blue in dark mode
            },
            secondary: {
              main: '#ce93d8',
            },
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
            text: {
              primary: '#e0e0e0',
              secondary: '#aaaaaa',
            },
          }
        : {
            // Light mode palette - default MUI light theme
          }),
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body:
            mode === 'dark'
              ? {
                  scrollbarColor: '#6b6b6b #2b2b2b',
                  '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                    backgroundColor: '#2b2b2b',
                  },
                  '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                    borderRadius: 8,
                    backgroundColor: '#6b6b6b',
                    minHeight: 24,
                    border: '3px solid #2b2b2b',
                  },
                  '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus':
                    {
                      backgroundColor: '#959595',
                    },
                  '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active':
                    {
                      backgroundColor: '#959595',
                    },
                  '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover':
                    {
                      backgroundColor: '#959595',
                    },
                  '&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner':
                    {
                      backgroundColor: '#2b2b2b',
                    },
                }
              : {},
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

// Custom hook to access theme toggle
export const useThemeToggle = () => {
  // In a real implementation, you would use React Context
  // This is a placeholder implementation
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    const newMode = isDark ? 'light' : 'dark';
    localStorage.setItem('theme-mode', newMode);
    document.documentElement.classList.toggle('dark', newMode === 'dark');
    window.location.reload(); // Force reload to apply theme changes
  };

  const isDarkMode = document.documentElement.classList.contains('dark');

  return { toggleTheme, isDarkMode };
};
