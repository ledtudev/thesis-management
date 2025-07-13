// components/ProposalDetail.js
import {
  ProposedProject,
  ProposedProjectStatus,
  SubmitProposalOutlineDto,
  useComments,
  useCreateComment,
  useSubmitProposalOutline,
  useUpdateProposedProject,
} from '@/services/proposalService';
import { getFileViewUrl, useFileUpload } from '@/services/storageService';
import { AddComment, Share as ShareIcon } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { File, Upload } from 'lucide-react';
import * as React from 'react';
import { toast } from 'react-hot-toast';

// Define the comment type interface
interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  CommenterStudent?: {
    id: string;
    fullName: string;
    studentCode?: string;
    profilePicture?: string | null;
  } | null;
  CommenterFacultyMember?: {
    id: string;
    fullName: string;
    profilePicture?: string | null;
    Faculty?: {
      id: string;
      name: string;
      facultyCode: string;
    };
  } | null;
}

// Define the member type interface
interface MemberData {
  id?: string;
  role?: string;
  status?: string;
  studentId?: string | null;
  facultyMemberId?: string | null;
  Student?: {
    id?: string;
    fullName?: string;
    studentCode?: string;
    profilePicture?: string | null;
    Faculty?: {
      id: string;
      name: string;
      facultyCode: string;
    };
  } | null;
  FacultyMember?: {
    id?: string;
    fullName?: string;
    profilePicture?: string | null;
    Faculty?: {
      id: string;
      name: string;
      facultyCode: string;
    };
  } | null;
}

// Function to get member avatar and display name
const getMemberDetails = (member: MemberData) => {
  // Check if this is a faculty member
  if (member.facultyMemberId && member.FacultyMember) {
    return {
      name: member.FacultyMember.fullName || 'Giảng viên',
      avatar: member.FacultyMember.profilePicture,
      code: member.FacultyMember.Faculty?.facultyCode || '',
      type: 'faculty',
    };
  }
  // Check if this is a student
  else if (member.studentId && member.Student) {
    return {
      name: member.Student.fullName || 'Sinh viên',
      avatar: member.Student.profilePicture,
      code: member.Student.studentCode || '',
      type: 'student',
    };
  }
  // Handle advisor role without specific faculty member assigned
  else if (member.role === 'ADVISOR') {
    return {
      name: 'Giảng viên hướng dẫn',
      avatar: null,
      code: 'GVHD',
      type: 'advisor',
    };
  }

  // Default fallback
  return {
    name: 'Không xác định',
    avatar: null,
    code: '',
    type: 'unknown',
  };
};

// Function to get role name in Vietnamese
const getRoleName = (role: string) => {
  switch (role) {
    case 'ADVISOR':
      return 'Giảng viên hướng dẫn';
    case 'LEADER':
      return 'Nhóm trưởng';
    case 'MEMBER':
      return 'Thành viên';
    default:
      return 'Sinh viên';
  }
};

// Function to get status color with proper typing
const getStatusColor = (
  status: ProposedProjectStatus,
):
  | 'primary'
  | 'secondary'
  | 'info'
  | 'default'
  | 'success'
  | 'warning'
  | 'error' => {
  switch (status) {
    case 'TOPIC_SUBMISSION_PENDING':
      return 'info';
    case 'TOPIC_REQUESTED_CHANGES':
    case 'OUTLINE_REQUESTED_CHANGES':
    case 'REQUESTED_CHANGES_ADVISOR':
    case 'REQUESTED_CHANGES_HEAD':
      return 'warning';
    case 'TOPIC_APPROVED':
    case 'OUTLINE_APPROVED':
    case 'ADVISOR_APPROVED':
    case 'APPROVED_BY_HEAD':
      return 'success';
    case 'REJECTED_BY_ADVISOR':
    case 'REJECTED_BY_HEAD':
    case 'OUTLINE_REJECTED':
      return 'error';
    case 'PENDING_ADVISOR':
    case 'PENDING_HEAD':
    case 'OUTLINE_PENDING_ADVISOR':
    case 'TOPIC_PENDING_ADVISOR':
      return 'secondary';
    case 'OUTLINE_PENDING_SUBMISSION':
      return 'primary';
    default:
      return 'default';
  }
};

// Simple PDF Preview Button Component for Student
interface PDFPreviewButtonProps {
  fileId: string;
  fileName?: string;
  children?: React.ReactNode;
}

