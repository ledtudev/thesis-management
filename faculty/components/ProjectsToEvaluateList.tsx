import {
  Person as PersonIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {
  EvaluatorRole,
  ProjectEvaluationStatusT,
} from '../services/evaluation.interface';
import { evaluationHooks } from '../services/evaluationService';

type TabPanelProps = {
  children?: React.ReactNode;
  index: number;
  value: number;
};

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`projects-tabpanel-${index}`}
      aria-labelledby={`projects-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProjectsToEvaluateList() {
  const [tabValue, setTabValue] = useState(0);
  const router = useRouter();

  const {
    data: projectsData,
    isLoading,
    isError,
  } = evaluationHooks.useProjectsToEvaluate();

  if (isLoading) {
    return <LinearProgress />;
  }

  if (isError || !projectsData?.data) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">
          Đã xảy ra lỗi khi tải dự án. Vui lòng thử lại sau.
        </Typography>
      </Paper>
    );
  }

  const { advisorProjects, committeeProjects } = projectsData.data;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const navigateToScoreForm = (projectId: string, role: EvaluatorRole) => {
    router.push(`/evaluation/score/${projectId}?role=${role}`);
  };

  const renderAdvisorProjects = () => {
    if (advisorProjects.length === 0) {
      return (
        <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
          Bạn không có dự án nào cần chấm điểm với vai trò giáo viên hướng dẫn.
        </Typography>
      );
    }

    return (
      <Grid container spacing={3}>
        {advisorProjects.map((project) => (
          <Grid item xs={12} md={6} key={project.id}>
            <Card>
              <CardHeader
                title={project.title}
                titleTypographyProps={{ variant: 'h6' }}
                subheader={
                  <Chip
                    label={
                      project.hasEvaluated ? 'Đã chấm điểm' : 'Chưa chấm điểm'
                    }
                    color={project.hasEvaluated ? 'success' : 'warning'}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                }
              />
              <Divider />
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Sinh viên thực hiện:
                </Typography>
                <List disablePadding>
                  {project.Member.filter((member) => member.Student).map(
                    (member) => (
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
                    ),
                  )}
                </List>
              </CardContent>
              <Divider />
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color={project.hasEvaluated ? 'primary' : 'success'}
                  onClick={() =>
                    navigateToScoreForm(project.id, EvaluatorRole.ADVISOR)
                  }
                >
                  {project.hasEvaluated ? 'Xem đánh giá' : 'Chấm điểm'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderCommitteeProjects = () => {
    if (committeeProjects.length === 0) {
      return (
        <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
          Bạn không có dự án nào cần chấm điểm với vai trò thành viên hội đồng.
        </Typography>
      );
    }

    return (
      <Grid container spacing={3}>
        {committeeProjects.map((project) => (
          <Grid item xs={12} md={6} key={project.id}>
            <Card>
              <CardHeader
                title={project.title}
                titleTypographyProps={{ variant: 'h6' }}
                subheader={
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={
                        project.hasEvaluated ? 'Đã chấm điểm' : 'Chưa chấm điểm'
                      }
                      color={project.hasEvaluated ? 'success' : 'warning'}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    {project.isChairman && (
                      <Chip
                        label="Chủ tịch hội đồng"
                        color="primary"
                        size="small"
                      />
                    )}
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Sinh viên thực hiện:
                </Typography>
                <List disablePadding>
                  {project.Member.filter((member) => member.Student).map(
                    (member) => (
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
                    ),
                  )}
                </List>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Giáo viên hướng dẫn:
                </Typography>
                <List disablePadding>
                  {project.Member.filter(
                    (member) =>
                      member.FacultyMember && member.role === 'ADVISOR',
                  ).map((member) => (
                    <ListItem key={member.id} dense>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={member.FacultyMember?.fullName}
                        secondary={member.FacultyMember?.facultyCode}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              <Divider />
              <CardActions sx={{ justifyContent: 'space-between' }}>
                {project.isChairman &&
                  project.ProjectEvaluation?.status ===
                    ProjectEvaluationStatusT.PENDING && (
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() =>
                        router.push(`/evaluation/finalize/${project.id}`)
                      }
                    >
                      Nhập hệ số & Chốt điểm
                    </Button>
                  )}
                <Box sx={{ ml: 'auto' }}>
                  <Button
                    variant="contained"
                    color={project.hasEvaluated ? 'primary' : 'success'}
                    onClick={() =>
                      navigateToScoreForm(project.id, EvaluatorRole.COMMITTEE)
                    }
                  >
                    {project.hasEvaluated ? 'Xem đánh giá' : 'Chấm điểm'}
                  </Button>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Paper>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="projects to evaluate tabs"
          variant="fullWidth"
        >
          <Tab
            label={`Dự án GVHD (${advisorProjects.length})`}
            id="projects-tab-0"
            aria-controls="projects-tabpanel-0"
          />
          <Tab
            label={`Dự án Hội đồng (${committeeProjects.length})`}
            id="projects-tab-1"
            aria-controls="projects-tabpanel-1"
          />
        </Tabs>
      </Box>
      <TabPanel value={tabValue} index={0}>
        {renderAdvisorProjects()}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        {renderCommitteeProjects()}
      </TabPanel>
    </Paper>
  );
}
