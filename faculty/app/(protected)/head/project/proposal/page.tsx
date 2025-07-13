'use client';

import { useDebounce } from '@/hooks/useDebounce';
import {
  BulkStatusUpdateDto,
  FindProposedProjectDto,
  proposalHooks,
  ProposedProjectStatus,
} from '@/services/proposalService';
import { useAuthStore } from '@/state/authStore';
import {
  AssignmentTurnedIn as AssignmentIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as ClockIcon,
  Error as ErrorIcon,
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
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

// Define valid status values for type safety
type ProposalStatus =
  | 'TOPIC_SUBMISSION_PENDING'
  | 'TOPIC_PENDING_ADVISOR'
  | 'TOPIC_REQUESTED_CHANGES'
  | 'TOPIC_APPROVED'
  | 'OUTLINE_PENDING_SUBMISSION'
  | 'OUTLINE_PENDING_ADVISOR'
  | 'OUTLINE_REQUESTED_CHANGES'
  | 'OUTLINE_REJECTED'
  | 'OUTLINE_APPROVED'
  | 'PENDING_HEAD'
  | 'REQUESTED_CHANGES_HEAD'
  | 'REJECTED_BY_HEAD'
  | 'APPROVED_BY_HEAD';

// Map status codes to Vietnamese labels
const STATUS_LABELS: Record<ProposalStatus, string> = {
  TOPIC_SUBMISSION_PENDING: 'Chờ nộp đề tài',
  TOPIC_PENDING_ADVISOR: 'Chờ duyệt đề tài',
  TOPIC_REQUESTED_CHANGES: 'Yêu cầu chỉnh sửa đề tài',
  TOPIC_APPROVED: 'Đã duyệt đề tài',
  OUTLINE_PENDING_SUBMISSION: 'Chờ nộp đề cương',
  OUTLINE_PENDING_ADVISOR: 'Chờ duyệt đề cương',
  OUTLINE_REQUESTED_CHANGES: 'Yêu cầu chỉnh sửa đề cương',
  OUTLINE_REJECTED: 'Đã từ chối đề cương',
  OUTLINE_APPROVED: 'Đã duyệt đề cương',
  PENDING_HEAD: 'Chờ phê duyệt từ trưởng bộ môn',
  REQUESTED_CHANGES_HEAD: 'Trưởng bộ môn yêu cầu chỉnh sửa',
  REJECTED_BY_HEAD: 'Trưởng bộ môn từ chối',
  APPROVED_BY_HEAD: 'Trưởng bộ môn phê duyệt',
};

// Status groups for filtering - using Vietnamese labels only
const STATUS_GROUPS: Record<string, ProposalStatus[]> = {
  'Chờ phê duyệt': [
    'TOPIC_PENDING_ADVISOR',
    'OUTLINE_PENDING_ADVISOR',
    'PENDING_HEAD',
  ],
  'Đã phê duyệt': ['TOPIC_APPROVED', 'OUTLINE_APPROVED', 'APPROVED_BY_HEAD'],
  'Yêu cầu chỉnh sửa': [
    'TOPIC_REQUESTED_CHANGES',
    'OUTLINE_REQUESTED_CHANGES',
    'REQUESTED_CHANGES_HEAD',
  ],
  'Từ chối': ['OUTLINE_REJECTED', 'REJECTED_BY_HEAD'],
  Khác: ['TOPIC_SUBMISSION_PENDING', 'OUTLINE_PENDING_SUBMISSION'],
};

const DEFAULT_PAGE_SIZE = 10;

// Define a more specific error type if you know the structure, e.g., for Axios errors
interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
      // other potential fields in error data
    };
    // other potential fields in error response
  };
}

