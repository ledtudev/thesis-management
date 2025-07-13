'use client';

import { useDebounce } from '@/hooks/useDebounce';
import {
  Check as CheckIcon,
  Edit as EditIcon,
  FileDownload as ExportIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  AssignmentTurnedIn as ScoreIcon,
  Search as SearchIcon,
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
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

// Define status labels
const EVALUATION_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ chấm điểm',
  SCORED: 'Đã chấm điểm',
  FINALIZED: 'Đã phê duyệt',
};

// Mock data - would normally come from API
const mockProjects = Array.from({ length: 15 }, (_, index) => ({
  id: `project-${index + 1}`,
  title: `Dự án ${index + 1}: ${
    [
      'Ứng dụng di động quản lý chi tiêu',
      'Phát triển website thương mại điện tử',
      'Hệ thống quản lý học sinh',
      'Phân tích dữ liệu bán hàng',
      'Ứng dụng IoT trong nông nghiệp',
    ][index % 5]
  }`,
  student: `Sinh viên ${index + 1}`,
  studentId: `SV${100 + index}`,
  advisor: `GV. ${['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C'][index % 3]}`,
  committee: `Hội đồng ${['A', 'B', 'C', 'D'][index % 4]}`,
  advisorScore: (7 + Math.random() * 3).toFixed(2),
  committeeScore: (7 + Math.random() * 3).toFixed(2),
  finalScore: null,
  status: ['PENDING', 'SCORED', 'FINALIZED'][index % 3],
  advisorWeight: 0.4,
  committeeWeight: 0.6,
}));

const DEFAULT_PAGE_SIZE = 10;

interface QueryParams {
  page: number;
  limit: number;
  status?: string;
  keyword?: string;
}

