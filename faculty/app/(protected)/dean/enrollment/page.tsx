'use client';

import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  AutoAwesome as AutoAwesomeIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

import {
  AllocationRecommendation,
  AutoAllocateDto,
  CreateProjectAllocationDto,
  enrollmentHooks,
  LecturerSelection,
  LecturerSelectionStatusT,
  ProjectAllocation,
  StudentSelection,
  StudentSelectionStatusT,
} from '@/services/enrollmentService';
import StudentSelectionsTab from './components/StudentSelectionsTab';

// Remove unused status mappings
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`enrollment-tabpanel-${index}`}
      aria-labelledby={`enrollment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function EnrollmentManagementPage() {
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');

  // Selection states
  const [selectedStudentSelections, setSelectedStudentSelections] = useState<
    string[]
  >([]);
  const [selectedLecturerSelections, setSelectedLecturerSelections] = useState<
    string[]
  >([]);

  // Dialog states
  const [createAllocationDialog, setCreateAllocationDialog] = useState(false);
  const [editAllocationDialog, setEditAllocationDialog] = useState(false);
  const [deleteAllocationDialog, setDeleteAllocationDialog] = useState(false);
  const [autoAllocateDialog, setAutoAllocateDialog] = useState(false);

  // Form states
  const [allocationForm, setAllocationForm] =
    useState<CreateProjectAllocationDto>({
      topicTitle: '',
      studentId: '',
      lecturerId: '',
    });

  const [editAllocationForm, setEditAllocationForm] = useState<{
    id: string;
    topicTitle: string;
    lecturerId: string;
  }>({
    id: '',
    topicTitle: '',
    lecturerId: '',
  });

  const [allocationToDelete, setAllocationToDelete] = useState<string>('');

  const [autoAllocateForm, setAutoAllocateForm] = useState<AutoAllocateDto>({
    departmentId: '',
    maxStudentsPerLecturer: 5,
    fieldPoolId: '',
  });

  // API hooks
  const {
    data: studentSelectionsData,
    isLoading: studentSelectionsLoading,
    refetch: refetchStudentSelections,
  } = enrollmentHooks.useStudentSelections({
    keyword: searchTerm,
    status: statusFilter || undefined,
    departmentId: departmentFilter || undefined,
    page: 1,
    limit: 50,
  });
  const {
    data: lecturerSelectionsData,
    isLoading: lecturerSelectionsLoading,
    refetch: refetchLecturerSelections,
  } = enrollmentHooks.useLecturerSelections({
    keyword: searchTerm,
    status: statusFilter || undefined,
    departmentId: departmentFilter || undefined,
    page: 1,
    limit: 50,
  });

  const {
    data: allocationsData,
    isLoading: allocationsLoading,
    refetch: refetchAllocations,
  } = enrollmentHooks.useProjectAllocations({
    keyword: searchTerm,
    status: statusFilter || undefined,
    departmentId: departmentFilter || undefined,
    page: 1,
    limit: 50,
  });

  const { data: statisticsData } = enrollmentHooks.useEnrollmentStatistics({
    departmentId: departmentFilter || undefined,
  });

  const { data: recommendationsData, isLoading: recommendationsLoading } =
    enrollmentHooks.useRecommendations({
      departmentId: departmentFilter || undefined,
      format: 'json',
    });

  // Mutations
  const updateStudentSelectionMutation =
    enrollmentHooks.useUpdateStudentSelectionStatus();
  const updateLecturerSelectionMutation =
    enrollmentHooks.useUpdateLecturerSelectionStatus();
  const createAllocationMutation = enrollmentHooks.useCreateProjectAllocation();
  const updateAllocationMutation = enrollmentHooks.useUpdateProjectAllocation();
  const deleteAllocationMutation = enrollmentHooks.useDeleteProjectAllocation();
  const autoAllocateMutation = enrollmentHooks.useAutoAllocate();

  // Data
  const studentSelections = Array.isArray(studentSelectionsData?.data?.data?.data)
    ? studentSelectionsData?.data?.data?.data
    : [];
  const lecturerSelections = Array.isArray(lecturerSelectionsData)
    ? lecturerSelectionsData
    : [];
  const allocations = Array.isArray(allocationsData) ? allocationsData : [];
  const statistics = statisticsData;
  const recommendations = Array.isArray(recommendationsData)
    ? recommendationsData
    : [];

  // Handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Clear selections when switching tabs
    setSelectedStudentSelections([]);
    setSelectedLecturerSelections([]);
  };

  const handleUpdateStudentSelection = async (
    id: string,
    status: StudentSelectionStatusT,
  ) => {
    try {
      await updateStudentSelectionMutation.mutateAsync({
        id,
        dto: { status },
      });
      toast.success('Cập nhật trạng thái thành công');
      refetchStudentSelections();
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const handleUpdateLecturerSelection = async (
    id: string,
    status: LecturerSelectionStatusT,
  ) => {
    try {
      await updateLecturerSelectionMutation.mutateAsync({
        id,
        dto: { status },
      });
      toast.success('Cập nhật trạng thái thành công');
      refetchLecturerSelections();
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const handleCreateAllocation = async () => {
    try {
      await createAllocationMutation.mutateAsync(allocationForm);
      toast.success('Tạo phân công thành công');
      setCreateAllocationDialog(false);
      resetAllocationForm();
      refetchAllocations();
    } catch {
      toast.error('Có lỗi xảy ra khi tạo phân công');
    }
  };

  const handleEditAllocation = (allocation: ProjectAllocation) => {
    setEditAllocationForm({
      id: allocation.id,
      topicTitle: allocation.topicTitle,
      lecturerId: allocation.lecturerId,
    });
    setEditAllocationDialog(true);
  };

  const handleUpdateAllocation = async () => {
    try {
      await updateAllocationMutation.mutateAsync({
        id: editAllocationForm.id,
        dto: {
          topicTitle: editAllocationForm.topicTitle,
          lecturerId: editAllocationForm.lecturerId,
        },
      });
      toast.success('Cập nhật phân công thành công');
      setEditAllocationDialog(false);
      resetEditAllocationForm();
      refetchAllocations();
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật phân công');
    }
  };

  const handleDeleteAllocation = (allocationId: string) => {
    setAllocationToDelete(allocationId);
    setDeleteAllocationDialog(true);
  };

  const handleConfirmDeleteAllocation = async () => {
    try {
      await deleteAllocationMutation.mutateAsync(allocationToDelete);
      toast.success('Xóa phân công thành công');
      setDeleteAllocationDialog(false);
      setAllocationToDelete('');
      refetchAllocations();
    } catch {
      toast.error('Có lỗi xảy ra khi xóa phân công');
    }
  };

  const handleAutoAllocate = async () => {
    try {
      const result = await autoAllocateMutation.mutateAsync(autoAllocateForm);
      toast.success(
        `Tự động phân công thành công cho ${
          result?.data?.data?.length || 0
        } sinh viên`,
      );
      setAutoAllocateDialog(false);
      resetAutoAllocateForm();
      refetchAllocations();
    } catch {
      toast.error('Có lỗi xảy ra khi tự động phân công');
    }
  };

  const resetAllocationForm = () => {
    setAllocationForm({
      topicTitle: '',
      studentId: '',
      lecturerId: '',
    });
  };

  const resetEditAllocationForm = () => {
    setEditAllocationForm({
      id: '',
      topicTitle: '',
      lecturerId: '',
    });
  };

  const resetAutoAllocateForm = () => {
    setAutoAllocateForm({
      departmentId: '',
      maxStudentsPerLecturer: 5,
      fieldPoolId: '',
    });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Quản lý đăng ký và phân công
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý nguyện vọng của sinh viên, đăng ký của giảng viên và phân công
          đề tài
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tổng số sinh viên
              </Typography>
              <Typography variant="h4">
                {statistics?.totalStudents || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tổng số giảng viên
              </Typography>
              <Typography variant="h4">
                {statistics?.totalLecturers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tổng số nguyện vọng
              </Typography>
              <Typography variant="h4">
                {statistics?.totalSelections || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tổng số phân công
              </Typography>
              <Typography variant="h4">
                {statistics?.totalAllocations || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm..."
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
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="PENDING">Chờ duyệt</MenuItem>
                <MenuItem value="APPROVED">Đã duyệt</MenuItem>
                <MenuItem value="REJECTED">Từ chối</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Khoa</InputLabel>
              <Select
                value={departmentFilter}
                label="Khoa"
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {/* Add department options here */}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab
            icon={<SchoolIcon />}
            label="Nguyện vọng sinh viên"
            iconPosition="start"
          />
          <Tab
            icon={<PersonIcon />}
            label="Đăng ký giảng viên"
            iconPosition="start"
          />
          <Tab
            icon={<AssignmentIcon />}
            label="Phân công đề tài"
            iconPosition="start"
          />
          <Tab
            icon={<AutoAwesomeIcon />}
            label="Đề xuất phân công"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <StudentSelectionsTab
          selections={studentSelections}
          loading={studentSelectionsLoading}
          selectedItems={selectedStudentSelections}
          onSelectionChange={setSelectedStudentSelections}
          onUpdateStatus={handleUpdateStudentSelection}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <LecturerSelectionsTab
          selections={lecturerSelections}
          loading={lecturerSelectionsLoading}
          selectedItems={selectedLecturerSelections}
          onSelectionChange={setSelectedLecturerSelections}
          onUpdateStatus={handleUpdateLecturerSelection}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <ProjectAllocationsTab
          allocations={allocations}
          loading={allocationsLoading}
          onCreateAllocation={() => setCreateAllocationDialog(true)}
          onEditAllocation={handleEditAllocation}
          onDeleteAllocation={handleDeleteAllocation}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <RecommendationsTab
          recommendations={recommendations}
          loading={recommendationsLoading}
          onCreateAllocation={() => setCreateAllocationDialog(true)}
        />
      </TabPanel>

      {/* Create Allocation Dialog */}
      <Dialog
        open={createAllocationDialog}
        onClose={() => setCreateAllocationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tạo phân công mới</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Tên đề tài"
              fullWidth
              value={allocationForm.topicTitle}
              onChange={(e) =>
                setAllocationForm({
                  ...allocationForm,
                  topicTitle: e.target.value,
                })
              }
            />
            <FormControl fullWidth>
              <InputLabel>Sinh viên</InputLabel>
              <Select
                value={allocationForm.studentId}
                label="Sinh viên"
                onChange={(e) =>
                  setAllocationForm({
                    ...allocationForm,
                    studentId: e.target.value,
                  })
                }
              >
                {(() => {
                  const approvedSelections = studentSelections.filter(
                    (s: StudentSelection) =>
                      s.status === StudentSelectionStatusT.APPROVED,
                  );
                  if (approvedSelections.length === 0) {
                    return studentSelections.map(
                      (selection: StudentSelection) => {
                        console.log('selection', selection);
                        return (
                          <MenuItem
                            key={selection.id}
                            value={selection.studentId}
                          >
                            {selection?.Student?.fullName} -{' '}
                            {selection?.Student?.studentCode} (
                            {selection.status})
                          </MenuItem>
                        );
                      },
                    );
                  }

                  return approvedSelections.map(
                    (selection: StudentSelection) => (
                    <MenuItem key={selection.id} value={selection.studentId}>
                        {selection?.Student?.fullName} -{' '}
                        {selection?.Student?.studentCode}
                    </MenuItem>
                    ),
                  );
                })()}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Giảng viên</InputLabel>
              <Select
                value={allocationForm.lecturerId}
                label="Giảng viên"
                onChange={(e) =>
                  setAllocationForm({
                    ...allocationForm,
                    lecturerId: e.target.value,
                  })
                }
              >
                {(() => {
                  const approvedLecturers = lecturerSelections.filter(
                    (s: LecturerSelection) =>
                      s.status === LecturerSelectionStatusT.APPROVED,
                  );

                  if (approvedLecturers.length === 0) {
                    // If no approved selections, show all lecturers from selections
                    return lecturerSelections.map(
                      (selection: LecturerSelection) => (
                        <MenuItem
                          key={selection.id}
                          value={selection.lecturerId}
                        >
                          {selection.Lecturer?.fullName} -{' '}
                          {selection.Lecturer?.facultyCode} ({selection.status})
                        </MenuItem>
                      ),
                    );
                  }

                  return approvedLecturers.map(
                    (selection: LecturerSelection) => (
                    <MenuItem key={selection.id} value={selection.lecturerId}>
                      {selection.Lecturer?.fullName} -{' '}
                      {selection.Lecturer?.facultyCode}
                    </MenuItem>
                    ),
                  );
                })()}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateAllocationDialog(false)}>Hủy</Button>
          <Button onClick={handleCreateAllocation} variant="contained">
            Tạo phân công
          </Button>
        </DialogActions>
      </Dialog>

      {/* Auto Allocate Dialog */}
      <Dialog
        open={autoAllocateDialog}
        onClose={() => setAutoAllocateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tự động phân công</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Khoa</InputLabel>
              <Select
                value={autoAllocateForm.departmentId}
                label="Khoa"
                onChange={(e) =>
                  setAutoAllocateForm({
                    ...autoAllocateForm,
                    departmentId: e.target.value,
                  })
                }
              >
                <MenuItem value="">Tất cả</MenuItem>
                {/* Add department options here */}
              </Select>
            </FormControl>
            <TextField
              label="Số sinh viên tối đa/giảng viên"
              type="number"
              fullWidth
              value={autoAllocateForm.maxStudentsPerLecturer}
              onChange={(e) =>
                setAutoAllocateForm({
                  ...autoAllocateForm,
                  maxStudentsPerLecturer: parseInt(e.target.value),
                })
              }
            />
            <FormControl fullWidth>
              <InputLabel>Lĩnh vực</InputLabel>
              <Select
                value={autoAllocateForm.fieldPoolId}
                label="Lĩnh vực"
                onChange={(e) =>
                  setAutoAllocateForm({
                    ...autoAllocateForm,
                    fieldPoolId: e.target.value,
                  })
                }
              >
                <MenuItem value="">Tất cả</MenuItem>
                {/* Add field pool options here */}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAutoAllocateDialog(false)}>Hủy</Button>
          <Button onClick={handleAutoAllocate} variant="contained">
            Tự động phân công
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Allocation Dialog */}
      <Dialog
        open={editAllocationDialog}
        onClose={() => setEditAllocationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cập nhật phân công</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Tên đề tài"
              fullWidth
              value={editAllocationForm.topicTitle}
              onChange={(e) =>
                setEditAllocationForm({
                  ...editAllocationForm,
                  topicTitle: e.target.value,
                })
              }
            />
            <FormControl fullWidth>
              <InputLabel>Giảng viên</InputLabel>
              <Select
                value={editAllocationForm.lecturerId}
                label="Giảng viên"
                onChange={(e) =>
                  setEditAllocationForm({
                    ...editAllocationForm,
                    lecturerId: e.target.value,
                  })
                }
              >
                {(() => {
                  const approvedLecturers = lecturerSelections.filter(
                    (s: LecturerSelection) =>
                      s.status === LecturerSelectionStatusT.APPROVED,
                  );

                  if (approvedLecturers.length === 0) {
                    // If no approved selections, show all lecturers from selections
                    return lecturerSelections.map(
                      (selection: LecturerSelection) => (
                        <MenuItem
                          key={selection.id}
                          value={selection.lecturerId}
                        >
                          {selection.Lecturer?.fullName} -{' '}
                          {selection.Lecturer?.facultyCode} ({selection.status})
                        </MenuItem>
                      ),
                    );
                  }

                  return approvedLecturers.map(
                    (selection: LecturerSelection) => (
                      <MenuItem key={selection.id} value={selection.lecturerId}>
                        {selection.Lecturer?.fullName} -{' '}
                        {selection.Lecturer?.facultyCode}
                      </MenuItem>
                    ),
                  );
                })()}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditAllocationDialog(false)}>Hủy</Button>
          <Button onClick={handleUpdateAllocation} variant="contained">
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Allocation Dialog */}
      <Dialog
        open={deleteAllocationDialog}
        onClose={() => setDeleteAllocationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa phân công</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Bạn đang xóa phân công đề tài. Điều này sẽ xóa toàn bộ thông tin về
            phân công đề tài.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bạn có chắc chắn muốn xóa phân công đề tài này?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAllocationDialog(false)}>Hủy</Button>
          <Button
            onClick={handleConfirmDeleteAllocation}
            variant="contained"
            color="error"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* FAB */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => {
          if (activeTab === 2) {
            setCreateAllocationDialog(true);
          } else if (activeTab === 3) {
            setAutoAllocateDialog(true);
          }
        }}
      >
        {activeTab === 2 ? <AddIcon /> : <AutoAwesomeIcon />}
      </Fab>
    </Container>
  );
}

// Lecturer Selections Tab Component
interface LecturerSelectionsTabProps {
  selections: LecturerSelection[];
  loading: boolean;
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
  onUpdateStatus: (id: string, status: LecturerSelectionStatusT) => void;
}

function LecturerSelectionsTab({
  selections,
  loading,
  selectedItems,
  onSelectionChange,
  onUpdateStatus,
}: LecturerSelectionsTabProps) {
  const [bulkStatusDialog, setBulkStatusDialog] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<LecturerSelectionStatusT>(
    LecturerSelectionStatusT.APPROVED,
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!selections || selections.length === 0) {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
          Chưa có đăng ký giảng viên
      </Typography>
      <Typography variant="body2" color="text.secondary">
          Chưa có giảng viên nào đăng ký hướng dẫn đề tài
      </Typography>
      </Box>
    );
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(selections.map((s) => s.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedItems, id]);
    } else {
      onSelectionChange(selectedItems.filter((item) => item !== id));
    }
  };

  const handleBulkStatusUpdate = () => {
    selectedItems.forEach((id) => {
      onUpdateStatus(id, bulkStatus);
    });
    setBulkStatusDialog(false);
    onSelectionChange([]);
  };

  const getStatusColor = (status: LecturerSelectionStatusT) => {
    switch (status) {
      case LecturerSelectionStatusT.APPROVED:
        return 'success';
      case LecturerSelectionStatusT.REJECTED:
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusLabel = (status: LecturerSelectionStatusT) => {
    switch (status) {
      case LecturerSelectionStatusT.APPROVED:
        return 'Đã duyệt';
      case LecturerSelectionStatusT.REJECTED:
        return 'Từ chối';
      default:
        return 'Chờ duyệt';
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h6">
          Đăng ký Giảng viên ({selections.length})
        </Typography>
        {selectedItems.length > 0 && (
          <Button
            variant="contained"
            onClick={() => setBulkStatusDialog(true)}
            startIcon={<EditIcon />}
          >
            Cập nhật trạng thái ({selectedItems.length})
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedItems.length === selections.length}
                  indeterminate={
                    selectedItems.length > 0 &&
                    selectedItems.length < selections.length
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell>Giảng viên</TableCell>
              <TableCell>Lĩnh vực</TableCell>
              <TableCell>Sức chứa</TableCell>
              <TableCell>Đã nhận</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hoạt động</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selections.map((selection) => (
              <TableRow key={selection.id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedItems.includes(selection.id)}
                    onChange={(e) =>
                      handleSelectItem(selection.id, e.target.checked)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      src={selection.Lecturer?.profilePicture}
                      sx={{ width: 32, height: 32 }}
                    >
                      {selection.Lecturer?.fullName?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {selection.Lecturer?.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selection.Lecturer?.facultyCode}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {selection.FieldPool?.name || 'Chưa chọn'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {selection.capacity}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {selection.currentCapacity}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(selection.status)}
                    color={getStatusColor(selection.status)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={selection.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    color={selection.isActive ? 'success' : 'default'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(selection.createdAt).toLocaleDateString('vi-VN')}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() =>
                      onUpdateStatus(
                        selection.id,
                        LecturerSelectionStatusT.APPROVED,
                      )
                    }
                    disabled={
                      selection.status === LecturerSelectionStatusT.APPROVED
                    }
                  >
                    <CheckCircleIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() =>
                      onUpdateStatus(
                        selection.id,
                        LecturerSelectionStatusT.REJECTED,
                      )
                    }
                    disabled={
                      selection.status === LecturerSelectionStatusT.REJECTED
                    }
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Bulk Status Update Dialog */}
      <Dialog
        open={bulkStatusDialog}
        onClose={() => setBulkStatusDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cập nhật trạng thái hàng loạt</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Bạn đang cập nhật trạng thái cho {selectedItems.length} đăng ký
            giảng viên.
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Trạng thái mới</InputLabel>
            <Select
              value={bulkStatus}
              label="Trạng thái mới"
              onChange={(e) =>
                setBulkStatus(e.target.value as LecturerSelectionStatusT)
              }
            >
              <MenuItem value={LecturerSelectionStatusT.APPROVED}>
                Duyệt
              </MenuItem>
              <MenuItem value={LecturerSelectionStatusT.REJECTED}>
                Từ chối
              </MenuItem>
              <MenuItem value={LecturerSelectionStatusT.PENDING}>
                Chờ duyệt
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkStatusDialog(false)}>Hủy</Button>
          <Button onClick={handleBulkStatusUpdate} variant="contained">
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

interface ProjectAllocationsTabProps {
  allocations: ProjectAllocation[];
  loading: boolean;
  onCreateAllocation: () => void;
  onEditAllocation: (allocation: ProjectAllocation) => void;
  onDeleteAllocation: (allocationId: string) => void;
}

function ProjectAllocationsTab({
  allocations,
  loading,
  onCreateAllocation,
  onEditAllocation,
  onDeleteAllocation,
}: ProjectAllocationsTabProps) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!allocations || allocations.length === 0) {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
          Chưa có phân công đề tài
      </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Chưa có phân công đề tài nào được tạo
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onCreateAllocation}
      >
        Tạo phân công mới
      </Button>
    </Box>
  );
}

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h6">
          Phân công Đề tài ({allocations.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateAllocation}
        >
          Tạo phân công mới
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Đề tài</TableCell>
              <TableCell>Sinh viên</TableCell>
              <TableCell>Giảng viên</TableCell>
              <TableCell>Ngày phân công</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allocations.map((allocation: ProjectAllocation) => (
              <TableRow key={allocation.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {allocation.topicTitle}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      src={allocation.student?.profilePicture}
                      sx={{ width: 32, height: 32 }}
                    >
                      {allocation.student?.fullName?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {allocation.student?.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {allocation.student?.studentCode}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      src={allocation.lecturer?.profilePicture}
                      sx={{ width: 32, height: 32 }}
                    >
                      {allocation.lecturer?.fullName?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {allocation.lecturer?.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {allocation.lecturer?.facultyCode}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {allocation.allocatedAt
                      ? new Date(allocation.allocatedAt).toLocaleDateString(
                          'vi-VN',
                        )
                      : 'Chưa có'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label="Đã phân công"
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onEditAllocation(allocation)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDeleteAllocation(allocation.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// Enhanced Recommendations Tab Component
interface RecommendationsTabProps {
  recommendations: AllocationRecommendation[];
  loading: boolean;
  onCreateAllocation: () => void;
}

function RecommendationsTab({
  recommendations,
  loading,
  onCreateAllocation,
}: RecommendationsTabProps) {
  const [uploadDialog, setUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedRecommendations, setSelectedRecommendations] = useState<
    string[]
  >([]);
  const [bulkCreateDialog, setBulkCreateDialog] = useState(false);

  // Mutations for file operations
  const uploadMutation = enrollmentHooks.useUploadProjectAllocations();
  const downloadMutation = enrollmentHooks.useDownloadRecommendations();
  const bulkCreateMutation = enrollmentHooks.useBulkCreateProjectAllocations();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleFileUpload = async () => {
    if (!uploadFile) return;

    try {
      await uploadMutation.mutateAsync({
        file: uploadFile,
        skipExisting: false,
        skipDepartmentCheck: false,
      });
      toast.success('Tải lên file thành công');
      setUploadDialog(false);
      setUploadFile(null);
    } catch {
      toast.error('Có lỗi xảy ra khi tải lên file');
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await downloadMutation.mutateAsync({
        format: 'excel',
        departmentId: undefined,
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `phan-cong-de-xuat-${new Date().toISOString().split('T')[0]}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Tải xuống file Excel thành công');
    } catch {
      toast.error('Có lỗi xảy ra khi tải xuống file');
    }
  };

  const handleBulkCreate = async () => {
    const selectedData = recommendations
      .filter((_, index) => selectedRecommendations.includes(index.toString()))
      .map((rec) => ({
        topicTitle: rec.topicTitle,
        studentId: rec.studentId,
        lecturerId: rec.lecturerId,
      }));

    try {
      await bulkCreateMutation.mutateAsync({ allocations: selectedData });
      toast.success(`Tạo ${selectedData.length} phân công thành công`);
      setBulkCreateDialog(false);
      setSelectedRecommendations([]);
    } catch {
      toast.error('Có lỗi xảy ra khi tạo phân công hàng loạt');
    }
  };

  const handleSelectRecommendation = (index: string, checked: boolean) => {
    if (checked) {
      setSelectedRecommendations([...selectedRecommendations, index]);
    } else {
      setSelectedRecommendations(
        selectedRecommendations.filter((item) => item !== index),
      );
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecommendations(
        recommendations.map((_, index) => index.toString()),
      );
    } else {
      setSelectedRecommendations([]);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h6">
          Đề xuất Phân công ({recommendations.length})
        </Typography>
        <Stack direction="row" spacing={2}>
          {selectedRecommendations.length > 0 && (
            <Button
              variant="contained"
              color="success"
              onClick={() => setBulkCreateDialog(true)}
              startIcon={<AddIcon />}
            >
              Tạo phân công ({selectedRecommendations.length})
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() => setUploadDialog(true)}
            startIcon={<UploadIcon />}
          >
            Tải lên Excel
          </Button>
          <Button
            variant="outlined"
            onClick={handleDownloadExcel}
            startIcon={<DownloadIcon />}
            disabled={downloadMutation.isPending}
          >
            {downloadMutation.isPending ? 'Đang tải...' : 'Tải xuống Excel'}
          </Button>
        </Stack>
      </Box>

      {recommendations.length === 0 ? (
    <Box sx={{ textAlign: 'center', py: 8 }}>
          <AutoAwesomeIcon
            sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
          />
      <Typography variant="h6" color="text.secondary" gutterBottom>
            Chưa có đề xuất phân công
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Hệ thống chưa tạo ra đề xuất phân công nào
          </Typography>
          <Button
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => {
              /* Trigger recommendation generation */
            }}
          >
            Tạo đề xuất phân công
          </Button>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={
                      selectedRecommendations.length === recommendations.length
                    }
                    indeterminate={
                      selectedRecommendations.length > 0 &&
                      selectedRecommendations.length < recommendations.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableCell>
                <TableCell>Sinh viên</TableCell>
                <TableCell>Giảng viên</TableCell>
                <TableCell>Đề tài</TableCell>
                <TableCell>Điểm phù hợp</TableCell>
                <TableCell>Lý do</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recommendations.map((recommendation, index) => (
                <TableRow
                  key={`${recommendation.studentId}-${recommendation.lecturerId}`}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRecommendations.includes(
                        index.toString(),
                      )}
                      onChange={(e) =>
                        handleSelectRecommendation(
                          index.toString(),
                          e.target.checked,
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={recommendation.student?.profilePicture}
                        sx={{ width: 32, height: 32 }}
                      >
                        {recommendation.student?.fullName?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {recommendation.student?.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {recommendation.student?.studentCode}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={recommendation.lecturer?.profilePicture}
                        sx={{ width: 32, height: 32 }}
                      >
                        {recommendation.lecturer?.fullName?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {recommendation.lecturer?.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {recommendation.lecturer?.facultyCode}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {recommendation.topicTitle}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${(recommendation.score * 100).toFixed(1)}%`}
                      color={
                        recommendation.score > 0.8
                          ? 'success'
                          : recommendation.score > 0.6
                          ? 'warning'
                          : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ maxWidth: 200 }}>
                      {recommendation.reasons.slice(0, 2).map((reason, idx) => (
                        <Chip
                          key={idx}
                          label={reason}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                      {recommendation.reasons.length > 2 && (
                        <Typography variant="caption" color="text.secondary">
                          +{recommendation.reasons.length - 2} khác
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        // Set form data and open create dialog
                        onCreateAllocation();
                      }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialog}
        onClose={() => setUploadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tải lên file Excel phân công</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Chọn file Excel chứa danh sách phân công đề tài. File phải có định
              dạng .xlsx hoặc .xls.
            </Typography>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            {uploadFile && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Đã chọn: {uploadFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Hủy</Button>
          <Button
            onClick={handleFileUpload}
            variant="contained"
            disabled={!uploadFile || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? 'Đang tải lên...' : 'Tải lên'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Create Dialog */}
      <Dialog
        open={bulkCreateDialog}
        onClose={() => setBulkCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tạo phân công hàng loạt</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Bạn đang tạo {selectedRecommendations.length} phân công đề tài từ
            các đề xuất đã chọn.
      </Typography>
      <Typography variant="body2" color="text.secondary">
            Các phân công sẽ được tạo với trạng thái &quot;Chờ duyệt&quot; và có
            thể được chỉnh sửa sau.
      </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkCreateDialog(false)}>Hủy</Button>
          <Button
            onClick={handleBulkCreate}
            variant="contained"
            disabled={bulkCreateMutation.isPending}
          >
            {bulkCreateMutation.isPending ? 'Đang tạo...' : 'Tạo phân công'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
