'use client';

import { FieldPool, fieldPoolHooks } from '@/services/fieldPoolService';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  DateRange as DateRangeIcon,
  Delete as DeleteIcon,
  Domain as DomainIcon,
  Edit as EditIcon,
  FilterList as FilterIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
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
import { format, isValid, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

// Status color mapping
const getStatusColor = (
  status: string,
): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case 'OPEN':
      return 'success';
    case 'CLOSED':
      return 'warning';
    case 'HIDDEN':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusText = (status: string): string => {
  switch (status) {
    case 'OPEN':
      return 'Đang mở';
    case 'CLOSED':
      return 'Đã đóng';
    case 'HIDDEN':
      return 'Ẩn';
    default:
      return status;
  }
};

// Form interfaces
interface FieldPoolFormData {
  name: string;
  description: string;
  registrationDeadline: string;
  status: 'OPEN' | 'CLOSED' | 'HIDDEN';
}

interface ExtendDeadlineFormData {
  newDeadline: string;
  reason: string;
}

export default function FieldPoolManagementPage() {
  // State management
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedFieldPool, setSelectedFieldPool] = useState<FieldPool | null>(
    null,
  );

  // Dialog states
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [extendDeadlineDialog, setExtendDeadlineDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);

  // Form states
  const [fieldPoolForm, setFieldPoolForm] = useState<FieldPoolFormData>({
    name: '',
    description: '',
    registrationDeadline: '',
    status: 'OPEN',
  });

  const [extendDeadlineForm, setExtendDeadlineForm] =
    useState<ExtendDeadlineFormData>({
      newDeadline: '',
      reason: '',
    });

  // API hooks
  const {
    data: fieldPools = [],
    isLoading: fieldPoolsLoading,
    refetch: refetchFieldPools,
  } = fieldPoolHooks.useFieldPools({
    search: searchTerm,
    status: statusFilter || undefined,
    page: page + 1,
    limit: rowsPerPage,
    orderBy: 'updatedAt',
    asc: 'desc',
  });
  // Mutations
  const createFieldPoolMutation = fieldPoolHooks.useCreateFieldPool();
  const updateFieldPoolMutation = fieldPoolHooks.useUpdateFieldPool();
  const extendDeadlineMutation = fieldPoolHooks.useExtendRegistrationDeadline();
  const deleteFieldPoolMutation = fieldPoolHooks.useDeleteFieldPool();

  // Event handlers
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleStatusFilter = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
    setPage(0);
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

  // Form handlers
  const handleCreateFieldPool = async () => {
    try {
      await createFieldPoolMutation.mutateAsync({
        name: fieldPoolForm.name,
        description: fieldPoolForm.description,
        registrationDeadline: fieldPoolForm.registrationDeadline,
      });
      toast.success('Tạo lĩnh vực thành công');
      setCreateDialog(false);
      resetForm();
      refetchFieldPools();
    } catch {
      toast.error('Không thể tạo lĩnh vực');
    }
  };

  const handleUpdateFieldPool = async () => {
    if (!selectedFieldPool) return;

    try {
      await updateFieldPoolMutation.mutateAsync({
        id: selectedFieldPool.id,
        name: fieldPoolForm.name,
        description: fieldPoolForm.description,
        registrationDeadline: fieldPoolForm.registrationDeadline,
        status: fieldPoolForm.status,
      });
      toast.success('Cập nhật lĩnh vực thành công');
      setEditDialog(false);
      resetForm();
      refetchFieldPools();
    } catch {
      toast.error('Không thể cập nhật lĩnh vực');
    }
  };

  const handleExtendDeadline = async () => {
    if (!selectedFieldPool) return;

    try {
      await extendDeadlineMutation.mutateAsync({
        id: selectedFieldPool.id,
        newDeadline: extendDeadlineForm.newDeadline,
        reason: extendDeadlineForm.reason,
      });
      toast.success(
        `Đã gia hạn đăng ký đến ${format(
          parseISO(extendDeadlineForm.newDeadline),
          'dd/MM/yyyy HH:mm',
          { locale: vi },
        )}`,
      );
      setExtendDeadlineDialog(false);
      setExtendDeadlineForm({ newDeadline: '', reason: '' });
      refetchFieldPools();
    } catch {
      toast.error('Không thể gia hạn đăng ký');
    }
  };

  const handleDeleteFieldPool = async () => {
    if (!selectedFieldPool) return;

    try {
      await deleteFieldPoolMutation.mutateAsync(selectedFieldPool.id);
      toast.success('Xóa lĩnh vực thành công');
      setDeleteDialog(false);
      setSelectedFieldPool(null);
      refetchFieldPools();
    } catch {
      toast.error('Không thể xóa lĩnh vực');
    }
  };

  // Utility functions
  const resetForm = () => {
    setFieldPoolForm({
      name: '',
      description: '',
      registrationDeadline: '',
      status: 'OPEN',
    });
    setSelectedFieldPool(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setCreateDialog(true);
  };

  const openEditDialog = (fieldPool: FieldPool) => {
    setSelectedFieldPool(fieldPool);
    setFieldPoolForm({
      name: fieldPool.name,
      description: fieldPool.description,
      registrationDeadline: fieldPool.registrationDeadline,
      status: fieldPool.status,
    });
    setEditDialog(true);
  };

  const openExtendDeadlineDialog = (fieldPool: FieldPool) => {
    setSelectedFieldPool(fieldPool);
    setExtendDeadlineForm({
      newDeadline: '',
      reason: '',
    });
    setExtendDeadlineDialog(true);
  };

  const openDeleteDialog = (fieldPool: FieldPool) => {
    setSelectedFieldPool(fieldPool);
    setDeleteDialog(true);
  };

  const openViewDialog = (fieldPool: FieldPool) => {
    setSelectedFieldPool(fieldPool);
    setViewDialog(true);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'N/A';
      return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return 'N/A';
    }
  };

  const isDeadlineExpired = (deadline: string) => {
    try {
      const date = parseISO(deadline);
      return isValid(date) && date < new Date();
    } catch {
      return false;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h4" color="primary" fontWeight="bold">
            Quản lý lĩnh vực nghiên cứu
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
            size="large"
          >
            Tạo lĩnh vực mới
          </Button>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DomainIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {fieldPools?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tổng lĩnh vực
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AssignmentIcon
                    color="success"
                    sx={{ fontSize: 40, mr: 2 }}
                  />
                  <Box>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="success.main"
                    >
                      {fieldPools?.filter(
                        (fp: FieldPool) => fp.status === 'OPEN',
                      ).length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Đang mở đăng ký
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PeopleIcon color="info" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="info.main"
                    >
                      {fieldPools?.reduce(
                        (sum: number, fp: FieldPool) =>
                          sum + (fp._count?.StudentSelection || 0),
                        0,
                      ) || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sinh viên đăng ký
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SchoolIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="warning.main"
                    >
                      {fieldPools?.reduce(
                        (sum: number, fp: FieldPool) =>
                          sum + (fp._count?.LecturerSelection || 0),
                        0,
                      ) || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Giảng viên tham gia
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters and Search */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm lĩnh vực..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  label="Trạng thái"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="OPEN">Đang mở</MenuItem>
                  <MenuItem value="CLOSED">Đã đóng</MenuItem>
                  <MenuItem value="HIDDEN">Ẩn</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setPage(0);
                }}
              >
                Xóa bộ lọc
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Field Pools Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên lĩnh vực</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Hạn đăng ký</TableCell>
                  <TableCell align="center">SV đăng ký</TableCell>
                  <TableCell align="center">GV tham gia</TableCell>
                  <TableCell align="center">Dự án</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fieldPoolsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : fieldPools?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Không có lĩnh vực nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  fieldPools?.map((fieldPool: FieldPool) => (
                    <TableRow key={fieldPool.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {fieldPool.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                          >
                            {fieldPool.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(fieldPool.status)}
                          color={getStatusColor(fieldPool.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {formatDate(fieldPool.registrationDeadline)}
                          </Typography>
                          {isDeadlineExpired(
                            fieldPool.registrationDeadline,
                          ) && (
                            <Chip
                              label="Đã hết hạn"
                              color="error"
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="h6" color="primary">
                          {fieldPool._count?.StudentSelection || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="h6" color="secondary">
                          {fieldPool._count?.LecturerSelection || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="h6" color="success.main">
                          {fieldPool._count?.Project || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Xem chi tiết">
                            <IconButton
                              size="small"
                              onClick={() => openViewDialog(fieldPool)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Chỉnh sửa">
                            <IconButton
                              size="small"
                              onClick={() => openEditDialog(fieldPool)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Gia hạn đăng ký">
                            <IconButton
                              size="small"
                              onClick={() =>
                                openExtendDeadlineDialog(fieldPool)
                              }
                              color="warning"
                            >
                              <ScheduleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton
                              size="small"
                              onClick={() => openDeleteDialog(fieldPool)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={fieldPools?.length || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
            }
          />
        </Paper>

        {/* Create Field Pool Dialog */}
        <Dialog
          open={createDialog}
          onClose={() => setCreateDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Tạo lĩnh vực nghiên cứu mới</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Tên lĩnh vực"
                value={fieldPoolForm.name}
                onChange={(e) =>
                  setFieldPoolForm({ ...fieldPoolForm, name: e.target.value })
                }
                required
              />
              <TextField
                fullWidth
                label="Mô tả"
                value={fieldPoolForm.description}
                onChange={(e) =>
                  setFieldPoolForm({
                    ...fieldPoolForm,
                    description: e.target.value,
                  })
                }
                multiline
                rows={3}
              />
              <TextField
                fullWidth
                label="Hạn đăng ký"
                type="datetime-local"
                value={fieldPoolForm.registrationDeadline}
                onChange={(e) =>
                  setFieldPoolForm({
                    ...fieldPoolForm,
                    registrationDeadline: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
                required
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialog(false)}>Hủy</Button>
            <Button
              variant="contained"
              onClick={handleCreateFieldPool}
              disabled={
                createFieldPoolMutation.isPending ||
                !fieldPoolForm.name ||
                !fieldPoolForm.registrationDeadline
              }
            >
              {createFieldPoolMutation.isPending ? (
                <CircularProgress size={24} />
              ) : (
                'Tạo'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Field Pool Dialog */}
        <Dialog
          open={editDialog}
          onClose={() => setEditDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Chỉnh sửa lĩnh vực nghiên cứu</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Tên lĩnh vực"
                value={fieldPoolForm.name}
                onChange={(e) =>
                  setFieldPoolForm({ ...fieldPoolForm, name: e.target.value })
                }
                required
              />
              <TextField
                fullWidth
                label="Mô tả"
                value={fieldPoolForm.description}
                onChange={(e) =>
                  setFieldPoolForm({
                    ...fieldPoolForm,
                    description: e.target.value,
                  })
                }
                multiline
                rows={3}
              />
              <TextField
                fullWidth
                label="Hạn đăng ký"
                type="datetime-local"
                value={fieldPoolForm.registrationDeadline}
                onChange={(e) =>
                  setFieldPoolForm({
                    ...fieldPoolForm,
                    registrationDeadline: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
                required
              />
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={fieldPoolForm.status}
                  onChange={(e) =>
                    setFieldPoolForm({
                      ...fieldPoolForm,
                      status: e.target.value as 'OPEN' | 'CLOSED' | 'HIDDEN',
                    })
                  }
                  label="Trạng thái"
                >
                  <MenuItem value="OPEN">Đang mở</MenuItem>
                  <MenuItem value="CLOSED">Đã đóng</MenuItem>
                  <MenuItem value="HIDDEN">Ẩn</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog(false)}>Hủy</Button>
            <Button
              variant="contained"
              onClick={handleUpdateFieldPool}
              disabled={
                updateFieldPoolMutation.isPending ||
                !fieldPoolForm.name ||
                !fieldPoolForm.registrationDeadline
              }
            >
              {updateFieldPoolMutation.isPending ? (
                <CircularProgress size={24} />
              ) : (
                'Cập nhật'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Extend Deadline Dialog */}
        <Dialog
          open={extendDeadlineDialog}
          onClose={() => setExtendDeadlineDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DateRangeIcon sx={{ mr: 1 }} />
              Gia hạn đăng ký
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedFieldPool && (
              <Stack spacing={3} sx={{ mt: 1 }}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Lĩnh vực:</strong> {selectedFieldPool.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Hạn hiện tại:</strong>{' '}
                    {formatDate(selectedFieldPool.registrationDeadline)}
                  </Typography>
                </Alert>
                <TextField
                  fullWidth
                  label="Hạn đăng ký mới"
                  type="datetime-local"
                  value={extendDeadlineForm.newDeadline}
                  onChange={(e) =>
                    setExtendDeadlineForm({
                      ...extendDeadlineForm,
                      newDeadline: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                  required
                />
                <TextField
                  fullWidth
                  label="Lý do gia hạn"
                  value={extendDeadlineForm.reason}
                  onChange={(e) =>
                    setExtendDeadlineForm({
                      ...extendDeadlineForm,
                      reason: e.target.value,
                    })
                  }
                  multiline
                  rows={3}
                  placeholder="Nhập lý do gia hạn đăng ký..."
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExtendDeadlineDialog(false)}>Hủy</Button>
            <Button
              variant="contained"
              onClick={handleExtendDeadline}
              disabled={
                extendDeadlineMutation.isPending ||
                !extendDeadlineForm.newDeadline
              }
              color="warning"
            >
              {extendDeadlineMutation.isPending ? (
                <CircularProgress size={24} />
              ) : (
                'Gia hạn'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog}
          onClose={() => setDeleteDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle color="error">Xác nhận xóa</DialogTitle>
          <DialogContent>
            {selectedFieldPool && (
              <Alert severity="warning">
                <Typography variant="body1">
                  Bạn có chắc chắn muốn xóa lĩnh vực{' '}
                  <strong>&ldquo;{selectedFieldPool.name}&rdquo;</strong>?
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Hành động này không thể hoàn tác và sẽ ảnh hưởng đến:
                </Typography>
                <ul>
                  <li>
                    {selectedFieldPool._count?.StudentSelection || 0} đăng ký
                    của sinh viên
                  </li>
                  <li>
                    {selectedFieldPool._count?.LecturerSelection || 0} tham gia
                    của giảng viên
                  </li>
                  <li>
                    {selectedFieldPool._count?.Project || 0} dự án liên quan
                  </li>
                </ul>
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>Hủy</Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteFieldPool}
              disabled={deleteFieldPoolMutation.isPending}
            >
              {deleteFieldPoolMutation.isPending ? (
                <CircularProgress size={24} />
              ) : (
                'Xóa'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Field Pool Dialog */}
        <Dialog
          open={viewDialog}
          onClose={() => setViewDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Chi tiết lĩnh vực nghiên cứu</DialogTitle>
          <DialogContent>
            {selectedFieldPool && (
              <Stack spacing={3} sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tên lĩnh vực
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedFieldPool.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Trạng thái
                    </Typography>
                    <Chip
                      label={getStatusText(selectedFieldPool.status)}
                      color={getStatusColor(selectedFieldPool.status)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Mô tả
                    </Typography>
                    <Typography variant="body1">
                      {selectedFieldPool.description || 'Không có mô tả'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Hạn đăng ký
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedFieldPool.registrationDeadline)}
                    </Typography>
                    {isDeadlineExpired(
                      selectedFieldPool.registrationDeadline,
                    ) && (
                      <Chip
                        label="Đã hết hạn"
                        color="error"
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ngày tạo
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedFieldPool.createdAt)}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Statistics */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Thống kê
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="primary">
                            {selectedFieldPool._count?.StudentSelection || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Sinh viên đăng ký
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={4}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="secondary">
                            {selectedFieldPool._count?.LecturerSelection || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Giảng viên tham gia
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={4}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="success.main">
                            {selectedFieldPool._count?.Project || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Dự án
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialog(false)}>Đóng</Button>
            {selectedFieldPool && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<ScheduleIcon />}
                  onClick={() => {
                    setViewDialog(false);
                    openExtendDeadlineDialog(selectedFieldPool);
                  }}
                  color="warning"
                >
                  Gia hạn đăng ký
                </Button>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setViewDialog(false);
                    openEditDialog(selectedFieldPool);
                  }}
                >
                  Chỉnh sửa
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </motion.div>
  );
}
