'use client';

import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';
import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
      }}
    >
      <Typography
        variant="h1"
        sx={{ fontSize: '6rem', fontWeight: 'bold', mb: 2 }}
      >
        Lỗi
      </Typography>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Đã xảy ra lỗi
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Xin lỗi, đã có lỗi xảy ra khi xử lý yêu cầu của bạn.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={reset}>
          Thử lại
        </Button>
        <Link href="/" passHref>
          <Button variant="outlined">Về trang chủ</Button>
        </Link>
      </Box>
    </Box>
  );
}
