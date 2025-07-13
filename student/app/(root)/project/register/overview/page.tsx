/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { formatDate } from '@/lib/utils';
import {
  StudentSelection,
  StudentSelectionResponse,
  StudentSelectionStatus,
  useDeleteStudentSelection,
  useMyStudentSelections,
  useUpdateStudentSelectionStatus,
} from '@/services/studentSelectionService';
import { useAuthStore } from '@/state/authStore';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  DeleteOutline as DeleteIcon,
  Edit as EditIcon,
  InfoOutlined as InfoIcon,
  Person as PersonIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Fade,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Snackbar,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useTheme,
  Zoom,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { Fragment, useState } from 'react';

// Status chip component for consistent style
const StatusChip = ({ status }: { status: StudentSelectionStatus }) => {
  let color:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning' = 'default';
  let label = 'Unknown';

  switch (status) {
    case StudentSelectionStatus.PENDING:
      color = 'info';
      label = 'Đang chờ';
      break;
    case StudentSelectionStatus.APPROVED:
      color = 'primary';
      label = 'Đã duyệt';
      break;
    case StudentSelectionStatus.CONFIRMED:
      color = 'success';
      label = 'Đã xác nhận';
      break;
    case StudentSelectionStatus.REJECTED:
      color = 'error';
      label = 'Từ chối';
      break;
    case StudentSelectionStatus.REQUESTED_CHANGES:
      color = 'warning';
      label = 'Yêu cầu chỉnh sửa';
      break;
  }

  return (
    <Chip
      label={label}
      color={color}
      size="small"
      sx={{ fontWeight: 500, minWidth: 100, justifyContent: 'center' }}
    />
  );
};

