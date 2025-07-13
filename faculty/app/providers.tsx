'use client';

import { CssBaseline } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { setupRefreshTokenInterceptor } from '../lib/refreshTokenHandler';
import ThemeRegistry from './ThemeRegistry';

export default function Providers({ children }: { children: React.ReactNode }) {
  // const router = useRouter();
  // const pathname = usePathname();
  // const { isAuthenticated } = useAuthStore();

  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    setupRefreshTokenInterceptor();
  }, []);

  // useEffect(() => {
  //   if (pathname === '/auth/login' && isAuthenticated === true) {
  //     router.push('/');
  //   }
  // }, [pathname, isAuthenticated, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouterCacheProvider>
        <ThemeRegistry>
          <CssBaseline />
          {children}
        </ThemeRegistry>
      </AppRouterCacheProvider>
    </QueryClientProvider>
  );
}
