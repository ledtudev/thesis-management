'use client';
import { useProposedProjects } from '@/services/proposalService';
import { useAuthStore } from '@/state/authStore';
import { Clear, FilterList, Search } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
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
  Typography,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import toast from 'react-hot-toast';

// Maps the status to colors
const statusColors = {
  PENDING_ADVISOR: 'default',
  REQUESTED_CHANGES_ADVISOR: 'warning',
  REJECTED_BY_ADVISOR: 'error',
  ADVISOR_APPROVED: 'success',
  PENDING_HEAD: 'default',
  REQUESTED_CHANGES_HEAD: 'warning',
  REJECTED_BY_HEAD: 'error',
  APPROVED_BY_HEAD: 'success',
  TOPIC_SUBMISSION_PENDING: 'info',
  TOPIC_PENDING_ADVISOR: 'default',
  TOPIC_REQUESTED_CHANGES: 'warning',
  TOPIC_APPROVED: 'success',
  OUTLINE_PENDING_SUBMISSION: 'info',
  OUTLINE_PENDING_ADVISOR: 'default',
  OUTLINE_REQUESTED_CHANGES: 'warning',
  OUTLINE_REJECTED: 'error',
  OUTLINE_APPROVED: 'success',
} as const;

// Status labels for better display
const statusLabels = {
  PENDING_ADVISOR: 'Chờ GVHD duyệt',
  REQUESTED_CHANGES_ADVISOR: 'GVHD yêu cầu chỉnh sửa',
  REJECTED_BY_ADVISOR: 'GVHD đã từ chối',
  ADVISOR_APPROVED: 'GVHD đã duyệt',
  PENDING_HEAD: 'Chờ Trưởng bộ môn duyệt',
  REQUESTED_CHANGES_HEAD: 'Trưởng bộ môn yêu cầu chỉnh sửa',
  REJECTED_BY_HEAD: 'Trưởng bộ môn từ chối',
  APPROVED_BY_HEAD: 'Trưởng bộ môn đã duyệt',
  TOPIC_SUBMISSION_PENDING: 'Chờ nộp đề tài',
  TOPIC_PENDING_ADVISOR: 'Chờ GVHD duyệt đề tài',
  TOPIC_REQUESTED_CHANGES: 'GVHD yêu cầu chỉnh sửa đề tài',
  TOPIC_APPROVED: 'Đề tài được duyệt',
  OUTLINE_PENDING_SUBMISSION: 'Chờ nộp đề cương',
  OUTLINE_PENDING_ADVISOR: 'Chờ GVHD duyệt đề cương',
  OUTLINE_REQUESTED_CHANGES: 'GVHD yêu cầu chỉnh sửa đề cương',
  OUTLINE_REJECTED: 'Đề cương bị từ chối',
  OUTLINE_APPROVED: 'Đề cương được duyệt',
};

export default function ProposalManagement() {
  const router = useRouter();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('');

  const user = useAuthStore((state) => state.user);
  // Fetch proposals
  const {
    data: proposalsData,
    isLoading,
    isError,
    error,
  } = useProposedProjects({
    advisorId: user?.id,
  });

  console.log('Raw proposalsData:', proposalsData);

  // Display any fetch errors using toast
  React.useEffect(() => {
    if (isError && error) {
      toast.error(
        `Lỗi khi tải danh sách đề xuất: ${
          error instanceof Error ? error.message : 'Lỗi không xác định'
        }`,
      );
    }
  }, [isError, error]);

  const handleSelectProposal = (id: string) => {
    router.push(`/project/proposal/${id}`);
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
    setPage(0); // Reset to first page when searching
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    setPage(0); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPage(0);
  };

  // Filter and process data for pagination
  const filteredProposals = React.useMemo(() => {
    // Fix: Access the actual array data correctly
    let proposals = [];

    console.log('proposalsData structure:', {
      proposalsData,
      hasData: !!proposalsData?.data,
      hasDataData: !!proposalsData?.data?.data,
      isDataArray: Array.isArray(proposalsData?.data),
      isDataDataArray: Array.isArray(proposalsData?.data?.data),
    });

    if (proposalsData?.data?.data && Array.isArray(proposalsData.data.data)) {
      proposals = proposalsData.data.data;
    } else if (proposalsData?.data && Array.isArray(proposalsData.data)) {
      proposals = proposalsData.data;
    } else if (Array.isArray(proposalsData)) {
      proposals = proposalsData;
    }

    console.log('Processed proposals:', proposals);
    console.log('Proposals length:', proposals.length);

    const filtered = proposals.filter((proposal) => {
      // Apply search filter (case insensitive)
      const matchesSearch =
        searchTerm === '' ||
        proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (proposal.description &&
          proposal.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      // Apply status filter
      const matchesStatus =
        statusFilter === '' || proposal.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    console.log('Filtered proposals:', filtered);
    console.log('Filtered length:', filtered.length);

    return filtered;
  }, [proposalsData, searchTerm, statusFilter]);

  // Apply pagination
  const paginatedProposals = filteredProposals.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  // Check if any filters are applied
  const isFiltered = searchTerm !== '' || statusFilter !== '';

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" color="primary" sx={{ mb: 3 }}>
        Danh sách đề cương
      </Typography>

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
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <Clear fontSize="small" />
                  </IconButton>
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
              {Object.entries(statusLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {isFiltered && (
            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={clearFilters}
              size="small"
            >
              Xóa bộ lọc
            </Button>
          )}
        </Stack>
      </Paper>

      <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Typography color="error" sx={{ textAlign: 'center', p: 4 }}>
            Đã xảy ra lỗi khi tải dữ liệu
          </Typography>
        ) : filteredProposals.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography color="text.secondary">
              {isFiltered
                ? 'Không tìm thấy đề tài nào phù hợp với bộ lọc.'
                : 'Chưa có đề tài nào!'}
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
                    <TableCell width="40%">Tên đề tài</TableCell>
                    <TableCell width="30%">Mô tả</TableCell>
                    <TableCell width="15%">Trạng thái</TableCell>
                    <TableCell width="15%">Thời gian</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedProposals.map((proposal) => (
                    <TableRow
                      hover
                      key={proposal.id}
                      onClick={() => handleSelectProposal(proposal.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Typography variant="body1" fontWeight={500}>
                          {proposal.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {proposal.description ? (
                          <Typography
                            variant="body2"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {proposal.description}
                          </Typography>
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            fontStyle="italic"
                          >
                            Không có mô tả
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            statusLabels[proposal.status] || proposal.status
                          }
                          size="small"
                          color={statusColors[proposal.status] || 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {proposal.createdAt && (
                          <Typography variant="body2">
                            {formatDistanceToNow(new Date(proposal.createdAt), {
                              addSuffix: true,
                              locale: vi,
                            })}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredProposals.length}
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
