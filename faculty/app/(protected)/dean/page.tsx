'use client';

import { Box, Typography } from '@mui/material';

export default function DeanDashboardPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Trang Quản Lý Trưởng Khoa
      </Typography>
      <Typography variant="body1">
        Chào mừng bạn đến với trang quản lý dành cho Trưởng khoa. Tại đây, bạn
        có thể quản lý các hoạt động của khoa.
      </Typography>
    </Box>
  );
}
