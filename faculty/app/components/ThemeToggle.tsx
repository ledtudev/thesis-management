'use client';

import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { IconButton, Tooltip } from '@mui/material';
import { useThemeToggle } from '../ThemeRegistry';

export default function ThemeToggle() {
  const { toggleTheme, isDarkMode } = useThemeToggle();

  return (
    <Tooltip
      title={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
    >
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        size="large"
        sx={{
          transition: 'transform 0.3s',
          '&:hover': {
            transform: 'rotate(30deg)',
          },
        }}
      >
        {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