export default function SelectionOverviewPage() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState<
    StudentSelectionStatus | 'ALL'
  >('ALL');
  const [sortBy, setSortBy] = useState<'priority' | 'createdAt' | 'updatedAt'>(
    'priority',
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedSelectionId, setSelectedSelectionId] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Fetch student selections using the new hook
  const {
    data: selectionsResponse,
    isLoading,
    isError,
    refetch,
  } = useMyStudentSelections({
    orderBy: sortBy,
    asc: sortOrder,
  });

  // Extract the selections array from the response correctly
  const selectionData: StudentSelectionResponse | undefined =
    selectionsResponse?.data?.data;
  const selections: StudentSelection[] = selectionData?.data || [];

  // Update status mutation
  const updateStatus = useUpdateStudentSelectionStatus();

  // Delete selection mutation
  const deleteSelection = useDeleteStudentSelection();

  // Handler for tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  // Handle selection status confirmation (student accepting an approved selection)
  const handleConfirmSelection = async () => {
    try {
      await updateStatus.mutateAsync({
        id: selectedSelectionId,
        status: StudentSelectionStatus.CONFIRMED,
      });
      setNotification({
        open: true,
        message: 'Đã xác nhận nguyện vọng thành công',
        severity: 'success',
      });
      refetch();
    } catch (error) {
      setNotification({
        open: true,
        message: 'Có lỗi xảy ra khi xác nhận nguyện vọng',
        severity: 'error',
      });
    } finally {
      setOpenConfirmDialog(false);
    }
  };

  // Handle selection deletion
  const handleDeleteSelection = async () => {
    try {
      await deleteSelection.mutateAsync(selectedSelectionId);
      setNotification({
        open: true,
        message: 'Đã xóa nguyện vọng thành công',
        severity: 'success',
      });
      refetch();
    } catch (error) {
      setNotification({
        open: true,
        message: 'Có lỗi xảy ra khi xóa nguyện vọng',
        severity: 'error',
      });
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  // Filter selections based on status filter
  const getFilteredAndSortedSelections = (): StudentSelection[] => {
    if (selections.length === 0) return [];

    let filtered = [...selections];

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(
        (selection) => selection.status === statusFilter,
      );
    }

    return filtered;
  };

  // Group selections by field pool
  const getGroupedSelections = (): Array<{
    fieldPoolId: string;
    fieldPoolName: string;
    selections: StudentSelection[];
  }> => {
    const filtered = getFilteredAndSortedSelections();
    const grouped: Record<
      string,
      {
        fieldPoolId: string;
        fieldPoolName: string;
        selections: StudentSelection[];
      }
    > = {};

    filtered.forEach((selection) => {
      const fieldPoolId = selection.fieldPoolId || 'unknown';
      const fieldPoolName = selection.fieldPool?.name || 'Chưa phân loại';

      if (!grouped[fieldPoolId]) {
        grouped[fieldPoolId] = {
          fieldPoolId,
          fieldPoolName,
          selections: [],
        };
      }

      grouped[fieldPoolId].selections.push(selection);
    });

    return Object.values(grouped);
  };

  const filteredSelections = getFilteredAndSortedSelections();
  const groupedSelections = getGroupedSelections();

  // Count selections by status
  const selectionCounts = {
    all: filteredSelections.length,
    pending: filteredSelections.filter(
      (s) => s.status === StudentSelectionStatus.PENDING,
    ).length,
    approved: filteredSelections.filter(
      (s) => s.status === StudentSelectionStatus.APPROVED,
    ).length,
    confirmed: filteredSelections.filter(
      (s) => s.status === StudentSelectionStatus.CONFIRMED,
    ).length,
    rejected: filteredSelections.filter(
      (s) => s.status === StudentSelectionStatus.REJECTED,
    ).length,
    requested_changes: filteredSelections.filter(
      (s) => s.status === StudentSelectionStatus.REQUESTED_CHANGES,
    ).length,
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/project/register')}
          variant="outlined"
        >
          Quay lại
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push('/project/register/theme')}
        >
          Đăng ký nguyện vọng mới
        </Button>
      </Box>

      <Fade in={true} timeout={800}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
          Tổng quan đăng ký nguyện vọng
        </Typography>
      </Fade>

      {isLoading ? (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
          <Box sx={{ mt: 2 }}>
            {[1, 2, 3].map((item) => (
              <Fade key={item} in={true} timeout={300 * item}>
                <Card sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={30} />
                    <Skeleton variant="text" width="40%" height={24} />
                    <Skeleton variant="text" width="80%" height={40} />
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mt: 2,
                      }}
                    >
                      <Skeleton variant="rectangular" width={100} height={30} />
                      <Skeleton variant="rectangular" width={150} height={30} />
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            ))}
          </Box>
        </Box>
      ) : isError ? (
        <Zoom in={true}>
          <Alert severity="error" sx={{ mb: 3 }}>
            Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
            <Button color="inherit" onClick={() => refetch()} sx={{ ml: 2 }}>
              Thử lại
            </Button>
          </Alert>
        </Zoom>
      ) : filteredSelections.length === 0 ? (
        <Fade in={true} timeout={500}>
          <Alert severity="info" sx={{ mb: 3, p: 3 }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Bạn chưa có nguyện vọng nào
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Hãy đăng ký nguyện vọng mới để bắt đầu quá trình lựa chọn đề tài
              cho dự án của bạn.
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/project/register/theme')}
            >
              Đăng ký nguyện vọng mới
            </Button>
          </Alert>
        </Fade>
      ) : (
        <>
          {/* Selection Stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Fade in={true} timeout={400}>
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                    borderRadius: 2,
                    height: '100%',
                    boxShadow: 3,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Tổng số nguyện vọng
                  </Typography>
                  <Typography variant="h3" sx={{ my: 1 }}>
                    {selectionCounts.all}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <Chip
                      size="small"
                      label={`${selectionCounts.pending} đang chờ`}
                      sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.2)' }}
                    />
                    <Chip
                      size="small"
                      label={`${selectionCounts.confirmed} đã xác nhận`}
                      sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.2)' }}
                    />
                  </Typography>
                </Paper>
              </Fade>
            </Grid>
            <Grid item xs={12} md={4}>
              <Fade in={true} timeout={600}>
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: theme.palette.success.light,
                    color: theme.palette.success.contrastText,
                    borderRadius: 2,
                    height: '100%',
                    boxShadow: 3,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Nguyện vọng được duyệt
                  </Typography>
                  <Typography variant="h3" sx={{ my: 1 }}>
                    {selectionCounts.approved}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      {selectionCounts.approved > 0
                        ? 'Bạn có nguyện vọng được duyệt. Hãy xác nhận để hoàn tất đăng ký.'
                        : 'Chưa có nguyện vọng nào được duyệt.'}
                    </Typography>
                  </Box>
                </Paper>
              </Fade>
            </Grid>
            <Grid item xs={12} md={4}>
              <Fade in={true} timeout={800}>
                <Paper
                  sx={{
                    p: 3,
                    bgcolor:
                      selectionCounts.rejected > 0
                        ? theme.palette.error.light
                        : theme.palette.grey[200],
                    color:
                      selectionCounts.rejected > 0
                        ? theme.palette.error.contrastText
                        : theme.palette.text.primary,
                    borderRadius: 2,
                    height: '100%',
                    boxShadow: 3,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Cần chú ý
                  </Typography>
                  <Typography variant="h3" sx={{ my: 1 }}>
                    {selectionCounts.rejected +
                      selectionCounts.requested_changes}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      {selectionCounts.rejected > 0 && (
                        <Chip
                          size="small"
                          label={`${selectionCounts.rejected} từ chối`}
                          sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.2)' }}
                        />
                      )}
                      {selectionCounts.requested_changes > 0 && (
                        <Chip
                          size="small"
                          label={`${selectionCounts.requested_changes} yêu cầu sửa`}
                          sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.2)' }}
                        />
                      )}
                    </Typography>
                  </Box>
                </Paper>
              </Fade>
            </Grid>
          </Grid>

          {/* Tabs and Filters */}
          <Fade in={true} timeout={1000}>
            <Box sx={{ mb: 3 }}>
              <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
                <Tabs
                  value={selectedTab}
                  onChange={handleTabChange}
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    '& .MuiTabs-indicator': {
                      height: 3,
                    },
                  }}
                >
                  <Tab label="Tất cả nguyện vọng" />
                  {/* <Tab label="Theo lĩnh vực" /> */}
                </Tabs>

                <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      label="Trạng thái"
                    >
                      <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
                      <MenuItem value={StudentSelectionStatus.PENDING}>
                        Đang chờ
                      </MenuItem>
                      <MenuItem value={StudentSelectionStatus.APPROVED}>
                        Đã duyệt
                      </MenuItem>
                      <MenuItem value={StudentSelectionStatus.CONFIRMED}>
                        Đã xác nhận
                      </MenuItem>
                      <MenuItem value={StudentSelectionStatus.REJECTED}>
                        Từ chối
                      </MenuItem>
                      <MenuItem
                        value={StudentSelectionStatus.REQUESTED_CHANGES}
                      >
                        Yêu cầu sửa
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Sắp xếp theo</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      label="Sắp xếp theo"
                    >
                      <MenuItem value="priority">Ưu tiên</MenuItem>
                      <MenuItem value="createdAt">Ngày tạo</MenuItem>
                      <MenuItem value="updatedAt">Ngày cập nhật</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Thứ tự</InputLabel>
                    <Select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as any)}
                      label="Thứ tự"
                    >
                      <MenuItem value="asc">Tăng dần</MenuItem>
                      <MenuItem value="desc">Giảm dần</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Paper>
            </Box>
          </Fade>

          {/* Selection List */}
          <Box sx={{ mt: 2 }}>
            {selectedTab === 0
              ? // All selections view
                filteredSelections.map((selection, index) => (
                  <Fade
                    key={selection.id}
                    in={true}
                    timeout={300 + index * 100}
                  >
                    <Card
                      sx={{
                        mb: 2,
                        borderRadius: 2,
                        boxShadow: 2,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4,
                        },
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 1,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              Nguyện vọng {selection.priority}
                            </Typography>
                            {selection.fieldPool && (
                              <Chip
                                label={selection.fieldPool.name}
                                size="small"
                                color="secondary"
                                variant="outlined"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                          <StatusChip status={selection.status} />
                        </Box>

                        <Typography variant="h6">
                          {selection.topicTitle || 'Chưa có tiêu đề'}
                        </Typography>

                        {selection.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                          >
                            {selection.description}
                          </Typography>
                        )}

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mt: 2,
                            color: 'text.secondary',
                            flexWrap: 'wrap',
                            gap: 2,
                          }}
                        >
                          {selection.lecturer && (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                              <Typography variant="body2">
                                {selection.lecturer.name}
                              </Typography>
                            </Box>
                          )}

                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">
                              Đăng ký: {formatDate(selection.createdAt)}
                            </Typography>
                          </Box>

                          {selection.updatedAt !== selection.createdAt && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarIcon fontSize="small" sx={{ mr: 0.5 }} />
                              <Typography variant="body2">
                                Cập nhật: {formatDate(selection.updatedAt)}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box
                          sx={{ display: 'flex', justifyContent: 'flex-end' }}
                        >
                          {/* {selection.status ===
                            StudentSelectionStatus.APPROVED && (
                            <Button
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => {
                                setSelectedSelectionId(selection.id);
                                setOpenConfirmDialog(true);
                              }}
                              sx={{ mr: 1 }}
                            >
                              Xác nhận
                            </Button>
                          )} */}

                          {selection.status ===
                            StudentSelectionStatus.PENDING && (
                            <>
                              <Tooltip title="Chỉnh sửa nguyện vọng">
                                <IconButton
                                  color="primary"
                                  onClick={() =>
                                    router.push(
                                      `/project/register/theme/${selection.fieldPoolId}/edit/${selection.id}`,
                                    )
                                  }
                                  sx={{ mr: 1 }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Xóa nguyện vọng">
                                <IconButton
                                  color="error"
                                  onClick={() => {
                                    setSelectedSelectionId(selection.id);
                                    setOpenDeleteDialog(true);
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}

                          <Tooltip title="Xem chi tiết">
                            <IconButton
                              onClick={() =>
                                router.push(
                                  `/project/register/theme/${selection.fieldPoolId}`,
                                )
                              }
                            >
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                ))
              : // Grouped by field pool view
                groupedSelections.map((group: any, groupIndex) => (
                  <Fade
                    key={group.fieldPoolId}
                    in={true}
                    timeout={300 + groupIndex * 200}
                  >
                    <Fragment>
                      <Paper
                        sx={{
                          p: 2,
                          mb: 2,
                          bgcolor: theme.palette.primary.main,
                          color: 'white',
                          borderRadius: '8px 8px 0 0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxShadow: 3,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SchoolIcon sx={{ mr: 1 }} />
                          <Typography variant="h6">
                            {group.fieldPoolName}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${group.selections.length} nguyện vọng`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                          }}
                        />
                      </Paper>

                      <Box sx={{ ml: 2, mb: 4 }}>
                        {group.selections.map(
                          (selection: any, index: number) => (
                            <Zoom
                              key={selection.id}
                              in={true}
                              style={{ transitionDelay: `${index * 100}ms` }}
                            >
                              <Card
                                sx={{
                                  mb: 2,
                                  borderRadius: 2,
                                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                                  boxShadow: 2,
                                  transition: 'all 0.2s ease-in-out',
                                  '&:hover': {
                                    transform: 'translateX(8px)',
                                    boxShadow: 4,
                                  },
                                }}
                              >
                                <CardContent>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      mb: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="subtitle1"
                                      fontWeight="bold"
                                    >
                                      Nguyện vọng {selection.priority}
                                    </Typography>
                                    <StatusChip status={selection.status} />
                                  </Box>

                                  <Typography variant="h6">
                                    {selection.topicTitle || 'Chưa có tiêu đề'}
                                  </Typography>

                                  {selection.description && (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ mt: 1 }}
                                    >
                                      {selection.description}
                                    </Typography>
                                  )}

                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      mt: 2,
                                      color: 'text.secondary',
                                      flexWrap: 'wrap',
                                      gap: 2,
                                    }}
                                  >
                                    {selection.lecturer && (
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                        }}
                                      >
                                        <PersonIcon
                                          fontSize="small"
                                          sx={{ mr: 0.5 }}
                                        />
                                        <Typography variant="body2">
                                          {selection.lecturer.name}
                                        </Typography>
                                      </Box>
                                    )}

                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <CalendarIcon
                                        fontSize="small"
                                        sx={{ mr: 0.5 }}
                                      />
                                      <Typography variant="body2">
                                        {formatDate(selection.createdAt)}
                                      </Typography>
                                    </Box>
                                  </Box>

                                  <Divider sx={{ my: 2 }} />

                                  <Box
                                    sx={{
                                      display: 'flex',
                                      justifyContent: 'flex-end',
                                    }}
                                  >
                                    {selection.status ===
                                      StudentSelectionStatus.APPROVED && (
                                      <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={<CheckCircleIcon />}
                                        onClick={() => {
                                          setSelectedSelectionId(selection.id);
                                          setOpenConfirmDialog(true);
                                        }}
                                        sx={{ mr: 1 }}
                                      >
                                        Xác nhận
                                      </Button>
                                    )}

                                    {selection.status ===
                                      StudentSelectionStatus.PENDING && (
                                      <>
                                        <Tooltip title="Chỉnh sửa nguyện vọng">
                                          <IconButton
                                            color="primary"
                                            onClick={() =>
                                              router.push(
                                                `/project/register/theme/${selection.fieldPoolId}/edit/${selection.id}`,
                                              )
                                            }
                                            sx={{ mr: 1 }}
                                          >
                                            <EditIcon />
                                          </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Xóa nguyện vọng">
                                          <IconButton
                                            color="error"
                                            onClick={() => {
                                              setSelectedSelectionId(
                                                selection.id,
                                              );
                                              setOpenDeleteDialog(true);
                                            }}
                                          >
                                            <DeleteIcon />
                                          </IconButton>
                                        </Tooltip>
                                      </>
                                    )}

                                    <Tooltip title="Xem chi tiết">
                                      <IconButton
                                        onClick={() =>
                                          router.push(
                                            `/project/register/theme/${selection.fieldPoolId}`,
                                          )
                                        }
                                      >
                                        <InfoIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Zoom>
                          ),
                        )}
                      </Box>
                    </Fragment>
                  </Fade>
                ))}
          </Box>
        </>
      )}

      {/* Confirm Dialog */}
      {/* <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        TransitionComponent={Zoom}
      >
        <DialogTitle>Xác nhận nguyện vọng</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xác nhận nguyện vọng này? Sau khi xác nhận,
            bạn sẽ không thể thay đổi nguyện vọng nữa.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Hủy</Button>
          <Button
            onClick={handleConfirmSelection}
            variant="contained"
            color="success"
            disabled={updateStatus.isPending}
          >
            {updateStatus.isPending ? (
              <CircularProgress size={24} />
            ) : (
              'Xác nhận'
            )}
          </Button>
        </DialogActions>
      </Dialog> */}

      {/* Delete Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        TransitionComponent={Zoom}
      >
        <DialogTitle>Xóa nguyện vọng</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa nguyện vọng này? Hành động này không thể
            hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button
            onClick={handleDeleteSelection}
            variant="contained"
            color="error"
            disabled={deleteSelection.isPending}
          >
            {deleteSelection.isPending ? <CircularProgress size={24} /> : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
