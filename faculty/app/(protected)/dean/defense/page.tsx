'use client';

import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  AutoAwesome as AutoAwesomeIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Group as GroupIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Button,
  Card,
  CardActions,
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
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

import {
  BulkCreateDefenseCommitteesDto,
  CreateDefenseCommitteeDto,
  DefenseCommittee,
  defenseHooks,
  ProjectReadyForDefense,
} from '@/services/defenseService';

// Status mapping for Vietnamese display
const statusMap = {
  PREPARING: { label: 'Đang chuẩn bị', color: 'warning' as const },
  SCHEDULED: { label: 'Đã lên lịch', color: 'info' as const },
  ONGOING: { label: 'Đang diễn ra', color: 'success' as const },
  FINISHED: { label: 'Đã kết thúc', color: 'default' as const },
  CANCELLED: { label: 'Đã hủy', color: 'error' as const },
};

// Error type for API responses
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

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
      id={`defense-tabpanel-${index}`}
      aria-labelledby={`defense-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Utility function to format date using native JavaScript
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
};

// Utility function to format date for input
const formatDateForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Utility function to parse date from input
const parseDateFromInput = (dateString: string) => {
  return new Date(dateString);
};

export default function DefenseManagementPage() {
  const router = useRouter();

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  // Dialog states
  const [createCommitteeDialog, setCreateCommitteeDialog] = useState(false);
  const [editCommitteeDialog, setEditCommitteeDialog] = useState(false);
  const [bulkCreateDialog, setBulkCreateDialog] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);

  // Selected items
  const [selectedCommittee, setSelectedCommittee] =
    useState<DefenseCommittee | null>(null);
  const [selectedProject, setSelectedProject] =
    useState<ProjectReadyForDefense | null>(null);

  // Form states
  const [committeeForm, setCommitteeForm] = useState<CreateDefenseCommitteeDto>(
    {
      name: '',
      description: '',
      defenseDate: new Date(),
      location: '',
      projectId: '',
    },
  );

  const [editCommitteeForm, setEditCommitteeForm] = useState({
    name: '',
    description: '',
    defenseDate: new Date(),
    location: '',
    status: 'PREPARING' as
      | 'PREPARING'
      | 'SCHEDULED'
      | 'ONGOING'
      | 'FINISHED'
      | 'CANCELLED',
  });

  const [bulkCreateForm, setBulkCreateForm] =
    useState<BulkCreateDefenseCommitteesDto>({
      projectIds: [],
      defaultLocation: '',
      defaultDefenseDate: new Date(),
      committeeSizeMin: 3,
      committeeSizeMax: 5,
    });

  // API hooks
  const {
    data: committeesData,
    isLoading: committeesLoading,
    refetch: refetchCommittees,
  } = defenseHooks.useDefenseCommittees({
    keyword: searchTerm,
    status: statusFilter || undefined,
    page: 1,
    limit: 50,
  });

  const {
    data: projectsData,
    isLoading: projectsLoading,
    refetch: refetchProjects,
  } = defenseHooks.useProjectsReadyForDefense({
    keyword: searchTerm,
    hasCommittee: activeTab === 1 ? false : undefined,
    page: 1,
    limit: 50,
  });

  // Mutations
  const createCommitteeMutation = defenseHooks.useCreateDefenseCommittee();
  const updateCommitteeMutation = defenseHooks.useUpdateDefenseCommittee();
  const deleteCommitteeMutation = defenseHooks.useDeleteDefenseCommittee();
  const bulkCreateMutation = defenseHooks.useBulkCreateDefenseCommittees();
  const autoAssignMutation = defenseHooks.useAutoAssignMembers();

  // Filtered data
  const committees = committeesData?.data || [];
  const readyProjects =
    projectsData?.data?.filter((p) => !p.DefenseCommittee) || [];
  const allProjects = projectsData?.data || [];

  // Handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCreateCommittee = async () => {
    try {
      await createCommitteeMutation.mutateAsync(committeeForm);
      toast.success('Tạo hội đồng thành công!');
      setCreateCommitteeDialog(false);
      resetCommitteeForm();
      refetchCommittees();
      refetchProjects();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(
        apiError.response?.data?.message || 'Có lỗi xảy ra khi tạo hội đồng',
      );
    }
  };

  const handleEditCommittee = async () => {
    if (!selectedCommittee) return;

    try {
      await updateCommitteeMutation.mutateAsync({
        id: selectedCommittee.id,
        name: editCommitteeForm.name,
        description: editCommitteeForm.description,
        defenseDate: editCommitteeForm.defenseDate,
        location: editCommitteeForm.location,
        status: editCommitteeForm.status,
      });
      toast.success('Cập nhật hội đồng thành công!');
      setEditCommitteeDialog(false);
      setSelectedCommittee(null);
      refetchCommittees();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(
        apiError.response?.data?.message ||
          'Có lỗi xảy ra khi cập nhật hội đồng',
      );
    }
  };

  const handleBulkCreate = async () => {
    if (selectedProjects.length === 0) {
      toast.error('Vui lòng chọn ít nhất một dự án');
      return;
    }

    try {
      const result = await bulkCreateMutation.mutateAsync({
        ...bulkCreateForm,
        projectIds: selectedProjects,
      });

      toast.success(
        `Tạo thành công ${result.totalCreated}/${result.totalRequested} hội đồng`,
      );
      setBulkCreateDialog(false);
      setSelectedProjects([]);
      resetBulkCreateForm();
      refetchCommittees();
      refetchProjects();
    } catch (error: unknown) {
      const errorMessage =
        (error as ApiError)?.response?.data?.message ||
        'Có lỗi xảy ra khi tạo hội đồng hàng loạt';
      toast.error(errorMessage);
    }
  };

  const handleDeleteCommittee = async () => {
    if (!selectedCommittee) return;

    try {
      await deleteCommitteeMutation.mutateAsync(selectedCommittee.id);
      toast.success('Xóa hội đồng thành công');
      setDeleteConfirmDialog(false);
      setSelectedCommittee(null);
      refetchCommittees();
    } catch (error: unknown) {
      const errorMessage =
        (error as ApiError)?.response?.data?.message ||
        'Có lỗi xảy ra khi xóa hội đồng';
      toast.error(errorMessage);
    }
  };

  const handleAutoAssignMembers = async (committeeId: string) => {
    try {
      await autoAssignMutation.mutateAsync({
        committeeId,
        memberCount: 5,
      });

      toast.success('Tự động phân công thành viên thành công');
      refetchCommittees();
    } catch (error: unknown) {
      const errorMessage =
        (error as ApiError)?.response?.data?.message ||
        'Có lỗi xảy ra khi tự động phân công thành viên';
      toast.error(errorMessage);
    }
  };

  const resetCommitteeForm = () => {
    setCommitteeForm({
      name: '',
      description: '',
      defenseDate: new Date(),
      location: '',
      projectId: '',
    });
  };

  const resetBulkCreateForm = () => {
    setBulkCreateForm({
      projectIds: [],
      defaultLocation: '',
      defaultDefenseDate: new Date(),
      committeeSizeMin: 3,
      committeeSizeMax: 5,
    });
  };

  const openCreateDialog = (project: ProjectReadyForDefense) => {
    setSelectedProject(project);
    setCommitteeForm({
      ...committeeForm,
      projectId: project.id,
      name: `Hội đồng bảo vệ: ${project.title}`,
    });
    setCreateCommitteeDialog(true);
  };

  const openEditDialog = (committee: DefenseCommittee) => {
    setSelectedCommittee(committee);
    setEditCommitteeForm({
      name: committee.name,
      description: committee.description || '',
      defenseDate: new Date(committee.defenseDate),
      location: committee.location || '',
      status: committee.status as
        | 'PREPARING'
        | 'SCHEDULED'
        | 'ONGOING'
        | 'FINISHED'
        | 'CANCELLED',
    });
    setEditCommitteeDialog(true);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Quản lý Hội đồng Bảo vệ
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý hội đồng bảo vệ đồ án và luận văn tốt nghiệp
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên hội đồng, dự án, sinh viên..."
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
              <InputLabel>Lọc theo trạng thái</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Lọc theo trạng thái"
              >
                <MenuItem value="">Tất cả trạng thái</MenuItem>
                {Object.entries(statusMap).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setBulkCreateDialog(true)}
              disabled={readyProjects.length === 0}
              size="large"
            >
              Tạo hàng loạt
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label={
              <Badge badgeContent={committees.length} color="primary">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupIcon />
                  Hội đồng hiện tại
                </Box>
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={readyProjects.length} color="error">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIcon />
                  Dự án chờ tạo HĐ
                </Box>
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={allProjects.length} color="info">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SchoolIcon />
                  Tất cả dự án
                </Box>
              </Badge>
            }
          />
        </Tabs>

        {/* Defense Committees Tab */}
        <TabPanel value={activeTab} index={0}>
          {committeesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : committees.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <GroupIcon
                sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có hội đồng nào
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hãy tạo hội đồng bảo vệ cho các dự án đã sẵn sàng
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3} sx={{ p: 3 }}>
              {committees.map((committee) => (
                <Grid item xs={12} md={6} lg={4} key={committee.id}>
                  <CommitteeCard
                    committee={committee}
                    onView={() => router.push(`/dean/defense/${committee.id}`)}
                    onEdit={() => {
                      openEditDialog(committee);
                    }}
                    onDelete={() => {
                      setSelectedCommittee(committee);
                      setDeleteConfirmDialog(true);
                    }}
                    onAutoAssign={() => handleAutoAssignMembers(committee.id)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Ready Projects Tab */}
        <TabPanel value={activeTab} index={1}>
          {projectsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : readyProjects.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <AssignmentIcon
                sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Không có dự án nào chờ tạo hội đồng
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tất cả dự án đã có hội đồng bảo vệ hoặc chưa đủ điều kiện
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 3 }}>
              {selectedProjects.length > 0 && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography>
                      Đã chọn {selectedProjects.length} dự án
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        onClick={() => setSelectedProjects([])}
                      >
                        Bỏ chọn tất cả
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => setBulkCreateDialog(true)}
                      >
                        Tạo hội đồng ({selectedProjects.length})
                      </Button>
                    </Box>
                  </Box>
                </Alert>
              )}

              <Grid container spacing={3}>
                {readyProjects.map((project) => (
                  <Grid item xs={12} key={project.id}>
                    <ProjectCard
                      project={project}
                      isSelected={selectedProjects.includes(project.id)}
                      onSelect={(selected) => {
                        if (selected) {
                          setSelectedProjects([
                            ...selectedProjects,
                            project.id,
                          ]);
                        } else {
                          setSelectedProjects(
                            selectedProjects.filter((id) => id !== project.id),
                          );
                        }
                      }}
                      onCreateCommittee={() => openCreateDialog(project)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </TabPanel>

        {/* All Projects Tab */}
        <TabPanel value={activeTab} index={2}>
          {projectsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3} sx={{ p: 3 }}>
              {allProjects.map((project) => (
                <Grid item xs={12} key={project.id}>
                  <ProjectCard project={project} showCommitteeInfo />
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Paper>

      {/* Floating Action Button */}
      {activeTab === 1 && readyProjects.length > 0 && (
        <Fab
          color="primary"
          aria-label="bulk create"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setBulkCreateDialog(true)}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Dialogs */}
      <CreateCommitteeDialog
        open={createCommitteeDialog}
        onClose={() => {
          setCreateCommitteeDialog(false);
          setSelectedProject(null);
          resetCommitteeForm();
        }}
        project={selectedProject}
        form={committeeForm}
        onFormChange={setCommitteeForm}
        onSubmit={handleCreateCommittee}
        isLoading={createCommitteeMutation.isPending}
      />

      <BulkCreateDialog
        open={bulkCreateDialog}
        onClose={() => {
          setBulkCreateDialog(false);
          resetBulkCreateForm();
        }}
        selectedProjects={selectedProjects}
        projects={readyProjects}
        form={bulkCreateForm}
        onFormChange={setBulkCreateForm}
        onSubmit={handleBulkCreate}
        isLoading={bulkCreateMutation.isPending}
      />

      {/* Edit Committee Dialog */}
      <EditCommitteeDialog
        open={editCommitteeDialog}
        onClose={() => {
          setEditCommitteeDialog(false);
          setSelectedCommittee(null);
        }}
        committee={selectedCommittee}
        form={editCommitteeForm}
        onFormChange={setEditCommitteeForm}
        onSubmit={handleEditCommittee}
        isLoading={updateCommitteeMutation.isPending}
      />

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmDialog}
        onClose={() => {
          setDeleteConfirmDialog(false);
          setSelectedCommittee(null);
        }}
        committee={selectedCommittee}
        onConfirm={handleDeleteCommittee}
        isLoading={deleteCommitteeMutation.isPending}
      />
    </Container>
  );
}

// Committee Card Component
function CommitteeCard({
  committee,
  onView,
  onEdit,
  onDelete,
  onAutoAssign,
}: {
  committee: DefenseCommittee;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAutoAssign: () => void;
}) {
  const status = statusMap[committee.status as keyof typeof statusMap];

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            component="h3"
            noWrap
            sx={{ flexGrow: 1, mr: 1 }}
          >
            {committee.name}
          </Typography>
          <Chip label={status.label} color={status.color} size="small" />
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          <AssignmentIcon
            sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }}
          />
          {committee.Project?.title}
        </Typography>

        <Stack spacing={1} sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarIcon
              sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }}
            />
            <Typography variant="body2">
              {formatDate(committee.defenseDate)}
            </Typography>
          </Box>

          {committee.location && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationIcon
                sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }}
              />
              <Typography variant="body2" noWrap>
                {committee.location}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <GroupIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">
              {committee.Members?.length || 0} thành viên
            </Typography>
          </Box>
        </Stack>

        {committee.Members && committee.Members.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
              {committee.Members.map((member) => (
                <Tooltip key={member.id} title={member.FacultyMember?.fullName}>
                  <Avatar
                    src={member.FacultyMember?.profilePicture}
                    sx={{ width: 32, height: 32 }}
                  >
                    {member.FacultyMember?.fullName?.charAt(0)}
                  </Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
          </Box>
        )}
      </CardContent>

      <CardActions>
        <IconButton size="small" onClick={onView} color="primary">
          <VisibilityIcon />
        </IconButton>
        <IconButton size="small" onClick={onEdit}>
          <EditIcon />
        </IconButton>
        {committee.status === 'PREPARING' && (
          <IconButton size="small" onClick={onAutoAssign} color="secondary">
            <AutoAwesomeIcon />
          </IconButton>
        )}
        <IconButton size="small" onClick={onDelete} color="error">
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}

// Project Card Component
function ProjectCard({
  project,
  isSelected,
  onSelect,
  onCreateCommittee,
  showCommitteeInfo,
}: {
  project: ProjectReadyForDefense;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onCreateCommittee?: () => void;
  showCommitteeInfo?: boolean;
}) {
  const students = project.Member?.filter((m) => m.Student) || [];
  const advisors = project.Member?.filter((m) => m.FacultyMember) || [];

  return (
    <Card
      sx={{
        border: isSelected ? 2 : 1,
        borderColor: isSelected ? 'primary.main' : 'divider',
        '&:hover': { boxShadow: 3 },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {onSelect && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={isSelected}
                  onChange={(e) => onSelect(e.target.checked)}
                />
              }
              label=""
              sx={{ m: 0 }}
            />
          )}

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom>
              {project.title}
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Chip label={project.type} size="small" />
              {project.Division && (
                <Chip
                  icon={<BusinessIcon />}
                  label={project.Division.name}
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>

            {students.length > 0 && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Sinh viên:</strong>{' '}
                {students.map((s) => s.Student?.fullName).join(', ')}
              </Typography>
            )}

            {advisors.length > 0 && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>GVHD:</strong>{' '}
                {advisors.map((a) => a.FacultyMember?.fullName).join(', ')}
              </Typography>
            )}

            {showCommitteeInfo && project.DefenseCommittee && (
              <Paper
                variant="outlined"
                sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {project.DefenseCommittee.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(project.DefenseCommittee.defenseDate)}
                      {project.DefenseCommittee.location &&
                        ` • ${project.DefenseCommittee.location}`}
                    </Typography>
                  </Box>
                  <Chip
                    label={
                      statusMap[
                        project.DefenseCommittee
                          .status as keyof typeof statusMap
                      ].label
                    }
                    color={
                      statusMap[
                        project.DefenseCommittee
                          .status as keyof typeof statusMap
                      ].color
                    }
                    size="small"
                  />
                </Box>
              </Paper>
            )}
          </Box>

          {onCreateCommittee && !project.DefenseCommittee && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreateCommittee}
            >
              Tạo hội đồng
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

// Create Committee Dialog
function CreateCommitteeDialog({
  open,
  onClose,
  project,
  form,
  onFormChange,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  project: ProjectReadyForDefense | null;
  form: CreateDefenseCommitteeDto;
  onFormChange: (form: CreateDefenseCommitteeDto) => void;
  onSubmit: () => void;
  isLoading: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Tạo Hội đồng Bảo vệ
        {project && (
          <Typography variant="body2" color="text.secondary">
            Dự án: {project.title}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Tên hội đồng"
            value={form.name}
            onChange={(e) => onFormChange({ ...form, name: e.target.value })}
            required
          />

          <TextField
            fullWidth
            label="Mô tả"
            value={form.description}
            onChange={(e) =>
              onFormChange({ ...form, description: e.target.value })
            }
            multiline
            rows={3}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ngày bảo vệ"
                type="datetime-local"
                value={formatDateForInput(form.defenseDate)}
                onChange={(e) =>
                  onFormChange({
                    ...form,
                    defenseDate: parseDateFromInput(e.target.value),
                  })
                }
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Địa điểm"
                value={form.location}
                onChange={(e) =>
                  onFormChange({ ...form, location: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <AddIcon />}
        >
          {isLoading ? 'Đang tạo...' : 'Tạo hội đồng'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Bulk Create Dialog
function BulkCreateDialog({
  open,
  onClose,
  selectedProjects,
  projects,
  form,
  onFormChange,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  selectedProjects: string[];
  projects: ProjectReadyForDefense[];
  form: BulkCreateDefenseCommitteesDto;
  onFormChange: (form: BulkCreateDefenseCommitteesDto) => void;
  onSubmit: () => void;
  isLoading: boolean;
}) {
  const selectedProjectsData = projects.filter((p) =>
    selectedProjects.includes(p.id),
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Tạo Hội đồng Hàng loạt
        <Typography variant="body2" color="text.secondary">
          Tạo hội đồng cho {selectedProjects.length} dự án đã chọn
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ngày bảo vệ mặc định"
                type="datetime-local"
                value={formatDateForInput(
                  form.defaultDefenseDate || new Date(),
                )}
                onChange={(e) =>
                  onFormChange({
                    ...form,
                    defaultDefenseDate: parseDateFromInput(e.target.value),
                  })
                }
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Địa điểm mặc định"
                value={form.defaultLocation}
                onChange={(e) =>
                  onFormChange({ ...form, defaultLocation: e.target.value })
                }
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Số thành viên tối thiểu"
                value={form.committeeSizeMin}
                onChange={(e) =>
                  onFormChange({
                    ...form,
                    committeeSizeMin: parseInt(e.target.value),
                  })
                }
                inputProps={{ min: 3, max: 7 }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Số thành viên tối đa"
                value={form.committeeSizeMax}
                onChange={(e) =>
                  onFormChange({
                    ...form,
                    committeeSizeMax: parseInt(e.target.value),
                  })
                }
                inputProps={{ min: 3, max: 7 }}
              />
            </Grid>
          </Grid>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Danh sách dự án được chọn ({selectedProjectsData.length})
            </Typography>
            <Paper
              variant="outlined"
              sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}
            >
              <Stack spacing={1}>
                {selectedProjectsData.map((project) => (
                  <Paper key={project.id} variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2">{project.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {project.Member?.filter((m) => m.Student)
                        .map((m) => m.Student?.fullName)
                        .join(', ')}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <AddIcon />}
        >
          {isLoading
            ? 'Đang tạo...'
            : `Tạo ${selectedProjects.length} hội đồng`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Edit Committee Dialog
function EditCommitteeDialog({
  open,
  onClose,
  committee,
  form,
  onFormChange,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  committee: DefenseCommittee | null;
  form: {
    name: string;
    description: string;
    defenseDate: Date;
    location: string;
    status: 'PREPARING' | 'SCHEDULED' | 'ONGOING' | 'FINISHED' | 'CANCELLED';
  };
  onFormChange: (form: {
    name: string;
    description: string;
    defenseDate: Date;
    location: string;
    status: 'PREPARING' | 'SCHEDULED' | 'ONGOING' | 'FINISHED' | 'CANCELLED';
  }) => void;
  onSubmit: () => void;
  isLoading: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Chỉnh sửa hội đồng bảo vệ
        {committee && (
          <Typography variant="body2" color="text.secondary">
            {committee.name}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Tên hội đồng"
            value={form.name}
            onChange={(e) => onFormChange({ ...form, name: e.target.value })}
            required
          />

          <TextField
            fullWidth
            label="Mô tả"
            value={form.description}
            onChange={(e) =>
              onFormChange({ ...form, description: e.target.value })
            }
            multiline
            rows={3}
          />

          <TextField
            fullWidth
            label="Ngày bảo vệ"
            type="datetime-local"
            value={formatDateForInput(form.defenseDate)}
            onChange={(e) =>
              onFormChange({
                ...form,
                defenseDate: parseDateFromInput(e.target.value),
              })
            }
            InputLabelProps={{
              shrink: true,
            }}
            required
          />

          <TextField
            fullWidth
            label="Địa điểm"
            value={form.location}
            onChange={(e) =>
              onFormChange({ ...form, location: e.target.value })
            }
          />

          <FormControl fullWidth>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={form.status}
              label="Trạng thái"
              onChange={(e) =>
                onFormChange({
                  ...form,
                  status: e.target.value as
                    | 'PREPARING'
                    | 'SCHEDULED'
                    | 'ONGOING'
                    | 'FINISHED'
                    | 'CANCELLED',
                })
              }
            >
              <MenuItem value="PREPARING">Đang chuẩn bị</MenuItem>
              <MenuItem value="SCHEDULED">Đã lên lịch</MenuItem>
              <MenuItem value="ONGOING">Đang diễn ra</MenuItem>
              <MenuItem value="FINISHED">Đã kết thúc</MenuItem>
              <MenuItem value="CANCELLED">Đã hủy</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <EditIcon />}
        >
          {isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Delete Confirm Dialog
function DeleteConfirmDialog({
  open,
  onClose,
  committee,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  committee: DefenseCommittee | null;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Xác nhận xóa hội đồng</DialogTitle>
      <DialogContent>
        <Typography>
          Bạn có chắc chắn muốn xóa hội đồng <strong>{committee?.name}</strong>?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Hành động này không thể hoàn tác.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          disabled={isLoading}
          startIcon={
            isLoading ? <CircularProgress size={20} /> : <DeleteIcon />
          }
        >
          {isLoading ? 'Đang xóa...' : 'Xóa'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
