'use client';

import { useDebounce } from '@/hooks/useDebounce';
import {
  DefenseCommitteeRoleT,
  Evaluation,
  ProjectEvaluationStatusT,
} from '@/services/evaluation.interface';
import { evaluationHooks } from '@/services/evaluationService';
import { useAuthStore } from '@/state/authStore';
import {
  CheckCircle as CheckCircleIcon,
  AccessTime as ClockIcon,
  Groups as CommitteeIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  SupervisorAccount as SupervisorIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function EvaluationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  // Extract query parameters
  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');
  const statusParam = searchParams.get('status');
  const roleParam = searchParams.get('defenseRole');
  const keywordParam = searchParams.get('keyword');

  // State for filtering and pagination
  const [page, setPage] = useState(pageParam ? parseInt(pageParam) : 1);
  const [limit, setLimit] = useState(limitParam ? parseInt(limitParam) : 10);
  const [status, setStatus] = useState<string | undefined>(
    statusParam || undefined,
  );
  const [defenseRole, setDefenseRole] = useState<
    DefenseCommitteeRoleT | undefined
  >((roleParam as DefenseCommitteeRoleT) || undefined);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState(keywordParam || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Update query params and filters when debounced search term changes
  useEffect(() => {
    updateQueryParams({
      page,
      limit,
      status: status as ProjectEvaluationStatusT | undefined,
      defenseRole,
      keyword: debouncedSearchTerm,
    });
  }, [debouncedSearchTerm, page, limit, status, defenseRole]);

  // Fetch evaluations using the new API
  const {
    data: evaluationsResponse,
    isLoading,
    error,
    refetch,
  } = evaluationHooks.useEvaluations({
    page,
    limit,
    status: status as ProjectEvaluationStatusT | undefined,
    defenseRole,
    keyword: debouncedSearchTerm,
    defenseMemberId: user?.id,
  });

  // Extract data with proper type handling
  const evaluations = evaluationsResponse?.data?.data || [];
  // Access total count from metadata
  const total = evaluationsResponse?.data?.metadata?.total || 0;

  const handleEvaluationClick = (evaluationId: string) => {
    router.push(`/lecturer/evalution/${evaluationId}`);
  };

  // Update query parameters in URL
  const updateQueryParams = (params: {
    page?: number;
    limit?: number;
    status?: string;
    defenseRole?: string;
    keyword?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params.page && params.page > 1)
      queryParams.set('page', params.page.toString());
    if (params.limit && params.limit !== 10)
      queryParams.set('limit', params.limit.toString());
    if (params.status) queryParams.set('status', params.status);
    if (params.defenseRole) queryParams.set('defenseRole', params.defenseRole);
    if (params.keyword) queryParams.set('keyword', params.keyword);

    const queryString = queryParams.toString();
    const url = queryString ? `?${queryString}` : '';
    router.push(`/lecturer/evalution${url}`, { scroll: false });
  };

  if (error) {
    toast.error('Failed to load evaluations. Please try again.');
  }

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setStatus(event.target.value || undefined);
    setPage(1);
  };

  const handleRoleChange = (event: SelectChangeEvent<string>) => {
    setDefenseRole((event.target.value as DefenseCommitteeRoleT) || undefined);
    setPage(1);
  };

  const handlePageChange = (_event: unknown, newPage: number) => {
    setPage(newPage + 1);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(1);
  };

  const filterByTab = (data: Evaluation[]) => {
    if (activeTab === 'all') return data;
    if (activeTab === 'supervisor') {
      return data.filter((item) => item.userRole === 'SUPERVISOR');
    }
    if (activeTab === 'committee') {
      return data.filter(
        (item) => item.userRole !== 'SUPERVISOR' && item.userRole !== undefined,
      );
    }
    if (activeTab === 'pending') {
      return data.filter(
        (item) =>
          !item.hasScored && item.status === ProjectEvaluationStatusT.PENDING,
      );
    }
    if (activeTab === 'evaluated') {
      return data.filter(
        (item) =>
          item.hasScored || item.status === ProjectEvaluationStatusT.EVALUATED,
      );
    }
    return data;
  };

  const getRoleLabel = (role?: string) => {
    if (!role) return 'Unknown';
    if (role === 'SUPERVISOR') return 'Giáo viên hướng dẫn';

    switch (role as DefenseCommitteeRoleT) {
      case DefenseCommitteeRoleT.CHAIRMAN:
        return 'Chủ tịch hội đồng';
      case DefenseCommitteeRoleT.SECRETARY:
        return 'Thư ký hội đồng';
      case DefenseCommitteeRoleT.REVIEWER:
        return 'Phản biện';
      case DefenseCommitteeRoleT.MEMBER:
        return 'Thành viên hội đồng';
      default:
        return role;
    }
  };

  const filteredEvaluations = filterByTab(evaluations as Evaluation[]);

  const handleTabClick = (tabValue: string) => {
    setActiveTab(tabValue);

    // Set the appropriate filters based on tab selection
    if (tabValue === 'all') {
      // Reset the filters
      setStatus(undefined);
      setDefenseRole(undefined);
    } else if (tabValue === 'supervisor') {
      // Show projects where user is a supervisor
      setStatus(undefined);
      setDefenseRole(undefined);
    } else if (tabValue === 'committee') {
      // Show projects where user is in the committee
      setStatus(undefined);
      setDefenseRole(undefined);
    } else if (tabValue === 'pending') {
      // Show pending evaluations
      setStatus(ProjectEvaluationStatusT.PENDING);
    } else if (tabValue === 'evaluated') {
      // Show evaluated evaluations
      setStatus(ProjectEvaluationStatusT.EVALUATED);
    }

    // Reset to first page when changing tabs
    setPage(1);
  };

  const handleResetFilters = () => {
    setStatus(undefined);
    setDefenseRole(undefined);
    setSearchTerm('');
    setActiveTab('all');
    setPage(1);
    setLimit(10);
    router.push('/lecturer/evalution');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              gutterBottom
            >
              Quản lý đánh giá dự án
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Đánh giá và chấm điểm dự án nghiên cứu của sinh viên trong vai trò
              GVHD hoặc thành viên hội đồng
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Làm mới dữ liệu">
              <IconButton onClick={() => refetch()} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Filters */}
        <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Tìm kiếm dự án"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                placeholder="Tìm theo tiêu đề dự án..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="status-filter-label">Trạng thái</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={status || ''}
                  onChange={handleStatusChange}
                  label="Trạng thái"
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Tất cả trạng thái</MenuItem>
                  <MenuItem value={ProjectEvaluationStatusT.PENDING}>
                    Đang chờ
                  </MenuItem>
                  <MenuItem value={ProjectEvaluationStatusT.EVALUATED}>
                    Đã đánh giá
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="role-filter-label">Vai trò</InputLabel>
                <Select
                  labelId="role-filter-label"
                  id="role-filter"
                  value={defenseRole || ''}
                  onChange={handleRoleChange}
                  label="Vai trò"
                >
                  <MenuItem value="">Tất cả vai trò</MenuItem>
                  <MenuItem value={DefenseCommitteeRoleT.CHAIRMAN}>
                    Chủ tịch
                  </MenuItem>
                  <MenuItem value={DefenseCommitteeRoleT.SECRETARY}>
                    Thư ký
                  </MenuItem>
                  <MenuItem value={DefenseCommitteeRoleT.REVIEWER}>
                    Phản biện
                  </MenuItem>
                  <MenuItem value={DefenseCommitteeRoleT.MEMBER}>
                    Thành viên
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={handleResetFilters}
                startIcon={<FilterIcon />}
                sx={{ height: '56px' }}
              >
                Xóa bộ lọc
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Tab filters */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button
              variant={activeTab === 'all' ? 'contained' : 'text'}
              onClick={() => handleTabClick('all')}
            >
              Tất cả
            </Button>
            <Button
              variant={activeTab === 'supervisor' ? 'contained' : 'text'}
              onClick={() => handleTabClick('supervisor')}
              startIcon={<SupervisorIcon />}
            >
              GVHD
            </Button>
            <Button
              variant={activeTab === 'committee' ? 'contained' : 'text'}
              onClick={() => handleTabClick('committee')}
              startIcon={<CommitteeIcon />}
            >
              Hội đồng
            </Button>
            <Button
              variant={activeTab === 'pending' ? 'contained' : 'text'}
              onClick={() => handleTabClick('pending')}
              startIcon={<ClockIcon />}
            >
              Chưa chấm
            </Button>
            <Button
              variant={activeTab === 'evaluated' ? 'contained' : 'text'}
              onClick={() => handleTabClick('evaluated')}
              startIcon={<CheckCircleIcon />}
            >
              Đã chấm
            </Button>
          </Stack>
        </Box>

        {/* Loading state */}
        {isLoading && (
          <Stack spacing={2}>
            {[1, 2, 3, 4, 5].map((item) => (
              <Paper key={item} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        width: '70%',
                        height: 24,
                        bgcolor: '#f0f0f0',
                        mb: 1,
                      }}
                    />
                    <Box
                      sx={{ width: '40%', height: 16, bgcolor: '#f0f0f0' }}
                    />
                  </Box>
                  <Box sx={{ width: 100, height: 40, bgcolor: '#f0f0f0' }} />
                </Box>
              </Paper>
            ))}
          </Stack>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                Thử lại
              </Button>
            }
          >
            Không thể tải danh sách đánh giá. Vui lòng thử lại sau.
          </Alert>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredEvaluations.length === 0 && (
          <Card variant="outlined">
            <CardHeader
              title="Không có dự án nào cần đánh giá"
              subheader="Không tìm thấy dự án nào phù hợp với bộ lọc hiện tại"
            />
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 6,
                  textAlign: 'center',
                }}
              >
                <VisibilityIcon
                  sx={{ fontSize: 80, color: 'text.disabled', mb: 3 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Không tìm thấy dự án cần đánh giá
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{ maxWidth: 500, mb: 3 }}
                >
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm dự án khác
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleResetFilters}
                  startIcon={<FilterIcon />}
                  size="large"
                >
                  Xóa tất cả bộ lọc
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Evaluations table */}
        {!isLoading && !error && filteredEvaluations.length > 0 && (
          <Paper elevation={0} variant="outlined">
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell width={50}>STT</TableCell>
                    <TableCell>Tên dự án</TableCell>
                    <TableCell width={180}>Vai trò</TableCell>
                    <TableCell width={150}>Trạng thái</TableCell>
                    <TableCell width={120}>Điểm của bạn</TableCell>
                    <TableCell width={120}>Điểm cuối</TableCell>
                    <TableCell align="right" width={150}>
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEvaluations.map((evaluation, index) => (
                    <TableRow
                      key={evaluation.id}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >
                      <TableCell>{(page - 1) * limit + index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {evaluation.Project?.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={
                            evaluation.userRole === 'SUPERVISOR' ? (
                              <SupervisorIcon fontSize="small" />
                            ) : (
                              <CommitteeIcon fontSize="small" />
                            )
                          }
                          label={getRoleLabel(evaluation.userRole)}
                          variant="outlined"
                          size="small"
                          color={
                            evaluation.userRole === 'SUPERVISOR'
                              ? 'primary'
                              : 'secondary'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {evaluation.status ===
                        ProjectEvaluationStatusT.PENDING ? (
                          <Chip
                            icon={<ClockIcon fontSize="small" />}
                            label="Đang chờ"
                            color="warning"
                            size="small"
                          />
                        ) : (
                          <Chip
                            icon={<CheckCircleIcon fontSize="small" />}
                            label="Đã chấm"
                            color="success"
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {evaluation.hasScored ? (
                          <Typography fontWeight="medium">
                            {evaluation.userScore?.toFixed(1)}
                          </Typography>
                        ) : (
                          <Chip
                            label="Chưa chấm"
                            variant="outlined"
                            size="small"
                            color="default"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {evaluation.finalScore ? (
                          <Typography fontWeight="bold">
                            {evaluation.finalScore.toFixed(1)}
                          </Typography>
                        ) : (
                          <Chip
                            label="Chưa có"
                            variant="outlined"
                            size="small"
                            color="default"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleEvaluationClick(evaluation.id)}
                          color={!evaluation.hasScored ? 'primary' : 'inherit'}
                        >
                          {evaluation.hasScored ? 'Chi tiết' : 'Chấm điểm'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={total}
              page={page - 1}
              onPageChange={handlePageChange}
              rowsPerPage={limit}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Số hàng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} của ${count}`
              }
            />
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
