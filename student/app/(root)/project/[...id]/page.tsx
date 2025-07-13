'use client';
import { useProjectById } from '@/services/projectService';
import { openFileInNewTab } from '@/services/storageService';
import { ArrowBack, Person } from '@mui/icons-material';
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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useParams, useRouter } from 'next/navigation';
import * as React from 'react';
import toast from 'react-hot-toast';

// Import components later if needed
import SubmitReportForm from '../_component/SubmitReportForm';

// Status and type text mapping functions
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    PENDING: 'Chờ xử lý',
    IN_PROGRESS: 'Đang thực hiện',
    WAITING_FOR_EVALUATION: 'Chờ đánh giá',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
  };
  return statusMap[status] || status;
};

const getStatusColor = (status: string) => {
  const statusMap: Record<
    string,
    | 'success'
    | 'warning'
    | 'error'
    | 'default'
    | 'info'
    | 'primary'
    | 'secondary'
  > = {
    PENDING: 'default',
    IN_PROGRESS: 'primary',
    WAITING_FOR_EVALUATION: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'error',
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

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [tabValue, setTabValue] = React.useState(0);

  // Fetch project details
  const {
    data: projectResponse,
    isLoading,
    isError,
    error,
  } = useProjectById(projectId);

  // Extract project data from API response with proper type checking
  let project = null;
  if (projectResponse) {
    // Check if projectResponse has a 'data' property (ApiResponse structure)
    if ('data' in projectResponse && projectResponse.data) {
      project = projectResponse.data;
    } else if ('id' in projectResponse) {
      // Direct project object
      project = projectResponse;
    }
  }

  // Handle errors
  React.useEffect(() => {
    if (isError && error) {
      toast.error(
        `Lỗi khi tải thông tin dự án: ${
          error instanceof Error ? error.message : 'Lỗi không xác định'
        }`,
      );
    }
  }, [isError, error]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          onClick={handleGoBack}
          sx={{ mr: 2 }}
          startIcon={<ArrowBack />}
        >
          Quay lại
        </Button>
        <Typography variant="h4" color="primary">
          Chi tiết dự án
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error" sx={{ my: 2 }}>
          Không thể tải thông tin dự án. Vui lòng thử lại sau.
        </Alert>
      ) : !project ? (
        <Alert severity="warning" sx={{ my: 2 }}>
          Không tìm thấy dự án với ID {projectId}
        </Alert>
      ) : (
        <>
          {/* Project header */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="h5" gutterBottom>
                  {project.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Chip
                    label={getProjectTypeText(project.type)}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={getStatusText(project.status)}
                    color={getStatusColor(project.status)}
                  />
                </Box>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {project.description || 'Không có mô tả chi tiết.'}
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
                    {project.createdAt &&
                      formatDistanceToNow(new Date(project.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                  </Typography>

                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                  >
                    Thuộc khoa/bộ môn
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {project.Division?.Faculty?.name || 'Không có thông tin'} /
                    {project.Division?.name || 'Không có thông tin'}
                  </Typography>
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
              <Tab label="Thông tin chung" />
              <Tab label="Thành viên" />
              <Tab label="Nộp báo cáo" />
              <Tab label="Báo cáo đã nộp" />
              <Tab label="Điểm đánh giá" />
              <Tab label="Hội đồng đánh giá" />
            </Tabs>

            {/* Tab content */}
            <Box sx={{ p: 3 }}>
              {/* General Info */}
              {tabValue === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Thông tin chung về dự án
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Tên dự án
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {project.title}
                      </Typography>

                      <Typography variant="subtitle2" color="text.secondary">
                        Mô tả
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {project.description || 'Không có mô tả'}
                      </Typography>

                      <Typography variant="subtitle2" color="text.secondary">
                        Loại dự án
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {getProjectTypeText(project.type)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Trạng thái
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={getStatusText(project.status)}
                          color={getStatusColor(project.status)}
                        />
                      </Box>

                      <Typography variant="subtitle2" color="text.secondary">
                        Khoa/Bộ môn
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {project.Division?.Faculty?.name ||
                          'Không có thông tin'}{' '}
                        / {project.Division?.name || 'Không có thông tin'}
                      </Typography>

                      <Typography variant="subtitle2" color="text.secondary">
                        Ngày tạo
                      </Typography>
                      <Typography variant="body1">
                        {project.createdAt &&
                          new Date(project.createdAt).toLocaleDateString(
                            'vi-VN',
                          )}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Members */}
              {tabValue === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Thành viên dự án
                  </Typography>
                  <List>
                    {project.Member?.map((member, index) => {
                      const isFaculty = !!member.FacultyMember;
                      const memberData = isFaculty
                        ? member.FacultyMember
                        : member.Student;

                      return (
                        <React.Fragment key={member.id || index}>
                          <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                              <Avatar>
                                <Person />
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
                                          memberData?.facultyCode || 'N/A'
                                        }`
                                      : `Mã SV: ${
                                          memberData?.studentCode || 'N/A'
                                        }`}
                                  </Typography>
                                </>
                              }
                            />
                          </ListItem>
                          {index < (project.Member?.length || 0) - 1 && (
                            <Divider variant="inset" component="li" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </List>
                </Box>
              )}

              {/* Submit Report */}
              {tabValue === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Nộp báo cáo dự án
                  </Typography>
                  {project.status === 'WAITING_FOR_EVALUATION' ||
                  project.status === 'IN_PROGRESS' ? (
                    <SubmitReportForm projectId={project.id} />
                  ) : (
                    <Alert severity="info">
                      Bạn chỉ có thể nộp báo cáo khi dự án đang trong trạng thái
                      "Đang thực hiện" hoặc "Chờ đánh giá".
                    </Alert>
                  )}
                </Box>
              )}

              {/* Submitted Reports */}
              {tabValue === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Báo cáo đã nộp
                  </Typography>
                  {project.FinalReport && project.FinalReport.length > 0 ? (
                    <List>
                      {project.FinalReport.map((report, index) => (
                        <Paper key={report.id || index} sx={{ p: 2, mb: 2 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            Báo cáo nộp ngày{' '}
                            {new Date(report.submittedAt).toLocaleDateString(
                              'vi-VN',
                            )}
                          </Typography>

                          {report.MainReportFile && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2">
                                Báo cáo chính:
                              </Typography>
                              <Button
                                variant="outlined"
                                onClick={() =>
                                  openFileInNewTab(report.MainReportFile.id)
                                }
                                sx={{ mt: 1 }}
                              >
                                {report.MainReportFile.originalName ||
                                  'Tải báo cáo'}
                              </Button>
                            </Box>
                          )}

                          {report.Attachments &&
                            report.Attachments.length > 0 && (
                              <Box>
                                <Typography variant="subtitle2">
                                  Tài liệu đính kèm:
                                </Typography>
                                <List dense>
                                  {report.Attachments.map((attachment, i) => (
                                    <ListItem key={i}>
                                      <Button
                                        variant="text"
                                        onClick={() =>
                                          openFileInNewTab(attachment.fileId)
                                        }
                                      >
                                        {attachment.File?.originalName ||
                                          `Tài liệu ${i + 1}`}
                                      </Button>
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
                </Box>
              )}

              {/* Evaluation Scores */}
              {tabValue === 4 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Điểm đánh giá
                  </Typography>
                  {project.ProjectEvaluation ? (
                    <Box>
                      {project.evaluationSummary ? (
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2 }}>
                              <Typography variant="subtitle1" gutterBottom>
                                Tổng quan đánh giá
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mb: 2,
                                }}
                              >
                                <Typography variant="subtitle2" sx={{ mr: 1 }}>
                                  Trạng thái đánh giá:
                                </Typography>
                                <Chip
                                  label={
                                    project.ProjectEvaluation.status ===
                                    'EVALUATED'
                                      ? 'Đã đánh giá'
                                      : 'Đang đánh giá'
                                  }
                                  color={
                                    project.ProjectEvaluation.status ===
                                    'EVALUATED'
                                      ? 'success'
                                      : 'warning'
                                  }
                                  size="small"
                                />
                              </Box>

                              {project.evaluationSummary.finalScore !==
                                null && (
                                <Typography
                                  variant="h5"
                                  color="primary"
                                  sx={{ mb: 2 }}
                                >
                                  Điểm cuối cùng:{' '}
                                  {project.evaluationSummary.finalScore.toFixed(
                                    1,
                                  )}
                                </Typography>
                              )}

                              <Divider sx={{ my: 2 }} />

                              <Typography variant="subtitle2">
                                Điểm trung bình từ GVHD:
                              </Typography>
                              <Typography variant="body1" gutterBottom>
                                {project.evaluationSummary.avgAdvisorScore !==
                                null
                                  ? project.evaluationSummary.avgAdvisorScore.toFixed(
                                      1,
                                    )
                                  : 'Chưa có điểm'}
                                {project.evaluationSummary.advisorWeight !==
                                  null &&
                                  ` (Hệ số: ${(
                                    project.evaluationSummary.advisorWeight *
                                    100
                                  ).toFixed(0)}%)`}
                              </Typography>

                              <Typography variant="subtitle2">
                                Điểm trung bình từ Hội đồng:
                              </Typography>
                              <Typography variant="body1">
                                {project.evaluationSummary.avgCommitteeScore !==
                                null
                                  ? project.evaluationSummary.avgCommitteeScore.toFixed(
                                      1,
                                    )
                                  : 'Chưa có điểm'}
                                {project.evaluationSummary.committeeWeight !==
                                  null &&
                                  ` (Hệ số: ${(
                                    project.evaluationSummary.committeeWeight *
                                    100
                                  ).toFixed(0)}%)`}
                              </Typography>
                            </Paper>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2 }}>
                              <Typography variant="subtitle1" gutterBottom>
                                Chi tiết điểm số
                              </Typography>

                              {project.ProjectEvaluation.EvaluationScores &&
                              project.ProjectEvaluation.EvaluationScores
                                .length > 0 ? (
                                <List dense>
                                  {project.ProjectEvaluation.EvaluationScores.map(
                                    (score, i) => (
                                      <React.Fragment key={score.id || i}>
                                        <ListItem>
                                          <ListItemText
                                            primary={
                                              <Box
                                                sx={{
                                                  display: 'flex',
                                                  justifyContent:
                                                    'space-between',
                                                }}
                                              >
                                                <Typography variant="body1">
                                                  {score.Evaluator?.fullName ||
                                                    'Người đánh giá'}
                                                </Typography>
                                                <Typography
                                                  variant="body1"
                                                  fontWeight="bold"
                                                >
                                                  {score.score.toFixed(1)}
                                                </Typography>
                                              </Box>
                                            }
                                            secondary={
                                              <>
                                                <Typography
                                                  variant="body2"
                                                  color="text.secondary"
                                                >
                                                  {score.role === 'ADVISOR'
                                                    ? 'Giảng viên hướng dẫn'
                                                    : 'Thành viên hội đồng'}
                                                </Typography>
                                                {score.comment && (
                                                  <Typography
                                                    variant="body2"
                                                    sx={{ mt: 1 }}
                                                  >
                                                    "{score.comment}"
                                                  </Typography>
                                                )}
                                              </>
                                            }
                                          />
                                        </ListItem>
                                        {i <
                                          project.ProjectEvaluation
                                            .EvaluationScores.length -
                                            1 && <Divider component="li" />}
                                      </React.Fragment>
                                    ),
                                  )}
                                </List>
                              ) : (
                                <Typography color="text.secondary">
                                  Chưa có điểm đánh giá chi tiết.
                                </Typography>
                              )}
                            </Paper>
                          </Grid>
                        </Grid>
                      ) : (
                        <Alert severity="info">
                          Thông tin đánh giá chi tiết không khả dụng.
                        </Alert>
                      )}
                    </Box>
                  ) : (
                    <Alert severity="info">Dự án này chưa được đánh giá.</Alert>
                  )}
                </Box>
              )}

              {/* Defense Committee */}
              {tabValue === 5 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Hội đồng đánh giá
                  </Typography>
                  {project.DefenseCommittee ? (
                    <Box>
                      <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {project.DefenseCommittee.name ||
                            'Hội đồng đánh giá dự án'}
                        </Typography>

                        {project.DefenseCommittee.description && (
                          <Typography variant="body2" paragraph>
                            {project.DefenseCommittee.description}
                          </Typography>
                        )}

                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Ngày bảo vệ
                            </Typography>
                            <Typography variant="body1">
                              {project.DefenseCommittee.defense_date &&
                                new Date(
                                  project.DefenseCommittee.defense_date,
                                ).toLocaleDateString('vi-VN')}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Địa điểm
                            </Typography>
                            <Typography variant="body1">
                              {project.DefenseCommittee.location ||
                                'Chưa xác định'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>

                      <Typography variant="subtitle1" gutterBottom>
                        Thành viên hội đồng
                      </Typography>

                      {project.DefenseCommittee.Members &&
                      project.DefenseCommittee.Members.length > 0 ? (
                        <List>
                          {project.DefenseCommittee.Members.map(
                            (member, index) => (
                              <React.Fragment key={member.id || index}>
                                <ListItem alignItems="flex-start">
                                  <ListItemAvatar>
                                    <Avatar>
                                      <Person />
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={
                                      <Typography variant="subtitle1">
                                        {member.FacultyMember?.fullName ||
                                          'Không có tên'}
                                      </Typography>
                                    }
                                    secondary={
                                      <>
                                        <Typography
                                          component="span"
                                          variant="body2"
                                          color="text.primary"
                                        >
                                          {member.role === 'CHAIRMAN'
                                            ? 'Chủ tịch hội đồng'
                                            : member.role === 'SECRETARY'
                                            ? 'Thư ký hội đồng'
                                            : 'Thành viên hội đồng'}
                                        </Typography>
                                        <Typography
                                          component="span"
                                          variant="body2"
                                          display="block"
                                        >
                                          {member.FacultyMember?.rank ||
                                            'Giảng viên'}
                                        </Typography>
                                      </>
                                    }
                                  />
                                </ListItem>
                                {index <
                                  (project.DefenseCommittee.Members.length ||
                                    0) -
                                    1 && (
                                  <Divider variant="inset" component="li" />
                                )}
                              </React.Fragment>
                            ),
                          )}
                        </List>
                      ) : (
                        <Typography color="text.secondary">
                          Chưa có thông tin về thành viên hội đồng.
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Alert severity="info">
                      Dự án này chưa được phân công hội đồng đánh giá.
                    </Alert>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </>
      )}
    </Container>
  );
}
