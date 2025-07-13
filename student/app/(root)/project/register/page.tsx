'use client';

import { Box, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the overview page which shows enrollment status
    router.push('/project/register/overview');
  }, [router]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
      <CircularProgress />
    </Box>
  );
}
