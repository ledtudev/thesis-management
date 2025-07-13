'use client';

import { Box, Typography } from '@mui/material';

export default function LecturerDashboardPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Trang Quản Lý Giảng Viên
      </Typography>
      <Typography variant="body1">
        Chào mừng bạn đến với trang quản lý cá nhân. Tại đây, bạn có thể quản lý
        các khóa học, nghiên cứu và sinh viên của mình.
      </Typography>
      {/* Thêm các thành phần dashboard khác ở đây */}
    </Box>
  );
}
