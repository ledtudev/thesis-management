'use client';

import api from '@/lib/axios';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Group as GroupIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import React, { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

import { FieldPool } from '@/services/fieldPoolService';
import {
  CreateLecturerSelectionDto,
  LecturerSelection,
  LecturerSelectionStatusT,
  useCreateLecturerSelection,
  useDeleteLecturerSelection,
  useMyLecturerSelections,
  useUpdateLecturerSelection,
} from '@/services/lecturerSelectionService';

interface RegisterDialogProps {
  open: boolean;
  onClose: () => void;
  fieldPool: FieldPool | null;
  existingSelection?: LecturerSelection;
}

const RegisterDialog: React.FC<RegisterDialogProps> = ({
  open,
  onClose,
  fieldPool,
  existingSelection,
}) => {
  const [capacity, setCapacity] = useState(existingSelection?.capacity || 1);
  const createMutation = useCreateLecturerSelection();
  const updateMutation = useUpdateLecturerSelection();

  const handleSubmit = async () => {
    if (!fieldPool) return;

    try {
      if (existingSelection) {
        await updateMutation.mutateAsync({
          id: existingSelection.id,
          dto: { capacity },
        });
        toast.success('Cập nhật đăng ký thành công!');
      } else {
        const dto: CreateLecturerSelectionDto = {
          fieldPoolId: fieldPool.id,
          capacity,
        };
        await createMutation.mutateAsync(dto);
        toast.success('Đăng ký thành công!');
      }
      onClose();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || 'Có lỗi xảy ra'
          : 'Có lỗi xảy ra';
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {existingSelection ? 'Cập nhật đăng ký' : 'Đăng ký lĩnh vực'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="h6" gutterBottom>
            {fieldPool?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {fieldPool?.description}
          </Typography>

          <TextField
            fullWidth
            label="Số lượng sinh viên tối đa"
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
            inputProps={{ min: 1, max: 20 }}
            helperText="Số lượng sinh viên tối đa bạn có thể hướng dẫn trong lĩnh vực này"
            sx={{ mt: 2 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {existingSelection ? 'Cập nhật' : 'Đăng ký'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const FieldPoolCard: React.FC<{
  fieldPool: FieldPool;
  existingSelection?: LecturerSelection;
  onRegister: (
    fieldPool: FieldPool,
    existingSelection?: LecturerSelection,
  ) => void;
  onDelete: (selection: LecturerSelection) => void;
}> = ({ fieldPool, existingSelection, onRegister, onDelete }) => {
  const isRegistered = !!existingSelection;
  const isExpired = new Date(fieldPool.registrationDeadline) < new Date();
  const canRegister = !isExpired && fieldPool.status === 'OPEN';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'success';
      case 'CLOSED':
        return 'error';
      case 'HIDDEN':
        return 'default';
      default:
        return 'default';
    }
  };

  const getSelectionStatusColor = (status: LecturerSelectionStatusT) => {
    switch (status) {
      case LecturerSelectionStatusT.APPROVED:
        return 'success';
      case LecturerSelectionStatusT.REJECTED:
        return 'error';
      case LecturerSelectionStatusT.PENDING:
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: isRegistered ? '2px solid' : '1px solid',
          borderColor: isRegistered ? 'primary.main' : 'divider',
          position: 'relative',
        }}
      >
        {isRegistered && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
            }}
          >
            <Chip
              icon={<CheckCircleIcon />}
              label={existingSelection?.status}
              color={getSelectionStatusColor(existingSelection!.status)}
              size="small"
            />
          </Box>
        )}

        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              {fieldPool.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {fieldPool.description}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={fieldPool.status}
                color={getStatusColor(fieldPool.status)}
                size="small"
              />
              {isExpired && (
                <Chip
                  icon={<ScheduleIcon />}
                  label="Hết hạn"
                  color="error"
                  size="small"
                />
              )}
            </Stack>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <ScheduleIcon
                sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }}
              />
              Hạn đăng ký:{' '}
              {new Date(fieldPool.registrationDeadline).toLocaleString('vi-VN')}
            </Typography>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={4}>
              <Box textAlign="center">
                <Typography variant="h6" color="primary">
                  {fieldPool._count?.LecturerSelection || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Giảng viên
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box textAlign="center">
                <Typography variant="h6" color="primary">
                  {fieldPool._count?.StudentSelection || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Sinh viên
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box textAlign="center">
                <Typography variant="h6" color="primary">
                  {fieldPool._count?.Project || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Dự án
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {fieldPool.FieldPoolDomain &&
            fieldPool.FieldPoolDomain.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Lĩnh vực:
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {fieldPool.FieldPoolDomain.map((domain, index) => (
                    <Chip
                      key={index}
                      label={domain.Domain.name}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>
            )}

          {isRegistered && existingSelection && (
            <Box sx={{ mb: 2, p: 1, bgcolor: 'primary.50', borderRadius: 1 }}>
              <Typography variant="body2" color="primary">
                <GroupIcon
                  sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }}
                />
                Đã đăng ký với sức chứa: {existingSelection.capacity} sinh viên
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hiện tại: {existingSelection.currentCapacity}/
                {existingSelection.capacity}
              </Typography>
            </Box>
          )}
        </CardContent>

        <Box sx={{ p: 2, pt: 0 }}>
          <Stack direction="row" spacing={1}>
            {canRegister && !isRegistered && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => onRegister(fieldPool)}
                fullWidth
              >
                Đăng ký
              </Button>
            )}

            {isRegistered && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => onRegister(fieldPool, existingSelection)}
                  sx={{ flex: 1 }}
                >
                  Sửa
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => onDelete(existingSelection!)}
                  sx={{ flex: 1 }}
                >
                  Hủy
                </Button>
              </>
            )}

            {!canRegister && !isRegistered && (
              <Button variant="outlined" disabled fullWidth>
                {isExpired ? 'Hết hạn đăng ký' : 'Không thể đăng ký'}
              </Button>
            )}
          </Stack>
        </Box>
      </Card>
    </motion.div>
  );
};

