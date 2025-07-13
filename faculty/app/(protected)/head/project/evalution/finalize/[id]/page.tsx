'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Person as PersonIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
  Alert,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Link as MuiLink,
  Paper,
  Slider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

// Zod schema for form validation
const finalizeSchema = z.object({
  advisorWeight: z.number().min(0).max(1).step(0.1),
  committeeWeight: z.number().min(0).max(1).step(0.1),
});

type FinalizeFormData = z.infer<typeof finalizeSchema>;

// Mock data types
interface EvaluatorInfo {
  id: string;
  fullName: string;
  facultyCode: string;
}

interface EvaluationScore {
  id: string;
  Evaluator: EvaluatorInfo;
  role: 'ADVISOR' | 'COMMITTEE';
  score: number;
  comment: string;
}

interface StudentInfo {
  id: string;
  fullName: string;
  studentCode: string;
}

interface FacultyMemberInfo {
  id: string;
  fullName: string;
  facultyCode: string;
}

interface ProjectMember {
  id: string;
  Student?: StudentInfo;
  role: string;
}

interface Advisor {
  id: string;
  FacultyMember: FacultyMemberInfo;
  role: 'ADVISOR';
}

interface MockProject {
  id: string;
  title: string;
  Member: ProjectMember[];
  advisors: Advisor[];
  status: 'PENDING' | 'SCORED' | 'FINALIZED';
  advisorWeight: number;
  committeeWeight: number;
  scores: EvaluationScore[];
}

// Generate mock project data
const getMockProject = (projectId: string): MockProject => {
  // Generate consistent mock data based on the ID
  const idNum = parseInt(projectId.replace('project-', '')) || 1;

  return {
    id: projectId,
    title: `Dự án ${idNum}: ${
      [
        'Ứng dụng di động quản lý chi tiêu',
        'Phát triển website thương mại điện tử',
        'Hệ thống quản lý học sinh',
        'Phân tích dữ liệu bán hàng',
        'Ứng dụng IoT trong nông nghiệp',
      ][idNum % 5]
    }`,
    Member: [
      {
        id: `student-${idNum}`,
        Student: {
          id: `student-${idNum}`,
          fullName: `Sinh viên ${idNum}`,
          studentCode: `SV${100 + idNum}`,
        },
        role: 'STUDENT',
      },
    ],
    advisors: [
      {
        id: `advisor-${idNum}`,
        FacultyMember: {
          id: `faculty-${idNum * 10}`,
          fullName: `GV. ${
            ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C'][idNum % 3]
          }`,
          facultyCode: `GV${100 + idNum}`,
        },
        role: 'ADVISOR',
      },
    ],
    status: 'SCORED',
    advisorWeight: 0.4,
    committeeWeight: 0.6,
    scores: [
      {
        id: `score-advisor-${idNum}`,
        Evaluator: {
          id: `faculty-${idNum * 10}`,
          fullName: `GV. ${
            ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C'][idNum % 3]
          }`,
          facultyCode: `GV${100 + idNum}`,
        },
        role: 'ADVISOR',
        score: 8 + (idNum % 3) * 0.5,
        comment: 'Đồ án có chất lượng tốt, sinh viên làm việc chăm chỉ.',
      },
      {
        id: `score-committee1-${idNum}`,
        Evaluator: {
          id: `faculty-${idNum * 10 + 1}`,
          fullName: `GV. ${
            ['Phạm Thị D', 'Hoàng Văn E', 'Vũ Thị F'][idNum % 3]
          }`,
          facultyCode: `GV${120 + idNum}`,
        },
        role: 'COMMITTEE',
        score: 7.5 + (idNum % 4) * 0.5,
        comment: 'Trình bày khá tốt, cần cải thiện một số chi tiết.',
      },
      {
        id: `score-committee2-${idNum}`,
        Evaluator: {
          id: `faculty-${idNum * 10 + 2}`,
          fullName: `GV. ${
            ['Đỗ Văn G', 'Trương Thị H', 'Ngô Văn I'][idNum % 3]
          }`,
          facultyCode: `GV${140 + idNum}`,
        },
        role: 'COMMITTEE',
        score: 8.5 + (idNum % 3) * 0.25,
        comment: 'Đề tài có tính ứng dụng cao, thực hiện tốt yêu cầu.',
      },
    ],
  };
};

