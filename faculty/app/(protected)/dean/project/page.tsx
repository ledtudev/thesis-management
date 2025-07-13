'use client';

import { useDebounce } from '@/hooks/useDebounce';
import {
  Project,
  ProjectMember,
  projectHooks,
} from '@/services/projectService';
import { useAuthStore } from '@/state/authStore';
import {
  AssignmentTurnedIn as AssignmentIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as ClockIcon,
  Engineering as EngineeringIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
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
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Skeleton,
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
import { format, formatDistanceToNow, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Define status labels
const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Bản nháp',
  IN_PROGRESS: 'Đang tiến hành',
  SUBMITTED: 'Đã nộp',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  PENDING_APPROVAL: 'Chờ phê duyệt',
  APPROVED: 'Đã phê duyệt',
  REJECTED: 'Bị từ chối',
  REQUESTED_CHANGES: 'Yêu cầu chỉnh sửa',
  WAITING_FOR_EVALUATION: 'Chờ đánh giá',
};

// Status groups for filtering
const STATUS_GROUPS: Record<string, string[]> = {
  'Đang tiến hành': ['IN_PROGRESS', 'WAITING_FOR_EVALUATION'],
  'Chờ phê duyệt': ['PENDING_APPROVAL', 'SUBMITTED'],
  'Đã phê duyệt': ['APPROVED', 'COMPLETED'],
  'Yêu cầu chỉnh sửa': ['REQUESTED_CHANGES'],
  'Trạng thái khác': ['DRAFT', 'CANCELLED', 'REJECTED'],
};

// Project type labels
const PROJECT_TYPE_LABELS: Record<string, string> = {
  GRADUATED: 'Luận văn tốt nghiệp',
  RESEARCH: 'Nghiên cứu khoa học',
  COMPETITION: 'Dự án thi đấu',
  COLLABORATION: 'Dự án hợp tác',
};

const DEFAULT_PAGE_SIZE = 10;

interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Interface for project query filters
interface ProjectQueryFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  keyword?: string;
  divisionId?: string;
  facultyId?: string;
}

