'use client';

import { userHooks } from '@/services/userService';
import { Assignment, Groups, School, TrendingUp } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';

export default function DeanDashboardPage() {
  // Fetch statistics
  const { data: facultiesResponse, isLoading: facultiesLoading } =
    userHooks.useFaculties({
      limit: 100, // Get all faculties for count
    });

  const { data: studentsResponse, isLoading: studentsLoading } =
    userHooks.useStudents({
      limit: 100, // Get all students for count
    });

  // Extract data
  const totalFaculties = facultiesResponse?.total || 0;
  const totalStudents = studentsResponse?.total || 0;
  const activeFaculties =
    facultiesResponse?.data?.filter((f) => f.status === 'ACTIVE').length || 0;
  const activeStudents =
    studentsResponse?.data?.filter((s) => s.status === 'ACTIVE').length || 0;

  const isLoading = facultiesLoading || studentsLoading;

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard Trưởng Khoa
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tổng quan thống kê hệ thống
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <School />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color="primary">
                      {totalStudents}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tổng sinh viên
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
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <Groups />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color="secondary">
                      {totalFaculties}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tổng giảng viên
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
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color="success.main">
                      {activeStudents}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sinh viên hoạt động
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
                    <Assignment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color="info.main">
                      {activeFaculties}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Giảng viên hoạt động
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Additional Info Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Thống kê sinh viên theo trạng thái
                </Typography>
                <Stack spacing={2}>
                  {studentsResponse?.data && (
                    <>
                      <Box display="flex" justifyContent="space-between">
                        <Typography>Hoạt động:</Typography>
                        <Typography color="success.main" fontWeight="bold">
                          {
                            studentsResponse.data.filter(
                              (s) => s.status === 'ACTIVE',
                            ).length
                          }
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography>Đã tốt nghiệp:</Typography>
                        <Typography color="info.main" fontWeight="bold">
                          {
                            studentsResponse.data.filter(
                              (s) => s.status === 'GRADUATED',
                            ).length
                          }
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography>Không hoạt động:</Typography>
                        <Typography color="warning.main" fontWeight="bold">
                          {
                            studentsResponse.data.filter(
                              (s) => s.status === 'INACTIVE',
                            ).length
                          }
                        </Typography>
                      </Box>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Thống kê giảng viên theo trạng thái
                </Typography>
                <Stack spacing={2}>
                  {facultiesResponse?.data && (
                    <>
                      <Box display="flex" justifyContent="space-between">
                        <Typography>Hoạt động:</Typography>
                        <Typography color="success.main" fontWeight="bold">
                          {
                            facultiesResponse.data.filter(
                              (f) => f.status === 'ACTIVE',
                            ).length
                          }
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography>Không hoạt động:</Typography>
                        <Typography color="warning.main" fontWeight="bold">
                          {
                            facultiesResponse.data.filter(
                              (f) => f.status === 'INACTIVE',
                            ).length
                          }
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography>Đã nghỉ hưu:</Typography>
                        <Typography color="error.main" fontWeight="bold">
                          {
                            facultiesResponse.data.filter(
                              (f) => f.status === 'RETIRED',
                            ).length
                          }
                        </Typography>
                      </Box>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
}
