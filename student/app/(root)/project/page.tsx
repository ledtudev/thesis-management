'use client';
import { Project, useProjects } from '@/services/projectService';
import { useAuthStore } from '@/state/authStore';
import { FilterList, Search } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import React from 'react';
import toast from 'react-hot-toast';

// Map project status to color
const getStatusColor = (status: string) => {
  const statusMap = {
    PENDING: 'default',
    IN_PROGRESS: 'primary',
    WAITING_FOR_EVALUATION: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'error',
  };
  return statusMap[status] || 'default';
};

// Map project status to readable text
const getStatusText = (status: string) => {
  const statusMap = {
    PENDING: 'Chờ xử lý',
    IN_PROGRESS: 'Đang thực hiện',
    WAITING_FOR_EVALUATION: 'Chờ đánh giá',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
  };
  return statusMap[status] || status;
};

// Map project type to readable text
const getProjectTypeText = (type: string) => {
  const typeMap = {
    GRADUATED: 'Đồ án tốt nghiệp',
    INTERNSHIP: 'Đồ án thực tập',
    RESEARCH: 'Đồ án nghiên cứu',
  };
  return typeMap[type] || type;
};

export default function ProjectsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');

  // Get projects
  const {
    data: projectsData,
    isLoading,
    isError,
    error,
  } = useProjects({
    page: page + 1, // API uses 1-based indexing
    limit: rowsPerPage,
    search: searchTerm || undefined,
    status: statusFilter || undefined,
    type: typeFilter || undefined,
    studentId: user?.id,
  });

  // Handle errors
  React.useEffect(() => {
    if (isError && error) {
      toast.error(
        `Lỗi khi tải danh sách dự án: ${
          error instanceof Error ? error.message : 'Lỗi không xác định'
        }`,
      );
    }
  }, [isError, error]);

  const handleViewProject = (id: string) => {
    router.push(`/project/${id}`);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleTypeFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setTypeFilter(event.target.value);
    setPage(0);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
    setPage(0);
  };

  // Check if any filters are applied
  const isFiltered =
    searchTerm !== '' || statusFilter !== '' || typeFilter !== '';

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" color="primary">
          Dự án của tôi
        </Typography>
      </Box>

      {/* Search and Filter Bar */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo tiêu đề hoặc mô tả..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            size="small"
          />

          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel id="status-filter-label">Trạng thái</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label="Trạng thái"
              onChange={handleStatusFilterChange}
              startAdornment={
                <FilterList fontSize="small" sx={{ ml: 1, mr: 0.5 }} />
              }
            >
              <MenuItem value="">Tất cả trạng thái</MenuItem>
              <MenuItem value="PENDING">Chờ xử lý</MenuItem>
              <MenuItem value="IN_PROGRESS">Đang thực hiện</MenuItem>
              <MenuItem value="WAITING_FOR_EVALUATION">Chờ đánh giá</MenuItem>
              <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
              <MenuItem value="CANCELLED">Đã hủy</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel id="type-filter-label">Loại dự án</InputLabel>
            <Select
              labelId="type-filter-label"
              id="type-filter"
              value={typeFilter}
              label="Loại dự án"
              onChange={handleTypeFilterChange}
              startAdornment={
                <FilterList fontSize="small" sx={{ ml: 1, mr: 0.5 }} />
              }
            >
              <MenuItem value="">Tất cả loại</MenuItem>
              <MenuItem value="GRADUATED">Đồ án tốt nghiệp</MenuItem>
              <MenuItem value="INTERNSHIP">Đồ án thực tập</MenuItem>
              <MenuItem value="RESEARCH">Đồ án nghiên cứu</MenuItem>
            </Select>
          </FormControl>

          {isFiltered && (
            <Button variant="outlined" onClick={clearFilters} size="small">
              Xóa bộ lọc
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Projects List */}
      <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Typography color="error" sx={{ textAlign: 'center', p: 4 }}>
            Đã xảy ra lỗi khi tải dữ liệu
          </Typography>
        ) : !projectsData?.data?.length ? (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {isFiltered
                ? 'Không tìm thấy dự án nào phù hợp với bộ lọc.'
                : 'Bạn chưa có dự án nào.'}
            </Typography>
            {isFiltered && (
              <Button variant="text" onClick={clearFilters} sx={{ mt: 1 }}>
                Xóa bộ lọc
              </Button>
            )}
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell width="35%">Tên dự án</TableCell>
                    <TableCell width="15%">Loại</TableCell>
                    <TableCell width="15%">Trạng thái</TableCell>
                    <TableCell width="20%">Giảng viên hướng dẫn</TableCell>
                    <TableCell width="15%">Thời gian tạo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectsData.data.map((project: Project) => {
                    // Find advisor in project members
                    const advisor = project.Member?.find(
                      (m) => m.role === 'ADVISOR' || m.role === 'SUPERVISOR',
                    )?.FacultyMember;

                    return (
                      <TableRow
                        hover
                        key={project.id}
                        onClick={() => handleViewProject(project.id)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Typography variant="body1" fontWeight={500}>
                            {project.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                          >
                            {project.description || 'Không có mô tả'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {getProjectTypeText(project.type)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusText(project.status)}
                            size="small"
                            color={getStatusColor(project.status)}
                          />
                        </TableCell>
                        <TableCell>
                          {advisor ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {advisor.fullName}
                            </Box>
                          ) : (
                            'Chưa có GVHD'
                          )}
                        </TableCell>
                        <TableCell>
                          {project.createdAt && (
                            <Typography variant="body2">
                              {formatDistanceToNow(
                                new Date(project.createdAt),
                                {
                                  addSuffix: true,
                                  locale: vi,
                                },
                              )}
                            </Typography>
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
              count={projectsData.total || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Số hàng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} của ${count}`
              }
            />
          </>
        )}
      </Paper>
    </Container>
  );
}
