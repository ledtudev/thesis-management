'use client';

import { useAuthStore } from '@/state/authStore';
import {
  Assignment,
  CheckCircle,
  Group,
  People,
  Schedule,
  TrendingUp,
} from '@mui/icons-material';
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

export default function HeadDashboardPage() {
  const { user } = useAuthStore();

  // Mock data for now - in real app, you would fetch from API
  const stats = {
    totalProjects: 15,
    activeProjects: 8,
    completedProjects: 7,
    totalLecturers: 5,
    totalStudents: 25,
    pendingApprovals: 3,
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard Trưởng Bộ môn
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Chào mừng {user?.fullName || 'Trưởng bộ môn'}
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
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
                      Tổng đồ án bộ môn
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
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

          <Grid item xs={12} sm={6} md={4}>
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

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <People />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color="info.main">
                      {stats.totalLecturers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Giảng viên bộ môn
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <Group />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color="secondary">
                      {stats.totalStudents}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sinh viên bộ môn
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'error.main' }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color="error.main">
                      {stats.pendingApprovals}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Chờ phê duyệt
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
                  Thông tin bộ môn
                </Typography>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Trưởng bộ môn:</Typography>
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
                    <Typography>Tỷ lệ hoàn thành:</Typography>
                    <Typography fontWeight="bold" color="success.main">
                      {Math.round(
                        (stats.completedProjects / stats.totalProjects) * 100,
                      )}
                      %
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
                  Thống kê nhanh
                </Typography>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Đồ án/Giảng viên:</Typography>
                    <Typography fontWeight="bold">
                      {Math.round(stats.totalProjects / stats.totalLecturers)}{' '}
                      đồ án
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Sinh viên/Giảng viên:</Typography>
                    <Typography fontWeight="bold">
                      {Math.round(stats.totalStudents / stats.totalLecturers)}{' '}
                      sinh viên
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Trạng thái:</Typography>
                    <Typography fontWeight="bold" color="success.main">
                      Hoạt động tốt
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Activities */}
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
                • Hệ thống sẽ cập nhật khi có dữ liệu từ API
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Các hoạt động sẽ bao gồm: phê duyệt đề tài, đánh giá đồ án,
                quản lý giảng viên
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
