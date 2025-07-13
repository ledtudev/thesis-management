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
  Delete as DeleteIcon,
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
  PENDING_HEAD: 'Chờ phê duyệt từ trưởng khoa',
  REQUESTED_CHANGES_HEAD: 'Trưởng bộ môn yêu cầu chỉnh sửa',
  REJECTED_BY_HEAD: 'Trưởng bộ môn từ chối',
  APPROVED_BY_HEAD: 'Trưởng bộ môn phê duyệt',
};

const STATUS_GROUPS: Record<string, ProposalStatus[]> = {
  'Chờ phê duyệt': [
    'OUTLINE_PENDING_ADVISOR',
    'PENDING_HEAD',
    'TOPIC_PENDING_ADVISOR',
  ],
  'Đã phê duyệt': ['OUTLINE_APPROVED', 'APPROVED_BY_HEAD'],
  'Yêu cầu chỉnh sửa': ['OUTLINE_REQUESTED_CHANGES', 'REQUESTED_CHANGES_HEAD'],
  'Từ chối': ['OUTLINE_REJECTED', 'REJECTED_BY_HEAD'],
  Khác: ['OUTLINE_PENDING_SUBMISSION'],
};

const DEFAULT_PAGE_SIZE = 10;

interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Extend the FindProposedProjectDto type to include our custom filter
interface CustomFindProposedProjectDto extends FindProposedProjectDto {
  outlineOnly?: boolean;
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
  const [filters, setFilters] = useState<CustomFindProposedProjectDto>({
    page: pageParam ? parseInt(pageParam) : 1,
    limit: limitParam ? parseInt(limitParam) : DEFAULT_PAGE_SIZE,
    status: statusParam as ProposalStatus | undefined,
    keyword: keywordParam || '',
    lecturerId: user?.id,
    outlineOnly: true, // Only fetch outline projects
  });

