/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import { formatDate, getRemainingDays } from '@/lib/utils';
import { useCreateStudentSelection } from '@/services';
import {
  Department,
  FieldPoolDepartment,
  FieldPoolDomain,
  FieldPoolLecturer,
  useFieldPoolDetail,
  useLecturersByFieldPool,
} from '@/services/fieldPoolService';
import {
  LecturerSelection,
  useLecturerSelectionsByFieldPool,
} from '@/services/lecturerSelectionService';
import { useAuthStore } from '@/state/authStore';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowBack as ArrowBackIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  PeopleAlt,
  Person,
  School,
  Search,
  Sort,
  StarBorder as StarBorderIcon,
  Star as StarIcon,
  Subject,
  Topic,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2,
  IconButton,
  InputAdornment,
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  Skeleton,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuthStore();
  console.log(user);
  const paramId = Array.isArray(params.id) ? params.id[0] : params.id;
  const fieldPoolId = paramId || '';

  // Zod schema for form validation
  const formSchema = z
    .object({
      projectTopic: z.string(),
      selectedLecturers: z.array(z.string()).max(1),
      priority: z.number().min(1).max(3).default(1),
      description: z.string().optional(),
    })
    .refine(
      (data) =>
        data.projectTopic?.trim().length > 0 ||
        data.selectedLecturers.length > 0,
      {
        message:
          'Vui lòng nhập đề tài dự kiến hoặc chọn một giảng viên hướng dẫn',
        path: ['_errors'],
      },
    );

  type FormValues = z.infer<typeof formSchema>;

  // States for registration dialog and UI
  const [openRegisterDialog, setOpenRegisterDialog] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedLecturers, setDisplayedLecturers] = useState<
    FieldPoolLecturer[]
  >([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Form hook
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectTopic: '',
      selectedLecturers: [],
      priority: 1,
      description: '',
    },
  });

  // Watch form values
  const selectedLecturers = watch('selectedLecturers');

  // Fetch field pool detail, lecturer selections, and lecturers
  const {
    data: fieldPoolsResponse,
    isLoading: fieldPoolLoading,
    isError: fieldPoolError,
  } = useFieldPoolDetail(fieldPoolId);
  const fieldPool = fieldPoolsResponse?.data;
  const {
    data: lecturerSelectionsResponse,
    isLoading: lecturerSelectionsLoading,
  } = useLecturerSelectionsByFieldPool(fieldPoolId);
  const lecturerSelections = lecturerSelectionsResponse?.data?.data || [];

  const { data: lecturersResponse, isLoading: lecturersLoading } =
    useLecturersByFieldPool(fieldPoolId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lecturers = lecturersResponse?.data?.data || [];
  const { mutateAsync: createStudentSelection } = useCreateStudentSelection();

  // Set displayed lecturers when data is loaded or search term changes
  useEffect(() => {
    if (lecturers.length > 0) {
      setDisplayedLecturers(
        lecturers.filter(
          (lecturer) =>
            lecturer.fullName
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (lecturer.Department?.name || '')
              .toLowerCase()
              .includes(searchTerm.toLowerCase()),
        ),
      );
    }
  }, [lecturers, searchTerm]);

  const handleOpenRegisterDialog = () => {
    reset(); // Reset form when opening dialog
    setOpenRegisterDialog(true);
    setSelectedTab(0);
  };

  const handleCloseRegisterDialog = () => {
    setOpenRegisterDialog(false);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleToggleLecturer = (lecturerId: string) => {
    const current = [...selectedLecturers];
    if (current.includes(lecturerId)) {
      // Deselect the lecturer
      setValue('selectedLecturers', []);
    } else {
      // Select new lecturer (replacing any existing selection)
      setValue('selectedLecturers', [lecturerId]);
    }
  };

  const handleConfirmBeforeSubmit = () => {
    if (watch('projectTopic') || selectedLecturers.length > 0) {
      setShowConfirmDialog(true);
    } else {
      setError('Vui lòng nhập đề tài dự kiến hoặc chọn giảng viên hướng dẫn');
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      // console.log(fieldPoolId, user?.id);
      // if (!fieldPoolId || !user?.id) {
      //   setError(
      //     'Không thể xác định thông tin người dùng hoặc lĩnh vực đề tài',
      //   );
      //   return;
      // }

      await createStudentSelection({
        priority: data.priority,
        topicTitle: data.projectTopic,
        lecturerId: data.selectedLecturers[0],
        fieldPoolId,
        description: data.description,
      });

      setRegistrationSuccess(true);
      setSuccessMessage('Đăng ký tham gia đề tài thành công!');
      setShowSuccessSnackbar(true);
      handleCloseRegisterDialog();
      setShowConfirmDialog(false);
      // Reset form
      reset();
    } catch (error) {
      console.error('Failed to register:', error);
      setError('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau!');
      setShowConfirmDialog(false);
    }
  };

  // State for sorting and filtering lecturers
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | null>(null);

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSortClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleFilterSelect = (departmentId: string | null) => {
    setDepartmentFilter(departmentId);
    handleFilterClose();
  };

  const handleSortSelect = (sort: string | null) => {
    setSortBy(sort);
    handleSortClose();
  };

  // Get unique departments from lecturers
  const departments = Array.from(
    new Set(lecturers.filter((l) => l.Department).map((l) => l.Department?.id)),
  ).map((id) => lecturers.find((l) => l.Department?.id === id)?.Department);

  // Apply department filtering and sorting to lecturers
  const getFilteredAndSortedLecturers = () => {
    let result = [...displayedLecturers];

    if (departmentFilter) {
      result = result.filter((l) => l.Department?.id === departmentFilter);
    }

    if (sortBy === 'name') {
      result.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
    }

    return result;
  };

  if (fieldPoolLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          my: 4,
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Đang tải thông tin đề tài...</Typography>
      </Box>
    );
  }

  if (fieldPoolError || !fieldPool) {
    return (
      <Box sx={{ my: 4 }}>
        <Alert severity="error">
          Đã xảy ra lỗi khi tải thông tin lĩnh vực đề tài. Vui lòng thử lại sau.
        </Alert>
        <Button
          onClick={() => router.push('/project/register/theme')}
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  // Extract domains from fieldPool
  const domains =
    fieldPool.FieldPoolDomain?.map((item: FieldPoolDomain) => item.Domain) ||
    [];
  const fieldPoolDepartments =
    fieldPool.FieldPoolDepartment?.map(
      (item: FieldPoolDepartment) => item.Department,
    ) || [];
  const remainingDays = getRemainingDays(fieldPool.registrationDeadline);

  return (
    <Box>
      <Button
        onClick={() => router.push('/project/register/theme')}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        Quay lại danh sách đề tài
      </Button>
      <Paper
        elevation={2}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          mb: 4,
        }}
      >
        <Box
          sx={{
            bgcolor: theme.palette.primary.main,
            color: 'white',
            py: 2,
            px: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {fieldPool.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <CalendarIcon sx={{ fontSize: 18, mr: 1 }} />
              <Typography component="div" variant="body2">
                Hạn đăng ký: {formatDate(fieldPool.registrationDeadline)}{' '}
                <Chip
                  size="small"
                  label={`Còn ${remainingDays} ngày`}
                  sx={{
                    ml: 1,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <Chip
              label={fieldPool.status === 'OPEN' ? 'Mở đăng ký' : 'Đã đóng'}
              color={fieldPool.status === 'OPEN' ? 'success' : 'default'}
              sx={{ fontWeight: 'bold', mb: 1 }}
            />
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Grid2 container spacing={3}>
            <Grid2 size={{ xs: 12, md: 8 }}>
              <Typography component="div" variant="body1">
                {fieldPool.description
                  .split('\n\n')
                  .map((paragraph: string, index: number) => (
                    <Typography key={index} variant="body1" paragraph>
                      {paragraph}
                    </Typography>
                  ))}
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Lĩnh vực nghiên cứu:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {fieldPool.FieldPoolDomain?.map((domain: FieldPoolDomain) => (
                    <Chip
                      key={domain.Domain.id}
                      label={domain.Domain.name}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>

              {fieldPool.longDescription && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Chi tiết:
                  </Typography>
                  <Typography variant="body1">
                    {fieldPool.longDescription}
                  </Typography>
                </Box>
              )}
            </Grid2>

            <Grid2 size={{ xs: 12, md: 4 }}>
              <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Thống kê Đề tài
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {/* Number of lecturers registered */}
                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <School
                          sx={{ mr: 1, color: theme.palette.primary.main }}
                        />
                        <Typography variant="body2">
                          Giảng viên đã đăng ký:
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        {fieldPool?._count?.LecturerSelection || 0}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={
                        fieldPool._count?.LecturerSelection
                          ? Math.min(
                              (fieldPool._count.LecturerSelection / 100) * 100,
                              100,
                            )
                          : 0
                      }
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    {/* Number of students registered */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 1,
                        mb: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PeopleAlt
                          sx={{ mr: 1, color: theme.palette.primary.main }}
                        />
                        <Typography variant="body2">
                          Sinh viên đã đăng ký:
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        {fieldPool._count?.StudentSelection || 0}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={
                        fieldPool._count?.StudentSelection
                          ? Math.min(
                              (fieldPool._count.StudentSelection / 100) * 100,
                              100,
                            )
                          : 0
                      }
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {/* Khoa/Viện */}
                  {fieldPoolDepartments.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Khoa/Viện:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {fieldPoolDepartments.map((dept: Department) => (
                          <Chip
                            key={dept.id}
                            label={dept.name}
                            size="small"
                            color="secondary"
                            variant="outlined"
                            sx={{
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              backgroundColor: 'rgba(255, 255, 255, 0.6)',
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Số đề tài liên quan */}
                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Subject
                          sx={{ mr: 1, color: theme.palette.primary.main }}
                        />
                        <Typography variant="body2">
                          Số đề tài liên quan:
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        {fieldPool.projectCount || 0}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      color="primary"
                      onClick={handleOpenRegisterDialog}
                      disabled={fieldPool.status !== 'OPEN'}
                      sx={{
                        borderRadius: 4,
                        py: 1,
                        boxShadow: 3,
                        fontWeight: 'bold',
                        textTransform: 'capitalize',
                      }}
                    >
                      Đăng ký tham gia đề tài
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {registrationSuccess && (
                <Alert
                  severity="success"
                  sx={{ mb: 3, borderRadius: 2 }}
                  icon={<CheckCircleIcon fontSize="inherit" />}
                >
                  {successMessage}
                </Alert>
              )}
            </Grid2>
          </Grid2>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Các chủ đề nghiên cứu gợi ý
          </Typography>

          {fieldPool.topics && fieldPool.topics.length > 0 ? (
            <Grid2 container spacing={2} sx={{ mb: 4 }}>
              {fieldPool.topics.map((topic, index: number) => (
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={topic.id || index}>
                  <Card
                    sx={{
                      borderRadius: 2,
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
                          mb: 1,
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold">
                          {topic.title}
                        </Typography>
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {topic.description}
                      </Typography>

                      {topic.domain && topic.domain.length > 0 && (
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 0.5,
                            mt: 1,
                          }}
                        >
                          {topic.domain.map(
                            (domain: string, tagIndex: number) => (
                              <Chip
                                key={tagIndex}
                                label={domain}
                                size="small"
                                variant="outlined"
                              />
                            ),
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid2>
              ))}
            </Grid2>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Chưa có chủ đề nghiên cứu nào được đề xuất.
            </Typography>
          )}

          <Divider sx={{ my: 4 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Giảng viên hướng dẫn
            </Typography>

            {/* Improved search and filter UI */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <TextField
                placeholder="Tìm kiếm giảng viên..."
                variant="outlined"
                size="small"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1 }}
              />

              {/* Filter button */}
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={handleFilterClick}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {departmentFilter
                  ? 'Bộ môn: ' +
                    lecturers.find((l) => l.Department?.id === departmentFilter)
                      ?.Department?.name
                  : 'Lọc theo bộ môn'}
              </Button>

              {/* Sort button */}
              <Button
                variant="outlined"
                startIcon={<Sort />}
                onClick={handleSortClick}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {sortBy === 'name'
                  ? 'Sắp xếp: Tên'
                  : sortBy === 'rank'
                  ? 'Sắp xếp: Chức danh'
                  : 'Sắp xếp'}
              </Button>

              {/* Department filter menu */}
              <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={handleFilterClose}
              >
                <MenuItem onClick={() => handleFilterSelect(null)}>
                  <Typography
                    fontWeight={!departmentFilter ? 'bold' : 'normal'}
                  >
                    Tất cả bộ môn
                  </Typography>
                </MenuItem>
                <Divider />
                {departments.map((dept) => (
                  <MenuItem
                    key={dept?.id}
                    onClick={() => handleFilterSelect(dept?.id || null)}
                    selected={departmentFilter === dept?.id}
                  >
                    <Typography
                      fontWeight={
                        departmentFilter === dept?.id ? 'bold' : 'normal'
                      }
                    >
                      {dept?.name}
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>

              {/* Sort menu */}
              <Menu
                anchorEl={sortAnchorEl}
                open={Boolean(sortAnchorEl)}
                onClose={handleSortClose}
              >
                <MenuItem onClick={() => handleSortSelect(null)}>
                  <Typography fontWeight={!sortBy ? 'bold' : 'normal'}>
                    Mặc định
                  </Typography>
                </MenuItem>
                <MenuItem onClick={() => handleSortSelect('name')}>
                  <Typography
                    fontWeight={sortBy === 'name' ? 'bold' : 'normal'}
                  >
                    Theo tên
                  </Typography>
                </MenuItem>
                <MenuItem onClick={() => handleSortSelect('rank')}>
                  <Typography
                    fontWeight={sortBy === 'rank' ? 'bold' : 'normal'}
                  >
                    Theo chức danh
                  </Typography>
                </MenuItem>
              </Menu>
            </Box>

            {/* Lecturers grid */}
            {lecturersLoading ? (
              <Box sx={{ width: '100%' }}>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Card sx={{ borderRadius: 2, mb: 2 }} key={item}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                      <Skeleton
                        variant="circular"
                        width={56}
                        height={56}
                        sx={{ mr: 2 }}
                      />
                      <Box sx={{ width: '100%' }}>
                        <Skeleton variant="text" width="40%" height={30} />
                        <Skeleton variant="text" width="20%" height={20} />
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mt: 1,
                          }}
                        >
                          <Skeleton variant="text" width="30%" />
                          <Skeleton
                            variant="rectangular"
                            width={100}
                            height={36}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <>
                {getFilteredAndSortedLecturers().length > 0 ? (
                  <Grid2 container spacing={2}>
                    {getFilteredAndSortedLecturers().map((lecturer) => {
                      const isSelected = selectedLecturers.includes(
                        lecturer.id,
                      );

                      return (
                        <Grid2 key={lecturer.id} size={{ xs: 12, md: 6 }}>
                          <Card
                            elevation={isSelected ? 3 : 1}
                            sx={{
                              borderRadius: 2,
                              border: isSelected
                                ? `2px solid ${theme.palette.primary.main}`
                                : '1px solid',
                              borderColor: isSelected
                                ? 'primary.main'
                                : 'divider',
                              bgcolor: 'background.paper',
                              height: '100%',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 4,
                              },
                            }}
                          >
                            <CardContent>
                              <Box
                                sx={{ display: 'flex', alignItems: 'center' }}
                              >
                                <Badge
                                  overlap="circular"
                                  anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                  }}
                                  badgeContent={
                                    isSelected ? (
                                      <StarIcon
                                        sx={{
                                          color: 'gold',
                                          bgcolor: 'white',
                                          borderRadius: '50%',
                                          fontSize: 16,
                                          border: '1px solid',
                                          borderColor: 'primary.main',
                                        }}
                                      />
                                    ) : null
                                  }
                                >
                                  <Avatar
                                    sx={{
                                      bgcolor: isSelected
                                        ? 'primary.main'
                                        : 'grey.300',
                                      mr: 2,
                                      width: 56,
                                      height: 56,
                                    }}
                                  >
                                    {lecturer.fullName?.charAt(0)}
                                  </Avatar>
                                </Badge>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="h6" fontWeight="bold">
                                    {lecturer.fullName}
                                  </Typography>

                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Giảng viên
                                  </Typography>

                                  {lecturer.Department && (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Bộ môn: {lecturer.Department.name}
                                    </Typography>
                                  )}
                                </Box>

                                <Button
                                  variant={
                                    isSelected ? 'contained' : 'outlined'
                                  }
                                  color="primary"
                                  onClick={() => handleOpenRegisterDialog()}
                                  startIcon={
                                    isSelected ? (
                                      <CheckCircleIcon />
                                    ) : (
                                      <StarBorderIcon />
                                    )
                                  }
                                  sx={{
                                    ml: 2,
                                    borderRadius: 4,
                                    boxShadow: isSelected ? 2 : 0,
                                  }}
                                >
                                  {isSelected ? 'Đã chọn' : 'Chọn GVHD'}
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid2>
                      );
                    })}
                  </Grid2>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      py: 4,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      gutterBottom
                    >
                      Không tìm thấy giảng viên nào phù hợp với tiêu chí tìm
                      kiếm
                    </Typography>
                    <Button
                      variant="text"
                      onClick={() => {
                        setSearchTerm('');
                        setDepartmentFilter(null);
                        setSortBy(null);
                      }}
                    >
                      Xóa bộ lọc
                    </Button>
                  </Box>
                )}
              </>
            )}

            {/* Lecturer selection count display */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {selectedLecturers.length > 0
                  ? 'Đã chọn giảng viên hướng dẫn'
                  : 'Chưa chọn giảng viên hướng dẫn'}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={selectedLecturers.length > 0 ? 100 : 0}
                sx={{ height: 6, borderRadius: 3, my: 1 }}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Danh sách đăng ký
          </Typography>

          {lecturerSelectionsLoading ? (
            <CircularProgress size={24} sx={{ ml: 2 }} />
          ) : lecturerSelections.length > 0 ? (
            <Box sx={{ width: '100%' }}>
              {lecturerSelections.map((selection: LecturerSelection) => (
                <Card key={selection.id} sx={{ borderRadius: 2, mb: 2 }}>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        {selection.topicTitle}
                      </Typography>
                      <Chip
                        size="small"
                        label={
                          selection.status === 'PENDING'
                            ? 'Đang chờ'
                            : selection.status === 'APPROVED'
                            ? 'Đã duyệt'
                            : selection.status === 'REJECTED'
                            ? 'Từ chối'
                            : selection.status === 'CONFIRMED'
                            ? 'Xác nhận'
                            : 'Yêu cầu thay đổi'
                        }
                        color={
                          selection.status === 'APPROVED' ||
                          selection.status === 'CONFIRMED'
                            ? 'success'
                            : selection.status === 'REJECTED'
                            ? 'error'
                            : selection.status === 'REQUESTED_CHANGES'
                            ? 'warning'
                            : 'default'
                        }
                      />
                    </Box>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      gutterBottom
                    >
                      Nguyện vọng {selection.position}
                    </Typography>

                    {selection.description && (
                      <Typography variant="body1" sx={{ my: 2 }}>
                        {selection.description}
                      </Typography>
                    )}

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 2,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        <strong>Mã số dự án:</strong>{' '}
                        {selection.id?.substring(0, 8)}...
                      </Typography>
                      {selection.lecturer && (
                        <Typography variant="body2">
                          <strong>Giảng viên:</strong> {selection.lecturer.name}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Chưa có đăng ký nào cho lĩnh vực này.
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Dialog đăng ký tham gia đề tài */}
      <Dialog
        open={openRegisterDialog}
        onClose={handleCloseRegisterDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', pb: 1 }}>
          Đăng ký tham gia đề tài
          <IconButton
            aria-label="close"
            onClick={handleCloseRegisterDialog}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            textColor="inherit"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: 'white',
              },
              mt: 1,
            }}
          >
            <Tab
              icon={<Topic />}
              iconPosition="start"
              label="Đề tài dự kiến"
              sx={{ color: 'white', textTransform: 'none' }}
            />
            <Tab
              icon={<Person />}
              iconPosition="start"
              label="Giảng viên hướng dẫn"
              sx={{ color: 'white', textTransform: 'none' }}
            />
          </Tabs>
        </DialogTitle>
        <DialogContent dividers>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Project topic tab */}
            <Box hidden={selectedTab !== 0} sx={{ py: 1 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Nhập tên đề tài dự kiến của bạn:
              </Typography>
              <Controller
                name="projectTopic"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Ví dụ: Ứng dụng trí tuệ nhân tạo trong việc dự đoán nhu cầu giao thông công cộng..."
                    variant="outlined"
                    error={!!errors.projectTopic}
                    helperText={errors.projectTopic?.message}
                  />
                )}
              />

              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  fontWeight="medium"
                >
                  Mô tả chi tiết đề tài (tùy chọn):
                </Typography>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Mô tả chi tiết hơn về đề tài bạn muốn thực hiện..."
                      variant="outlined"
                    />
                  )}
                />
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  fontWeight="medium"
                >
                  Mức độ ưu tiên:
                </Typography>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      helperText="Chọn mức độ ưu tiên của đề tài này (1-10, 1 là cao nhất)"
                    >
                      {[...Array(3)].map((_, index) => (
                        <MenuItem key={index + 1} value={index + 1}>
                          {index + 1} {index === 0 && '(Cao nhất)'}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Box>

              <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                <Typography variant="body2">
                  <strong>Lưu ý:</strong> Bạn có thể chỉ nhập đề tài dự kiến mà
                  không cần chọn giảng viên hướng dẫn, hoặc ngược lại. Tuy
                  nhiên, việc cung cấp cả hai thông tin sẽ giúp hệ thống xử lý
                  yêu cầu của bạn hiệu quả hơn.
                </Typography>
              </Alert>

              {watch('description') && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Mô tả chi tiết:
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, bgcolor: 'background.default' }}
                  >
                    <Typography variant="body2">
                      {watch('description')}
                    </Typography>
                  </Paper>
                </Box>
              )}

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={() => setSelectedTab(1)}
                  sx={{ borderRadius: 4 }}
                >
                  Tiếp tục chọn giảng viên
                </Button>
              </Box>
            </Box>

            {/* Lecturer selection tab */}
            <Box hidden={selectedTab !== 1}>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Chọn giảng viên hướng dẫn (tối đa 3 giảng viên):
              </Typography>

              {/* Search and filter */}
              <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm theo tên hoặc bộ môn..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={handleFilterClick}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {departmentFilter
                    ? 'Bộ môn: ' +
                      lecturers.find(
                        (l) => l.Department?.id === departmentFilter,
                      )?.Department?.name
                    : 'Lọc theo bộ môn'}
                </Button>
              </Box>

              {/* Selected lecturers */}
              {selectedLecturers.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Giảng viên đã chọn:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedLecturers.map((lecturerId) => {
                      const lecturer = lecturers.find(
                        (l) => l.id === lecturerId,
                      );
                      return (
                        <Chip
                          key={lecturerId}
                          avatar={
                            <Avatar>
                              {lecturer?.fullName?.charAt(0) || '?'}
                            </Avatar>
                          }
                          label={lecturer?.fullName || 'Unknown'}
                          onDelete={() => handleToggleLecturer(lecturerId)}
                          sx={{ px: 1, py: 2.5, mr: 1 }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              )}

              {/* Lecturer cards */}
              <Box
                sx={{
                  width: '100%',
                  maxHeight: '400px',
                  overflow: 'auto',
                  px: 1,
                }}
              >
                {lecturersLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} sx={{ mb: 2 }}>
                      <CardContent
                        sx={{ display: 'flex', alignItems: 'center' }}
                      >
                        <Skeleton
                          variant="circular"
                          width={50}
                          height={50}
                          sx={{ mr: 2 }}
                        />
                        <Box sx={{ width: '100%' }}>
                          <Skeleton variant="text" width="60%" height={24} />
                          <Skeleton variant="text" width="40%" height={18} />
                        </Box>
                        <Skeleton
                          variant="rectangular"
                          width={100}
                          height={36}
                        />
                      </CardContent>
                    </Card>
                  ))
                ) : displayedLecturers.length > 0 ? (
                  displayedLecturers.map((lecturer) => {
                    const isSelected = selectedLecturers.includes(lecturer.id);

                    return (
                      <Card
                        key={lecturer.id}
                        sx={{
                          mb: 2,
                          borderRadius: 2,
                          border: isSelected
                            ? `2px solid ${theme.palette.primary.main}`
                            : '1px solid',
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: 3,
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Badge
                              overlap="circular"
                              anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                              }}
                              badgeContent={
                                isSelected ? (
                                  <StarIcon
                                    sx={{
                                      color: 'gold',
                                      bgcolor: 'white',
                                      borderRadius: '50%',
                                      fontSize: 16,
                                      border: '1px solid',
                                      borderColor: 'primary.main',
                                    }}
                                  />
                                ) : null
                              }
                            >
                              <Avatar
                                sx={{
                                  bgcolor: isSelected
                                    ? 'primary.main'
                                    : 'grey.300',
                                  width: 50,
                                  height: 50,
                                  mr: 2,
                                }}
                              >
                                {lecturer.fullName?.charAt(0) || '?'}
                              </Avatar>
                            </Badge>

                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="subtitle1"
                                fontWeight="medium"
                              >
                                {lecturer.fullName}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Giảng viên
                                {lecturer.Department?.name &&
                                  ` • ${lecturer.Department.name}`}
                              </Typography>
                            </Box>

                            <Box>
                              {isSelected ? (
                                <Box
                                  sx={{ display: 'flex', alignItems: 'center' }}
                                >
                                  <IconButton
                                    color="primary"
                                    onClick={() =>
                                      handleToggleLecturer(lecturer.id)
                                    }
                                    size="small"
                                  >
                                    <CloseIcon />
                                  </IconButton>
                                </Box>
                              ) : (
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  onClick={() =>
                                    handleToggleLecturer(lecturer.id)
                                  }
                                  startIcon={<StarBorderIcon />}
                                  disabled={selectedLecturers.length >= 1}
                                  sx={{ borderRadius: 4 }}
                                >
                                  Chọn
                                </Button>
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Không tìm thấy giảng viên nào phù hợp với tiêu chí tìm kiếm.
                    Vui lòng thử lại với từ khóa khác.
                  </Alert>
                )}
              </Box>
            </Box>
          </form>
        </DialogContent>

        {/* Form action buttons */}
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button variant="outlined" onClick={handleCloseRegisterDialog}>
            Hủy
          </Button>

          <Box>
            {selectedTab === 1 && (
              <Button
                variant="outlined"
                onClick={() => setSelectedTab(0)}
                sx={{ mr: 1 }}
              >
                Quay lại
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleConfirmBeforeSubmit}
              disabled={
                isSubmitting ||
                (!watch('projectTopic') && selectedLecturers.length === 0)
              }
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              sx={{ borderRadius: 4, px: 3 }}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đăng ký'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          Xác nhận đăng ký
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Bạn có chắc chắn muốn đăng ký tham gia đề tài này?
          </Typography>
          {selectedLecturers.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Giảng viên đã chọn:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedLecturers.map((lecturerId) => {
                  const lecturer = lecturers.find((l) => l.id === lecturerId);
                  return (
                    <Chip
                      key={lecturerId}
                      avatar={
                        <Avatar>{lecturer?.fullName?.charAt(0) || '?'}</Avatar>
                      }
                      label={lecturer?.fullName}
                      color="primary"
                      variant="outlined"
                      sx={{ m: 0.5 }}
                    />
                  );
                })}
              </Box>
            </Box>
          )}
          {watch('projectTopic') && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Đề tài dự kiến:
              </Typography>
              <Paper
                variant="outlined"
                sx={{ p: 2, bgcolor: 'background.default' }}
              >
                <Typography variant="body2">{watch('projectTopic')}</Typography>
              </Paper>
            </Box>
          )}
          {watch('description') && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Mô tả chi tiết:
              </Typography>
              <Paper
                variant="outlined"
                sx={{ p: 2, bgcolor: 'background.default' }}
              >
                <Typography variant="body2">{watch('description')}</Typography>
              </Paper>
            </Box>
          )}
          {/* Show priority in confirmation dialog */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Mức độ ưu tiên:
            </Typography>
            <Chip
              label={`Ưu tiên: ${watch('priority')}`}
              color="secondary"
              variant="outlined"
              sx={{ m: 0.5 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setShowConfirmDialog(false)}
            startIcon={<CloseIcon />}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={20} />
              ) : (
                <CheckCircleIcon />
              )
            }
            color="primary"
            sx={{ ml: 1 }}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đăng ký'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Toast */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Success Toast */}
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          onClose={() => setShowSuccessSnackbar(false)}
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