// Interface for pagination
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ProjectListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  // Extract query parameters
  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');
  const statusParam = searchParams.get('status');
  const typeParam = searchParams.get('type');
  const keywordParam = searchParams.get('keyword');

  // State for filtering and pagination
  const [filters, setFilters] = useState<ProjectQueryFilters>({
    page: pageParam ? parseInt(pageParam) : 1,
    limit: limitParam ? parseInt(limitParam) : DEFAULT_PAGE_SIZE,
    status: statusParam || undefined,
    type: typeParam || undefined,
    keyword: keywordParam || '',
    facultyId: user?.facultyId,
  });

  const [searchTerm, setSearchTerm] = useState(filters.keyword || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Update filters when debounced search term changes
  useEffect(() => {
    setFilters((prev) => ({ ...prev, keyword: debouncedSearchTerm }));
  }, [debouncedSearchTerm]);

  // Fetch projects with filters
  const {
    data: projectsResponse,
    isLoading,
    error,
    refetch,
  } = projectHooks.useProjects(filters);

  // Extract data from response safely with error handling
  const projects: Project[] = [];
  let pagination: Pagination = {
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  };

  try {
    if (projectsResponse?.data) {
      Object.assign(projects, projectsResponse.data);
    }

    if (projectsResponse?.metadata) {
      pagination = {
        page: projectsResponse.metadata.page || 1,
        limit: projectsResponse.metadata.limit || DEFAULT_PAGE_SIZE,
        total: projectsResponse.metadata.total || 0,
        totalPages: projectsResponse.metadata.totalPages || 1,
      };
    }

    console.log('Extracted projects:', projects);
  } catch (err) {
    console.error('Error extracting project data:', err);
  }

  // Handle error display with better messaging
  const errorMessage = error
    ? (error as ApiError)?.response?.data?.message ||
      (error as Error).message ||
      'Lỗi không xác định'
    : null;

  // Handle page change
  const handlePageChange = (_event: unknown, newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage + 1 }));
    updateQueryParams({ ...filters, page: newPage + 1 });
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newLimit = parseInt(event.target.value, 10);
    setFilters((prev) => ({ ...prev, page: 1, limit: newLimit }));
    updateQueryParams({ ...filters, page: 1, limit: newLimit });
  };

  // Handle status filter change
  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    const status = event.target.value;
    setFilters((prev) => ({
      ...prev,
      page: 1,
      status: status || undefined,
    }));
    updateQueryParams({
      ...filters,
      page: 1,
      status: status || undefined,
    });
  };

  // Handle type filter change
  const handleTypeChange = (event: SelectChangeEvent<string>) => {
    const type = event.target.value;
    setFilters((prev) => ({
      ...prev,
      page: 1,
      type: type || undefined,
    }));
    updateQueryParams({
      ...filters,
      page: 1,
      type: type || undefined,
    });
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Update query parameters in URL
  const updateQueryParams = (params: ProjectQueryFilters) => {
    const queryParams = new URLSearchParams();
    if (params.page && params.page > 1)
      queryParams.set('page', params.page.toString());
    if (params.limit && params.limit !== DEFAULT_PAGE_SIZE)
      queryParams.set('limit', params.limit.toString());
    if (params.status) queryParams.set('status', params.status);
    if (params.type) queryParams.set('type', params.type);
    if (params.keyword) queryParams.set('keyword', params.keyword);

    const queryString = queryParams.toString();
    const url = queryString ? `?${queryString}` : '';
    router.push(`/dean/project${url}`, { scroll: false });
  };

  // Navigate to project detail
  const navigateToDetail = (id: string) => {
    router.push(`/dean/project/${id}`);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: DEFAULT_PAGE_SIZE,
      facultyId: user?.facultyId,
    });
    setSearchTerm('');
    updateQueryParams({
      page: 1,
      limit: DEFAULT_PAGE_SIZE,
      facultyId: user?.facultyId,
    });
  };

  // Render status chip
  const renderStatusChip = (status: string) => {
    let color:
      | 'success'
      | 'warning'
      | 'error'
      | 'default'
      | 'info'
      | 'primary'
      | 'secondary' = 'default';
    let icon = <ClockIcon fontSize="small" />;

    if (status === 'COMPLETED' || status === 'APPROVED') {
      color = 'success';
      icon = <CheckCircleIcon fontSize="small" />;
    } else if (
      status === 'IN_PROGRESS' ||
      status === 'WAITING_FOR_EVALUATION' ||
      status === 'PENDING_APPROVAL' ||
      status === 'SUBMITTED'
    ) {
      color = 'info';
      icon = <ClockIcon fontSize="small" />;
    } else if (status === 'REJECTED' || status === 'CANCELLED') {
      color = 'error';
      icon = <CancelIcon fontSize="small" />;
    } else if (status === 'REQUESTED_CHANGES') {
      color = 'warning';
      icon = <EngineeringIcon fontSize="small" />;
    }

    // Use the Vietnamese label from our mapping
    const displayText = STATUS_LABELS[status] || status;

    return (
      <Chip
        icon={icon}
        label={displayText}
        color={color}
        size="small"
        sx={{
          fontWeight: 500,
          whiteSpace: 'nowrap',
        }}
      />
    );
  };

  // Format date safely
  const formatDate = (
    dateString: string | undefined | null,
    formatString: string,
  ) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      if (!isValid(date)) return 'N/A';
      return format(date, formatString);
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'N/A';
    }
  };

  // Format distance to now safely
  const formatTimeAgo = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      if (!isValid(date)) return 'N/A';
      return formatDistanceToNow(date, { addSuffix: true, locale: vi });
    } catch (err) {
      console.error('Error formatting time ago:', err);
      return 'N/A';
    }
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
              Danh sách dự án
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Quản lý và theo dõi các dự án nghiên cứu của sinh viên
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
                onChange={handleSearchChange}
                variant="outlined"
                placeholder="Tìm theo tiêu đề, tên sinh viên..."
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
                <InputLabel id="status-filter-label">
                  Lọc theo trạng thái
                </InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={filters.status || ''}
                  onChange={handleStatusChange}
                  label="Lọc theo trạng thái"
                >
                  <MenuItem value="">Tất cả trạng thái</MenuItem>
                  {Object.entries(STATUS_GROUPS).flatMap(
                    ([groupName, statuses]) => [
                      <MenuItem
                        key={`group-${groupName}`}
                        disabled
                        sx={{ opacity: 0.7, fontWeight: 'bold' }}
                      >
                        {groupName}
                      </MenuItem>,
                      ...statuses.map((status) => (
                        <MenuItem
                          key={`status-${status}`}
                          value={status}
                          sx={{ pl: 4 }}
                        >
                          {STATUS_LABELS[status] || status}
                        </MenuItem>
                      )),
                      <Divider key={`divider-${groupName}`} />,
                    ],
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="type-filter-label">
                  Lọc theo loại dự án
                </InputLabel>
                <Select
                  labelId="type-filter-label"
                  id="type-filter"
                  value={filters.type || ''}
                  onChange={handleTypeChange}
                  label="Lọc theo loại dự án"
                >
                  <MenuItem value="">Tất cả loại dự án</MenuItem>
                  {Object.entries(PROJECT_TYPE_LABELS).map(([type, label]) => (
                    <MenuItem key={type} value={type}>
                      {label}
                    </MenuItem>
                  ))}
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
                sx={{ height: '56px' }} // Match height with other inputs
              >
                Xóa bộ lọc
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Loading state */}
        {isLoading && (
          <Stack spacing={2}>
            {[1, 2, 3, 4, 5].map((item) => (
              <Paper key={item} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="70%" height={32} />
                    <Skeleton variant="text" width="40%" />
                  </Box>
                  <Skeleton variant="rectangular" width={100} height={40} />
                </Box>
              </Paper>
            ))}
          </Stack>
        )}

        {/* Error state */}
        {errorMessage && !isLoading && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                Thử lại
              </Button>
            }
          >
            Không thể tải danh sách dự án. {errorMessage}
          </Alert>
        )}

        {/* Empty state */}
        {!isLoading && !errorMessage && projects.length === 0 && (
          <Card variant="outlined">
            <CardHeader
              title="Không có dự án nào"
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
                <AssignmentIcon
                  sx={{ fontSize: 80, color: 'text.disabled', mb: 3 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Không tìm thấy dự án nghiên cứu
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

        {/* Projects table */}
        {!isLoading && !errorMessage && projects.length > 0 && (
          <Paper elevation={0} variant="outlined">
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell width={50}>STT</TableCell>
                    <TableCell>Tiêu đề</TableCell>
                    <TableCell width={180}>Loại dự án</TableCell>
                    <TableCell>Sinh viên</TableCell>
                    <TableCell width={180}>Trạng thái</TableCell>
                    <TableCell width={150}>Cập nhật</TableCell>
                    <TableCell align="right" width={120}>
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project, index) => {
                    const studentMembers: ProjectMember[] =
                      project.Member?.filter((m: ProjectMember) => m.Student) ||
                      [];

                    return (
                      <TableRow
                        key={project.id}
                        hover
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            onClick={() => navigateToDetail(project.id)}
                            sx={{
                              cursor: 'pointer',
                              '&:hover': { textDecoration: 'underline' },
                            }}
                          >
                            {project.title}
                          </Typography>
                          {project.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {project.description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              PROJECT_TYPE_LABELS[project.type as string] ||
                              project.type
                            }
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {studentMembers.length > 0 ? (
                            studentMembers.map(
                              (member: ProjectMember, memberIndex: number) => (
                                <Box
                                  key={
                                    member.Student?.id ||
                                    `student-${memberIndex}`
                                  }
                                  mb={
                                    memberIndex < studentMembers.length - 1
                                      ? 1
                                      : 0
                                  }
                                >
                                  <Typography
                                    variant="body2"
                                    fontWeight="medium"
                                  >
                                    {member.Student?.fullName || 'N/A'}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {member.Student?.studentCode || 'N/A'}
                                  </Typography>
                                </Box>
                              ),
                            )
                          ) : (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontStyle="italic"
                            >
                              Chưa có sinh viên
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {renderStatusChip(project.status as string)}
                        </TableCell>
                        <TableCell>
                          <Tooltip
                            title={formatDate(
                              project.updatedAt,
                              'dd/MM/yyyy HH:mm:ss',
                            )}
                          >
                            <Typography variant="body2" color="text.secondary">
                              {formatTimeAgo(project.updatedAt)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                          >
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<VisibilityIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToDetail(project.id);
                              }}
                            >
                              Chi tiết
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={pagination.total}
              rowsPerPage={pagination.limit}
              page={pagination.page - 1}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleChangeRowsPerPage}
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
