import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GlobalState {
  isSidebarCollapsed: boolean;
  isDarkMode: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  setIsDarkMode: (darkMode: boolean) => void;
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      isDarkMode: false,
      setIsSidebarCollapsed: (collapsed) =>
        set({ isSidebarCollapsed: collapsed }),
      setIsDarkMode: (darkMode) => set({ isDarkMode: darkMode }),
    }),
    {
      name: 'global',
    },
  ),
);
