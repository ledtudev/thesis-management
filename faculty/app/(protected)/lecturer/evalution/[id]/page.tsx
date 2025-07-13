'use client';

import {
  EvaluatorRole,
  ProjectEvaluationStatusT,
} from '@/services/evaluation.interface';
import { evaluationHooks } from '@/services/evaluationService';
import fileService, { FileType } from '@/services/fileService';
import { openFileInNewTab } from '@/services/storageService';
import {
  ArrowBack as ArrowLeftIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  AccessTime as ClockIcon,
  Close as CloseIcon,
  Groups as CommitteeIcon,
  Apartment as DivisionIcon,
  Download as DownloadIcon,
  DoneAll as FinalizeIcon,
  Grade as GradeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  School as SchoolIcon,
  SupervisorAccount as SupervisorIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  OutlinedInput,
  Paper,
  Rating,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function EvaluationDetail() {
  const { id } = useParams();
  const [score, setScore] = useState<number | undefined>();
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalizeData, setFinalizeData] = useState({
    advisorWeight: 0.4,
    committeeWeight: 0.6,
  });
  const [previewFile, setPreviewFile] = useState<{
    id: string;
    name: string;
    mimeType?: string;
  } | null>(null);

  const {
    data: evaluationResponse,
    isLoading,
    error,
    refetch,
  } = evaluationHooks.useEvaluationById(id as string);

  const evaluation = evaluationResponse?.data as any;
  const scores = evaluation?.scores || [];
  const project = evaluation?.Project as any;

  const createScoreMutation = evaluationHooks.useCreateEvaluationScore();
  const updateScoreMutation = evaluationHooks.useUpdateEvaluationScore();
  const finalizeEvaluationMutation = evaluationHooks.useFinalizeEvaluation();

  // Get user's score if exists
  const userScore = scores.find(
    (score) => score.evaluatorId === evaluation?.userContext?.id,
  );

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get the project members by role with proper type handling
  const getProjectMembersByRole = (role: string) => {
    return project?.Member?.filter((member: any) => member.role === role) || [];
  };

  // Get students and advisors
  const students = getProjectMembersByRole('STUDENT');
  const advisors = getProjectMembersByRole('ADVISOR');

  // Get committee members by role with proper type handling
  const getCommitteeMembersByRole = (role: string) => {
    return (
      project?.DefenseCommittee?.Members?.filter(
        (member: any) => member.role === role,
      ) || []
    );
  };

  // Get chairman, secretary and committee members
  const chairmen = getCommitteeMembersByRole('CHAIRMAN');
  const secretaries = getCommitteeMembersByRole('SECRETARY');
  const committeeMembers = getCommitteeMembersByRole('MEMBER');

  const handleScoreSubmit = async () => {
    if (!score || score < 0 || score > 10) {
      toast.error('Điểm phải từ 0 đến 10');
      return;
    }

    setIsSubmitting(true);

    try {
      if (userScore) {
        // Update existing score
        await updateScoreMutation.mutateAsync({
          scoreId: userScore.id,
          data: {
            score,
            comment,
          },
        });
        toast.success('Cập nhật điểm thành công');
      } else {
        // Create new score
        const role = evaluation?.userContext?.isSupervisor
          ? EvaluatorRole.ADVISOR
          : EvaluatorRole.COMMITTEE;

        await createScoreMutation.mutateAsync({
          evaluationId: id as string,
          role,
          score,
          comment,
        });
        toast.success('Chấm điểm thành công');
      }
      refetch();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi lưu điểm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalizeEvaluation = async () => {
    if (!evaluation) return;

    const { advisorWeight, committeeWeight } = finalizeData;
    if (Math.abs(advisorWeight + committeeWeight - 1) > 0.01) {
      toast.error('Tổng trọng số phải bằng 1');
      return;
    }

    setIsSubmitting(true);

    try {
      await finalizeEvaluationMutation.mutateAsync({
        id: id as string,
        data: {
          advisorWeight,
          committeeWeight,
          status: ProjectEvaluationStatusT.EVALUATED,
        },
      });
      toast.success('Chốt điểm thành công');
      refetch();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi chốt điểm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleName = (role: string) => {
    if (role === EvaluatorRole.ADVISOR) return 'GVHD';
    if (role === EvaluatorRole.COMMITTEE) return 'Hội đồng';
    return role;
  };

  // Calculate average score
  const getAverageScore = (roleType: string) => {
    const roleScores = scores.filter((score) => score.role === roleType);
    if (roleScores.length === 0) return null;

    const sum = roleScores.reduce((acc, score) => acc + score.score, 0);
    return sum / roleScores.length;
  };

  const advisorAvgScore = getAverageScore(EvaluatorRole.ADVISOR);
  const committeeAvgScore = getAverageScore(EvaluatorRole.COMMITTEE);

  // Calculate projected final score
  const getProjectedFinalScore = () => {
    if (!advisorAvgScore && !committeeAvgScore) return null;

    const { advisorWeight, committeeWeight } = finalizeData;
    let finalScore = 0;
    let totalWeight = 0;

    if (advisorAvgScore !== null) {
      finalScore += advisorAvgScore * advisorWeight;
      totalWeight += advisorWeight;
    }

    if (committeeAvgScore !== null) {
      finalScore += committeeAvgScore * committeeWeight;
      totalWeight += committeeWeight;
    }

    return totalWeight > 0 ? finalScore / totalWeight : null;
  };

  const projectedFinalScore = getProjectedFinalScore();

  // Handle file download
  const handleFileDownload = (fileId: string) => {
    if (!fileId) return;
    fileService.downloadFile(fileId);
  };

  // Handle file preview
  const handleFilePreview = (file: {
    id: string;
    originalName: string;
    mimeType?: string;
  }) => {
    if (!file?.id) return;
    setPreviewFile({
      id: file.id,
      name: file.originalName,
      mimeType: file.mimeType,
    });
  };

  // Close preview dialog
  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  // Check if file is previewable
  const isPreviewable = (mimeType?: string) => {
    if (!mimeType) return false;
    return fileService.isPreviewable(mimeType);
  };

  // Check if file is PDF
  const isPdf = (mimeType?: string) => {
    if (!mimeType) return false;
    return fileService.getFileType(mimeType) === FileType.PDF;
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !evaluation) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              component={Link}
              href="/lecturer/evalution"
              startIcon={<ArrowLeftIcon />}
            >
              Quay lại
            </Button>
          }
          sx={{ mb: 2 }}
        >
          Không thể tải thông tin đánh giá. Vui lòng thử lại sau.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 2,
          }}
        >
          <Button
            component={Link}
            href="/lecturer/evalution"
            variant="outlined"
            startIcon={<ArrowLeftIcon />}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Chi tiết đánh giá
          </Typography>
        </Box>

        {/* Project information and Final Score */}
        <Grid container spacing={3}>
          {/* Project info */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} variant="outlined">
              <CardHeader
                title="Thông tin dự án"
                action={
                  evaluation?.status === ProjectEvaluationStatusT.PENDING ? (
                    <Chip
                      icon={<ClockIcon fontSize="small" />}
                      label="Đang chờ"
                      color="warning"
                      variant="outlined"
                    />
                  ) : (
                    <Chip
                      icon={<CheckIcon fontSize="small" />}
                      label="Đã chấm"
                      color="success"
                    />
                  )
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tên dự án
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="medium"
                      sx={{ mt: 1, mb: 2 }}
                    >
                      {project?.title}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Lĩnh vực
                    </Typography>
                    <Chip
                      icon={<SchoolIcon fontSize="small" />}
                      label={project?.field || 'Chưa có thông tin'}
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Bộ môn
                    </Typography>
                    <Chip
                      icon={<DivisionIcon fontSize="small" />}
                      label={project?.Division?.name || 'Chưa có thông tin'}
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Mô tả
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                      {project?.description || 'Chưa có mô tả'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Vai trò của bạn
                    </Typography>
                    <Chip
                      icon={
                        evaluation?.userContext?.isSupervisor ? (
                          <SupervisorIcon fontSize="small" />
                        ) : (
                          <CommitteeIcon fontSize="small" />
                        )
                      }
                      label={
                        evaluation?.userContext?.isSupervisor
                          ? 'Giáo viên hướng dẫn'
                          : `Thành viên hội đồng (${evaluation?.userContext?.defenseRole})`
                      }
                      variant="outlined"
                      sx={{ mt: 1 }}
                      color={
                        evaluation?.userContext?.isSupervisor
                          ? 'primary'
                          : 'secondary'
                      }
                    />
                  </Grid>

                  {project?.FinalReport &&
                    project.FinalReport.length > 0 &&
                    project.FinalReport[0].MainReportFile && (
                      <Grid item xs={12}>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Báo cáo cuối cùng
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() =>
                            project.FinalReport[0].MainReportFile?.id &&
                            openFileInNewTab(
                              project.FinalReport[0].MainReportFile.id,
                            )
                          }
                          disabled={!project.FinalReport[0].MainReportFile?.id}
                        >
                          Tải xuống báo cáo
                        </Button>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {project.FinalReport[0].MainReportFile?.originalName}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Nộp lúc:{' '}
                          {project.FinalReport[0].submittedAt
                            ? formatDate(project.FinalReport[0].submittedAt)
                            : 'N/A'}
                        </Typography>

                        {/* Attachments section */}
                        {project.FinalReport[0].Attachments &&
                          project.FinalReport[0].Attachments.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                                gutterBottom
                              >
                                Tệp đính kèm (
                                {project.FinalReport[0].Attachments.length})
                              </Typography>
                              <Paper variant="outlined" sx={{ p: 2 }}>
                                <Stack spacing={1}>
                                  {project.FinalReport[0].Attachments.map(
                                    (attachment: any, index: number) => (
                                      <Box
                                        key={index}
                                        sx={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          p: 1,
                                          borderRadius: 1,
                                          '&:hover': {
                                            bgcolor: 'action.hover',
                                          },
                                        }}
                                      >
                                        <Typography
                                          variant="body2"
                                          noWrap
                                          sx={{ flex: 1 }}
                                        >
                                          {index + 1}. {attachment.id}
                                        </Typography>
                                        <Tooltip title="Tải xuống">
                                          <IconButton
                                            size="small"
                                            onClick={() =>
                                              attachment.id &&
                                              openFileInNewTab(attachment.id)
                                            }
                                            disabled={!attachment.id}
                                          >
                                            <DownloadIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      </Box>
                                    ),
                                  )}
                                </Stack>
                              </Paper>
                            </Box>
                          )}
                      </Grid>
                    )}
                </Grid>
              </CardContent>
            </Paper>

            {/* Defense Committee Information */}
            <Paper elevation={0} variant="outlined" sx={{ mt: 3 }}>
              <CardHeader title="Thông tin hội đồng bảo vệ" />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tên hội đồng
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
                      {project?.DefenseCommittee?.name || 'Chưa có thông tin'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Thời gian bảo vệ
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mt: 1,
                        gap: 1,
                      }}
                    >
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {project?.DefenseCommittee?.defenseDate
                          ? formatDate(project.DefenseCommittee.defenseDate)
                          : 'Chưa xác định'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Địa điểm
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mt: 1,
                        gap: 1,
                      }}
                    >
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {project?.DefenseCommittee?.location || 'Chưa xác định'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Thành viên hội đồng
                    </Typography>
                    <TableContainer
                      component={Paper}
                      variant="outlined"
                      sx={{ mt: 1 }}
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Vai trò</TableCell>
                            <TableCell>Giảng viên</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {project?.DefenseCommittee?.Members?.map(
                            (member: any) => (
                              <TableRow key={member.id}>
                                <TableCell>
                                  <Chip
                                    size="small"
                                    label={
                                      member.role === 'CHAIRMAN'
                                        ? 'Chủ tịch'
                                        : member.role === 'SECRETARY'
                                        ? 'Thư ký'
                                        : 'Thành viên'
                                    }
                                    color={
                                      member.role === 'CHAIRMAN'
                                        ? 'primary'
                                        : member.role === 'SECRETARY'
                                        ? 'info'
                                        : 'default'
                                    }
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  {member.FacultyMember?.fullName ||
                                    'Chưa có thông tin'}
                                </TableCell>
                              </TableRow>
                            ),
                          ) || (
                            <TableRow>
                              <TableCell colSpan={2} align="center">
                                Chưa có thông tin thành viên hội đồng
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </CardContent>
            </Paper>
          </Grid>

          {/* Final score card */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 3,
                backgroundColor: evaluation?.finalScore ? '#f5f9ff' : 'inherit',
              }}
            >
              <GradeIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />

              {evaluation?.finalScore !== null ? (
                <>
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    align="center"
                  >
                    Điểm cuối cùng
                  </Typography>
                  <Typography
                    variant="h2"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    {evaluation?.finalScore?.toFixed(1)}
                  </Typography>
                  <Box
                    sx={{
                      mt: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Rating
                      value={evaluation?.finalScore / 2}
                      precision={0.5}
                      readOnly
                      size="large"
                    />
                  </Box>
                </>
              ) : projectedFinalScore ? (
                <>
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    align="center"
                  >
                    Điểm dự kiến
                  </Typography>
                  <Typography
                    variant="h2"
                    fontWeight="bold"
                    color="text.secondary"
                  >
                    {projectedFinalScore.toFixed(1)}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    align="center"
                    sx={{ mt: 1 }}
                  >
                    Điểm dự kiến dựa trên trọng số hiện tại
                  </Typography>
                </>
              ) : (
                <>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    align="center"
                  >
                    Chưa có điểm cuối cùng
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={{ mt: 1 }}
                  >
                    Cần chấm điểm và finalize để có điểm cuối cùng
                  </Typography>
                </>
              )}

              <Box sx={{ mt: 3, width: '100%' }}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      GVHD
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {advisorAvgScore ? advisorAvgScore.toFixed(1) : '—'} ×{' '}
                      {evaluation?.advisorWeight || finalizeData.advisorWeight}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Hội đồng
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {committeeAvgScore ? committeeAvgScore.toFixed(1) : '—'} ×{' '}
                      {evaluation?.committeeWeight ||
                        finalizeData.committeeWeight}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Student Info */}
              <Box sx={{ mt: 4, width: '100%' }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Sinh viên thực hiện
                </Typography>
                {students.length > 0 ? (
                  students.map((student, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mt: 1,
                        gap: 1,
                      }}
                    >
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {student.Student?.fullName}{' '}
                        {student.Student?.studentCode
                          ? `(${student.Student.studentCode})`
                          : ''}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Không có thông tin
                  </Typography>
                )}
              </Box>

              {/* Advisor Info */}
              <Box sx={{ mt: 2, width: '100%' }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Giáo viên hướng dẫn
                </Typography>
                {advisors.length > 0 ? (
                  advisors.map((advisor, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mt: 1,
                        gap: 1,
                      }}
                    >
                      <SupervisorIcon fontSize="small" color="primary" />
                      <Typography variant="body2">
                        {advisor.FacultyMember?.fullName}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Không có thông tin
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Scores */}
        <Paper elevation={0} variant="outlined">
          <CardHeader title="Bảng điểm" />
          <Divider />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Người chấm</TableCell>
                  <TableCell>Vai trò</TableCell>
                  <TableCell>Điểm</TableCell>
                  <TableCell>Nhận xét</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Chưa có điểm nào được chấm
                    </TableCell>
                  </TableRow>
                ) : (
                  scores.map((score) => (
                    <TableRow key={score.id}>
                      <TableCell>{score.Evaluator?.fullName}</TableCell>
                      <TableCell>
                        <Chip
                          icon={
                            score.role === EvaluatorRole.ADVISOR ? (
                              <SupervisorIcon fontSize="small" />
                            ) : (
                              <CommitteeIcon fontSize="small" />
                            )
                          }
                          label={getRoleName(score.role)}
                          variant="outlined"
                          size="small"
                          color={
                            score.role === EvaluatorRole.ADVISOR
                              ? 'primary'
                              : 'secondary'
                          }
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'medium' }}>
                        {score.score.toFixed(1)}
                      </TableCell>
                      <TableCell>
                        {score.comment || '(Không có nhận xét)'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Scoring form */}
        {evaluation.status === ProjectEvaluationStatusT.PENDING &&
          evaluation.userContext?.canEdit && (
            <Paper elevation={0} variant="outlined">
              <CardHeader
                title={userScore ? 'Cập nhật điểm' : 'Chấm điểm'}
                subheader="Nhập điểm và nhận xét của bạn cho dự án này"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Điểm đánh giá (0-10)
                      </Typography>
                      <Rating
                        name="score"
                        value={
                          (score !== undefined
                            ? score
                            : userScore?.score || 0) / 2
                        }
                        precision={0.5}
                        onChange={(_, newValue) =>
                          setScore(newValue ? newValue * 2 : undefined)
                        }
                        size="large"
                      />
                      <Typography variant="h4" color="primary" sx={{ mt: 1 }}>
                        {score !== undefined ? score : userScore?.score || '0'}
                        /10
                      </Typography>
                    </Box>

                    <FormControl fullWidth variant="outlined">
                      <InputLabel htmlFor="score-input">
                        Điểm chính xác (0-10)
                      </InputLabel>
                      <OutlinedInput
                        id="score-input"
                        type="number"
                        inputProps={{ min: 0, max: 10, step: 0.1 }}
                        value={
                          score !== undefined ? score : userScore?.score || ''
                        }
                        onChange={(e) => setScore(parseFloat(e.target.value))}
                        label="Điểm chính xác (0-10)"
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      label="Nhận xét"
                      value={comment || userScore?.comment || ''}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Nhập nhận xét đánh giá chi tiết về dự án (không bắt buộc)"
                      variant="outlined"
                      helperText="Nhận xét của bạn sẽ giúp sinh viên cải thiện dự án"
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sx={{ display: 'flex', justifyContent: 'flex-end' }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleScoreSubmit}
                      disabled={isSubmitting || score === undefined}
                      startIcon={userScore ? <UpdateIcon /> : <SaveIcon />}
                      size="large"
                    >
                      {isSubmitting ? (
                        <CircularProgress
                          size={24}
                          color="inherit"
                          sx={{ mr: 1 }}
                        />
                      ) : null}
                      {userScore ? 'Cập nhật điểm' : 'Lưu điểm'}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Paper>
          )}

        {/* Secretary finalization */}
        {evaluation.status === ProjectEvaluationStatusT.PENDING &&
          evaluation.userContext?.canFinalize && (
            <Paper elevation={0} variant="outlined">
              <CardHeader
                title="Chốt điểm cuối cùng"
                subheader="Thiết lập trọng số và chốt điểm cuối cùng cho dự án"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Typography variant="subtitle2">
                        Thông tin chốt điểm
                      </Typography>
                      <Typography variant="body2">
                        Sau khi chốt điểm, kết quả đánh giá sẽ không thể thay
                        đổi. Vui lòng đảm bảo tất cả thành viên đã chấm điểm và
                        tổng trọng số bằng 1.
                      </Typography>
                    </Alert>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel htmlFor="advisor-weight">
                            Trọng số điểm GVHD
                          </InputLabel>
                          <OutlinedInput
                            id="advisor-weight"
                            type="number"
                            inputProps={{ min: 0, max: 1, step: 0.1 }}
                            value={finalizeData.advisorWeight}
                            onChange={(e) =>
                              setFinalizeData({
                                ...finalizeData,
                                advisorWeight: parseFloat(e.target.value),
                              })
                            }
                            label="Trọng số điểm GVHD"
                          />
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel htmlFor="committee-weight">
                            Trọng số điểm hội đồng
                          </InputLabel>
                          <OutlinedInput
                            id="committee-weight"
                            type="number"
                            inputProps={{ min: 0, max: 1, step: 0.1 }}
                            value={finalizeData.committeeWeight}
                            onChange={(e) =>
                              setFinalizeData({
                                ...finalizeData,
                                committeeWeight: parseFloat(e.target.value),
                              })
                            }
                            label="Trọng số điểm hội đồng"
                          />
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Paper
                      elevation={0}
                      variant="outlined"
                      sx={{
                        p: 2,
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Điểm dự kiến
                      </Typography>
                      <Typography variant="h3" fontWeight="bold">
                        {projectedFinalScore
                          ? projectedFinalScore.toFixed(1)
                          : '—'}
                      </Typography>

                      <Divider
                        sx={{ my: 2, borderColor: 'primary.contrastText' }}
                      />

                      <Typography variant="body2" paragraph>
                        Điểm cuối cùng sẽ được tính theo công thức:
                      </Typography>

                      <Typography variant="body1" fontWeight="medium">
                        Điểm GVHD × {finalizeData.advisorWeight} + Điểm Hội đồng
                        × {finalizeData.committeeWeight}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sx={{ display: 'flex', justifyContent: 'flex-end' }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleFinalizeEvaluation}
                      disabled={isSubmitting || !scores.length}
                      startIcon={<FinalizeIcon />}
                      size="large"
                    >
                      {isSubmitting ? (
                        <CircularProgress
                          size={24}
                          color="inherit"
                          sx={{ mr: 1 }}
                        />
                      ) : null}
                      Chốt điểm cuối cùng
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Paper>
          )}

        {/* File Preview Dialog */}
        <Dialog
          open={!!previewFile}
          onClose={handleClosePreview}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { height: '90vh' },
          }}
        >
          <DialogTitle>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6" noWrap sx={{ flex: 1 }}>
                {previewFile?.name}
              </Typography>
              <IconButton onClick={handleClosePreview} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3, textAlign: 'center' }}>
            {previewFile && (
              <Box>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Nhấn nút bên dưới để tải xuống file
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={() => openFileInNewTab(previewFile.id)}
                  size="large"
                >
                  Tải xuống {previewFile.name}
                </Button>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Stack>
    </Container>
  );
}