export default function ProposalListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  // Extract query parameters
  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');
  const statusParam = searchParams.get('status');
  const keywordParam = searchParams.get('keyword');

  // State for filtering and pagination
  const [filters, setFilters] = useState<FindProposedProjectDto>({
    page: pageParam ? parseInt(pageParam) : 1,
    limit: limitParam ? parseInt(limitParam) : DEFAULT_PAGE_SIZE,
    status: statusParam as ProposalStatus | undefined,
    keyword: keywordParam || '',
    facultyId: user?.facultyId,
  });

  const [searchTerm, setSearchTerm] = useState(filters.keyword || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [selectedProposals, setSelectedProposals] = useState<string[]>([]);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [comment, setComment] = useState('');

  // Update filters when debounced search term changes
  useEffect(() => {
    setFilters((prev) => ({ ...prev, keyword: debouncedSearchTerm }));
  }, [debouncedSearchTerm]);

  // Clear selected proposals when filters change
  useEffect(() => {
    setSelectedProposals([]);
  }, [filters.status, filters.keyword]);

  // Fetch proposed projects with filters
  const {
    data: proposedProjectsResponse,
    isLoading,
    error,
    refetch,
  } = proposalHooks.useProposedProjectsByHead(filters, {
    refetchInterval: true,
  });

  // Extract data from response
  const projects = proposedProjectsResponse?.data || [];
  const pagination = proposedProjectsResponse?.pagination || {
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  };
  // Division info from the response
  const divisionInfo = proposedProjectsResponse?.divisionInfo;

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
      status: status ? (status as ProposalStatus) : undefined,
    }));
    updateQueryParams({
      ...filters,
      page: 1,
      status: status ? (status as ProposalStatus) : undefined,
    });
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Update query parameters in URL
  const updateQueryParams = (params: FindProposedProjectDto) => {
    const queryParams = new URLSearchParams();
    if (params.page && params.page > 1)
      queryParams.set('page', params.page.toString());
    if (params.limit && params.limit !== DEFAULT_PAGE_SIZE)
      queryParams.set('limit', params.limit.toString());
    if (params.status) queryParams.set('status', params.status as string);
    if (params.keyword) queryParams.set('keyword', params.keyword);

    const queryString = queryParams.toString();
    const url = queryString ? `?${queryString}` : '';
    router.push(`/head/project/proposal${url}`, { scroll: false });
  };

  // Navigate to proposal detail
  const navigateToDetail = (id: string) => {
    router.push(`/head/project/proposal/${id}`);
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

    if (status.includes('APPROVED')) {
      color = 'success';
      icon = <CheckCircleIcon fontSize="small" />;
    } else if (status.includes('PENDING')) {
      color = 'warning';
      icon = <ClockIcon fontSize="small" />;
    } else if (status.includes('REJECTED')) {
      color = 'error';
      icon = <CancelIcon fontSize="small" />;
    } else if (status.includes('REQUESTED_CHANGES')) {
      color = 'info';
      icon = <ErrorIcon fontSize="small" />;
    }

    // Use the Vietnamese label from our mapping
    const displayText = STATUS_LABELS[status as ProposalStatus] || status;

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

  // Handle select all proposals
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = projects.map((project) => project.id);
      setSelectedProposals(newSelected);
    } else {
      setSelectedProposals([]);
    }
  };

  // Handle select individual proposal
  const handleSelectProposal = (id: string) => {
    const selectedIndex = selectedProposals.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedProposals, id];
    } else {
      newSelected = selectedProposals.filter((proposalId) => proposalId !== id);
    }

    setSelectedProposals(newSelected);
  };

  const isSelected = (id: string) => selectedProposals.indexOf(id) !== -1;

  // Group proposals by status for bulk actions
  const getSelectedProposalStatuses = () => {
    const statuses = new Set<string>();
    selectedProposals.forEach((id) => {
      const project = projects.find((p) => p.id === id);
      if (project) {
        statuses.add(project.status);
      }
    });
    return Array.from(statuses);
  };

  // Check if all selected proposals can be approved
  const canBulkApprove = () => {
    const statuses = getSelectedProposalStatuses();
    return statuses.every(
      (status) => status === 'OUTLINE_APPROVED' || status === 'PENDING_HEAD',
    );
  };

  // Use the new bulk update mutation for Division Head (formerly Department Head)
  const {
    mutate: bulkUpdateStatusByDepartmentHead,
    isPending: isProcessingBulkAction,
  } = proposalHooks.useBulkUpdateStatusByDepartmentHead();

  // Open bulk action dialog
  const handleBulkActionClick = (action: string) => {
    setBulkAction(action);
    setBulkActionDialogOpen(true);
  };

  // Handle bulk status update
  const handleBulkUpdate = () => {
    if (selectedProposals.length === 0) {
      toast.error('Chưa chọn đề tài nào');
      return;
    }

    // Determine the target status based on action and selected projects
    const selectedStatuses = getSelectedProposalStatuses();
    const uniqueStatuses = Array.from(new Set(selectedStatuses));

    // Check if we have multiple different current statuses
    // For Deans, we primarily expect to act on 'PENDING_HEAD' statuses in bulk
    if (uniqueStatuses.length > 1) {
      toast.error('Các đề tài đã chọn phải có cùng loại trạng thái');
      return;
    }

    const currentStatus = uniqueStatuses[0];
    let newStatus: ProposedProjectStatus | undefined = undefined;

    // Map the action to appropriate status changes based on current status for Department Head
    if (
      currentStatus === 'PENDING_HEAD' ||
      currentStatus === 'OUTLINE_APPROVED'
    ) {
      if (bulkAction === 'approve') {
        newStatus = 'APPROVED_BY_HEAD';
      } else if (bulkAction === 'request_changes') {
        newStatus = 'REQUESTED_CHANGES_HEAD';
      } else if (bulkAction === 'reject') {
        newStatus = 'REJECTED_BY_HEAD';
      } else {
        toast.error(
          `Hành động "${bulkAction}" không hợp lệ cho trạng thái hiện tại`,
        );
        return;
      }
    } else {
      toast.error(
        'Chỉ có thể thực hiện hành động hàng loạt cho các đề tài có trạng thái "Đã duyệt đề cương" (OUTLINE_APPROVED) hoặc "Chờ trưởng bộ môn duyệt" (PENDING_HEAD)',
      );
      return;
    }

    if (!newStatus) {
      toast.error('Không thể xác định trạng thái mới.');
      return;
    }

    // Create the bulk update payload
    const bulkUpdatePayload: BulkStatusUpdateDto = {
      projectIds: selectedProposals,
      status: newStatus,
      comment: comment || undefined,
    };

    bulkUpdateStatusByDepartmentHead(bulkUpdatePayload, {
      onSuccess: (response) => {
        // Check for successful response structure from API
        if (response?.data?.success) {
          const apiResponse = response.data.data; // Access the nested data object
          toast.success(
            `Đã xử lý ${apiResponse.processed} / ${apiResponse.total} đề tài.`, // Use processed and total from the response
          );
          refetch(); // Refresh the data
          setSelectedProposals([]);
          setBulkActionDialogOpen(false);
          setComment('');
        } else {
          // Handle cases where the outer success is false or structure is unexpected
          toast.error(
            (response?.data?.message as string) ||
              'Có lỗi xảy ra trong quá trình xử lý hàng loạt.',
          );
        }
      },
      onError: (error) => {
        const errorMessage =
          (error as ApiError)?.response?.data?.message ||
          (error as Error).message ||
          'Có lỗi xảy ra khi cập nhật hàng loạt';
        toast.error(
          `Lỗi khi cập nhật hàng loạt: ${errorMessage || 'Vui lòng thử lại.'}`,
        );
      },
    });
  };

  return (
    <Container maxWidth="xl">
      {/* <Typography variant="h4" gutterBottom sx={{ my: 2 }}>
        Quản lý Đề xuất Dự án (Trưởng bộ môn)
      </Typography> */}
      <Paper elevation={2} sx={{ mb: 2, p: 2 }}>
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
                Danh sách đề xuất
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Quản lý và đánh giá các đề xuất nghiên cứu của sinh viên
              </Typography>
              {divisionInfo && (
                <Chip
                  label={`Bộ môn: ${divisionInfo.name}`}
                  color="primary"
                  size="small"
                  sx={{ mt: 1 }}
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title="Làm mới dữ liệu">
                <IconButton onClick={() => refetch()} color="primary">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Bulk actions toolbar */}
          {selectedProposals.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="subtitle1">
                Đã chọn {selectedProposals.length} đề xuất
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={() => handleBulkActionClick('approve')}
                  disabled={!canBulkApprove() || selectedProposals.length === 0}
                  startIcon={<CheckCircleIcon />}
                  color="success"
                >
                  Phê duyệt hàng loạt
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleBulkActionClick('request_changes')}
                  disabled={selectedProposals.length === 0}
                  startIcon={<ErrorIcon />}
                  color="warning"
                >
                  Yêu cầu chỉnh sửa hàng loạt
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleBulkActionClick('reject')}
                  disabled={selectedProposals.length === 0}
                  startIcon={<CancelIcon />}
                  color="error"
                >
                  Từ chối hàng loạt
                </Button>
              </Box>
            </Paper>
          )}

          {/* Filters */}
          <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tìm kiếm đề xuất"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  variant="outlined"
                  placeholder="Tìm theo tiêu đề hoặc tên sinh viên..."
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
                    value={(filters.status as string) || ''}
                    onChange={handleStatusChange}
                    label="Lọc theo trạng thái"
                    startAdornment={
                      <InputAdornment position="start">
                        <FilterIcon />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">Tất cả trạng thái</MenuItem>
                    {Object.entries(STATUS_GROUPS).map(
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
                            key={status}
                            value={status as ProposalStatus}
                            sx={{ pl: 4 }}
                          >
                            {STATUS_LABELS[status as ProposalStatus]}
                          </MenuItem>
                        )),
                        <Divider key={`divider-${groupName}`} />,
                      ],
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
          {error && !isLoading && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => refetch()}>
                  Thử lại
                </Button>
              }
            >
              Không thể tải danh sách đề xuất. Vui lòng thử lại sau.
            </Alert>
          )}

          {/* Empty state */}
          {!isLoading && !error && projects.length === 0 && (
            <Card variant="outlined">
              <CardHeader
                title="Không có đề xuất nào"
                subheader="Không tìm thấy đề xuất nào phù hợp với bộ lọc hiện tại"
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
                    Không tìm thấy đề xuất nghiên cứu
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ maxWidth: 500, mb: 3 }}
                  >
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm đề xuất
                    khác
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
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          indeterminate={
                            selectedProposals.length > 0 &&
                            selectedProposals.length < projects.length
                          }
                          checked={
                            projects.length > 0 &&
                            selectedProposals.length === projects.length
                          }
                          onChange={handleSelectAll}
                          inputProps={{ 'aria-label': 'select all proposals' }}
                        />
                      </TableCell>
                      <TableCell width={50}>STT</TableCell>
                      <TableCell>Tiêu đề</TableCell>
                      <TableCell>Sinh viên</TableCell>
                      <TableCell width={180}>Trạng thái</TableCell>
                      <TableCell width={150}>Cập nhật</TableCell>
                      <TableCell align="right" width={200}>
                        Thao tác
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {projects.map((project, index) => {
                      const studentMembers =
                        project.ProposedProjectMember?.filter(
                          (m) =>
                            m?.studentId &&
                            (m.role === 'STUDENT' ||
                              m.role === 'Sinh viên thực hiện'), // Accept 'STUDENT' or 'Sinh viên thực hiện'
                        );
                      const isItemSelected = isSelected(project.id);

                      return (
                        <TableRow
                          key={project.id}
                          hover
                          selected={isItemSelected}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                            cursor: 'pointer',
                          }}
                          onClick={() => handleSelectProposal(project.id)}
                        >
                          <TableCell
                            padding="checkbox"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Checkbox
                              color="primary"
                              checked={isItemSelected}
                              onChange={() => handleSelectProposal(project.id)}
                              inputProps={{
                                'aria-labelledby': `proposal-${project.id}`,
                              }}
                            />
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {(pagination.page - 1) * pagination.limit +
                              index +
                              1}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
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
                            {studentMembers && studentMembers.length > 0 ? (
                              studentMembers.map((member, memberIndex) => (
                                <Box
                                  key={member.studentId || memberIndex}
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
                              ))
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
                            {renderStatusChip(project.status)}
                          </TableCell>
                          <TableCell>
                            <Tooltip
                              title={format(
                                new Date(project.updatedAt),
                                'dd/MM/yyyy HH:mm:ss',
                              )}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {formatDistanceToNow(
                                  new Date(project.updatedAt),
                                  {
                                    addSuffix: true,
                                    locale: vi,
                                  },
                                )}
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
                                onClick={() => navigateToDetail(project.id)}
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
      </Paper>

      {/* Bulk Action Dialog - Improved */}
      <Dialog
        open={bulkActionDialogOpen}
        onClose={() => setBulkActionDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {bulkAction === 'approve'
            ? 'Phê duyệt hàng loạt đề tài (Trưởng bộ môn)'
            : bulkAction === 'request_changes'
            ? 'Yêu cầu chỉnh sửa hàng loạt (Trưởng bộ môn)'
            : 'Từ chối hàng loạt đề tài (Trưởng bộ môn)'}
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            {bulkAction === 'approve'
              ? `Bạn có chắc chắn muốn phê duyệt ${selectedProposals.length} đề tài đã chọn không?`
              : bulkAction === 'request_changes'
              ? `Vui lòng nhập lý do yêu cầu chỉnh sửa cho ${selectedProposals.length} đề tài đã chọn:`
              : `Vui lòng nhập lý do từ chối cho ${selectedProposals.length} đề tài đã chọn:`}
          </Typography>

          {getSelectedProposalStatuses().some(
            (s) => s === 'OUTLINE_APPROVED' || s === 'PENDING_HEAD',
          ) && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {bulkAction === 'approve'
                  ? 'Phê duyệt các đề tài này sẽ hoàn tất quá trình duyệt và chuyển sang giai đoạn thực hiện dự án.'
                  : bulkAction === 'request_changes'
                  ? 'Sinh viên sẽ cần chỉnh sửa đề cương dựa trên phản hồi của bạn.'
                  : 'Từ chối sẽ yêu cầu sinh viên nộp lại đề cương mới.'}
              </Typography>
            </Alert>
          )}

          <TextField
            autoFocus
            margin="dense"
            id="comment"
            label={
              bulkAction === 'approve'
                ? 'Nhận xét (tùy chọn)'
                : 'Lý do ' +
                  (bulkAction === 'request_changes'
                    ? 'yêu cầu chỉnh sửa'
                    : 'từ chối')
            }
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required={bulkAction !== 'approve'}
            error={bulkAction !== 'approve' && !comment.trim()}
            helperText={
              bulkAction !== 'approve' && !comment.trim()
                ? 'Vui lòng cung cấp lý do để sinh viên hiểu rõ'
                : ''
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setBulkActionDialogOpen(false)}
            disabled={isProcessingBulkAction}
          >
            Hủy
          </Button>
          <Button
            onClick={handleBulkUpdate}
            variant="contained"
            color={
              bulkAction === 'approve'
                ? 'success'
                : bulkAction === 'request_changes'
                ? 'warning'
                : 'error'
            }
            disabled={
              (bulkAction !== 'approve' && !comment.trim()) ||
              isProcessingBulkAction
            }
            startIcon={
              isProcessingBulkAction ? (
                <CircularProgress size={20} color="inherit" />
              ) : bulkAction === 'approve' ? (
                <CheckCircleIcon />
              ) : bulkAction === 'request_changes' ? (
                <ErrorIcon />
              ) : (
                <CancelIcon />
              )
            }
          >
            {isProcessingBulkAction
              ? 'Đang xử lý...'
              : bulkAction === 'approve'
              ? 'Phê duyệt tất cả'
              : bulkAction === 'request_changes'
              ? 'Gửi yêu cầu chỉnh sửa'
              : 'Từ chối tất cả'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
