'use client';

import { ProjectEvaluationStatusT } from '@/services/evaluation.interface';
import { evaluationHooks as evalServiceHooks } from '@/services/evaluationService';
import {
  Project,
  ProjectAttachment,
  ProjectComment,
  ProjectFinalReport,
  projectHooks,
  ProjectMember,
  ProjectStatusT,
} from '@/services/projectService';
import { openFileInNewTab } from '@/services/storageService';
import { useAuthStore } from '@/state/authStore';
import {
  ArrowBack as ArrowBackIcon,
  AttachFile as AttachFileIcon,
  ChatBubbleOutline as ChatIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as ClockIcon,
  Description as DescriptionIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { format, formatDistanceToNow, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

// Interface for API errors (if not already globally defined)
interface ApiError extends Error {
  response?: {
    data?: {
      message?: string | string[];
    };
  };
}

const CommentItem = ({ comment }: { comment: ProjectComment }) => {
  const theme = useTheme();
  const { user } = useAuthStore();

  // Determine if the comment is from the current user or another party to align left/right
  // Just check if commenter IDs match the current user
  const isCurrentUserCommenter = user
    ? comment.commenterFacultyId === user.id ||
      comment.commenterStudentId === user.id
    : false;

  // Get the appropriate profile picture, ensuring it's a string or undefined (not null)
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
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 10,
            [isCurrentUserCommenter ? 'right' : 'left']: -8,
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            [isCurrentUserCommenter
              ? 'borderLeft'
              : 'borderRight']: `8px solid ${
              isCurrentUserCommenter
                ? theme.palette.primary.light
                : theme.palette.background.paper
            }`,
            transform: isCurrentUserCommenter ? 'none' : 'rotate(180deg)', // Adjusted for correct arrow pointing
          },
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

const StatusBadge = ({ status }: { status: string }) => {
  // Simplified status badge, adapt as needed for ProjectStatusT
  let color: 'success' | 'warning' | 'error' | 'default' | 'info' = 'default';
  let icon = <ClockIcon fontSize="small" />;

  switch (status) {
    case 'IN_PROGRESS':
      color = 'info';
      break;
    case 'COMPLETED':
      color = 'success';
      icon = <CheckCircleIcon fontSize="small" />;
      break;
    case 'CANCELLED':
      color = 'error';
      break;
    default:
      color = 'default';
  }

  return (
    <Chip
      icon={icon}
      label={status.replace(/_/g, ' ')}
      color={color}
      size="small"
      sx={{ textTransform: 'capitalize' }}
    />
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

  const [commentText, setCommentText] = useState('');

  const {
    data: projectApiResponse,
    isLoading: isLoadingProject,
    error: projectError,
    refetch: refetchProject,
  } = projectHooks.useProjectById(projectId);

  const project: Project | undefined = projectApiResponse?.data;

  const {
    data: commentsResponse = [],
    isLoading: isLoadingComments,
    refetch: refetchComments,
  } = projectHooks.useProjectComments(projectId);

  const {
    data: evaluationResponse,
    isLoading: isLoadingEvaluation,
    error: evaluationError,
    refetch: refetchEvaluation,
  } = evalServiceHooks.useProjectEvaluationByProjectId(projectId);

  const projectEvaluation = evaluationResponse?.data;

  // Extract comments from response or use empty array as fallback
  const comments: ProjectComment[] = Array.isArray(commentsResponse)
    ? commentsResponse
    : commentsResponse.data || [];

  const addCommentMutation = projectHooks.useAddProjectComment();

  const handleSendComment = async () => {
    if (!commentText.trim() || !user) return;
    try {
      await addCommentMutation.mutateAsync({
        projectId,
        content: commentText,
      });
      toast.success('Bình luận đã được gửi');
      setCommentText('');
      refetchComments(); // Refetch comments after adding a new one
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.message || 'Không thể gửi bình luận';
      toast.error(
        Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
      );
    }
  };

  // Safely format date
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

  // Safely format time ago
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

  if (isLoadingProject || isLoadingComments || isLoadingEvaluation) {
    return (
      <Container sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Đang tải dữ liệu dự án...</Typography>
        </Box>
      </Container>
    );
  }

  if (projectError || !project) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">
          {projectError
            ? `Lỗi tải dự án: ${(projectError as ApiError).message}`
            : 'Không tìm thấy dự án.'}
        </Alert>
        <Button
          onClick={() => router.back()}
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Quay lại
        </Button>
      </Container>
    );
  }

  const studentMembers =
    project.Member?.filter((m: ProjectMember) => m.Student) || [];
  const lecturerMembers =
    project.Member?.filter((m: ProjectMember) => m.FacultyMember) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={3}>
          <IconButton onClick={() => router.back()} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight="bold">
            Chi tiết Dự án
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {/* Left Column: Project Details */}
          <Grid item xs={12} md={7}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                {project.title}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <StatusBadge status={project.status?.toString() || ''} />
                <Chip
                  icon={<DescriptionIcon fontSize="small" />}
                  label={
                    project.type ? project.type.replace(/_/g, ' ') : 'Chưa rõ'
                  }
                  size="small"
                  variant="outlined"
                />
                {project.field && (
                  <Chip label={project.field} size="small" variant="outlined" />
                )}
              </Stack>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Ngày tạo: {formatDate(project.createdAt)}
              </Typography>
              {project.updatedAt && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Cập nhật lần cuối: {formatTimeAgo(project.updatedAt)}
                </Typography>
              )}

              {project.description && (
                <Box mb={2}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="medium"
                    gutterBottom
                  >
                    Mô tả
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {project.description}
                  </Typography>
                </Box>
              )}

              {project.FieldPool && (
                <Box mb={2}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Lĩnh vực nghiên cứu:
                  </Typography>
                  <Chip label={project.FieldPool.name} size="small" />
                </Box>
              )}

              {project.Division && (
                <Box mb={2}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Đơn vị quản lý:
                  </Typography>
                  <Typography variant="body1">
                    {project.Division.Faculty?.name} - {project.Division.name}
                  </Typography>
                </Box>
              )}

              {project.ApprovedByFacultyMember && (
                <Box mb={2}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Giảng viên duyệt:
                  </Typography>
                  <Typography variant="body1">
                    {project.ApprovedByFacultyMember.fullName} (
                    {project.ApprovedByFacultyMember.facultyCode})
                  </Typography>
                </Box>
              )}

              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Thành viên
              </Typography>
              {studentMembers.length > 0 && (
                <Box mb={1}>
                  <Typography variant="caption" color="text.secondary">
                    SINH VIÊN:
                  </Typography>
                  {studentMembers.map((member: ProjectMember) => (
                    <Chip
                      key={member.Student?.id || `member-${member.id}`}
                      avatar={
                        <Avatar
                          src={member.Student?.profilePicture || undefined}
                        />
                      }
                      label={`${member.Student?.fullName || 'N/A'} (${
                        member.Student?.studentCode || 'N/A'
                      })`}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              )}
              {lecturerMembers.length > 0 && (
                <Box mb={1}>
                  <Typography variant="caption" color="text.secondary">
                    GIẢNG VIÊN HƯỚNG DẪN:
                  </Typography>
                  {lecturerMembers.map((member: ProjectMember) => (
                    <Chip
                      key={member.FacultyMember?.id || `member-${member.id}`}
                      avatar={
                        <Avatar
                          src={
                            member.FacultyMember?.profilePicture || undefined
                          }
                        />
                      }
                      label={`${member.FacultyMember?.fullName || 'N/A'} (${
                        member.FacultyMember?.facultyCode || 'N/A'
                      }) - ${member.role?.replace(/_/g, ' ') || 'N/A'}`}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              )}
              {studentMembers.length === 0 && lecturerMembers.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Chưa có thành viên.
                </Typography>
              )}

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography variant="h6">Trạng thái dự án:</Typography>
                <StatusBadge status={project.status as string} />
              </Stack>

              {project.status === ProjectStatusT.WAITING_FOR_EVALUATION && (
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ my: 2 }}
                  onClick={() =>
                    router.push(`/lecturer/project/${projectId}/evaluation`)
                  }
                >
                  Chấm điểm / Xem đánh giá
                </Button>
              )}

              {projectEvaluation &&
                projectEvaluation.status ===
                  ProjectEvaluationStatusT.COMPLETED && (
                  <Button
                    variant="outlined"
                    color="primary"
                    sx={{
                      my: 2,
                      ml:
                        project.status === ProjectStatusT.WAITING_FOR_EVALUATION
                          ? 1
                          : 0,
                    }}
                    onClick={() =>
                      router.push(`/lecturer/project/${projectId}/evaluation`)
                    }
                  >
                    Xem Kết Quả Đánh Giá
                  </Button>
                )}

              {projectEvaluation &&
                projectEvaluation.status ===
                  ProjectEvaluationStatusT.IN_PROGRESS && (
                  <Button
                    variant="contained"
                    color="info"
                    sx={{
                      my: 2,
                      ml:
                        project.status === ProjectStatusT.WAITING_FOR_EVALUATION
                          ? 1
                          : 0,
                    }}
                    onClick={() =>
                      router.push(`/lecturer/project/${projectId}/evaluation`)
                    }
                  >
                    Tiếp tục đánh giá
                  </Button>
                )}
            </Paper>

            {/* Placeholder for Final Reports and other sections if needed */}
            {project.FinalReport && project.FinalReport.length > 0 && (
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Báo cáo cuối kỳ
                </Typography>
                {project.FinalReport.map((report: ProjectFinalReport) => (
                  <Box
                    key={report.id}
                    mb={2}
                    p={2}
                    border={1}
                    borderColor="divider"
                    borderRadius={1}
                  >
                    <Typography variant="subtitle2">
                      Nộp bởi: {report.Student?.fullName || 'N/A'} (
                      {report.Student?.studentCode || 'N/A'})
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ngày nộp:{' '}
                      {formatDate(report.submittedAt, 'dd/MM/yyyy HH:mm')}
                    </Typography>
                    {report.MainReportFile && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AttachFileIcon />}
                        onClick={() =>
                          report.MainReportFile?.id &&
                          openFileInNewTab(report.MainReportFile.id)
                        }
                        disabled={!report.MainReportFile?.id}
                        sx={{ mt: 1 }}
                      >
                        Tải xuống: {report.MainReportFile.originalName}
                      </Button>
                    )}
                    {report.Attachments && report.Attachments.length > 0 && (
                      <Box mt={1}>
                        <Typography variant="caption">
                          File đính kèm:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {report.Attachments.map((att: ProjectAttachment) => (
                            <Chip
                              key={att.id}
                              label={att.File?.originalName || 'File'}
                              onClick={() =>
                                att.fileId && openFileInNewTab(att.fileId)
                              }
                              size="small"
                              icon={<AttachFileIcon fontSize="small" />}
                              clickable
                              disabled={!att.fileId}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                ))}
              </Paper>
            )}
          </Grid>

          {/* Right Column: Comments */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h6" gutterBottom fontWeight="bold">
                <ChatIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Trao đổi
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box
                sx={{
                  flexGrow: 1,
                  overflowY: 'auto',
                  mb: 2,
                  pr: 1 /* For scrollbar */,
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
                  onClick={handleSendComment}
                  disabled={!commentText.trim() || addCommentMutation.isPending}
                >
                  {addCommentMutation.isPending ? (
                    <CircularProgress size={24} />
                  ) : (
                    <SendIcon />
                  )}
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </motion.div>
  );
}