const PDFPreviewButton: React.FC<PDFPreviewButtonProps> = ({
  fileId,
  fileName = 'Tài liệu',
  children,
}) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handlePreview = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<File size={16} />}
        onClick={handlePreview}
      >
        {children || 'Xem tài liệu'}
      </Button>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">{fileName}</Typography>
          <Button onClick={handleCloseDialog} color="inherit">
            Đóng
          </Button>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <iframe
            src={getFileViewUrl(fileId)}
            width="100%"
            height="100%"
            style={{ border: 'none', minHeight: '70vh' }}
            title={fileName}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

interface ProposalDetailProps {
  proposal: ProposedProject;
}

export default function ProposalDetail({ proposal }: ProposalDetailProps) {
  const [tabValue, setTabValue] = React.useState(0);
  const [draftData, setDraftData] = React.useState({
    title: proposal.title,
    description: proposal.description || '',
  });

  // Get query client for cache updates
  const queryClient = useQueryClient();

  // Proposal data
  const [proposalData, setProposalData] = React.useState<
    Omit<SubmitProposalOutlineDto, 'proposedProjectId'>
  >({
    introduction: proposal.ProposalOutline?.introduction || '',
    objectives: proposal.ProposalOutline?.objectives || '',
    methodology: proposal.ProposalOutline?.methodology || '',
    expectedResults: proposal.ProposalOutline?.expectedResults || '',
    fileId: proposal.ProposalOutline?.fileId,
    submitForReview: false,
  });

  const [newComment, setNewComment] = React.useState('');
  const [openCommentDialog, setOpenCommentDialog] = React.useState(false);
  const [uploadingFile, setUploadingFile] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [commentError, setCommentError] = React.useState<string | null>(null);

  // Debug proposal ID
  // React.useEffect(() => {
  //   console.log('ProposalDetail - proposal object:', proposal);
  //   console.log('ProposalDetail - proposal.id:', proposal.id);
  //   console.log('ProposalDetail - proposal.id type:', typeof proposal.id);
  //   console.log(
  //     'ProposalDetail - proposal.id valid:',
  //     !!proposal.id && typeof proposal.id === 'string',
  //   );
  // }, [proposal]);

  // Use comments from proposal data directly instead of separate API call
  const comments: CommentData[] = React.useMemo(() => {
    if (!proposal.ProposedProjectComment) return [];

    // Map the comments from proposal data to expected format
    return proposal.ProposedProjectComment.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      CommenterStudent: comment.CommenterStudent,
      CommenterFacultyMember: comment.CommenterFacultyMember,
    }));
  }, [proposal.ProposedProjectComment]);

  // Keep the useComments hook for refetching, but don't use its data
  const { isLoading: commentsLoading, error: commentsError } = useComments(
    proposal.id && typeof proposal.id === 'string' ? proposal.id : undefined,
  );

  // Handle comments error
  React.useEffect(() => {
    if (commentsError) {
      console.error('Comments error:', commentsError);
      // Don't show toast for comments error as it might be too intrusive
    }
  }, [commentsError]);

  // Mutations
  const submitProposalMutation = useSubmitProposalOutline();
  const fileUploadMutation = useFileUpload();
  const commentMutation = useCreateComment();
  const updateProposalMutation = useUpdateProposedProject();

  // Get members from proposal
  const members = React.useMemo(() => {
    return proposal.ProposedProjectMember || [];
  }, [proposal.ProposedProjectMember]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDraftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDraftData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProposalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProposalData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setUploadingFile(true);
    setUploadProgress(0);

    try {
      const result = await fileUploadMutation.mutateAsync({
        file,
        context: 'PROPOSAL',
        description: `Đề cương cho đề tài ${proposal.title}`,
        onProgress: (progress) => setUploadProgress(progress),
      });
      console.log(result);
      if (result && result.id) {
        setProposalData((prev) => ({ ...prev, fileId: result.id }));
      } else {
        toast.error('Không thể tải file lên - không có ID file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Lỗi khi tải file lên. Vui lòng thử lại.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !proposalData.introduction ||
      !proposalData.objectives ||
      !proposalData.methodology ||
      !proposalData.expectedResults
    ) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const loadingToast = toast.loading('Đang nộp đề cương...');

    try {
      const result = await submitProposalMutation.mutateAsync({
        ...proposalData,
        proposedProjectId: proposal.id,
      });

      toast.dismiss(loadingToast);
      toast.success('Nộp đề cương thành công');

      // Refetch the proposal data after submission
      queryClient.invalidateQueries({ queryKey: ['proposal', proposal.id] });

      // Update local state to enable "View Outline" tab
      if (result) {
        // Update the proposalData with the response
        setProposalData((prev) => ({
          ...prev,
          introduction: result.introduction || prev.introduction,
          objectives: result.objectives || prev.objectives,
          methodology: result.methodology || prev.methodology,
          expectedResults: result.expectedResults || prev.expectedResults,
          fileId: result.fileId || prev.fileId,
        }));

        // Force enable the "View Outline" tab by updating local cached data
        queryClient.setQueryData(
          ['proposal', proposal.id],
          (oldData: ProposedProject | undefined) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              ProposalOutline: {
                ...oldData.ProposalOutline,
                id: result.id || oldData.ProposalOutline?.id,
                introduction:
                  result.introduction || oldData.ProposalOutline?.introduction,
                objectives:
                  result.objectives || oldData.ProposalOutline?.objectives,
                methodology:
                  result.methodology || oldData.ProposalOutline?.methodology,
                expectedResults:
                  result.expectedResults ||
                  oldData.ProposalOutline?.expectedResults,
                status: result.status || oldData.ProposalOutline?.status,
                fileId: result.fileId || oldData.ProposalOutline?.fileId,
                updatedAt: new Date().toISOString(),
              },
            };
          },
        );

        // Switch to the "View Outline" tab
        setTabValue(2);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error submitting proposal:', error);
      toast.error('Lỗi khi nộp đề cương. Vui lòng thử lại.');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      setCommentError('Vui lòng nhập nội dung bình luận');
      return;
    }

    // Reset error state
    setCommentError(null);

    try {
      // Show loading toast
      const loadingToast = toast.loading('Đang thêm bình luận...');

      await commentMutation.mutateAsync({
        proposedProjectId: proposal.id,
        content: newComment.trim(),
      });

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Thêm bình luận thành công');

      // Reload the entire proposal data to get updated comments
      queryClient.invalidateQueries({
        queryKey: ['proposedProject', proposal.id],
      });

      setNewComment('');
      setOpenCommentDialog(false);
    } catch (error: unknown) {
      console.error('Error adding comment:', error);

      // Check for validation errors in the response
      const apiError = error as {
        response?: {
          data?: {
            error?: {
              details?: Array<{ message: string }>;
            };
            message?: string;
          };
        };
      };

      if (apiError.response?.data?.error?.details) {
        const details = apiError.response.data.error.details;
        const fieldErrors = details.map((err) => `${err.message}`).join(', ');
        setCommentError(fieldErrors);
        toast.error(`Lỗi: ${fieldErrors}`);
      } else if (apiError.response?.data?.message) {
        setCommentError(apiError.response.data.message);
        toast.error(`Lỗi: ${apiError.response.data.message}`);
      } else {
        setCommentError('Lỗi không xác định khi thêm bình luận');
        toast.error('Lỗi không xác định khi thêm bình luận');
      }
    }
  };

  // Check if the proposal is editable based on status
  const isEditable = (status: ProposedProjectStatus): boolean => {
    const editableStatuses: ProposedProjectStatus[] = [
      'TOPIC_SUBMISSION_PENDING',
      'TOPIC_REQUESTED_CHANGES',
      'TOPIC_APPROVED',
      'OUTLINE_PENDING_SUBMISSION',
      'OUTLINE_REQUESTED_CHANGES',
      'OUTLINE_APPROVED',
    ];
    return editableStatuses.includes(status);
  };

  // Check if the title is editable - only possible before approval
  const isTitleEditable = (status: ProposedProjectStatus): boolean => {
    const titleEditableStatuses: ProposedProjectStatus[] = [
      'TOPIC_SUBMISSION_PENDING',
      'TOPIC_REQUESTED_CHANGES',
    ];
    return titleEditableStatuses.includes(status);
  };

  // Check if the proposal outline can be submitted - only when topic is approved
  const canSubmitOutline = (status: ProposedProjectStatus): boolean => {
    const outlineSubmissionStatuses: ProposedProjectStatus[] = [
      'TOPIC_APPROVED',
      'OUTLINE_PENDING_SUBMISSION',
      'OUTLINE_REQUESTED_CHANGES',
      'OUTLINE_APPROVED',
    ];
    return outlineSubmissionStatuses.includes(status);
  };

  const canEditTitle = isTitleEditable(
    proposal.status as ProposedProjectStatus,
  );
  const canSubmitProposal = isEditable(
    proposal.status as ProposedProjectStatus,
  );
  const canAccessOutline = canSubmitOutline(
    proposal.status as ProposedProjectStatus,
  );

  const handleSubmitTopic = async (submitToAdvisor: boolean) => {
    if (!draftData.title.trim()) {
      toast.error('Vui lòng nhập tên đề tài');
      return;
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading(
        submitToAdvisor ? 'Đang gửi đề tài cho GVHD...' : 'Đang lưu đề tài...',
      );

      await updateProposalMutation.mutateAsync({
        id: proposal.id,
        updateData: {
          title: draftData.title,
          description: draftData.description,
          submitToAdvisor,
        },
      });

      // Refetch the proposal data after submission
      queryClient.invalidateQueries({ queryKey: ['proposal', proposal.id] });

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(
        submitToAdvisor
          ? 'Đã gửi đề tài cho giảng viên hướng dẫn thành công'
          : 'Đã lưu đề tài thành công',
      );
    } catch (error) {
      console.error('Error updating proposal:', error);
      toast.error(
        `Lỗi khi cập nhật đề tài: ${
          error instanceof Error ? error.message : 'Lỗi không xác định'
        }`,
      );
    }
  };

  // Function to share the proposal link
  const handleShareLink = () => {
    const url = `${window.location.origin}/project/proposal/${proposal.id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success('Đã sao chép đường dẫn vào clipboard'))
      .catch(() => toast.error('Không thể sao chép đường dẫn'));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6" color="primary">
          {proposal.title}{' '}
          <Chip
            label={proposal.status}
            size="small"
            color={getStatusColor(proposal.status as ProposedProjectStatus)}
            sx={{ ml: 1, verticalAlign: 'middle' }}
          />
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={handleShareLink}
          startIcon={<ShareIcon />}
        >
          Chia sẻ
        </Button>
      </Box>

      {/* Display additional info */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Cập nhật:</strong>{' '}
          {proposal.updatedAt &&
            formatDistanceToNow(new Date(proposal.updatedAt), {
              addSuffix: true,
              locale: vi,
            })}
        </Typography>
      </Box>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label="Đề tài dự kiến" />
        <Tab label="Nộp đề cương" disabled={!canAccessOutline} />
        <Tab
          label={
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                opacity: proposal.ProposalOutline?.introduction ? 1 : 0.7,
              }}
            >
              Xem đề cương
              {proposal.ProposalOutline?.status && (
                <Chip
                  label={
                    proposal.ProposalOutline.status === 'APPROVED'
                      ? 'Đã duyệt'
                      : proposal.ProposalOutline.status === 'PENDING_REVIEW'
                      ? 'Chờ duyệt'
                      : 'Chờ sửa'
                  }
                  size="small"
                  color={
                    proposal.ProposalOutline.status === 'APPROVED'
                      ? 'success'
                      : proposal.ProposalOutline.status === 'PENDING_REVIEW'
                      ? 'warning'
                      : 'error'
                  }
                  sx={{ ml: 1, height: 18, fontSize: '0.7rem' }}
                />
              )}
            </Box>
          }
          disabled={!proposal.ProposalOutline?.introduction}
        />
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              Thành viên
              <Chip
                label={members.length}
                size="small"
                color="primary"
                sx={{ ml: 1, height: 20, minWidth: 20 }}
              />
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              Bình luận
              {comments && comments.length > 0 && (
                <Chip
                  label={comments.length}
                  size="small"
                  color="primary"
                  sx={{ ml: 1, height: 20, minWidth: 20 }}
                />
              )}
            </Box>
          }
        />
      </Tabs>

      {/* Tab 1: Draft topic info */}
      {tabValue === 0 && (
        <Box component="form">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Tên đề tài"
                value={draftData.title}
                onChange={handleDraftChange}
                fullWidth
                variant="outlined"
                required
                disabled={!canEditTitle}
              />
              {!canEditTitle && proposal.status === 'TOPIC_APPROVED' && (
                <Typography
                  variant="caption"
                  color="info.main"
                  sx={{ display: 'block', mt: 1 }}
                >
                  Đề tài đã được duyệt, không thể chỉnh sửa tên đề tài. Bạn có
                  thể tiếp tục nộp đề cương cho đề tài này.
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                name="description"
                value={draftData.description}
                onChange={handleDraftChange}
                variant="outlined"
                multiline
                rows={4}
                disabled={!canEditTitle}
              />
            </Grid>
            {canEditTitle && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!draftData.title.trim()}
                    onClick={() => handleSubmitTopic(false)}
                  >
                    Lưu đề tài
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    disabled={!draftData.title.trim()}
                    onClick={() => handleSubmitTopic(true)}
                  >
                    Lưu và gửi GVHD
                  </Button>
                </Box>
              </Grid>
            )}
            {!canSubmitProposal && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Đề tài đã được gửi cho giảng viên hướng dẫn xem xét và không
                  thể chỉnh sửa.
                </Alert>
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      {/* Tab 2: Submit proposal outline */}
      {tabValue === 1 && (
        <Box component="form" onSubmit={handleProposalSubmit}>
          {!canAccessOutline ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Đề tài chưa được phê duyệt. Bạn cần phải có đề tài được phê duyệt
              (TOPIC_APPROVED) trước khi nộp đề cương.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Giới thiệu đề tài"
                  name="introduction"
                  value={proposalData.introduction}
                  onChange={handleProposalChange}
                  variant="outlined"
                  multiline
                  rows={3}
                  required
                  disabled={
                    !canSubmitProposal || submitProposalMutation.isPending
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mục tiêu nghiên cứu"
                  name="objectives"
                  value={proposalData.objectives}
                  onChange={handleProposalChange}
                  variant="outlined"
                  multiline
                  rows={3}
                  required
                  disabled={
                    !canSubmitProposal || submitProposalMutation.isPending
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phương pháp nghiên cứu"
                  name="methodology"
                  value={proposalData.methodology}
                  onChange={handleProposalChange}
                  variant="outlined"
                  multiline
                  rows={3}
                  required
                  disabled={
                    !canSubmitProposal || submitProposalMutation.isPending
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Kết quả dự kiến"
                  name="expectedResults"
                  value={proposalData.expectedResults}
                  onChange={handleProposalChange}
                  variant="outlined"
                  multiline
                  rows={3}
                  required
                  disabled={
                    !canSubmitProposal || submitProposalMutation.isPending
                  }
                />
              </Grid>

              {/* File upload section */}
              <Grid item xs={12}>
                <Box sx={{ border: '1px dashed grey', p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Tài liệu đề cương
                  </Typography>

                  {proposalData.fileId ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <File size={24} />
                      <Typography>
                        {proposal.ProposalOutline?.file?.originalName ||
                          'Đã tải tài liệu đề cương'}
                      </Typography>
                      <PDFPreviewButton
                        fileId={proposalData.fileId}
                        fileName={
                          proposal.ProposalOutline?.file?.originalName ||
                          'Đề cương'
                        }
                      >
                        Xem tài liệu
                      </PDFPreviewButton>
                      {canSubmitProposal && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() =>
                            setProposalData((prev) => ({
                              ...prev,
                              fileId: undefined,
                            }))
                          }
                        >
                          Xóa
                        </Button>
                      )}
                    </Box>
                  ) : uploadingFile ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CircularProgress
                        size={24}
                        variant="determinate"
                        value={uploadProgress}
                      />
                      <Typography>Đang tải lên... {uploadProgress}%</Typography>
                    </Box>
                  ) : (
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<Upload />}
                      disabled={
                        !canSubmitProposal || fileUploadMutation.isPending
                      }
                    >
                      Tải lên tài liệu đề cương
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </Button>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={proposalData.submitForReview}
                      onChange={(e) =>
                        setProposalData((prev) => ({
                          ...prev,
                          submitForReview: e.target.checked,
                        }))
                      }
                      disabled={
                        !canSubmitProposal || submitProposalMutation.isPending
                      }
                    />
                  }
                  label="Gửi cho giảng viên hướng dẫn duyệt"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={
                      !canAccessOutline ||
                      !canSubmitProposal ||
                      submitProposalMutation.isPending
                    }
                  >
                    {submitProposalMutation.isPending ? (
                      <CircularProgress size={24} />
                    ) : proposalData.submitForReview ? (
                      'Gửi đề cương để duyệt'
                    ) : (
                      'Lưu đề cương nháp'
                    )}
                  </Button>
                </Box>
              </Grid>

              {!canSubmitProposal && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    Đề cương hiện không thể chỉnh sửa do trạng thái hiện tại.
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </Box>
      )}

      {/* Tab 3: View proposal outline details */}
      {tabValue === 2 && (
        <Box>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 1,
              mb: 3,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Box>
                <Typography variant="h6">Chi tiết đề cương</Typography>
                {proposal.ProposalOutline?.updatedAt && (
                  <Typography variant="caption" color="text.secondary">
                    Cập nhật lần cuối:{' '}
                    {new Date(
                      proposal.ProposalOutline.updatedAt,
                    ).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                )}
              </Box>
              <Box>
                {proposal.ProposalOutline?.status && (
                  <Chip
                    label={proposal.ProposalOutline.status}
                    size="small"
                    color={
                      proposal.ProposalOutline.status === 'APPROVED'
                        ? 'success'
                        : proposal.ProposalOutline.status === 'PENDING_REVIEW'
                        ? 'warning'
                        : 'default'
                    }
                    sx={{ mr: 1 }}
                  />
                )}
                {proposal.ProposalOutline?.fileId && (
                  <PDFPreviewButton fileId={proposal.ProposalOutline.fileId}>
                    Tải xuống tài liệu đề cương
                  </PDFPreviewButton>
                )}
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={500}>
                  Giới thiệu đề tài
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mt: 1,
                    minHeight: '100px',
                    bgcolor: 'background.default',
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {proposal.ProposalOutline?.introduction ||
                      'Chưa có thông tin giới thiệu'}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={500}>
                  Mục tiêu nghiên cứu
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mt: 1,
                    minHeight: '100px',
                    bgcolor: 'background.default',
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {proposal.ProposalOutline?.objectives ||
                      'Chưa có thông tin mục tiêu'}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={500}>
                  Phương pháp nghiên cứu
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mt: 1,
                    minHeight: '100px',
                    bgcolor: 'background.default',
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {proposal.ProposalOutline?.methodology ||
                      'Chưa có thông tin phương pháp'}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={500}>
                  Kết quả dự kiến
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mt: 1,
                    minHeight: '100px',
                    bgcolor: 'background.default',
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {proposal.ProposalOutline?.expectedResults ||
                      'Chưa có thông tin kết quả dự kiến'}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sx={{ mt: 3 }}>
                <Typography variant="subtitle1" fontWeight={500}>
                  Tài liệu đính kèm
                </Typography>

                {proposal.ProposalOutline?.fileId ? (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      mt: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      bgcolor: 'background.default',
                    }}
                  >
                    <File size={40} color="#1976d2" />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight={500}>
                        {proposal.ProposalOutline?.file?.originalName ||
                          'Tài liệu đề cương'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {proposal.ProposalOutline?.file?.mimeType || 'Tài liệu'}
                        {proposal.ProposalOutline?.file?.fileSize &&
                          ` • ${Math.round(
                            proposal.ProposalOutline.file.fileSize / 1024,
                          )} KB`}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <PDFPreviewButton
                        fileId={proposal.ProposalOutline.fileId}
                        fileName={
                          proposal.ProposalOutline?.file?.originalName ||
                          'Tài liệu đề cương'
                        }
                      >
                        Xem tài liệu
                      </PDFPreviewButton>
                    </Box>
                  </Paper>
                ) : (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      mt: 1,
                      textAlign: 'center',
                      bgcolor: 'background.default',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Chưa có tài liệu đề cương được tải lên
                    </Typography>
                  </Paper>
                )}
              </Grid>

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Alert severity="info">
                  {proposal.ProposalOutline?.status === 'APPROVED'
                    ? 'Đề cương của bạn đã được phê duyệt.'
                    : proposal.ProposalOutline?.status === 'PENDING_REVIEW'
                    ? 'Đề cương đang chờ giảng viên hướng dẫn xem xét.'
                    : proposal.ProposalOutline?.status === 'REQUESTED_CHANGES'
                    ? 'Giảng viên yêu cầu chỉnh sửa đề cương. Vui lòng xem tab "Bình luận" để biết thêm chi tiết.'
                    : 'Đề cương đang ở trạng thái nháp. Bạn có thể tiếp tục chỉnh sửa trong tab "Nộp đề cương".'}
                </Alert>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}

      {/* Tab 4: Project Members - Simplified */}
      {tabValue === 3 && (
        <Box>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 1,
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Thành viên nhóm nghiên cứu ({members.length})
            </Typography>

            {members.length > 0 ? (
              <List sx={{ p: 0 }}>
                {members.map((member, index) => {
                  const { name, avatar, code, type } = getMemberDetails(member);
                  const role = member.role || 'STUDENT';
                  const roleName = getRoleName(role);
                  const isActive = member.status === 'ACTIVE';

                  return (
                    <React.Fragment key={member.id || index}>
                      <ListItem
                        sx={{
                          px: 2,
                          py: 1.5,
                          borderRadius: 1,
                          opacity: isActive ? 1 : 0.6,
                          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                        }}
                      >
                        <Avatar
                          src={avatar || undefined}
                          sx={{
                            mr: 2,
                            bgcolor:
                              type === 'faculty'
                                ? 'primary.main'
                                : 'secondary.main',
                          }}
                        >
                          {name?.charAt(0) || '?'}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 500 }}
                          >
                            {name}
                            {!isActive && (
                              <Typography
                                component="span"
                                color="error"
                                variant="caption"
                                sx={{ ml: 1 }}
                              >
                                (Không hoạt động)
                              </Typography>
                            )}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {roleName} •{' '}
                            {type === 'faculty' ? 'Mã GV: ' : 'Mã SV: '}
                            {code || 'N/A'}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={
                            type === 'faculty' ? 'Giảng viên' : 'Sinh viên'
                          }
                          color={type === 'faculty' ? 'primary' : 'secondary'}
                          variant="outlined"
                        />
                      </ListItem>
                      {index < members.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </List>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  Chưa có thành viên nào được thêm vào dự án.
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {/* Tab 5: Comments - SIMPLIFIED LIKE LECTURER VERSION */}
      {tabValue === 4 && (
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6">Bình luận</Typography>
            <Button
              variant="contained"
              startIcon={<AddComment />}
              onClick={() => {
                setCommentError(null);
                setOpenCommentDialog(true);
              }}
            >
              Thêm bình luận
            </Button>
          </Box>

          <Paper
            elevation={0}
            variant="outlined"
            sx={{ p: 0, mb: 2, borderRadius: 1 }}
          >
            {commentsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : commentsError ? (
              <Alert severity="error" sx={{ m: 2 }}>
                Không thể tải bình luận. Vui lòng thử lại sau.
              </Alert>
            ) : comments.length > 0 ? (
              <List sx={{ p: 0 }}>
                {comments.map((comment: CommentData, index: number) => (
                  <React.Fragment key={comment.id || index}>
                    <ListItem
                      alignItems="flex-start"
                      sx={{
                        px: 2,
                        py: 1.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', width: '100%' }}>
                        <Avatar
                          src={
                            comment.CommenterStudent?.profilePicture ||
                            comment.CommenterFacultyMember?.profilePicture ||
                            undefined
                          }
                          sx={{ mr: 2, width: 40, height: 40 }}
                        >
                          {
                            (comment.CommenterStudent?.fullName ||
                              comment.CommenterFacultyMember?.fullName ||
                              'U')[0]
                          }
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              mb: 0.5,
                            }}
                          >
                            <Typography variant="subtitle2" fontWeight="medium">
                              {comment.CommenterStudent?.fullName ||
                                comment.CommenterFacultyMember?.fullName ||
                                'Người dùng không xác định'}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatDistanceToNow(
                                new Date(comment.createdAt),
                                {
                                  addSuffix: true,
                                  locale: vi,
                                },
                              )}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{ whiteSpace: 'pre-wrap', mb: 1 }}
                          >
                            {comment.content}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItem>
                    {index < comments.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  Chưa có bình luận nào cho đề xuất này.
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {/* Comment dialog */}
      <Dialog
        open={openCommentDialog}
        onClose={() => {
          if (!commentMutation.isPending) {
            setOpenCommentDialog(false);
            setCommentError(null);
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Thêm bình luận</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nội dung bình luận"
            placeholder="Nhập bình luận của bạn về đề tài này..."
            fullWidth
            multiline
            rows={4}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            error={!!commentError}
            helperText={commentError}
            required
            disabled={commentMutation.isPending}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setOpenCommentDialog(false);
              setCommentError(null);
            }}
            disabled={commentMutation.isPending}
            color="inherit"
          >
            Hủy
          </Button>
          <Button
            onClick={handleAddComment}
            variant="contained"
            disabled={!newComment.trim() || commentMutation.isPending}
          >
            {commentMutation.isPending ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Đang gửi...
              </>
            ) : (
              'Gửi bình luận'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
