import { viVN } from '@mui/material/locale';
import { PaletteMode, createTheme } from '@mui/material/styles';
import { Roboto } from 'next/font/google';

export const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

// Create a theme instance.
const getTheme = (mode: PaletteMode = 'light') =>
  createTheme(
    {
      palette: {
        mode,
        ...(mode === 'dark'
          ? {
              primary: {
                main: '#90caf9',
                light: '#e3f2fd',
                dark: '#42a5f5',
              },
              secondary: {
                main: '#ce93d8',
                light: '#f3e5f5',
                dark: '#ab47bc',
              },
              error: {
                main: '#f44336',
                light: '#e57373',
                dark: '#d32f2f',
              },
              warning: {
                main: '#ffa726',
                light: '#ffb74d',
                dark: '#f57c00',
              },
              info: {
                main: '#29b6f6',
                light: '#4fc3f7',
                dark: '#0288d1',
              },
              success: {
                main: '#66bb6a',
                light: '#81c784',
                dark: '#388e3c',
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
              // Light theme colors (unchanged)
              primary: {
                main: '#1976d2',
                light: '#42a5f5',
                dark: '#1565c0',
              },
              secondary: {
                main: '#9c27b0',
                light: '#ba68c8',
                dark: '#7b1fa2',
              },
              error: {
                main: '#d32f2f',
                light: '#ef5350',
                dark: '#c62828',
              },
              warning: {
                main: '#ed6c02',
                light: '#ff9800',
                dark: '#e65100',
              },
              info: {
                main: '#0288d1',
                light: '#03a9f4',
                dark: '#01579b',
              },
              success: {
                main: '#2e7d32',
                light: '#4caf50',
                dark: '#1b5e20',
              },
              background: {
                default: '#f5f5f5',
                paper: '#ffffff',
              },
            }),
      },
      typography: {
        fontFamily: roboto.style.fontFamily,
        button: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
      shape: {
        borderRadius: 8,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              boxShadow: 'none',
              '&:hover': {
                boxShadow:
                  mode === 'dark'
                    ? '0px 2px 4px rgba(255, 255, 255, 0.1)'
                    : '0px 2px 4px rgba(0, 0, 0, 0.1)',
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              boxShadow:
                mode === 'dark'
                  ? '0px 2px 4px rgba(255, 255, 255, 0.05)'
                  : '0px 2px 4px rgba(0, 0, 0, 0.05)',
              borderRadius: 12,
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              boxShadow:
                mode === 'dark'
                  ? '0px 2px 4px rgba(255, 255, 255, 0.05)'
                  : '0px 2px 4px rgba(0, 0, 0, 0.05)',
            },
          },
        },
        MuiCssBaseline: {
          styleOverrides: {
            body:
              mode === 'dark'
                ? {
                    scrollbarColor: '#6b6b6b #2b2b2b',
                    '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                      backgroundColor: '#2b2b2b',
                    },
                    '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb':
                      {
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
    },
    viVN, // Vietnamese locale
  );

// Default export for light theme
const theme = getTheme('light');

export { getTheme };
export default theme;
