'use client';

import { useAuthStore } from '@/state/authStore';
import { Assignment, CheckCircle, People, Schedule } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';

export default function LecturerDashboardPage() {
  const { user } = useAuthStore();

  // Mock data for now - in real app, you would fetch from API
  const stats = {
    totalProjects: 5,
    activeProjects: 3,
    completedProjects: 2,
    totalStudents: 8,
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard Giảng viên
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Chào mừng {user?.fullName || 'Giảng viên'}
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Assignment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color="primary">
                      {stats.totalProjects}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tổng đồ án
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <Schedule />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color="warning.main">
                      {stats.activeProjects}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Đồ án đang thực hiện
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <CheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color="success.main">
                      {stats.completedProjects}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Đồ án hoàn thành
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <People />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color="info.main">
                      {stats.totalStudents}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sinh viên hướng dẫn
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Additional Info */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Thông tin cá nhân
                </Typography>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Họ tên:</Typography>
                    <Typography fontWeight="bold">
                      {user?.fullName || 'Chưa cập nhật'}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Email:</Typography>
                    <Typography fontWeight="bold">
                      {user?.email || 'Chưa cập nhật'}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Mã giảng viên:</Typography>
                    <Typography fontWeight="bold">
                      {user?.facultyCode || 'Chưa cập nhật'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Hoạt động gần đây
                </Typography>
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    • Chưa có hoạt động nào gần đây
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Hệ thống sẽ cập nhật khi có dữ liệu
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
}
