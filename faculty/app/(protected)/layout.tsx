'use client';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import StoreProvider from '@/components/StoreProvider';
import { useGlobalStore } from '@/state';
import React, { useCallback, useEffect } from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const isDarkMode = useGlobalStore((state) => state.isDarkMode);

  const updateDarkMode = useCallback(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    updateDarkMode();
  }, [updateDarkMode]);

  return (
    <StoreProvider>
      <div className="flex min-h-screen w-full bg-gray-50 text-gray-900">
        <Sidebar />
        <main className="flex w-full flex-col bg-gray-50 dark:bg-dark-bg">
          <Navbar />
          {children}
        </main>
      </div>
    </StoreProvider>
  );
};

export default Layout;
