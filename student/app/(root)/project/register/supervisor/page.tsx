'use client';

import type React from 'react';

import {
  Faculty,
  useCreateStudentSelection,
  useFacultiesForStudents,
  useMyStudentSelections,
} from '@/services';

import {
  Email as EmailIcon,
  Person as PersonIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
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
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function SupervisorRegistrationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  // Fetch faculty members
  const { data: facultyResponse, isLoading: isLoadingFaculty } =
    useFacultiesForStudents({
      fullName: searchTerm,
      orderBy: 'fullName',
      asc: 'asc',
      page: page + 1,
      limit: rowsPerPage,
    });

  // Get student's existing selections
  const { data: studentSelectionsData } = useMyStudentSelections();

  // Create student selection mutation
  const createStudentSelectionMutation = useCreateStudentSelection();

  // Process faculty data
  const faculties: Faculty[] = facultyResponse?.data?.data?.data || [];
  const totalFaculties = facultyResponse?.data?.data?.total || 0;

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectFaculty = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFaculty(null);
    setProjectTitle('');
    setProjectDescription('');
  };

  const handleSubmitRegistration = async () => {
    if (
      !selectedFaculty ||
      !projectTitle.trim() ||
      !projectDescription.trim()
    ) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const loadingToast = toast.loading('Đang xử lý đăng ký...');

    try {
      await createStudentSelectionMutation.mutateAsync({
        lecturerId: selectedFaculty.id,
        topicTitle: projectTitle.trim(),
        description: projectDescription.trim(),
        priority: 1,
      });

      toast.dismiss(loadingToast);
      toast.success('Đăng ký giảng viên hướng dẫn thành công!');
      handleCloseDialog();
    } catch (error: unknown) {
      toast.dismiss(loadingToast);
      const errorMessage =
        error instanceof Error ? error.message : 'Có lỗi xảy ra khi đăng ký';
      toast.error(errorMessage);
    }
  };

  const existingSelections = studentSelectionsData?.data?.data?.data || [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Đăng ký Giảng viên Hướng dẫn
      </Typography>

      {existingSelections.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Bạn đã có {existingSelections.length} đăng ký. Bạn có thể đăng ký thêm
          giảng viên khác.
        </Alert>
      )}

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm giảng viên theo tên..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            ),
          }}
        />
      </Box>

      {/* Faculty Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Giảng viên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Khoa</TableCell>
                <TableCell>Chức vụ</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingFaculty ? (
                Array.from({ length: rowsPerPage }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={5}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                      >
                        <CircularProgress size={20} />
                        <Typography>Đang tải...</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : faculties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">
                      Không tìm thấy giảng viên nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                faculties.map((faculty) => (
                  <TableRow key={faculty.id} hover>
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                      >
                        <Avatar>
                          {faculty.profilePicture ? (
                            <img
                              src={faculty.profilePicture}
                              alt={faculty.fullName}
                            />
                          ) : (
                            <PersonIcon />
                          )}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {faculty.fullName}
                          </Typography>
                          {faculty.facultyCode && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {faculty.facultyCode}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <EmailIcon fontSize="small" color="action" />
                        {faculty.email}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {faculty.Faculty?.name || 'Chưa xác định'}
                    </TableCell>
                    <TableCell>
                      {faculty.Role && faculty.Role.length > 0 ? (
                        <Box
                          sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}
                        >
                          {faculty.Role.map((role) => (
                            <Chip
                              key={role.id}
                              label={role.role}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      ) : (
                        'Giảng viên'
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleSelectFaculty(faculty)}
                        disabled={createStudentSelectionMutation.isPending}
                      >
                        Chọn
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalFaculties}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
          }
        />
      </Paper>

      {/* Registration Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Đăng ký Giảng viên Hướng dẫn</DialogTitle>
        <DialogContent>
          {selectedFaculty && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Giảng viên: {selectedFaculty.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {selectedFaculty.email}
              </Typography>
              {selectedFaculty.Faculty && (
                <Typography variant="body2" color="text.secondary">
                  Khoa: {selectedFaculty.Faculty.name}
                </Typography>
              )}
            </Box>
          )}

          <TextField
            fullWidth
            label="Tiêu đề đề tài"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            margin="normal"
            required
            placeholder="Nhập tiêu đề đề tài của bạn"
          />

          <TextField
            fullWidth
            label="Mô tả đề tài"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            margin="normal"
            required
            multiline
            rows={4}
            placeholder="Mô tả chi tiết về đề tài, mục tiêu, phạm vi nghiên cứu..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={handleSubmitRegistration}
            variant="contained"
            disabled={
              createStudentSelectionMutation.isPending ||
              !projectTitle.trim() ||
              !projectDescription.trim()
            }
          >
            {createStudentSelectionMutation.isPending ? (
              <CircularProgress size={20} />
            ) : (
              'Đăng ký'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