export default function LecturerProjectRegisterPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selectedFieldPool, setSelectedFieldPool] = useState<FieldPool | null>(
    null,
  );
  const [selectedSelection, setSelectedSelection] = useState<
    LecturerSelection | undefined
  >();
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);

  const limit = 12;

  const {
    data: fieldPoolsResponse,
    isLoading: fieldPoolsLoading,
    refetch: refetchFieldPools,
  } = useQuery({
    queryKey: [
      'fieldPools',
      { search: searchTerm, status: statusFilter, page, limit },
    ],
    queryFn: () =>
      api.get<{
        message: string;
        data: FieldPool[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>('/field-pool', {
        params: {
          search: searchTerm || undefined,
          status: statusFilter || undefined,
          page,
          limit,
          orderBy: 'createdAt',
          asc: 'desc',
        },
      }),
  });

  // Fetch my lecturer selections
  const { data: mySelectionsResponse, refetch: refetchSelections } =
    useMyLecturerSelections();
  const mySelections = mySelectionsResponse?.data?.data || [];

  const deleteMutation = useDeleteLecturerSelection();

  // Create a map of field pool ID to existing selection
  const selectionMap = useMemo(() => {
    const map = new Map<string, LecturerSelection>();
    mySelections.forEach((selection) => {
      if (selection.fieldPoolId) {
        map.set(selection.fieldPoolId, selection);
      }
    });
    return map;
  }, [mySelections]);

  const handleRegister = (
    fieldPool: FieldPool,
    existingSelection?: LecturerSelection,
  ) => {
    setSelectedFieldPool(fieldPool);
    setSelectedSelection(existingSelection);
    setRegisterDialogOpen(true);
  };

  const handleDelete = async (selection: LecturerSelection) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đăng ký này?')) {
      try {
        await deleteMutation.mutateAsync(selection.id);
        toast.success('Hủy đăng ký thành công!');
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error && 'response' in error
            ? (error as { response?: { data?: { message?: string } } }).response
                ?.data?.message || 'Có lỗi xảy ra'
            : 'Có lỗi xảy ra';
        toast.error(errorMessage);
      }
    }
  };

  const handleRefresh = () => {
    refetchFieldPools();
    refetchSelections();
  };

  const fieldPools = fieldPoolsResponse?.data?.data || [];
  const totalPages = fieldPoolsResponse?.data?.pagination?.totalPages || 1;

  const registeredCount = mySelections.length;
  const approvedCount = mySelections.filter(
    (s) => s.status === LecturerSelectionStatusT.APPROVED,
  ).length;
  const pendingCount = mySelections.filter(
    (s) => s.status === LecturerSelectionStatusT.PENDING,
  ).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Đăng ký lĩnh vực nghiên cứu
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Đăng ký tham gia các lĩnh vực nghiên cứu để hướng dẫn sinh viên thực
          hiện đồ án
        </Typography>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssignmentIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" color="primary">
                    {registeredCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đã đăng ký
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircleIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" color="success.main">
                    {approvedCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đã duyệt
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ScheduleIcon color="warning" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {pendingCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chờ duyệt
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <SchoolIcon color="info" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" color="info.main">
                    {fieldPools.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lĩnh vực khả dụng
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm lĩnh vực..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Trạng thái"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="OPEN">Đang mở</MenuItem>
                  <MenuItem value="CLOSED">Đã đóng</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                fullWidth
              >
                Làm mới
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Field Pools Grid */}
      {fieldPoolsLoading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="80%" height={32} />
                  <Skeleton variant="text" width="100%" height={20} />
                  <Skeleton variant="text" width="100%" height={20} />
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={100}
                    sx={{ mt: 2 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : fieldPools.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <SchoolIcon
                sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Không tìm thấy lĩnh vực nào
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {fieldPools.map((fieldPool: FieldPool) => (
            <Grid item xs={12} sm={6} md={4} key={fieldPool.id}>
              <FieldPoolCard
                fieldPool={fieldPool}
                existingSelection={selectionMap.get(fieldPool.id)}
                onRegister={handleRegister}
                onDelete={handleDelete}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}

      {/* Register Dialog */}
      <RegisterDialog
        open={registerDialogOpen}
        onClose={() => setRegisterDialogOpen(false)}
        fieldPool={selectedFieldPool}
        existingSelection={selectedSelection}
      />
    </Box>
  );
}
