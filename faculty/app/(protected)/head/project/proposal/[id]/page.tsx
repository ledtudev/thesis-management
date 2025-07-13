'use client';

import { useDebounce } from '@/hooks/useDebounce';
import { Lecturer } from '@/services/lecturerSelectionService';
import {
  ManageProposedMemberDto,
  proposalHooks,
  ProposalOutlineStatusT,
  ProposedProject,
  ProposedProjectComment,
  ProposedProjectStatus,
} from '@/services/proposalService';
import { openFileInNewTab } from '@/services/storageService';
import { Student, userHooks } from '@/services/userService';
import { useAuthStore } from '@/state/authStore';
import {
  ArrowBack as ArrowBackIcon,
  AttachFile as AttachFileIcon,
  ChatBubbleOutline as ChatIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as ClockIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  PersonAdd as PersonAddIcon,
  Send as SendIcon,
  ThumbDown as ThumbDownIcon,
  ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';
import {
  Alert,
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
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const CommentItem = ({ comment }: { comment: ProposedProjectComment }) => {
  const theme = useTheme();
  const isLecturer = !!comment.commenterFacultyId;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        mb: 2,
        flexDirection: isLecturer ? 'row-reverse' : 'row',
      }}
    >
      <Avatar
        sx={{
          bgcolor: isLecturer
            ? theme.palette.primary.main
            : theme.palette.secondary.main,
          width: 40,
          height: 40,
        }}
      >
        {(isLecturer
          ? comment.CommenterFacultyMember?.fullName?.charAt(0)
          : comment.CommenterStudent?.fullName?.charAt(0)) || 'U'}
      </Avatar>

      <Box
        sx={{
          maxWidth: '80%',
          p: 2,
          borderRadius: 2,
          bgcolor: isLecturer ? 'primary.light' : 'background.paper',
          color: isLecturer ? 'primary.contrastText' : 'text.primary',
          position: 'relative',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 10,
            [isLecturer ? 'right' : 'left']: -8,
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            [isLecturer ? 'borderRight' : 'borderLeft']: `8px solid ${
              isLecturer
                ? theme.palette.primary.light
                : theme.palette.background.paper
            }`,
            transform: isLecturer ? 'rotate(180deg)' : 'none',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {isLecturer
              ? comment.CommenterFacultyMember?.fullName
              : comment.CommenterStudent?.fullName}
          </Typography>
          <Typography
            variant="caption"
            color={isLecturer ? 'inherit' : 'text.secondary'}
          >
            {format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm')}
          </Typography>
        </Box>

        <Typography variant="body2">{comment.content}</Typography>
      </Box>
    </Box>
  );
};

// Status badge component
const StatusBadge = ({ status }: { status: ProposedProjectStatus }) => {
  let color:
    | 'success'
    | 'warning'
    | 'error'
    | 'default'
    | 'info'
    | 'primary'
    | 'secondary' = 'default';
  let icon = <ClockIcon fontSize="small" />;
  let displayLabel = '';

  switch (status) {
    case 'TOPIC_SUBMISSION_PENDING':
      displayLabel = 'Chờ nộp đề tài';
      color = 'default';
      break;
    case 'TOPIC_PENDING_ADVISOR':
      displayLabel = 'Chờ giảng viên duyệt đề tài';
      color = 'warning';
      icon = <ClockIcon fontSize="small" />;
      break;
    case 'TOPIC_REQUESTED_CHANGES':
      displayLabel = 'Yêu cầu chỉnh sửa đề tài';
      color = 'secondary';
      icon = <EditIcon fontSize="small" />;
      break;
    case 'TOPIC_APPROVED':
      displayLabel = 'Đề tài được duyệt';
      color = 'success';
      icon = <CheckCircleIcon fontSize="small" />;
      break;
    case 'OUTLINE_PENDING_SUBMISSION':
      displayLabel = 'Chờ nộp đề cương';
      color = 'default';
      break;
    case 'OUTLINE_PENDING_ADVISOR':
      displayLabel = 'Chờ giảng viên duyệt đề cương';
      color = 'warning';
      icon = <ClockIcon fontSize="small" />;
      break;
    case 'OUTLINE_REQUESTED_CHANGES':
      displayLabel = 'Yêu cầu chỉnh sửa đề cương';
      color = 'secondary';
      icon = <EditIcon fontSize="small" />;
      break;
    case 'OUTLINE_REJECTED':
      displayLabel = 'Đề cương bị từ chối';
      color = 'error';
      break;
    case 'OUTLINE_APPROVED':
      displayLabel = 'Đề cương được duyệt';
      color = 'success';
      icon = <CheckCircleIcon fontSize="small" />;
      break;
    case 'PENDING_HEAD':
      displayLabel = 'Chờ trưởng bộ môn duyệt';
      color = 'warning';
      icon = <ClockIcon fontSize="small" />;
      break;
    case 'REQUESTED_CHANGES_HEAD':
      displayLabel = 'Trưởng bộ môn yêu cầu chỉnh sửa';
      color = 'secondary';
      icon = <EditIcon fontSize="small" />;
      break;
    case 'REJECTED_BY_HEAD':
      displayLabel = 'Bị từ chối bởi trưởng bộ môn';
      color = 'error';
      icon = <ThumbDownIcon fontSize="small" />;
      break;
    case 'APPROVED_BY_HEAD':
      displayLabel = 'Đã được trưởng bộ môn phê duyệt';
      color = 'success';
      icon = <CheckCircleIcon fontSize="small" />;
      break;
    default:
      displayLabel = status;
  }

  return (
    <Chip
      icon={icon}
      label={displayLabel}
      color={color}
      size="small"
      sx={{ fontWeight: 500 }}
    />
  );
};

export default function ProposalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuthStore();

  // State
  const [currentTab, setCurrentTab] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog states
  const [topicApprovalDialogOpen, setTopicApprovalDialogOpen] = useState(false);
  const [outlineApprovalDialogOpen, setOutlineApprovalDialogOpen] =
    useState(false);
  const [departmentHeadReviewDialogOpen, setDepartmentHeadReviewDialogOpen] =
    useState(false);
  const [approvalAction, setApprovalAction] = useState<
    'approve' | 'request_changes' | 'reject'
  >('approve');

  // State for member management
  const [manageMemberDialogOpen, setManageMemberDialogOpen] = useState(false);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const debouncedMemberSearchTerm = useDebounce(memberSearchTerm, 500);
  const [userTypeToSearch, setUserTypeToSearch] = useState<
    'student' | 'lecturer'
  >('student');
  const [searchResults, setSearchResults] = useState<(Student | Lecturer)[]>(
    [],
  );
  const [isSearchingMembers, setIsSearchingMembers] = useState(false);

  // Fetch proposal data using the proposal service
  const {
    data: proposalResponse,
    isLoading,
    error,
    refetch,
  } = proposalHooks.useProposedProject(params.id, true);

  // Get comments with real-time updates
  const { data: commentsResponse } = proposalHooks.useProposedProjectComments(
    params.id,
    true,
  );

  // Mutations
  const { mutate: addComment } =
    proposalHooks.useCreateProposedProjectComment();
  const { mutate: changeStatus, isPending: isChangingStatus } =
    proposalHooks.useChangeProposedProjectStatus();
  const { mutate: reviewOutline, isPending: isReviewing } =
    proposalHooks.useReviewProposalOutline();
  const { mutate: departmentHeadReview, isPending: isDepartmentHeadReviewing } =
    proposalHooks.useDepartmentHeadReview();
  const { mutate: finalApproval, isPending: isFinalApproving } =
    proposalHooks.useFinalApproval();
  const { mutate: manageMembers, isPending: isManagingMembers } =
    proposalHooks.useManageProposedProjectMembers();

  // Access the proposal data from the response
  const proposal = proposalResponse?.data?.data as ProposedProject | undefined;
  const comments = commentsResponse?.data?.data || [];
  const outline = proposal?.ProposalOutline;

  const studentMember = proposal?.ProposedProjectMember?.find(
    (m) => m.studentId && m.role === 'Sinh viên thực hiện',
  );
  const student = studentMember?.Student;

  // Effect for searching students
  const { data: searchedStudents, isLoading: isLoadingStudents } =
    userHooks.useStudents({
      keyword:
        manageMemberDialogOpen &&
        userTypeToSearch === 'student' &&
        debouncedMemberSearchTerm.length > 0
          ? debouncedMemberSearchTerm
          : undefined,
      facultyId: user?.facultyId,
    });

  // Effect for searching lecturers
  const { data: searchedLecturers, isLoading: isLoadingLecturers } =
    userHooks.useLecturers({
      keyword:
        manageMemberDialogOpen &&
        userTypeToSearch === 'lecturer' &&
        debouncedMemberSearchTerm.length > 0
          ? debouncedMemberSearchTerm
          : undefined,
      facultyId: user?.facultyId,
    });

  useEffect(() => {
    if (userTypeToSearch === 'student') {
      setSearchResults(Array.isArray(searchedStudents) ? searchedStudents : []);
    }
  }, [searchedStudents, userTypeToSearch]);

  useEffect(() => {
    if (userTypeToSearch === 'lecturer') {
      setSearchResults(
        Array.isArray(searchedLecturers) ? searchedLecturers : [],
      );
    }
  }, [searchedLecturers, userTypeToSearch]);

  useEffect(() => {
    setIsSearchingMembers(isLoadingStudents || isLoadingLecturers);
  }, [isLoadingStudents, isLoadingLecturers]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleOpenManageMemberDialog = () => {
    setMemberSearchTerm('');
    setSearchResults([]);
    setManageMemberDialogOpen(true);
  };

  const handleManageMember = (
    userId: string,
    action: 'add' | 'remove',
    role?: string,
  ) => {
    const payload: ManageProposedMemberDto = {
      action,
      studentId: userId,
    };
    if (action === 'add' && role) {
      payload.role = role;
    }

    manageMembers(
      { id: params.id, data: payload },
      {
        onSuccess: () => {
          toast.success(
            `Member ${action === 'add' ? 'added' : 'removed'} successfully.`,
          );
          refetch();
          if (action === 'add') {
            setManageMemberDialogOpen(false);
          }
        },
        onError: (
          err: Error & { response?: { data?: { message?: string } } },
        ) => {
          const errorMsg =
            err.response?.data?.message ||
            err.message ||
            `Failed to ${action} member.`;
          toast.error(errorMsg);
        },
      },
    );
  };

  const handleSendComment = () => {
    if (!commentText.trim()) {
      toast.error('Vui lòng nhập nội dung bình luận');
      return;
    }

    setIsSubmitting(true);
    addComment(
      {
        proposedProjectId: params.id,
        content: commentText.trim(),
      },
      {
        onSuccess: () => {
          toast.success('Đã gửi bình luận thành công');
          setCommentText('');
          setIsSubmitting(false);
          refetch();
        },
        onError: () => {
          toast.error('Có lỗi khi gửi bình luận');
          setIsSubmitting(false);
        },
      },
    );
  };

  // Open approval dialog with specified action
  const openTopicApprovalDialog = (
    action: 'approve' | 'request_changes' | 'reject',
  ) => {
    setApprovalAction(action);
    setTopicApprovalDialogOpen(true);
  };

  const openOutlineApprovalDialog = (
    action: 'approve' | 'request_changes' | 'reject',
  ) => {
    setApprovalAction(action);
    setOutlineApprovalDialogOpen(true);
  };

  const openDepartmentHeadReviewDialog = (
    action: 'approve' | 'request_changes' | 'reject',
  ) => {
    setApprovalAction(action);
    setDepartmentHeadReviewDialogOpen(true);
  };

  // Handle topic approval submission
  const handleTopicApprovalSubmit = () => {
    if (approvalAction !== 'approve' && !commentText.trim()) {
      toast.error('Please provide a reason for your decision');
      return;
    }

    let newStatus: ProposedProjectStatus;

    if (approvalAction === 'approve') {
      newStatus = 'TOPIC_APPROVED';
    } else if (approvalAction === 'request_changes') {
      newStatus = 'TOPIC_REQUESTED_CHANGES';
    } else {
      // For topics, rejection is treated as requesting changes
      newStatus = 'TOPIC_REQUESTED_CHANGES';
    }

    changeStatus(
      {
        id: params.id,
        statusData: {
          status: newStatus,
          comment:
            commentText.trim() ||
            (approvalAction === 'approve' ? 'Approved' : 'Changes requested'),
        },
      },
      {
        onSuccess: () => {
          toast.success(
            approvalAction === 'approve'
              ? 'Topic approved successfully'
              : 'Feedback sent to student',
          );
          setCommentText('');
          setTopicApprovalDialogOpen(false);
          refetch();
        },
        onError: () => {
          toast.error('Error updating project status');
        },
      },
    );
  };

  // Handle outline approval submission
  const handleOutlineApprovalSubmit = () => {
    if (!outline?.id) {
      toast.error('Outline ID not found');
      return;
    }

    if (approvalAction !== 'approve' && !commentText.trim()) {
      toast.error('Please provide feedback for the student');
      return;
    }

    let outlineStatus: 'APPROVED' | 'REQUESTED_CHANGES' | 'REJECTED';

    if (approvalAction === 'approve') {
      outlineStatus = 'APPROVED';
    } else if (approvalAction === 'request_changes') {
      outlineStatus = 'REQUESTED_CHANGES';
    } else {
      outlineStatus = 'REJECTED';
    }

    reviewOutline(
      {
        outlineId: outline.id,
        reviewData: {
          status: outlineStatus,
          comment:
            commentText.trim() ||
            (approvalAction === 'approve'
              ? 'Outline approved'
              : 'Changes requested'),
        },
      },
      {
        onSuccess: () => {
          toast.success(
            approvalAction === 'approve'
              ? 'Outline approved successfully'
              : approvalAction === 'request_changes'
              ? 'Feedback sent to student'
              : 'Outline rejected',
          );
          setCommentText('');
          setOutlineApprovalDialogOpen(false);
          refetch();
        },
        onError: () => {
          toast.error('Error updating outline status');
        },
      },
    );
  };

  // Handle department head review submission
  const handleDepartmentHeadReviewSubmit = () => {
    if (approvalAction !== 'approve' && !commentText.trim()) {
      toast.error('Vui lòng nhập lý do cho quyết định của bạn');
      return;
    }

    if (approvalAction === 'approve') {
      // Use final approval endpoint for approval
      finalApproval(
        {
          id: params.id,
          approvalData: {
            status: 'APPROVED_BY_HEAD',
            comment: commentText.trim() || 'Đã phê duyệt bởi Trưởng bộ môn',
          },
        },
        {
          onSuccess: () => {
            toast.success('Đã phê duyệt thành công');
            setCommentText('');
            setDepartmentHeadReviewDialogOpen(false);
            refetch();
          },
          onError: () => {
            toast.error('Có lỗi khi phê duyệt');
          },
        },
      );
    } else {
      // Use department head review endpoint for rejection and requesting changes
      let newStatus: ProposedProjectStatus;

      if (approvalAction === 'request_changes') {
        newStatus = 'REQUESTED_CHANGES_HEAD';
      } else {
        newStatus = 'REJECTED_BY_HEAD';
      }

      departmentHeadReview(
        {
          id: params.id,
          reviewData: {
            status: newStatus,
            comment: commentText.trim() || 'Yêu cầu chỉnh sửa',
          },
        },
        {
          onSuccess: () => {
            toast.success(
              approvalAction === 'request_changes'
                ? 'Đã gửi yêu cầu chỉnh sửa'
                : 'Đã từ chối đề xuất',
            );
            setCommentText('');
            setDepartmentHeadReviewDialogOpen(false);
            refetch();
          },
          onError: () => {
            toast.error('Có lỗi khi cập nhật trạng thái');
          },
        },
      );
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !proposal) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        Không tìm thấy đề xuất này hoặc bạn không có quyền xem.
      </Alert>
    );
  }

  // Determine if we can show action buttons based on status
  const canReviewTopic = proposal.status === 'TOPIC_PENDING_ADVISOR';
  const canReviewOutline =
    proposal.status === 'OUTLINE_PENDING_ADVISOR' &&
    outline?.status === ProposalOutlineStatusT.PENDING_REVIEW;
  const canDepartmentHeadReview =
    proposal.status === 'OUTLINE_APPROVED' ||
    proposal.status === 'PENDING_HEAD';

  return (
    <Container maxWidth="lg" className="mt-10">
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton
            onClick={() => router.push('/lecturer/project/proposal')}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" fontWeight="bold">
            Chi tiết Đề xuất
          </Typography>
          <Box sx={{ ml: 'auto' }}>
            <StatusBadge status={proposal.status} />
          </Box>
        </Box>

        {/* Main content */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {proposal.title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              alt={student?.fullName || ''}
              sx={{
                width: 40,
                height: 40,
                mr: 2,
                bgcolor: theme.palette.secondary.main,
              }}
            >
              {student?.fullName?.charAt(0) || 'S'}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="medium">
                {student?.fullName || 'Chưa có sinh viên'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {student?.studentCode || ''}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Tóm tắt
          </Typography>
          <Typography variant="body1" paragraph>
            {proposal.description || 'Không có thông tin mô tả'}
          </Typography>

          {/* Action buttons for topic approval - shown only when status is appropriate */}
          {canReviewTopic && (
            <Box sx={{ mt: 3, mb: 2 }}>
              <Alert
                severity="info"
                icon={<InfoIcon />}
                action={
                  <Stack direction="row" spacing={1}>
                    <Button
                      color="error"
                      size="small"
                      onClick={() => openTopicApprovalDialog('reject')}
                    >
                      Reject
                    </Button>
                    <Button
                      color="warning"
                      size="small"
                      onClick={() => openTopicApprovalDialog('request_changes')}
                    >
                      Request Changes
                    </Button>
                    <Button
                      color="success"
                      size="small"
                      variant="contained"
                      onClick={() => openTopicApprovalDialog('approve')}
                    >
                      Approve Topic
                    </Button>
                  </Stack>
                }
              >
                This project topic is awaiting your review
              </Alert>
            </Box>
          )}

          {/* Action buttons for outline approval - shown only when status is appropriate */}
          {canReviewOutline && (
            <Box sx={{ mt: 3, mb: 2 }}>
              <Alert
                severity="info"
                icon={<InfoIcon />}
                action={
                  <Stack direction="row" spacing={1}>
                    <Button
                      color="error"
                      size="small"
                      onClick={() => openOutlineApprovalDialog('reject')}
                    >
                      Reject
                    </Button>
                    <Button
                      color="warning"
                      size="small"
                      onClick={() =>
                        openOutlineApprovalDialog('request_changes')
                      }
                    >
                      Request Changes
                    </Button>
                    <Button
                      color="success"
                      size="small"
                      variant="contained"
                      onClick={() => openOutlineApprovalDialog('approve')}
                    >
                      Approve Outline
                    </Button>
                  </Stack>
                }
              >
                This project outline is awaiting your review
              </Alert>
            </Box>
          )}

          {/* Action buttons for department head review - shown when outline is approved */}
          {canDepartmentHeadReview && (
            <Box sx={{ mt: 3, mb: 2 }}>
              <Alert
                severity="warning"
                icon={<InfoIcon />}
                action={
                  <Stack direction="row" spacing={1}>
                    <Button
                      color="error"
                      size="small"
                      onClick={() => openDepartmentHeadReviewDialog('reject')}
                      disabled={isDepartmentHeadReviewing}
                    >
                      Từ chối
                    </Button>
                    <Button
                      color="warning"
                      size="small"
                      onClick={() =>
                        openDepartmentHeadReviewDialog('request_changes')
                      }
                      disabled={isDepartmentHeadReviewing}
                    >
                      Yêu cầu chỉnh sửa
                    </Button>
                    <Button
                      color="success"
                      size="small"
                      variant="contained"
                      onClick={() => openDepartmentHeadReviewDialog('approve')}
                      disabled={isDepartmentHeadReviewing}
                    >
                      Phê duyệt (Trưởng bộ môn)
                    </Button>
                  </Stack>
                }
              >
                Đề cương đã được giảng viên duyệt, đang chờ Trưởng bộ môn phê
                duyệt cuối cùng
              </Alert>
            </Box>
          )}

          {/* Tabs for Content */}
          <Box sx={{ width: '100%', mt: 4 }}>
            <Paper elevation={0} variant="outlined">
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab
                  icon={<InfoIcon />}
                  label="Thông tin chung"
                  iconPosition="start"
                />
                <Tab
                  icon={<DescriptionIcon />}
                  label="Đề cương"
                  iconPosition="start"
                />
                <Tab
                  icon={<ChatIcon />}
                  label={`Bình luận (${comments.length})`}
                  iconPosition="start"
                />
              </Tabs>

              {/* Tab Content */}
              {/* General Info Tab */}
              {currentTab === 0 && (
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Thông tin chung
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Ngày nộp:
                      </Typography>
                      <Typography variant="body1">
                        {format(
                          new Date(proposal.createdAt),
                          'dd/MM/yyyy HH:mm',
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Cập nhật:
                      </Typography>
                      <Typography variant="body1">
                        {formatDistanceToNow(new Date(proposal.updatedAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </Typography>
                    </Grid>
                    {proposal.proposalDeadline && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Hạn nộp:
                        </Typography>
                        <Typography
                          variant="body1"
                          color={
                            new Date(proposal.proposalDeadline) < new Date()
                              ? 'error.main'
                              : 'inherit'
                          }
                        >
                          {format(
                            new Date(proposal.proposalDeadline),
                            'dd/MM/yyyy',
                          )}
                        </Typography>
                      </Grid>
                    )}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Trạng thái:
                      </Typography>
                      <StatusBadge status={proposal.status} />
                    </Grid>
                  </Grid>

                  {/* Project Members */}
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Thành viên dự án
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        mb: 1,
                      }}
                    >
                      <Button
                        variant="outlined"
                        startIcon={<PersonAddIcon />}
                        onClick={handleOpenManageMemberDialog}
                        size="small"
                      >
                        Thêm thành viên
                      </Button>
                    </Box>
                    <List>
                      {proposal.ProposedProjectMember &&
                        proposal.ProposedProjectMember.map((member, index) => (
                          <ListItem key={member.id || index} sx={{ px: 0 }}>
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  bgcolor: member.studentId
                                    ? 'secondary.main'
                                    : 'primary.main',
                                }}
                              >
                                {member.Student?.fullName?.charAt(0) ||
                                  member.FacultyMember?.fullName?.charAt(0) ||
                                  'U'}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                member.Student?.fullName ||
                                member.FacultyMember?.fullName ||
                                'Unknown'
                              }
                              secondary={`${member.role || 'Thành viên'} - ${
                                member.Student?.studentCode ||
                                member.FacultyMember?.facultyCode ||
                                ''
                              }`}
                            />
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() =>
                                handleManageMember(
                                  member.studentId || member.facultyMemberId!,
                                  'remove',
                                )
                              }
                              disabled={isManagingMembers}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItem>
                        ))}
                    </List>
                  </Box>
                </Box>
              )}

              {/* Outline Content Tab */}
              {currentTab === 1 && (
                <Box sx={{ p: 3 }}>
                  {outline ? (
                    <>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6" gutterBottom>
                          Nội dung đề cương
                        </Typography>
                        <Chip
                          label={outline.status || 'DRAFT'}
                          color={
                            outline.status === ProposalOutlineStatusT.APPROVED
                              ? 'success'
                              : outline.status ===
                                ProposalOutlineStatusT.REJECTED
                              ? 'error'
                              : outline.status ===
                                ProposalOutlineStatusT.PENDING_REVIEW
                              ? 'warning'
                              : 'default'
                          }
                          size="small"
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        gutterBottom
                      >
                        Cập nhật:{' '}
                        {outline.updatedAt
                          ? format(
                              new Date(outline.updatedAt),
                              'dd/MM/yyyy HH:mm',
                            )
                          : ''}
                      </Typography>

                      <Stack spacing={3} sx={{ mt: 3 }}>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Giới thiệu:
                          </Typography>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              bgcolor: 'action.hover',
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            <Typography variant="body2">
                              {outline.introduction || 'Không có thông tin'}
                            </Typography>
                          </Paper>
                        </Box>

                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Mục tiêu:
                          </Typography>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              bgcolor: 'action.hover',
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            <Typography variant="body2">
                              {outline.objectives || 'Không có thông tin'}
                            </Typography>
                          </Paper>
                        </Box>

                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Phương pháp:
                          </Typography>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              bgcolor: 'action.hover',
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            <Typography variant="body2">
                              {outline.methodology || 'Không có thông tin'}
                            </Typography>
                          </Paper>
                        </Box>

                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Kết quả dự kiến:
                          </Typography>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              bgcolor: 'action.hover',
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            <Typography variant="body2">
                              {outline.expectedResults || 'Không có thông tin'}
                            </Typography>
                          </Paper>
                        </Box>

                        {outline.fileId && (
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Tệp đính kèm:
                            </Typography>
                            <Link
                              component="button"
                              onClick={() =>
                                outline.fileId &&
                                openFileInNewTab(outline.fileId)
                              }
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                textDecoration: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              <AttachFileIcon fontSize="small" />
                              <Typography variant="body2">
                                {outline.file?.originalName ||
                                  'Tải tệp đính kèm'}
                                {outline.file?.fileSize &&
                                  ` (${(outline.file.fileSize / 1024).toFixed(
                                    1,
                                  )} KB)`}
                              </Typography>
                            </Link>
                          </Box>
                        )}
                      </Stack>
                    </>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">
                        Sinh viên chưa nộp đề cương cho đề tài này.
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Comments Tab */}
              {currentTab === 2 && (
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Lịch sử trao đổi
                  </Typography>

                  {comments.length > 0 ? (
                    <Box sx={{ mt: 3 }}>
                      {comments.map((comment, index) => (
                        <CommentItem
                          key={comment.id || index}
                          comment={comment}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Chưa có bình luận nào.
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          </Box>
        </Paper>

        {/* Manage Member Dialog */}
        <Dialog
          open={manageMemberDialogOpen}
          onClose={() => setManageMemberDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Thêm thành viên vào dự án</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Tìm kiếm theo tên hoặc mã"
                variant="outlined"
                fullWidth
                value={memberSearchTerm}
                onChange={(e) => setMemberSearchTerm(e.target.value)}
                InputProps={{
                  endAdornment: isSearchingMembers ? (
                    <CircularProgress size={20} />
                  ) : null,
                }}
              />
              <FormControl fullWidth>
                <InputLabel>Loại người dùng</InputLabel>
                <Select
                  value={userTypeToSearch}
                  label="Loại người dùng"
                  onChange={(e) => {
                    setUserTypeToSearch(
                      e.target.value as 'student' | 'lecturer',
                    );
                    setSearchResults([]); // Clear previous results
                  }}
                >
                  <MenuItem value="student">Sinh viên</MenuItem>
                  <MenuItem value="lecturer">Giảng viên</MenuItem>
                </Select>
              </FormControl>

              {isSearchingMembers && <Typography>Đang tìm kiếm...</Typography>}
              {!isSearchingMembers &&
                searchResults.length === 0 &&
                debouncedMemberSearchTerm && (
                  <Typography>Không tìm thấy kết quả.</Typography>
                )}

              <List>
                {searchResults.map((userFound) => (
                  <ListItem
                    key={userFound.id}
                    secondaryAction={
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() =>
                          handleManageMember(
                            userFound.id,
                            'add',
                            userTypeToSearch === 'student'
                              ? 'STUDENT'
                              : 'LECTURER',
                          )
                        } // Default roles, adjust as needed
                        disabled={
                          isManagingMembers ||
                          proposal.ProposedProjectMember?.some(
                            (m) =>
                              m.studentId === userFound.id ||
                              m.facultyMemberId === userFound.id,
                          )
                        }
                      >
                        Thêm
                      </Button>
                    }
                    sx={{ borderBottom: '1px solid divider' }}
                  >
                    <ListItemText
                      primary={userFound.fullName}
                      secondary={
                        (userFound as Student).studentCode ||
                        (userFound as Lecturer).facultyCode ||
                        userFound.email
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setManageMemberDialogOpen(false)}>
              Hủy
            </Button>
          </DialogActions>
        </Dialog>

        {/* Comment section - keep existing */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom>
            Gửi bình luận
          </Typography>

          <TextField
            label="Bình luận"
            multiline
            rows={4}
            fullWidth
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Nhập bình luận của bạn..."
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SendIcon />}
              onClick={handleSendComment}
              disabled={isSubmitting || !commentText.trim()}
            >
              Gửi bình luận
            </Button>
          </Box>
        </Paper>

        {/* Topic Approval Dialog */}
        <Dialog
          open={topicApprovalDialogOpen}
          onClose={() => !isChangingStatus && setTopicApprovalDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {approvalAction === 'approve'
              ? 'Approve Project Topic'
              : approvalAction === 'request_changes'
              ? 'Request Changes to Project Topic'
              : 'Reject Project Topic'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Project: {proposal.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Student: {student?.fullName} ({student?.studentCode})
              </Typography>
            </Box>

            {approvalAction === 'approve' && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Approving this topic will allow the student to proceed to the
                outline phase.
              </Alert>
            )}

            {approvalAction === 'request_changes' && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                The student will need to revise their topic based on your
                feedback.
              </Alert>
            )}

            {approvalAction === 'reject' && (
              <Alert severity="error" sx={{ mb: 3 }}>
                For topics, rejection is treated as a request for changes.
              </Alert>
            )}

            <TextField
              autoFocus
              margin="dense"
              label={
                approvalAction === 'approve'
                  ? 'Comment (Optional)'
                  : 'Feedback for Student'
              }
              fullWidth
              multiline
              rows={4}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required={approvalAction !== 'approve'}
              error={approvalAction !== 'approve' && !commentText.trim()}
              helperText={
                approvalAction !== 'approve' && !commentText.trim()
                  ? 'Please provide feedback to help the student understand what changes are needed'
                  : ''
              }
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setTopicApprovalDialogOpen(false)}
              disabled={isChangingStatus}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTopicApprovalSubmit}
              variant="contained"
              color={
                approvalAction === 'approve'
                  ? 'success'
                  : approvalAction === 'request_changes'
                  ? 'warning'
                  : 'error'
              }
              disabled={
                (approvalAction !== 'approve' && !commentText.trim()) ||
                isChangingStatus
              }
              startIcon={
                isChangingStatus ? (
                  <CircularProgress size={20} color="inherit" />
                ) : approvalAction === 'approve' ? (
                  <ThumbUpIcon />
                ) : approvalAction === 'request_changes' ? (
                  <EditIcon />
                ) : (
                  <ThumbDownIcon />
                )
              }
            >
              {isChangingStatus
                ? 'Processing...'
                : approvalAction === 'approve'
                ? 'Approve'
                : approvalAction === 'request_changes'
                ? 'Request Changes'
                : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Outline Approval Dialog */}
        <Dialog
          open={outlineApprovalDialogOpen}
          onClose={() => !isReviewing && setOutlineApprovalDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {approvalAction === 'approve'
              ? 'Approve Project Outline'
              : approvalAction === 'request_changes'
              ? 'Request Changes to Project Outline'
              : 'Reject Project Outline'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Project: {proposal.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Student: {student?.fullName} ({student?.studentCode})
              </Typography>
            </Box>

            {approvalAction === 'approve' && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Approving this outline will mark the project as ready for the
                next phase.
              </Alert>
            )}

            {approvalAction === 'request_changes' && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                The student will need to revise their outline based on your
                feedback.
              </Alert>
            )}

            {approvalAction === 'reject' && (
              <Alert severity="error" sx={{ mb: 3 }}>
                Rejecting the outline will require the student to create a new
                submission.
              </Alert>
            )}

            <TextField
              autoFocus
              margin="dense"
              label={
                approvalAction === 'approve'
                  ? 'Comment (Optional)'
                  : 'Feedback for Student'
              }
              fullWidth
              multiline
              rows={4}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required={approvalAction !== 'approve'}
              error={approvalAction !== 'approve' && !commentText.trim()}
              helperText={
                approvalAction !== 'approve' && !commentText.trim()
                  ? 'Please provide feedback to help the student understand what changes are needed'
                  : ''
              }
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOutlineApprovalDialogOpen(false)}
              disabled={isReviewing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleOutlineApprovalSubmit}
              variant="contained"
              color={
                approvalAction === 'approve'
                  ? 'success'
                  : approvalAction === 'request_changes'
                  ? 'warning'
                  : 'error'
              }
              disabled={
                (approvalAction !== 'approve' && !commentText.trim()) ||
                isReviewing
              }
              startIcon={
                isReviewing ? (
                  <CircularProgress size={20} color="inherit" />
                ) : approvalAction === 'approve' ? (
                  <ThumbUpIcon />
                ) : approvalAction === 'request_changes' ? (
                  <EditIcon />
                ) : (
                  <ThumbDownIcon />
                )
              }
            >
              {isReviewing
                ? 'Processing...'
                : approvalAction === 'approve'
                ? 'Approve'
                : approvalAction === 'request_changes'
                ? 'Request Changes'
                : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Department Head Review Dialog */}
        <Dialog
          open={departmentHeadReviewDialogOpen}
          onClose={() =>
            !isDepartmentHeadReviewing &&
            !isFinalApproving &&
            setDepartmentHeadReviewDialogOpen(false)
          }
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {approvalAction === 'approve'
              ? 'Phê duyệt Đề cương (Trưởng bộ môn)'
              : approvalAction === 'request_changes'
              ? 'Yêu cầu chỉnh sửa Đề cương'
              : 'Từ chối Đề cương'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Dự án: {proposal.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sinh viên: {student?.fullName} ({student?.studentCode})
              </Typography>
            </Box>

            {approvalAction === 'approve' && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Phê duyệt đề cương này sẽ hoàn tất quá trình duyệt và chuyển
                sang giai đoạn thực hiện dự án.
              </Alert>
            )}

            {approvalAction === 'request_changes' && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                Sinh viên sẽ cần chỉnh sửa đề cương dựa trên phản hồi của bạn.
              </Alert>
            )}

            {approvalAction === 'reject' && (
              <Alert severity="error" sx={{ mb: 3 }}>
                Từ chối đề cương sẽ yêu cầu sinh viên nộp lại đề cương mới.
              </Alert>
            )}

            <TextField
              autoFocus
              margin="dense"
              label={
                approvalAction === 'approve'
                  ? 'Nhận xét (Tùy chọn)'
                  : 'Phản hồi cho sinh viên'
              }
              fullWidth
              multiline
              rows={4}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required={approvalAction !== 'approve'}
              error={approvalAction !== 'approve' && !commentText.trim()}
              helperText={
                approvalAction !== 'approve' && !commentText.trim()
                  ? 'Vui lòng cung cấp phản hồi để giúp sinh viên hiểu những thay đổi cần thiết'
                  : ''
              }
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDepartmentHeadReviewDialogOpen(false)}
              disabled={isDepartmentHeadReviewing || isFinalApproving}
            >
              Hủy
            </Button>
            <Button
              onClick={handleDepartmentHeadReviewSubmit}
              variant="contained"
              color={
                approvalAction === 'approve'
                  ? 'success'
                  : approvalAction === 'request_changes'
                  ? 'warning'
                  : 'error'
              }
              disabled={
                (approvalAction !== 'approve' && !commentText.trim()) ||
                isDepartmentHeadReviewing ||
                isFinalApproving
              }
              startIcon={
                isDepartmentHeadReviewing || isFinalApproving ? (
                  <CircularProgress size={20} color="inherit" />
                ) : approvalAction === 'approve' ? (
                  <ThumbUpIcon />
                ) : approvalAction === 'request_changes' ? (
                  <EditIcon />
                ) : (
                  <ThumbDownIcon />
                )
              }
            >
              {isDepartmentHeadReviewing || isFinalApproving
                ? 'Đang xử lý...'
                : approvalAction === 'approve'
                ? 'Phê duyệt'
                : approvalAction === 'request_changes'
                ? 'Yêu cầu chỉnh sửa'
                : 'Từ chối'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
