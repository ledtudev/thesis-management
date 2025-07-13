/* eslint-disable react/no-unescaped-entities */
'use client';

import { defenseHooks } from '@/services/defenseService';
import {
  ProjectComment,
  ProjectFinalReport,
  projectHooks,
  ProjectMember,
  ProjectStatusT,
} from '@/services/projectService';
import {
  downloadFileAsBlob,
  openFileInNewTab,
} from '@/services/storageService';
import { useAuthStore } from '@/state/authStore';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  AttachFile as AttachFileIcon,
  ChatBubbleOutline as ChatIcon,
  GavelOutlined as DefenseIcon,
  Download as DownloadIcon,
  EditOutlined as EditIcon,
  Group as GroupIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Send as SendIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
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
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

// Status and type mapping functions
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    PENDING: 'Chờ xử lý',
    IN_PROGRESS: 'Đang thực hiện',
    WAITING_FOR_EVALUATION: 'Chờ đánh giá',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    APPROVED: 'Đã phê duyệt',
    REJECTED: 'Bị từ chối',
  };
  return statusMap[status] || status;
};

const getStatusColor = (
  status: string,
):
  | 'default'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning' => {
  const statusMap: Record<
    string,
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning'
  > = {
    PENDING: 'default',
    IN_PROGRESS: 'primary',
    WAITING_FOR_EVALUATION: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'error',
    APPROVED: 'success',
    REJECTED: 'error',
  };
  return statusMap[status] || 'default';
};

const getProjectTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    GRADUATED: 'Đồ án tốt nghiệp',
    INTERNSHIP: 'Đồ án thực tập',
    RESEARCH: 'Đồ án nghiên cứu',
  };
  return typeMap[type] || type;
};

// Interface for API errors
interface ApiError extends Error {
  response?: {
    data?: {
      message?: string | string[];
    };
  };
}

// Defense committee form interface
interface DefenseCommitteeFormData {
  name: string;
  description: string;
  defenseDate: Date;
  location: string;
}

