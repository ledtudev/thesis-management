'use client';

import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
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
  Menu,
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
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

import {
  CreateFacultyDto,
  CreateStudentDto,
  Faculty,
  FacultyRoleT,
  FacultyStatusT,
  GenderT,
  Student,
  StudentStatusT,
  UpdateFacultyDto,
  UpdateStudentDto,
  userHooks,
} from '@/services/userService';

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
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog states
  const [createFacultyDialog, setCreateFacultyDialog] = useState(false);
  const [createStudentDialog, setCreateStudentDialog] = useState(false);
  const [editFacultyDialog, setEditFacultyDialog] = useState(false);
  const [editStudentDialog, setEditStudentDialog] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUserId, setMenuUserId] = useState<string>('');

  // Form states
  const [facultyForm, setFacultyForm] = useState<CreateFacultyDto>({
    facultyCode: '',
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    bio: '',
    rank: '',
    facultyId: '',
    roles: [FacultyRoleT.LECTURER],
  });

  const [studentForm, setStudentForm] = useState<CreateStudentDto>({
    studentCode: '',
    fullName: '',
    email: '',
    password: '',
    phone: '',
    gender: GenderT.MALE,
    admissionYear: new Date().getFullYear(),
    graduationYear: new Date().getFullYear() + 4,
    facultyId: '',
    majorCode: '',
    bio: '',
  });

  // API hooks
  const { data: facultiesResponse, isLoading: facultiesLoading } =
    userHooks.useFaculties({
      fullName: searchTerm || undefined,
      status: (statusFilter as FacultyStatusT) || undefined,
      page: page + 1,
      limit: rowsPerPage,
    });
  const { data: studentsResponse, isLoading: studentsLoading } =
    userHooks.useStudents({
      fullName: searchTerm || undefined,
      status: (statusFilter as StudentStatusT) || undefined,
      page: page + 1,
      limit: rowsPerPage,
    });
  console.log(facultiesResponse);
  console.log(studentsResponse);
  // Extract data from responses
  const faculties = facultiesResponse?.data || [];
  const facultiesTotal = facultiesResponse?.paging?.total || 0;
  const students = studentsResponse?.data || [];
  const studentsTotal = studentsResponse?.paging?.total || 0;
  console.log(students);

  // Mutations
  const createFacultyMutation = userHooks.useCreateFaculty();
  const createStudentMutation = userHooks.useCreateStudent();
  const updateFacultyMutation = userHooks.useUpdateFaculty();
  const updateStudentMutation = userHooks.useUpdateStudent();
  const deleteFacultyMutation = userHooks.useDeleteFaculty();
  const deleteStudentMutation = userHooks.useDeleteStudent();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(0);
    setSearchTerm('');
    setStatusFilter('');
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    userId: string,
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUserId('');
  };

  const handleCreateFaculty = async () => {
    try {
      await createFacultyMutation.mutateAsync(facultyForm);
      toast.success('Tạo giảng viên thành công');
      setCreateFacultyDialog(false);
      resetFacultyForm();
    } catch {
      toast.error('Có lỗi xảy ra khi tạo giảng viên');
    }
  };

  const handleCreateStudent = async () => {
    try {
      await createStudentMutation.mutateAsync(studentForm);
      toast.success('Tạo sinh viên thành công');
      setCreateStudentDialog(false);
      resetStudentForm();
    } catch {
      toast.error('Có lỗi xảy ra khi tạo sinh viên');
    }
  };

  const handleEditFaculty = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setFacultyForm({
      facultyCode: faculty.facultyCode,
      fullName: faculty.fullName,
      email: faculty.email,
      password: '',
      phoneNumber: faculty.phoneNumber || '',
      bio: faculty.bio || '',
      rank: faculty.rank || '',
      facultyId: faculty.facultyId || '',
      roles: faculty.roles,
    });
    setEditFacultyDialog(true);
    handleMenuClose();
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setStudentForm({
      studentCode: student.studentCode,
      fullName: student.fullName,
      email: student.email,
      password: '',
      phone: student.phone || '',
      gender: student.gender || GenderT.MALE,
      admissionYear: student.admissionYear || new Date().getFullYear(),
      graduationYear: student.graduationYear || new Date().getFullYear() + 4,
      facultyId: student.facultyId || '',
      majorCode: student.majorCode || '',
      bio: student.bio || '',
    });
    setEditStudentDialog(true);
    handleMenuClose();
  };

  const handleUpdateFaculty = async () => {
    if (!selectedFaculty) return;
    try {
      const updateData: UpdateFacultyDto = {
        facultyCode: facultyForm.facultyCode,
        fullName: facultyForm.fullName,
        email: facultyForm.email,
        phoneNumber: facultyForm.phoneNumber,
        bio: facultyForm.bio,
        rank: facultyForm.rank,
        facultyId: facultyForm.facultyId,
      };
      await updateFacultyMutation.mutateAsync({
        id: selectedFaculty.id,
        dto: updateData,
      });
      toast.success('Cập nhật giảng viên thành công');
      setEditFacultyDialog(false);
      setSelectedFaculty(null);
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật giảng viên');
    }
  };

  const handleUpdateStudent = async () => {
    if (!selectedStudent) return;
    try {
      const updateData: UpdateStudentDto = {
        studentCode: studentForm.studentCode,
        fullName: studentForm.fullName,
        email: studentForm.email,
        phone: studentForm.phone,
        gender: studentForm.gender,
        admissionYear: studentForm.admissionYear,
        graduationYear: studentForm.graduationYear,
        facultyId: studentForm.facultyId,
        majorCode: studentForm.majorCode,
        bio: studentForm.bio,
      };
      await updateStudentMutation.mutateAsync({
        id: selectedStudent.id,
        dto: updateData,
      });
      toast.success('Cập nhật sinh viên thành công');
      setEditStudentDialog(false);
      setSelectedStudent(null);
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật sinh viên');
    }
  };

  const handleDeleteUser = async () => {
    if (activeTab === 0 && menuUserId) {
      try {
        await deleteFacultyMutation.mutateAsync(menuUserId);
        toast.success('Xóa giảng viên thành công');
      } catch {
        toast.error('Có lỗi xảy ra khi xóa giảng viên');
      }
    } else if (activeTab === 1 && menuUserId) {
      try {
        await deleteStudentMutation.mutateAsync(menuUserId);
        toast.success('Xóa sinh viên thành công');
      } catch {
        toast.error('Có lỗi xảy ra khi xóa sinh viên');
      }
    }
    handleMenuClose();
  };

  const resetFacultyForm = () => {
    setFacultyForm({
      facultyCode: '',
      fullName: '',
      email: '',
      password: '',
      phoneNumber: '',
      bio: '',
      rank: '',
      facultyId: '',
      roles: [FacultyRoleT.LECTURER],
    });
  };

  const resetStudentForm = () => {
    setStudentForm({
      studentCode: '',
      fullName: '',
      email: '',
      password: '',
      phone: '',
      gender: GenderT.MALE,
      admissionYear: new Date().getFullYear(),
      graduationYear: new Date().getFullYear() + 4,
      facultyId: '',
      majorCode: '',
      bio: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'warning';
      case 'GRADUATED':
        return 'info';
      case 'RETIRED':
      case 'RESIGNED':
      case 'DROPPED_OUT':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Hoạt động';
      case 'INACTIVE':
        return 'Không hoạt động';
      case 'GRADUATED':
        return 'Đã tốt nghiệp';
      case 'RETIRED':
        return 'Đã nghỉ hưu';
      case 'RESIGNED':
        return 'Đã nghỉ việc';
      case 'DROPPED_OUT':
        return 'Đã thôi học';
      case 'ON_LEAVE':
        return 'Nghỉ phép';
      default:
        return status;
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Quản lý người dùng
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý tài khoản giảng viên và sinh viên
        </Typography>
      </Box>

      {/* Statistics Cards */}
      {/* <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tổng giảng viên
              </Typography>
              <Typography variant="h4">{facultiesTotal}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tổng sinh viên
              </Typography>
              <Typography variant="h4">{studentsTotal}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid> */}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên..."
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
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="ACTIVE">Hoạt động</MenuItem>
                <MenuItem value="INACTIVE">Không hoạt động</MenuItem>
                {activeTab === 1 && (
                  <MenuItem value="GRADUATED">Đã tốt nghiệp</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<PersonIcon />} label="Giảng viên" iconPosition="start" />
          <Tab icon={<SchoolIcon />} label="Sinh viên" iconPosition="start" />
        </Tabs>
      </Box>

      {/* Faculty Tab */}
      <TabPanel value={activeTab} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Avatar</TableCell>
                <TableCell>Mã GV</TableCell>
                <TableCell>Họ tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {facultiesLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                faculties?.map((faculty: Faculty) => (
                  <TableRow key={faculty.id}>
                    <TableCell>
                      <Avatar src={faculty.profilePicture}>
                        {faculty.fullName.charAt(0)}
                      </Avatar>
                    </TableCell>
                    <TableCell>{faculty.facultyCode}</TableCell>
                    <TableCell>{faculty.fullName}</TableCell>
                    <TableCell>{faculty.email}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {faculty?.Role?.map((role: any) => (
                          <Chip
                            key={role.id}
                            label={role.role}
                            size="small"
                            color={
                              role === 'ADMIN'
                                ? 'error'
                                : role === 'DEAN'
                                ? 'warning'
                                : 'primary'
                            }
                          />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(faculty.status)}
                        color={getStatusColor(faculty.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, faculty.id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={facultiesTotal}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) =>
              setRowsPerPage(parseInt(e.target.value))
            }
          />
        </TableContainer>
      </TabPanel>

      {/* Student Tab */}
      <TabPanel value={activeTab} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Avatar</TableCell>
                <TableCell>Mã SV</TableCell>
                <TableCell>Họ tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Khóa</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {studentsLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                students?.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Avatar src={student.profilePicture}>
                        {student.fullName.charAt(0)}
                      </Avatar>
                    </TableCell>
                    <TableCell>{student.studentCode}</TableCell>
                    <TableCell>{student.fullName}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.admissionYear}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(student.status)}
                        color={getStatusColor(student.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, student.id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={students?.metadata?.total || 0}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) =>
              setRowsPerPage(parseInt(e.target.value))
            }
          />
        </TableContainer>
      </TabPanel>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            if (activeTab === 0) {
              const faculty = faculties?.data?.find((f) => f.id === menuUserId);
              if (faculty) handleEditFaculty(faculty);
            } else {
              const student = students?.data?.find((s) => s.id === menuUserId);
              if (student) handleEditStudent(student);
            }
          }}
        >
          <EditIcon sx={{ mr: 1 }} />
          Chỉnh sửa
        </MenuItem>
        <MenuItem onClick={handleDeleteUser}>
          <DeleteIcon sx={{ mr: 1 }} />
          Xóa
        </MenuItem>
      </Menu>

      {/* Create Faculty Dialog */}
      <Dialog
        open={createFacultyDialog}
        onClose={() => setCreateFacultyDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Tạo giảng viên mới</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mã giảng viên"
                value={facultyForm.facultyCode}
                onChange={(e) =>
                  setFacultyForm({
                    ...facultyForm,
                    facultyCode: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Họ tên"
                value={facultyForm.fullName}
                onChange={(e) =>
                  setFacultyForm({ ...facultyForm, fullName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={facultyForm.email}
                onChange={(e) =>
                  setFacultyForm({ ...facultyForm, email: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mật khẩu"
                type="password"
                value={facultyForm.password}
                onChange={(e) =>
                  setFacultyForm({ ...facultyForm, password: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={facultyForm.phoneNumber}
                onChange={(e) =>
                  setFacultyForm({
                    ...facultyForm,
                    phoneNumber: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Học hàm/học vị"
                value={facultyForm.rank}
                onChange={(e) =>
                  setFacultyForm({ ...facultyForm, rank: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Giới thiệu"
                multiline
                rows={3}
                value={facultyForm.bio}
                onChange={(e) =>
                  setFacultyForm({ ...facultyForm, bio: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateFacultyDialog(false)}>Hủy</Button>
          <Button onClick={handleCreateFaculty} variant="contained">
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Student Dialog */}
      <Dialog
        open={createStudentDialog}
        onClose={() => setCreateStudentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Tạo sinh viên mới</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mã sinh viên"
                value={studentForm.studentCode}
                onChange={(e) =>
                  setStudentForm({
                    ...studentForm,
                    studentCode: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Họ tên"
                value={studentForm.fullName}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, fullName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={studentForm.email}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, email: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mật khẩu"
                type="password"
                value={studentForm.password}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, password: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={studentForm.phone}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, phone: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Giới tính</InputLabel>
                <Select
                  value={studentForm.gender}
                  label="Giới tính"
                  onChange={(e) =>
                    setStudentForm({
                      ...studentForm,
                      gender: e.target.value as GenderT,
                    })
                  }
                >
                  <MenuItem value={GenderT.MALE}>Nam</MenuItem>
                  <MenuItem value={GenderT.FEMALE}>Nữ</MenuItem>
                  <MenuItem value={GenderT.OTHER}>Khác</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Năm nhập học"
                type="number"
                value={studentForm.admissionYear}
                onChange={(e) =>
                  setStudentForm({
                    ...studentForm,
                    admissionYear: parseInt(e.target.value),
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mã chuyên ngành"
                value={studentForm.majorCode}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, majorCode: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Giới thiệu"
                multiline
                rows={3}
                value={studentForm.bio}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, bio: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateStudentDialog(false)}>Hủy</Button>
          <Button onClick={handleCreateStudent} variant="contained">
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Faculty Dialog */}
      <Dialog
        open={editFacultyDialog}
        onClose={() => setEditFacultyDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chỉnh sửa giảng viên</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mã giảng viên"
                value={facultyForm.facultyCode}
                onChange={(e) =>
                  setFacultyForm({
                    ...facultyForm,
                    facultyCode: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Họ tên"
                value={facultyForm.fullName}
                onChange={(e) =>
                  setFacultyForm({ ...facultyForm, fullName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={facultyForm.email}
                onChange={(e) =>
                  setFacultyForm({ ...facultyForm, email: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={facultyForm.phoneNumber}
                onChange={(e) =>
                  setFacultyForm({
                    ...facultyForm,
                    phoneNumber: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Học hàm/học vị"
                value={facultyForm.rank}
                onChange={(e) =>
                  setFacultyForm({ ...facultyForm, rank: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Giới thiệu"
                multiline
                rows={3}
                value={facultyForm.bio}
                onChange={(e) =>
                  setFacultyForm({ ...facultyForm, bio: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditFacultyDialog(false)}>Hủy</Button>
          <Button onClick={handleUpdateFaculty} variant="contained">
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog
        open={editStudentDialog}
        onClose={() => setEditStudentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chỉnh sửa sinh viên</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mã sinh viên"
                value={studentForm.studentCode}
                onChange={(e) =>
                  setStudentForm({
                    ...studentForm,
                    studentCode: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Họ tên"
                value={studentForm.fullName}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, fullName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={studentForm.email}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, email: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={studentForm.phone}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, phone: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Giới tính</InputLabel>
                <Select
                  value={studentForm.gender}
                  label="Giới tính"
                  onChange={(e) =>
                    setStudentForm({
                      ...studentForm,
                      gender: e.target.value as GenderT,
                    })
                  }
                >
                  <MenuItem value={GenderT.MALE}>Nam</MenuItem>
                  <MenuItem value={GenderT.FEMALE}>Nữ</MenuItem>
                  <MenuItem value={GenderT.OTHER}>Khác</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Năm nhập học"
                type="number"
                value={studentForm.admissionYear}
                onChange={(e) =>
                  setStudentForm({
                    ...studentForm,
                    admissionYear: parseInt(e.target.value),
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mã chuyên ngành"
                value={studentForm.majorCode}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, majorCode: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Giới thiệu"
                multiline
                rows={3}
                value={studentForm.bio}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, bio: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditStudentDialog(false)}>Hủy</Button>
          <Button onClick={handleUpdateStudent} variant="contained">
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>

      {/* FAB */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => {
          if (activeTab === 0) {
            setCreateFacultyDialog(true);
          } else {
            setCreateStudentDialog(true);
          }
        }}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
}
