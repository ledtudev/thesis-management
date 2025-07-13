'use client';

import {
  DefenseCommittee,
  DefenseMember,
  defenseHooks,
} from '@/services/defenseService';
import { useAuthStore } from '@/state/authStore';
import {
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  PersonRemove as PersonRemoveIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { format, parseISO } from 'date-fns';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { SyntheticEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface ApiError extends Error {
  response?: {
    data?: {
      message?: string | string[];
    };
  };
}

// Define role options
const ROLE_OPTIONS = [
  { value: 'CHAIRMAN', label: 'Chủ tịch hội đồng' },
  { value: 'SECRETARY', label: 'Thư ký' },
  { value: 'MEMBER', label: 'Thành viên' },
  { value: 'REVIEWER', label: 'Phản biện' },
];

// Status options
const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Chờ xử lý' },
  { value: 'SCHEDULED', label: 'Đã lên lịch' },
  { value: 'IN_PROGRESS', label: 'Đang diễn ra' },
  { value: 'COMPLETED', label: 'Đã hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'warning',
  SCHEDULED: 'info',
  IN_PROGRESS: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

export default function DefenseCommitteeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { id: committeeId } = params;
  const { user } = useAuthStore();

  // State variables
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<DefenseCommittee>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<DefenseMember | null>(
    null,
  );

  // Fetch committee data
  const {
    data: committeeResponse,
    isLoading,
    error,
    refetch,
  } = defenseHooks.useDefenseCommitteeById(committeeId);

  // Fetch faculty members for adding to committee
  const { data: facultyMembersResponse } = defenseHooks.useFacultyMembers();
  const facultyMembers = facultyMembersResponse?.data || [];

  // Mutations
  const updateCommitteeMutation = defenseHooks.useUpdateDefenseCommittee();
  const deleteCommitteeMutation = defenseHooks.useDeleteDefenseCommittee();
  const addMemberMutation = defenseHooks.useAddDefenseMember();
  const removeMemberMutation = defenseHooks.useRemoveDefenseMember();

  // Extract committee data
  const committee = committeeResponse?.data;

  // Set initial form data when committee data is loaded
  useEffect(() => {
    if (committee) {
      setEditedData({
        name: committee.name,
        description: committee.description,
        defenseDate: parseISO(committee.defenseDate),
        location: committee.location,
        status: committee.status,
      });
    }
  }, [committee]);

  // Handle tab change
  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Toggle edit mode
  const handleToggleEdit = () => {
    setIsEditing((prev) => !prev);
    // Reset form if cancelling edit
    if (isEditing && committee) {
      setEditedData({
        name: committee.name,
        description: committee.description,
        defenseDate: parseISO(committee.defenseDate),
        location: committee.location,
        status: committee.status,
      });
    }
  };

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditedData({ ...editedData, [name]: value });
  };

  // Handle status change
  const handleStatusChange = (e: any) => {
    setEditedData({ ...editedData, status: e.target.value });
  };

  // Handle date change
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setEditedData({ ...editedData, defenseDate: date });
    }
  };

  // Save committee changes
  const handleSaveChanges = async () => {
    try {
      await updateCommitteeMutation.mutateAsync({
        id: committeeId,
        ...editedData,
      });
      toast.success('Cập nhật hội đồng thành công');
      setIsEditing(false);
      refetch();
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.message || 'Không thể cập nhật hội đồng';
      toast.error(
        Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
      );
    }
  };

  // Delete committee
  const handleDeleteCommittee = async () => {
    try {
      await deleteCommitteeMutation.mutateAsync(committeeId);
      toast.success('Xóa hội đồng thành công');
      router.push('/dean/defense');
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.message || 'Không thể xóa hội đồng';
      toast.error(
        Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
      );
      setDeleteDialogOpen(false);
    }
  };

  // Add member dialog functions
  const handleOpenAddMemberDialog = () => {
    setAddMemberDialogOpen(true);
  };

  const handleCloseAddMemberDialog = () => {
    setAddMemberDialogOpen(false);
    setSelectedMember('');
    setSelectedRole('');
  };

  // Add member to committee
  const handleAddMember = async () => {
    if (!selectedMember || !selectedRole) {
      toast.error('Vui lòng chọn giảng viên và vai trò');
      return;
    }

    try {
      await addMemberMutation.mutateAsync({
        committeeId,
        facultyMemberId: selectedMember,
        role: selectedRole,
      });
      toast.success('Thêm thành viên thành công');
      handleCloseAddMemberDialog();
      refetch();
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.message || 'Không thể thêm thành viên';
      toast.error(
        Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
      );
    }
  };

  // Remove member dialog functions
  const handleOpenRemoveMemberDialog = (member: DefenseMember) => {
    setMemberToRemove(member);
    setRemoveMemberDialogOpen(true);
  };

  const handleCloseRemoveMemberDialog = () => {
    setRemoveMemberDialogOpen(false);
    setMemberToRemove(null);
  };

  // Remove member from committee
  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      await removeMemberMutation.mutateAsync({
        committeeId,
        memberId: memberToRemove.id,
      });
      toast.success('Xóa thành viên thành công');
      handleCloseRemoveMemberDialog();
      refetch();
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.message || 'Không thể xóa thành viên';
      toast.error(
        Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
      );
    }
  };

  // Format date
  const formatDate = (
    dateString: string,
    formatString: string = 'dd/MM/yyyy HH:mm',
  ) => {
    try {
      return format(parseISO(dateString), formatString);
    } catch (error) {
      return 'N/A';
    }
  };

  // Get label for role
  const getRoleLabel = (role: string) => {
    return ROLE_OPTIONS.find((option) => option.value === role)?.label || role;
  };

  if (isLoading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !committee) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">
          Không thể tải thông tin hội đồng:{' '}
          {(error as ApiError)?.response?.data?.message ||
            (error as Error)?.message ||
            'Lỗi không xác định'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/dean/defense')}
          sx={{ mt: 2 }}
        >
          Quay lại danh sách
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          edge="start"
          onClick={() => router.push('/dean/defense')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {committee.name}
        </Typography>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          {!isEditing ? (
            <>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleToggleEdit}
              >
                Chỉnh sửa
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Xóa
              </Button>
            </>
          ) : (
            <>
              <Button variant="outlined" onClick={handleToggleEdit}>
                Hủy
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveChanges}
                disabled={updateCommitteeMutation.isPending}
              >
                {updateCommitteeMutation.isPending ? (
                  <CircularProgress size={24} />
                ) : (
                  'Lưu thay đổi'
                )}
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab label="Thông tin chung" />
        <Tab label="Thành viên hội đồng" />
        <Tab label="Dự án đánh giá" />
      </Tabs>

      {/* General Information Tab */}
      {tabValue === 0 && (
        <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
          {isEditing ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên hội đồng"
                  name="name"
                  value={editedData.name || ''}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Ngày bảo vệ"
                  value={editedData.defenseDate}
                  onChange={handleDateChange}
                  sx={{ width: '100%' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Địa điểm"
                  name="location"
                  value={editedData.location || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={editedData.status || ''}
                    onChange={handleStatusChange}
                    label="Trạng thái"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả"
                  name="description"
                  value={editedData.description || ''}
                  onChange={handleChange}
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Trạng thái
                    </Typography>
                    <Chip
                      label={
                        STATUS_OPTIONS.find(
                          (option) => option.value === committee.status,
                        )?.label || committee.status
                      }
                      color={
                        (STATUS_COLORS[committee.status] as any) || 'default'
                      }
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ngày bảo vệ
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(committee.defenseDate)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Địa điểm
                    </Typography>
                    <Typography variant="body1">
                      {committee.location || 'Chưa cập nhật'}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mô tả
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {committee.description || 'Không có mô tả'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Người tạo
                  </Typography>
                  <Typography variant="body1">
                    {committee.CreatedByFacultyMember?.fullName || 'N/A'} (
                    {committee.CreatedByFacultyMember?.email || 'N/A'})
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </Paper>
      )}

      {/* Members Tab */}
      {tabValue === 1 && (
        <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography variant="h6">Danh sách thành viên</Typography>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleOpenAddMemberDialog}
            >
              Thêm thành viên
            </Button>
          </Box>

          {committee.Members && committee.Members.length > 0 ? (
            <Grid container spacing={2}>
              {committee.Members.map((member) => (
                <Grid item xs={12} sm={6} md={4} key={member.id}>
                  <Card variant="outlined">
                    <Box sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Avatar
                          src={member.FacultyMember?.profilePicture}
                          sx={{ mr: 2 }}
                        >
                          {member.FacultyMember?.fullName?.charAt(0) || 'U'}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {member.FacultyMember?.fullName || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {member.FacultyMember?.facultyCode || 'N/A'}
                          </Typography>
                        </Box>
                        <IconButton
                          color="error"
                          onClick={() => handleOpenRemoveMemberDialog(member)}
                          size="small"
                        >
                          <PersonRemoveIcon />
                        </IconButton>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Chip
                          label={getRoleLabel(member.role)}
                          size="small"
                          color={
                            member.role === 'CHAIRMAN'
                              ? 'primary'
                              : member.role === 'SECRETARY'
                              ? 'secondary'
                              : member.role === 'REVIEWER'
                              ? 'warning'
                              : 'default'
                          }
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontStyle="italic"
                        >
                          {member.FacultyMember?.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                py: 6,
                color: 'text.secondary',
              }}
            >
              <PersonIcon sx={{ fontSize: 60, opacity: 0.5, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Chưa có thành viên
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Hội đồng này chưa có thành viên nào. Hãy thêm thành viên để bắt
                đầu.
              </Typography>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={handleOpenAddMemberDialog}
              >
                Thêm thành viên
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {/* Project Tab */}
      {tabValue === 2 && (
        <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
          {committee.Project ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Thông tin dự án
              </Typography>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {committee.Project.title}
                  </Typography>
                  <Chip
                    label={committee.Project.type}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Thành viên dự án:
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {committee.Project.Member &&
                    committee.Project.Member.length > 0 ? (
                      committee.Project.Member.map((member) => (
                        <Box key={member.id} sx={{ mb: 1 }}>
                          {member.Student && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                src={member.Student.profilePicture}
                                sx={{ width: 24, height: 24, mr: 1 }}
                              >
                                {member.Student.fullName?.charAt(0)}
                              </Avatar>
                              <Typography variant="body2">
                                {member.Student.fullName} (
                                {member.Student.studentCode}) - Sinh viên
                              </Typography>
                            </Box>
                          )}
                          {member.FacultyMember && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                src={member.FacultyMember.profilePicture}
                                sx={{ width: 24, height: 24, mr: 1 }}
                              >
                                {member.FacultyMember.fullName?.charAt(0)}
                              </Avatar>
                              <Typography variant="body2">
                                {member.FacultyMember.fullName} (
                                {member.FacultyMember.facultyCode}) -{' '}
                                {member.role || 'Giảng viên'}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontStyle="italic"
                      >
                        Không có thành viên
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
                  <Button
                    component={NextLink}
                    href={`/dean/project/${committee.Project.id}`}
                    startIcon={<AssignmentIcon />}
                  >
                    Xem chi tiết dự án
                  </Button>
                </Box>
              </Card>
            </Box>
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                py: 6,
                color: 'text.secondary',
              }}
            >
              <AssignmentIcon sx={{ fontSize: 60, opacity: 0.5, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Chưa có dự án
              </Typography>
              <Typography variant="body2">
                Hội đồng này chưa được gán cho dự án nào.
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Xác nhận xóa hội đồng</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa hội đồng này? Hành động này không thể hoàn
            tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button
            color="error"
            onClick={handleDeleteCommittee}
            disabled={deleteCommitteeMutation.isPending}
          >
            {deleteCommitteeMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              'Xóa'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog
        open={addMemberDialogOpen}
        onClose={handleCloseAddMemberDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Thêm thành viên hội đồng</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Giảng viên</InputLabel>
              <Select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                label="Giảng viên"
              >
                {facultyMembers
                  .filter((faculty) => {
                    // Filter out faculty members already in the committee
                    const isAlreadyMember = committee.Members?.some(
                      (member) => member.facultyMemberId === faculty.id,
                    );
                    return !isAlreadyMember;
                  })
                  .map((faculty) => (
                    <MenuItem key={faculty.id} value={faculty.id}>
                      {faculty.fullName} ({faculty.facultyCode || 'N/A'})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Vai trò</InputLabel>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                label="Vai trò"
              >
                {ROLE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddMemberDialog}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleAddMember}
            disabled={
              !selectedMember || !selectedRole || addMemberMutation.isPending
            }
          >
            {addMemberMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              'Thêm thành viên'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog
        open={removeMemberDialogOpen}
        onClose={handleCloseRemoveMemberDialog}
      >
        <DialogTitle>Xác nhận xóa thành viên</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa thành viên{' '}
            <strong>
              {memberToRemove?.FacultyMember?.fullName || 'Không xác định'}
            </strong>{' '}
            khỏi hội đồng?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveMemberDialog}>Hủy</Button>
          <Button
            color="error"
            onClick={handleRemoveMember}
            disabled={removeMemberMutation.isPending}
          >
            {removeMemberMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              'Xóa'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