export default function HeadProjectEvaluationPage() {
  const router = useRouter();

  // State for filtering and pagination
  const [filters, setFilters] = useState<QueryParams>({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    status: undefined,
    keyword: '',
  });

  const [searchTerm, setSearchTerm] = useState(filters.keyword || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [projects, setProjects] = useState(mockProjects);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate fetching data
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call delay
    const timer = setTimeout(() => {
      try {
        // Apply filters to mock data
        const filteredProjects = mockProjects.filter((project) => {
          // Filter by search term
          const matchesSearch = debouncedSearchTerm
            ? project.title
                .toLowerCase()
                .includes(debouncedSearchTerm.toLowerCase()) ||
              project.student
                .toLowerCase()
                .includes(debouncedSearchTerm.toLowerCase()) ||
              project.advisor
                .toLowerCase()
                .includes(debouncedSearchTerm.toLowerCase())
            : true;

          // Filter by status
          const matchesStatus = filters.status
            ? project.status === filters.status
            : true;

          return matchesSearch && matchesStatus;
        });

        // Apply pagination
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        const paginatedProjects = filteredProjects.slice(start, end);

        setProjects(paginatedProjects);
        setIsLoading(false);
      } catch {
        setError('Có lỗi xảy ra khi tải dữ liệu');
        setIsLoading(false);
      }
    }, 800); // Simulate network delay

    return () => clearTimeout(timer);
  }, [filters, debouncedSearchTerm]);

  // Update filters when debounced search term changes
  useEffect(() => {
    setFilters((prev) => ({ ...prev, keyword: debouncedSearchTerm, page: 1 }));
  }, [debouncedSearchTerm]);

  // Handle page change
  const handlePageChange = (_event: unknown, newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage + 1 }));
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newLimit = parseInt(event.target.value, 10);
    setFilters((prev) => ({ ...prev, page: 1, limit: newLimit }));
  };

  // Handle status filter change
  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    const status = event.target.value;
    setFilters((prev) => ({
      ...prev,
      page: 1,
      status: status || undefined,
    }));
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: DEFAULT_PAGE_SIZE,
    });
    setSearchTerm('');
  };

  // Navigate to finalize score page
  const navigateToFinalizeScore = (id: string) => {
    router.push(`/head/project/evalution/finalize/${id}`);
  };

  // Export to Excel
  const exportToExcel = () => {
    // Get all projects (not just current page)
    const allProjects = mockProjects.map((project) => ({
      'Mã SV': project.studentId,
      'Tên sinh viên': project.student,
      'Tên đồ án': project.title,
      'Giảng viên hướng dẫn': project.advisor,
      'Điểm GVHD': project.advisorScore,
      'Điểm hội đồng': project.committeeScore,
      'Trọng số GVHD': project.advisorWeight,
      'Trọng số hội đồng': project.committeeWeight,
      'Điểm cuối':
        project.finalScore ||
        (project.status === 'FINALIZED'
          ? (
              parseFloat(project.advisorScore) * project.advisorWeight +
              parseFloat(project.committeeScore) * project.committeeWeight
            ).toFixed(2)
          : 'Chưa phê duyệt'),
      'Trạng thái': EVALUATION_STATUS_LABELS[project.status] || project.status,
    }));

    const ws = XLSX.utils.json_to_sheet(allProjects);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Điểm đồ án');

    // Generate filename with current date
    const fileName = `Diem_do_an_${
      new Date().toISOString().split('T')[0]
    }.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Render status chip
  const renderStatusChip = (status: string) => {
    let color: 'success' | 'warning' | 'info' = 'info';

    if (status === 'FINALIZED') {
      color = 'success';
    } else if (status === 'SCORED') {
      color = 'info';
    } else if (status === 'PENDING') {
      color = 'warning';
    }

    return (
      <Chip
        label={EVALUATION_STATUS_LABELS[status] || status}
        color={color}
        size="small"
        sx={{
          fontWeight: 500,
        }}
      />
    );
  };

  // Calculate total filtered projects for pagination
  const totalFilteredProjects = mockProjects.filter((project) => {
    const matchesSearch = debouncedSearchTerm
      ? project.title
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        project.student
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        project.advisor
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase())
      : true;

    const matchesStatus = filters.status
      ? project.status === filters.status
      : true;

    return matchesSearch && matchesStatus;
  }).length;

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
              Phê duyệt điểm đồ án
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Duyệt và phê duyệt điểm cuối cùng cho các đồ án của sinh viên
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={exportToExcel}
            >
              Xuất Excel
            </Button>
            <Tooltip title="Làm mới dữ liệu">
              <IconButton onClick={() => handleResetFilters()} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Filters */}
        <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tìm kiếm đồ án"
                value={searchTerm}
                onChange={handleSearchChange}
                variant="outlined"
                placeholder="Tìm theo tên đồ án, sinh viên, giảng viên..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
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
                  {Object.entries(EVALUATION_STATUS_LABELS).map(
                    ([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ),
                  )}
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
        {error && !isLoading && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={handleResetFilters}>
                Thử lại
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Empty state */}
        {!isLoading && !error && projects.length === 0 && (
          <Card variant="outlined">
            <CardHeader
              title="Không có đồ án nào"
              subheader="Không tìm thấy đồ án nào phù hợp với bộ lọc hiện tại"
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
                <ScoreIcon
                  sx={{ fontSize: 80, color: 'text.disabled', mb: 3 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Không tìm thấy đồ án nào
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{ maxWidth: 500, mb: 3 }}
                >
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
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
        {!isLoading && !error && projects.length > 0 && (
          <Paper elevation={0} variant="outlined">
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell width={50}>STT</TableCell>
                    <TableCell>Thông tin đồ án</TableCell>
                    <TableCell align="center" width={120}>
                      Điểm GVHD
                    </TableCell>
                    <TableCell align="center" width={120}>
                      Điểm hội đồng
                    </TableCell>
                    <TableCell align="center" width={120}>
                      Điểm cuối
                    </TableCell>
                    <TableCell width={150}>Trạng thái</TableCell>
                    <TableCell align="right" width={120}>
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project, index) => {
                    // Calculate final score if available
                    const finalScore =
                      project.finalScore ||
                      (project.status === 'FINALIZED'
                        ? (
                            parseFloat(project.advisorScore) *
                              project.advisorWeight +
                            parseFloat(project.committeeScore) *
                              project.committeeWeight
                          ).toFixed(2)
                        : null);

                    return (
                      <TableRow
                        key={project.id}
                        hover
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {(filters.page - 1) * filters.limit + index + 1}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {project.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Sinh viên: {project.student} ({project.studentId})
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            GVHD: {project.advisor}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {project.advisorScore}
                        </TableCell>
                        <TableCell align="center">
                          {project.committeeScore}
                        </TableCell>
                        <TableCell align="center">
                          {finalScore ? (
                            <Typography fontWeight="bold">
                              {finalScore}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Chưa phê duyệt
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {renderStatusChip(project.status)}
                        </TableCell>
                        <TableCell align="right">
                          {project.status === 'FINALIZED' ? (
                            <Tooltip title="Đã phê duyệt">
                              <IconButton color="success" size="small">
                                <CheckIcon />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() =>
                                navigateToFinalizeScore(project.id)
                              }
                            >
                              Phê duyệt
                            </Button>
                          )}
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
              count={totalFilteredProjects}
              rowsPerPage={filters.limit}
              page={filters.page - 1}
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
