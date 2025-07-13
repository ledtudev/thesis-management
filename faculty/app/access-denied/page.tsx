'use client';

import { Box, Button, Container, Typography } from '@mui/material';
import { LockIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccessDeniedPage() {
  const router = useRouter();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          textAlign: 'center',
          py: 5,
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'error.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 4,
          }}
        >
          <LockIcon size={40} color="white" />
        </Box>

        <Typography variant="h4" gutterBottom fontWeight="bold">
          Không có quyền truy cập
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Bạn không có quyền truy cập vào nội dung này. Vui lòng liên hệ quản
          trị viên hoặc quay lại trang chủ.
        </Typography>

        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => router.back()}
            sx={{ borderRadius: 2 }}
          >
            Quay lại trang trước
          </Button>
          <Link href="/" passHref style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              color="primary"
              sx={{ borderRadius: 2 }}
            >
              Trở về trang chủ
            </Button>
          </Link>
        </Box>
      </Box>
    </Container>
  );
}
