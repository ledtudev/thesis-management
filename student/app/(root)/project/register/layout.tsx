'use client';

import type React from 'react';

import {
  Box,
  Container,
  Paper,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Import the summary component with dynamic loading to avoid SSR issues with authentication
// const RegistrationSummary = dynamic(
//   () => import('./_component/RegistrationSummary'),
//   { ssr: false },
// );

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const pathname = usePathname();
  // const isOverviewPage = pathname.endsWith('/overview');
  // const shouldShowSummary = !isOverviewPage;

  useEffect(() => {
    if (pathname === '/guideline' || pathname === '/') {
      setActiveTab(0);
    } else if (pathname.includes('/theme')) {
      setActiveTab(1);
    } else if (pathname.includes('/supervisor')) {
      setActiveTab(2);
    } else if (pathname.includes('/overview')) {
      setActiveTab(3);
    }
  }, [pathname]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);

    if (newValue === 0) {
      router.push('/project/register/guideline');
    } else if (newValue === 1) {
      router.push('/project/register/theme');
    } else if (newValue === 2) {
      router.push('/project/register/supervisor');
    } else if (newValue === 3) {
      router.push('/project/register/overview');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        fontWeight="bold"
        sx={{
          mb: 4,
          textAlign: { xs: 'center', md: 'left' },
          color: theme.palette.primary.main,
          fontFamily: "'Roboto', sans-serif",
        }}
      >
        Cổng Đăng Ký Đề Tài
      </Typography>

      {/* {shouldShowSummary && <RegistrationSummary />} */}

      <Paper
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          mb: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? 'fullWidth' : 'standard'}
            centered={!isMobile}
            sx={{
              background: theme.palette.background.default,
              '& .MuiTab-root': {
                fontWeight: 'medium',
                py: 2,
                fontSize: { xs: '0.875rem', md: '1rem' },
              },
              '& .Mui-selected': {
                fontWeight: 'bold',
              },
            }}
          >
            <Tab label="Hướng dẫn nhanh" />
            <Tab label="Lĩnh Vực Đề Tài" />
            <Tab label="Chọn Giảng Viên" />
            <Tab label="Trạng Thái Đăng Ký" />
          </Tabs>
        </Box>

        <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>
      </Paper>
    </Container>
  );
}
