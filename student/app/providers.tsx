'use client';

import { setupRefreshTokenInterceptor } from '@/lib/refreshTokenHandler';
import { CssBaseline } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import ThemeRegistry from './ThemeRegistry';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Create a client for React Query
  const [queryClient] = useState(() => new QueryClient());

  // Set up token refresh interceptor on mount
  useEffect(() => {
    setupRefreshTokenInterceptor();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouterCacheProvider>
        <ThemeRegistry>
          <CssBaseline />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#00b300',
                },
              },
              error: {
                style: {
                  background: '#e11d48',
                },
              },
            }}
          />
        </ThemeRegistry>
      </AppRouterCacheProvider>
    </QueryClientProvider>
  );
}
