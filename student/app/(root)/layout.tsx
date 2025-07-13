'use client';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useGlobalStore } from '@/state';
import React, { useEffect } from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarCollapsed = useGlobalStore(
    (state) => state.isSidebarCollapsed,
  );
  const isDarkMode = useGlobalStore((state) => state.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  });

  return (
    <div className="flex min-h-screen w-full bg-gray-50 text-gray-900">
      <Sidebar />
      <main
        className={`flex w-full flex-col bg-gray-50 dark:bg-dark-bg ${
          isSidebarCollapsed ? '' : 'md:pl-64'
        }`}
      >
        <Navbar />
        {children}
      </main>
    </div>
  );
};

export default Layout;
