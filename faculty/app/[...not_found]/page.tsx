'use client';

import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';

export default function NotFoundCatchAll() {
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
        404
      </Typography>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Trang không tồn tại
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Đường dẫn bạn đang truy cập không tồn tại trong hệ thống.
      </Typography>
      <Link href="/" passHref>
        <Button variant="contained" color="primary">
          Về trang chủ
        </Button>
      </Link>
    </Box>
  );
}