export default function HeadFinalizePage({
  params,
}: {
  params: { id: string };
}) {
  const projectId = params.id;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use mock data
  const mockProject = getMockProject(projectId);

  // Initialize form
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FinalizeFormData>({
    resolver: zodResolver(finalizeSchema),
    defaultValues: {
      advisorWeight: mockProject.advisorWeight,
      committeeWeight: mockProject.committeeWeight,
    },
  });

  // Get current form values for calculating preview
  const formValues = watch();

  // Handle form submission
  const onSubmit = async (formData: FinalizeFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API call with the form data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess('Đã phê duyệt điểm đánh giá thành công!');

      // Redirect back after successful submission
      setTimeout(() => {
        router.push('/head/project/evalution');
      }, 2000);
    } catch {
      setError('Đã xảy ra lỗi khi phê duyệt điểm đánh giá.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate scores for display
  const advisorScores = mockProject.scores.filter(
    (score) => score.role === 'ADVISOR',
  );

  const committeeScores = mockProject.scores.filter(
    (score) => score.role === 'COMMITTEE',
  );

  const advisorAverage =
    advisorScores.length > 0
      ? advisorScores.reduce((sum, score) => sum + score.score, 0) /
        advisorScores.length
      : 0;

  const committeeAverage =
    committeeScores.length > 0
      ? committeeScores.reduce((sum, score) => sum + score.score, 0) /
        committeeScores.length
      : 0;

  // Calculate final score preview based on current weights
  const previewFinalScore =
    advisorAverage * formValues.advisorWeight +
    committeeAverage * formValues.committeeWeight;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link href="/head/dashboard" passHref>
            <MuiLink underline="hover" color="inherit">
              Trang chủ
            </MuiLink>
          </Link>
          <Link href="/head/project/evalution" passHref>
            <MuiLink underline="hover" color="inherit">
              Phê duyệt điểm đồ án
            </MuiLink>
          </Link>
          <Typography color="text.primary">Phê duyệt điểm đánh giá</Typography>
        </Breadcrumbs>

        {/* Title */}
        <Typography variant="h4" component="h1">
          Phê duyệt điểm đánh giá dự án
        </Typography>

        {/* Project info */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              {mockProject.title}
            </Typography>
            <Chip label="Trưởng bộ môn" color="primary" variant="outlined" />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Sinh viên thực hiện:</strong>
              </Typography>
              <List disablePadding>
                {mockProject.Member.filter((m) => m.Student).map((member) => (
                  <ListItem key={member.id} dense>
                    <ListItemAvatar>
                      <Avatar>
                        <SchoolIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={member.Student?.fullName}
                      secondary={member.Student?.studentCode}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Giáo viên hướng dẫn:</strong>
              </Typography>
              <List disablePadding>
                {mockProject.advisors.map((advisor) => (
                  <ListItem key={advisor.id} dense>
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={advisor.FacultyMember?.fullName}
                      secondary={advisor.FacultyMember?.facultyCode}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </Paper>

        {/* Success/Error messages */}
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        {isLoading && <LinearProgress />}

        {/* Evaluation scores table */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Điểm đánh giá
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Giảng viên</TableCell>
                  <TableCell>Vai trò</TableCell>
                  <TableCell align="right">Điểm</TableCell>
                  <TableCell>Nhận xét</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {advisorScores.map((score) => (
                  <TableRow key={score.id}>
                    <TableCell>{score.Evaluator?.fullName}</TableCell>
                    <TableCell>
                      <Chip label="GVHD" color="primary" size="small" />
                    </TableCell>
                    <TableCell align="right">
                      {score.score.toFixed(1)}
                    </TableCell>
                    <TableCell>{score.comment || '-'}</TableCell>
                  </TableRow>
                ))}

                {committeeScores.map((score) => (
                  <TableRow key={score.id}>
                    <TableCell>{score.Evaluator?.fullName}</TableCell>
                    <TableCell>
                      <Chip label="Hội đồng" color="secondary" size="small" />
                    </TableCell>
                    <TableCell align="right">
                      {score.score.toFixed(1)}
                    </TableCell>
                    <TableCell>{score.comment || '-'}</TableCell>
                  </TableRow>
                ))}

                {/* Average scores */}
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell colSpan={2}>
                    <Typography variant="subtitle2">
                      Điểm TB GVHD ({advisorScores.length} người chấm)
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1" fontWeight="bold">
                      {advisorAverage.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell />
                </TableRow>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell colSpan={2}>
                    <Typography variant="subtitle2">
                      Điểm TB Hội đồng ({committeeScores.length} người chấm)
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1" fontWeight="bold">
                      {committeeAverage.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Finalize form */}
        <Paper component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Phê duyệt hệ số và điểm cuối cùng
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.advisorWeight}>
                <InputLabel htmlFor="advisor-weight">
                  Hệ số điểm GVHD
                </InputLabel>
                <Controller
                  name="advisorWeight"
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ px: 2, mt: 4 }}>
                      <Slider
                        value={field.value}
                        onChange={(_, value) => field.onChange(value)}
                        step={0.1}
                        marks
                        min={0}
                        max={1}
                        valueLabelDisplay="on"
                        valueLabelFormat={(value) => value.toFixed(1)}
                      />
                      <TextField
                        margin="normal"
                        fullWidth
                        value={field.value}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value) && value >= 0 && value <= 1) {
                            field.onChange(value);
                          }
                        }}
                        type="number"
                        inputProps={{ step: 0.1, min: 0, max: 1 }}
                        error={!!errors.advisorWeight}
                        helperText={errors.advisorWeight?.message}
                      />
                    </Box>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.committeeWeight}>
                <InputLabel htmlFor="committee-weight">
                  Hệ số điểm Hội đồng
                </InputLabel>
                <Controller
                  name="committeeWeight"
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ px: 2, mt: 4 }}>
                      <Slider
                        value={field.value}
                        onChange={(_, value) => field.onChange(value)}
                        step={0.1}
                        marks
                        min={0}
                        max={1}
                        valueLabelDisplay="on"
                        valueLabelFormat={(value) => value.toFixed(1)}
                      />
                      <TextField
                        margin="normal"
                        fullWidth
                        value={field.value}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value) && value >= 0 && value <= 1) {
                            field.onChange(value);
                          }
                        }}
                        type="number"
                        inputProps={{ step: 0.1, min: 0, max: 1 }}
                        error={!!errors.committeeWeight}
                        helperText={errors.committeeWeight?.message}
                      />
                    </Box>
                  )}
                />
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Preview calculation */}
          <Box sx={{ bgcolor: 'action.hover', p: 3, borderRadius: 1, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Dự kiến điểm cuối cùng
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Điểm TB GVHD × Hệ số
                  </Typography>
                  <Typography variant="h6">
                    {advisorAverage.toFixed(2)} ×{' '}
                    {formValues.advisorWeight.toFixed(1)} ={' '}
                    {(advisorAverage * formValues.advisorWeight).toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Điểm TB Hội đồng × Hệ số
                  </Typography>
                  <Typography variant="h6">
                    {committeeAverage.toFixed(2)} ×{' '}
                    {formValues.committeeWeight.toFixed(1)} ={' '}
                    {(committeeAverage * formValues.committeeWeight).toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Điểm cuối cùng
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="success.main"
                  >
                    {previewFinalScore.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={isLoading}
            >
              Phê duyệt điểm đánh giá
            </Button>
          </Box>
        </Paper>
      </Stack>
    </Container>
  );
}