  const [searchTerm, setSearchTerm] = useState(filters.keyword || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [selectedProposals, setSelectedProposals] = useState<string[]>([]);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [comment, setComment] = useState('');
  const [isProcessingBulkAction, setIsProcessingBulkAction] = useState(false);

  // Make sure we only include outline-related statuses
  useEffect(() => {
    // Add filter function to filter projects after they're loaded
    const outlineStatuses: ProposalStatus[] = [
      'OUTLINE_PENDING_SUBMISSION',
      'OUTLINE_PENDING_ADVISOR',
      'OUTLINE_REQUESTED_CHANGES',
      'OUTLINE_REJECTED',
      'OUTLINE_APPROVED',
      'PENDING_HEAD',
      'REQUESTED_CHANGES_HEAD',
      'REJECTED_BY_HEAD',
      'APPROVED_BY_HEAD',
    ];

    // Set filters with outline only
    if (
      !filters.status ||
      !outlineStatuses.includes(filters.status as ProposalStatus)
    ) {
      // If current status is not an outline status, remove it
      setFilters((prev) => ({
        ...prev,
        outlineOnly: true, // This is a custom parameter expected by the API
      }));
    }
  }, [filters.status]);

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
  } = proposalHooks.useProposedProjects(filters, {
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
  const updateQueryParams = (params: CustomFindProposedProjectDto) => {
    const queryParams = new URLSearchParams();
    if (params.page && params.page > 1)
      queryParams.set('page', params.page.toString());
    if (params.limit && params.limit !== DEFAULT_PAGE_SIZE)
      queryParams.set('limit', params.limit.toString());
    if (params.status) queryParams.set('status', params.status as string);
    if (params.keyword) queryParams.set('keyword', params.keyword);
    // Note: outlineOnly parameter is handled by the API, not in the URL

    const queryString = queryParams.toString();
    const url = queryString ? `?${queryString}` : '';
    router.push(`/lecturer/project/proposal${url}`, { scroll: false });
  };

  // Navigate to proposal detail
  const navigateToDetail = (id: string) => {
    router.push(`/lecturer/project/proposal/${id}`);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: DEFAULT_PAGE_SIZE,
      lecturerId: user?.id,
      outlineOnly: true, // Maintain the outline-only filter
    });
    setSearchTerm('');
    updateQueryParams({
      page: 1,
      limit: DEFAULT_PAGE_SIZE,
      lecturerId: user?.id,
      outlineOnly: true, // Maintain the outline-only filter
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
    return statuses.every((status) => status === 'OUTLINE_PENDING_ADVISOR');
  };

  // Use the new bulk update mutation
  const { mutate: bulkUpdateStatus } =
    proposalHooks.useBulkUpdateStatusByLecturer();

  // Open bulk action dialog
  const handleBulkActionClick = (action: string) => {
    setBulkAction(action);
    setBulkActionDialogOpen(true);
  };

  // Handle bulk status update
  const handleBulkUpdate = () => {
    if (selectedProposals.length === 0) {
      toast.error('No projects selected');
      return;
    }

    setIsProcessingBulkAction(true);

    // Determine the target status based on action and selected projects
    const selectedStatuses = getSelectedProposalStatuses();
    const uniqueStatuses = Array.from(new Set(selectedStatuses));

    // Check if we have multiple different current statuses
    if (uniqueStatuses.length > 1) {
      toast.error('Selected projects must have the same status type');
      setIsProcessingBulkAction(false);
      return;
    }

    const currentStatus = uniqueStatuses[0];
    let newStatus: ProposedProjectStatus;

    // Map the action to appropriate status changes based on current status
    if (currentStatus === 'OUTLINE_PENDING_ADVISOR') {
      if (bulkAction === 'approve') {
        newStatus = 'OUTLINE_APPROVED';
      } else if (bulkAction === 'request_changes') {
        newStatus = 'OUTLINE_REQUESTED_CHANGES';
      } else {
        newStatus = 'OUTLINE_REJECTED';
      }
    } else {
      toast.error('Selected projects cannot be processed with this action');
      setIsProcessingBulkAction(false);
      return;
    }

    // Create the bulk update payload
    const bulkUpdatePayload: BulkStatusUpdateDto = {
      projectIds: selectedProposals,
      status: newStatus,
      comment: comment || undefined,
    };

    // Call the bulk update API
    bulkUpdateStatus(bulkUpdatePayload, {
      onSuccess: (response) => {
        const result = response?.data?.data;
        toast.success(
          `Successfully processed ${result.processed} of ${result.total} projects`,
        );
        setBulkActionDialogOpen(false);
        setSelectedProposals([]);
        setComment('');
        setIsProcessingBulkAction(false);
      },
      onError: (error) => {
        console.error('Bulk update error:', error);
        const errorMessage =
          (error as ApiError)?.response?.data?.message ||
          (error as Error).message ||
          'Error processing batch update';
        toast.error(errorMessage);
        setIsProcessingBulkAction(false);
      },
    });
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
              Danh sách đề cương
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Quản lý và đánh giá các đề cương nghiên cứu của sinh viên
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
              {canBulkApprove() && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleBulkActionClick('approve')}
                >
                  Phê duyệt đã chọn
                </Button>
              )}
              <Button
                variant="contained"
                color="warning"
                startIcon={<ErrorIcon />}
                onClick={() => handleBulkActionClick('request_changes')}
              >
                Yêu cầu chỉnh sửa
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => handleBulkActionClick('reject')}
              >
                Từ chối
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<DeleteIcon />}
                onClick={() => setSelectedProposals([])}
              >
                Bỏ chọn tất cả
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
              title="Không có đề cương nào"
              subheader="Không tìm thấy đề cương nào phù hợp với bộ lọc hiện tại"
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
                  Không tìm thấy đề cương nghiên cứu
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{ maxWidth: 500, mb: 3 }}
                >
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm đề cương khác
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
                            m.role === 'OWNER' ||
                            m.role === 'Sinh viên thực hiện'),
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
                          {(pagination.page - 1) * pagination.limit + index + 1}
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
                                key={member.studentId || memberIndex} // Use studentId or index as key
                                mb={
                                  memberIndex < studentMembers.length - 1
                                    ? 1
                                    : 0
                                }
                              >
                                <Typography variant="body2" fontWeight="medium">
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
                            <Typography variant="body2" color="text.secondary">
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

      {/* Bulk Action Dialog - Improved */}
      <Dialog
        open={bulkActionDialogOpen}
        onClose={() =>
          !isProcessingBulkAction && setBulkActionDialogOpen(false)
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {bulkAction === 'approve'
            ? 'Phê duyệt đề cương đã chọn'
            : bulkAction === 'request_changes'
            ? 'Yêu cầu chỉnh sửa đề cương'
            : 'Từ chối đề cương'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Bạn sắp{' '}
              {bulkAction === 'approve'
                ? 'phê duyệt'
                : bulkAction === 'request_changes'
                ? 'yêu cầu chỉnh sửa'
                : 'từ chối'}{' '}
              {selectedProposals.length} đề cương được chọn.
            </Typography>

            {getSelectedProposalStatuses().some(
              (s) => s === 'OUTLINE_PENDING_ADVISOR',
            ) && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  {bulkAction === 'approve'
                    ? 'Phê duyệt đề cương sẽ cho phép đề xuất chuyển sang giai đoạn tiếp theo.'
                    : bulkAction === 'request_changes'
                    ? 'Sinh viên sẽ cần chỉnh sửa đề cương trước khi nộp lại.'
                    : 'Từ chối đề cương sẽ yêu cầu sinh viên tạo bản đề xuất mới.'}
                </Typography>
              </Alert>
            )}
          </Box>

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
                ? 'Vui lòng cung cấp lý do cho sinh viên'
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
              ? 'Yêu cầu chỉnh sửa'
              : 'Từ chối tất cả'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