// Tab panel component
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
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Comment component
const CommentItem = ({ comment }: { comment: ProjectComment }) => {
  const theme = useTheme();
  const { user } = useAuthStore();

  const isCurrentUserCommenter = user
    ? comment.commenterFacultyId === user.id ||
      comment.commenterStudentId === user.id
    : false;

  const profilePicture = isCurrentUserCommenter
    ? comment.CommenterFacultyMember?.profilePicture ||
      comment.CommenterStudent?.profilePicture ||
      undefined
    : comment.CommenterFacultyMember?.profilePicture ||
      comment.CommenterStudent?.profilePicture ||
      undefined;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        mb: 2,
        flexDirection: isCurrentUserCommenter ? 'row-reverse' : 'row',
      }}
    >
      <Avatar
        sx={{
          bgcolor: isCurrentUserCommenter
            ? theme.palette.primary.main
            : theme.palette.secondary.main,
          width: 40,
          height: 40,
        }}
        src={profilePicture}
      >
        {(isCurrentUserCommenter
          ? comment.CommenterFacultyMember?.fullName?.charAt(0)
          : comment.CommenterStudent?.fullName?.charAt(0)) || 'U'}
      </Avatar>

      <Box
        sx={{
          maxWidth: '80%',
          p: 2,
          borderRadius: 2,
          bgcolor: isCurrentUserCommenter
            ? 'primary.light'
            : 'background.paper',
          color: isCurrentUserCommenter
            ? 'primary.contrastText'
            : 'text.primary',
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {comment.CommenterFacultyMember?.fullName ||
              comment.CommenterStudent?.fullName}
          </Typography>
          <Typography
            variant="caption"
            color={isCurrentUserCommenter ? 'inherit' : 'text.secondary'}
          >
            {format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm')}
          </Typography>
        </Box>
        <Typography variant="body2">{comment.content}</Typography>
      </Box>
    </Box>
  );
};

export default function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { id: projectId } = params;
  const { user } = useAuthStore();
  const [tabValue, setTabValue] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [defenseDialogOpen, setDefenseDialogOpen] = useState(false);
  const [defenseFormData, setDefenseFormData] =
    useState<DefenseCommitteeFormData>({
      name: '',
      description: '',
      defenseDate: new Date(),
      location: '',
    });

  // API hooks
  const {
    data: project,
    isLoading: isLoadingProject,
    error: projectError,
    refetch: refetchProject,
  } = projectHooks.useProjectById(projectId);

  const {
    data: commentsResponse = [],
    isLoading: isLoadingComments,
    refetch: refetchComments,
  } = projectHooks.useProjectComments(projectId);

  // Mutations
  const createDefenseCommitteeMutation =
    defenseHooks.useCreateDefenseCommittee();
  const addCommentMutation = projectHooks.useAddProjectComment();

  // Extract data
  const projectData = (project?.data || project) as {
    Member?: ProjectMember[];
    title?: string;
    status?: string;
    type?: string;
    field?: string;
    createdAt?: string;
    updatedAt?: string;
    description?: string;
    FieldPool?: { name: string };
    Division?: {
      name: string;
      Faculty?: { name: string };
    };
    ApprovedByFacultyMember?: {
      fullName: string;
      facultyCode: string;
    };
    FinalReport?: ProjectFinalReport[];
    DefenseCommittee?: {
      id: string;
      name: string;
      description?: string;
      defenseDate: string;
      location?: string;
      status: string;
      Members?: Array<{
        id: string;
        role: string;
        FacultyMember?: {
          id: string;
          fullName: string;
          facultyCode?: string;
          profilePicture?: string;
        };
      }>;
    };
  };

  const defenseCommittee = projectData?.DefenseCommittee;
  const comments: ProjectComment[] = Array.isArray(commentsResponse)
    ? commentsResponse
    : commentsResponse.data || [];

  // Event handlers
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleFileDownload = async (fileId: string, fileName: string) => {
    try {
      const blob = await downloadFileAsBlob(fileId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Không thể tải xuống tài liệu');
    }
  };

  const isPdfFile = (fileName: string) => {
    return fileName?.toLowerCase().endsWith('.pdf') || false;
  };

  const handleOpenDefenseDialog = () => {
    if (projectData?.title) {
      setDefenseFormData({
        ...defenseFormData,
        name: `Hội đồng đánh giá: ${projectData.title}`,
      });
    }
    setDefenseDialogOpen(true);
  };

  const handleCloseDefenseDialog = () => {
    setDefenseDialogOpen(false);
  };

  const handleDefenseFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setDefenseFormData({
      ...defenseFormData,
      [name]: value,
    });
  };

  const handleDefenseDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const date = parseISO(e.target.value);
      setDefenseFormData({
        ...defenseFormData,
        defenseDate: date,
      });
    }
  };

  const handleCreateDefenseCommittee = async () => {
    try {
      await createDefenseCommitteeMutation.mutateAsync({
        ...defenseFormData,
        projectId,
      });
      toast.success('Đã tạo hội đồng đánh giá thành công');
      handleCloseDefenseDialog();
      refetchProject();
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.message || 'Không thể tạo hội đồng đánh giá';
      toast.error(
        Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
      );
    }
  };

  const navigateToDefenseDetail = (id: string) => {
    router.push(`/dean/defense/${id}`);
  };

  const formatDate = (
    dateString: string | undefined | null,
    formatPattern: string = 'dd/MM/yyyy',
  ): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return 'N/A';
      return format(date, formatPattern);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'N/A';
    }
  };

  const formatTimeAgo = (dateString: string | undefined | null): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return 'N/A';
      return formatDistanceToNow(date, { addSuffix: true, locale: vi });
    } catch (error) {
      console.error('Time ago formatting error:', error);
      return 'N/A';
    }
  };

  const formatDateForInput = (date: Date): string => {
    try {
      return format(date, "yyyy-MM-dd'T'HH:mm");
    } catch (error) {
      console.error('Error formatting date for input:', error);
      return '';
    }
  };

  if (isLoadingProject) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (projectError || !project) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ my: 2 }}>
          Không thể tải thông tin dự án. Vui lòng thử lại sau.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{ mt: 2 }}
        >
          Quay lại
        </Button>
      </Container>
    );
  }

  const studentMembers =
    projectData.Member?.filter((m: ProjectMember) => m.Student) || [];
  const lecturerMembers =
    projectData.Member?.filter((m: ProjectMember) => m.FacultyMember) || [];

  const isEligibleForDefense =
    projectData.status === ProjectStatusT.WAITING_FOR_EVALUATION;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            onClick={handleGoBack}
            sx={{ mr: 2 }}
            startIcon={<ArrowBackIcon />}
          >
            Quay lại
          </Button>
          <Typography variant="h4" color="primary">
            Chi tiết dự án
          </Typography>
        </Box>

        {/* Project header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Typography variant="h5" gutterBottom>
                {projectData.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip
                  label={getProjectTypeText(projectData.type || '')}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={getStatusText(projectData.status || '')}
                  color={getStatusColor(projectData.status || '')}
                />
              </Box>
              <Typography variant="body1" color="text.secondary" paragraph>
                {projectData.description || 'Không có mô tả chi tiết.'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  borderLeft: { md: 1 },
                  borderColor: 'divider',
                  pl: { md: 2 },
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Thời gian tạo
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatTimeAgo(projectData.createdAt)}
                </Typography>

                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Thuộc khoa/bộ môn
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {projectData.Division?.Faculty?.name || 'Không có thông tin'}{' '}
                  /{projectData.Division?.name || 'Không có thông tin'}
                </Typography>

                {projectData.ApprovedByFacultyMember && (
                  <>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mt: 2 }}
                    >
                      Giảng viên duyệt
                    </Typography>
                    <Typography variant="body1">
                      {projectData.ApprovedByFacultyMember.fullName} (
                      {projectData.ApprovedByFacultyMember.facultyCode})
                    </Typography>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs for different sections */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              icon={<InfoIcon />}
              label="Thông tin chung"
              iconPosition="start"
            />
            <Tab icon={<GroupIcon />} label="Thành viên" iconPosition="start" />
            <Tab
              icon={<AssignmentIcon />}
              label="Báo cáo đã nộp"
              iconPosition="start"
            />
            <Tab
              icon={<StarIcon />}
              label="Điểm đánh giá"
              iconPosition="start"
            />
            <Tab
              icon={<DefenseIcon />}
              label="Hội đồng đánh giá"
              iconPosition="start"
            />
            <Tab icon={<ChatIcon />} label="Trao đổi" iconPosition="start" />
          </Tabs>

          {/* Tab content */}
          <Box sx={{ p: 3 }}>
            {/* General Info */}
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                Thông tin chung về dự án
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tên dự án
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {projectData.title}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">
                    Mô tả
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {projectData.description || 'Không có mô tả'}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">
                    Loại dự án
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {getProjectTypeText(projectData.type || '')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trạng thái
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={getStatusText(projectData.status || '')}
                      color={getStatusColor(projectData.status || '')}
                    />
                  </Box>

                  <Typography variant="subtitle2" color="text.secondary">
                    Khoa/Bộ môn
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {projectData.Division?.Faculty?.name ||
                      'Không có thông tin'}{' '}
                    / {projectData.Division?.name || 'Không có thông tin'}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày tạo
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(projectData.createdAt)}
                  </Typography>

                  {projectData.FieldPool && (
                    <>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mt: 2 }}
                      >
                        Lĩnh vực nghiên cứu
                      </Typography>
                      <Typography variant="body1">
                        {projectData.FieldPool.name}
                      </Typography>
                    </>
                  )}
                </Grid>
              </Grid>
            </TabPanel>

            {/* Members */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                Thành viên dự án
              </Typography>
              <List>
                {[...studentMembers, ...lecturerMembers].map(
                  (member, index) => {
                    const isFaculty = !!member.FacultyMember;
                    const memberData = isFaculty
                      ? member.FacultyMember
                      : member.Student;

                    return (
                      <React.Fragment key={member.id || index}>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar
                              src={memberData?.profilePicture || undefined}
                            >
                              {isFaculty ? <PersonIcon /> : <SchoolIcon />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1">
                                {memberData?.fullName || 'Không có tên'}
                              </Typography>
                            }
                            secondary={
                              <>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >
                                  {isFaculty
                                    ? `Giảng viên - ${
                                        member.role || 'Thành viên'
                                      }`
                                    : `Sinh viên - ${
                                        member.role || 'Thành viên'
                                      }`}
                                </Typography>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  display="block"
                                >
                                  {isFaculty
                                    ? `Mã GV: ${
                                        (memberData as { facultyCode?: string })
                                          ?.facultyCode || 'N/A'
                                      }`
                                    : `Mã SV: ${
                                        (memberData as { studentCode?: string })
                                          ?.studentCode || 'N/A'
                                      }`}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                        {index <
                          [...studentMembers, ...lecturerMembers].length -
                            1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    );
                  },
                )}
              </List>
            </TabPanel>

            {/* Submitted Reports */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Báo cáo đã nộp
              </Typography>
              {projectData.FinalReport && projectData.FinalReport.length > 0 ? (
                <List>
                  {projectData.FinalReport.map((report, index) => (
                    <Paper key={report.id || index} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Báo cáo nộp ngày{' '}
                        {formatDate(report.submittedAt, 'dd/MM/yyyy HH:mm')}
                      </Typography>

                      {report.MainReportFile && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2">
                            Báo cáo chính:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Button
                              variant="outlined"
                              startIcon={<DownloadIcon />}
                              onClick={() =>
                                report.MainReportFile &&
                                handleFileDownload(
                                  report.MainReportFile.id,
                                  report.MainReportFile.originalName ||
                                    'Báo cáo chính',
                                )
                              }
                            >
                              Tải xuống
                            </Button>
                            {report.MainReportFile && (
                              <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<DownloadIcon />}
                                onClick={() =>
                                  report.MainReportFile &&
                                  openFileInNewTab(report.MainReportFile.id)
                                }
                                size="medium"
                              >
                                Tải xuống PDF
                              </Button>
                            )}
                          </Box>
                        </Box>
                      )}

                      {report.Attachments && report.Attachments.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2">
                            Tài liệu đính kèm:
                          </Typography>
                          <List dense>
                            {report.Attachments.map((attachment, i) => (
                              <ListItem key={i}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    width: '100%',
                                  }}
                                >
                                  <AttachFileIcon fontSize="small" />
                                  <Typography sx={{ flex: 1 }}>
                                    {attachment.File?.originalName ||
                                      `Tài liệu ${i + 1}`}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                      variant="text"
                                      size="small"
                                      startIcon={<DownloadIcon />}
                                      onClick={() =>
                                        handleFileDownload(
                                          attachment.fileId,
                                          attachment.File?.originalName ||
                                            `Tài liệu ${i + 1}`,
                                        )
                                      }
                                    >
                                      Tải xuống
                                    </Button>
                                    <Button
                                      variant="text"
                                      size="small"
                                      startIcon={<DownloadIcon />}
                                      onClick={() =>
                                        openFileInNewTab(attachment.fileId)
                                      }
                                    >
                                      Tải xuống
                                    </Button>
                                  </Box>
                                </Box>
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                    </Paper>
                  ))}
                </List>
              ) : (
                <Alert severity="info">
                  Chưa có báo cáo nào được nộp cho dự án này.
                </Alert>
              )}
            </TabPanel>

            {/* Evaluation Scores */}
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>
                Điểm đánh giá
              </Typography>
              <Alert severity="info">
                Tính năng đánh giá điểm sẽ được triển khai trong phiên bản tiếp
                theo.
              </Alert>
            </TabPanel>

            {/* Defense Committee */}
            <TabPanel value={tabValue} index={4}>
              <Typography variant="h6" gutterBottom>
                Hội đồng đánh giá
              </Typography>

              <Card
                sx={{
                  bgcolor: isEligibleForDefense ? 'primary.50' : 'inherit',
                  borderLeft: isEligibleForDefense ? '4px solid' : 'none',
                  borderColor: 'primary.main',
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      <DefenseIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Thông tin hội đồng
                    </Typography>
                    {!defenseCommittee && isEligibleForDefense && (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenDefenseDialog}
                        disabled={isLoadingProject}
                      >
                        Tạo hội đồng
                      </Button>
                    )}
                    {defenseCommittee && (
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() =>
                          navigateToDefenseDetail(defenseCommittee.id)
                        }
                        color="primary"
                      >
                        Quản lý hội đồng
                      </Button>
                    )}
                  </Box>

                  {isLoadingProject ? (
                    <Box
                      sx={{ display: 'flex', justifyContent: 'center', py: 3 }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : defenseCommittee ? (
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {defenseCommittee.name}
                      </Typography>

                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            fontWeight="medium"
                          >
                            Ngày bảo vệ:
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(
                              defenseCommittee.defenseDate,
                              'dd/MM/yyyy HH:mm',
                            )}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            fontWeight="medium"
                          >
                            Địa điểm:
                          </Typography>
                          <Typography variant="body1">
                            {defenseCommittee.location || 'Chưa cập nhật'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            fontWeight="medium"
                          >
                            Trạng thái:
                          </Typography>
                          <Chip
                            label={
                              defenseCommittee.status === 'SCHEDULED'
                                ? 'Đã lên lịch'
                                : defenseCommittee.status === 'COMPLETED'
                                ? 'Đã hoàn thành'
                                : defenseCommittee.status === 'CANCELLED'
                                ? 'Đã hủy'
                                : defenseCommittee.status
                            }
                            color={
                              defenseCommittee.status === 'SCHEDULED'
                                ? 'primary'
                                : defenseCommittee.status === 'COMPLETED'
                                ? 'success'
                                : defenseCommittee.status === 'CANCELLED'
                                ? 'error'
                                : 'default'
                            }
                            size="small"
                          />
                        </Grid>
                      </Grid>

                      {defenseCommittee.Members &&
                        defenseCommittee.Members.length > 0 && (
                          <Box mt={2}>
                            <Typography
                              variant="subtitle2"
                              gutterBottom
                              fontWeight="medium"
                            >
                              Thành viên hội đồng:
                            </Typography>
                            <Box
                              sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}
                            >
                              {defenseCommittee.Members.map((member) => (
                                <Chip
                                  key={member.id}
                                  avatar={
                                    <Avatar
                                      src={member.FacultyMember?.profilePicture}
                                    />
                                  }
                                  label={`${
                                    member.FacultyMember?.fullName || 'N/A'
                                  } (${
                                    member.role === 'CHAIRMAN'
                                      ? 'Chủ tịch'
                                      : member.role === 'SECRETARY'
                                      ? 'Thư ký'
                                      : member.role === 'MEMBER'
                                      ? 'Thành viên'
                                      : member.role
                                  })`}
                                  size="small"
                                  sx={{
                                    bgcolor:
                                      member.role === 'CHAIRMAN'
                                        ? 'success.light'
                                        : member.role === 'SECRETARY'
                                        ? 'info.light'
                                        : 'default.light',
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      {isEligibleForDefense ? (
                        <>
                          <Typography color="text.secondary" gutterBottom>
                            Dự án này đang ở trạng thái chờ đánh giá và chưa có
                            hội đồng đánh giá.
                          </Typography>
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleOpenDefenseDialog}
                            disabled={isLoadingProject}
                            sx={{ mt: 2 }}
                          >
                            Tạo hội đồng ngay
                          </Button>
                        </>
                      ) : (
                        <Typography color="text.secondary">
                          Dự án này chưa đủ điều kiện để tạo hội đồng đánh giá.
                          Dự án cần ở trạng thái "Chờ đánh giá" trước khi có thể
                          tạo hội đồng.
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </TabPanel>

            {/* Comments */}
            <TabPanel value={tabValue} index={5}>
              <Typography variant="h6" gutterBottom>
                Trao đổi
              </Typography>

              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  height: '500px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box
                  sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    mb: 2,
                    pr: 1,
                  }}
                >
                  {isLoadingComments ? (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : comments && comments.length > 0 ? (
                    comments.map((comment: ProjectComment) => (
                      <CommentItem key={comment.id} comment={comment} />
                    ))
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      textAlign="center"
                    >
                      Chưa có bình luận nào.
                    </Typography>
                  )}
                </Box>
                <Divider sx={{ mt: 'auto' }} />
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}
                >
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    variant="outlined"
                    placeholder="Nhập bình luận của bạn..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={addCommentMutation.isPending}
                  />
                  <IconButton
                    color="primary"
                    onClick={() => {
                      if (!commentText.trim() || !user) return;
                      addCommentMutation.mutate({
                        projectId,
                        content: commentText,
                      });
                      toast.success('Bình luận đã được gửi');
                      setCommentText('');
                      refetchComments();
                    }}
                    disabled={
                      !commentText.trim() || addCommentMutation.isPending
                    }
                  >
                    {addCommentMutation.isPending ? (
                      <CircularProgress size={24} />
                    ) : (
                      <SendIcon />
                    )}
                  </IconButton>
                </Box>
              </Paper>
            </TabPanel>
          </Box>
        </Paper>
      </Container>

      {/* Defense Committee Creation Dialog */}
      <Dialog
        open={defenseDialogOpen}
        onClose={handleCloseDefenseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tạo hội đồng đánh giá</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Tên hội đồng"
              name="name"
              value={defenseFormData.name}
              onChange={handleDefenseFormChange}
              required
            />
            <TextField
              fullWidth
              label="Mô tả"
              name="description"
              value={defenseFormData.description}
              onChange={handleDefenseFormChange}
              multiline
              rows={3}
            />
            <FormControl fullWidth>
              <InputLabel shrink htmlFor="defense-date">
                Ngày bảo vệ
              </InputLabel>
              <TextField
                id="defense-date"
                type="datetime-local"
                value={formatDateForInput(defenseFormData.defenseDate)}
                onChange={handleDefenseDateChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ mt: 1 }}
              />
            </FormControl>
            <TextField
              fullWidth
              label="Địa điểm"
              name="location"
              value={defenseFormData.location}
              onChange={handleDefenseFormChange}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDefenseDialog}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleCreateDefenseCommittee}
            disabled={
              !defenseFormData.name || createDefenseCommitteeMutation.isPending
            }
          >
            {createDefenseCommitteeMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              'Tạo hội đồng'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
