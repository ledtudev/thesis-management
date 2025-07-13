'use client';

import { useAuthStore } from '@/state/authStore';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Group as GroupIcon,
  Lightbulb as LightbulbIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Science as ScienceIcon,
  Star as StarIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

export default function IntroductionPage() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();

  const features = [
    {
      icon: <AssignmentIcon color="primary" />,
      title: 'Quản lý dự án nghiên cứu',
      description:
        'Theo dõi và quản lý toàn bộ quy trình thực hiện dự án từ đăng ký đến hoàn thành',
    },
    {
      icon: <PeopleIcon color="secondary" />,
      title: 'Kết nối sinh viên - giảng viên',
      description:
        'Tạo cầu nối giữa sinh viên và giảng viên trong các hoạt động nghiên cứu',
    },
    {
      icon: <ScienceIcon color="success" />,
      title: 'Lĩnh vực nghiên cứu đa dạng',
      description:
        'Hỗ trợ nhiều lĩnh vực nghiên cứu khác nhau phù hợp với chuyên ngành',
    },
    {
      icon: <TrendingUpIcon color="warning" />,
      title: 'Theo dõi tiến độ',
      description:
        'Giám sát và đánh giá tiến độ thực hiện dự án một cách chi tiết',
    },
  ];

  const benefits = [
    'Quy trình đăng ký và quản lý dự án đơn giản, minh bạch',
    'Hệ thống đánh giá và phản hồi toàn diện',
    'Giao diện thân thiện, dễ sử dụng',
    'Thông báo và cập nhật thời gian thực',
    'Báo cáo và thống kê chi tiết',
    'Hỗ trợ đa nền tảng (web, mobile)',
  ];

  const stats = [
    { label: 'Dự án đã hoàn thành', value: '500+', icon: <CheckCircleIcon /> },
    { label: 'Sinh viên tham gia', value: '2,000+', icon: <SchoolIcon /> },
    { label: 'Giảng viên hướng dẫn', value: '150+', icon: <PeopleIcon /> },
    { label: 'Lĩnh vực nghiên cứu', value: '25+', icon: <ScienceIcon /> },
  ];

  const getRoleBasedContent = () => {
    const userRoles = user?.roles || [];

    if (userRoles.includes('DEAN')) {
      return {
        title: 'Chào mừng Trưởng khoa!',
        subtitle: 'Quản lý và giám sát toàn bộ hoạt động nghiên cứu của khoa',
        actions: [
          { label: 'Quản lý dự án', path: '/dean/project', color: 'primary' },
          {
            label: 'Quản lý lĩnh vực',
            path: '/dean/theme',
            color: 'secondary',
          },
          {
            label: 'Phân công đăng ký',
            path: '/dean/enrollment',
            color: 'success',
          },
        ],
      };
    } else if (userRoles.includes('LECTURER')) {
      return {
        title: 'Chào mừng Giảng viên!',
        subtitle: 'Hướng dẫn và đánh giá các dự án nghiên cứu của sinh viên',
        actions: [
          {
            label: 'Dự án của tôi',
            path: '/lecturer/project',
            color: 'primary',
          },
          {
            label: 'Đánh giá dự án',
            path: '/lecturer/evalution',
            color: 'secondary',
          },
          {
            label: 'Lĩnh vực nghiên cứu',
            path: '/lecturer/field-pool',
            color: 'success',
          },
        ],
      };
    } else {
      return {
        title: 'Chào mừng đến với Research Hub!',
        subtitle: 'Nền tảng quản lý nghiên cứu khoa học toàn diện',
        actions: [
          { label: 'Khám phá tính năng', path: '#features', color: 'primary' },
          { label: 'Xem thống kê', path: '#stats', color: 'secondary' },
        ],
      };
    }
  };

  const roleContent = getRoleBasedContent();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        sx={{ textAlign: 'center', mb: 6 }}
      >
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          {roleContent.title}
        </Typography>
        <Typography
          variant="h5"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}
        >
          {roleContent.subtitle}
        </Typography>

        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {roleContent.actions.map((action, index) => (
            <Button
              key={index}
              variant="contained"
              color={
                action.color as
                  | 'primary'
                  | 'secondary'
                  | 'success'
                  | 'error'
                  | 'info'
                  | 'warning'
              }
              size="large"
              onClick={() => router.push(action.path)}
              sx={{ minWidth: 160 }}
            >
              {action.label}
            </Button>
          ))}
        </Box>
      </MotionBox>

      {/* Statistics Section */}
      <MotionBox
        id="stats"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        sx={{ mb: 6 }}
      >
        <Typography
          variant="h4"
          textAlign="center"
          gutterBottom
          fontWeight="bold"
        >
          Thành tích nổi bật
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <MotionCard
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
                sx={{ textAlign: 'center', height: '100%' }}
              >
                <CardContent>
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      width: 60,
                      height: 60,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h3" fontWeight="bold" color="primary">
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </MotionBox>

      {/* Features Section */}
      <MotionBox
        id="features"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        sx={{ mb: 6 }}
      >
        <Typography
          variant="h4"
          textAlign="center"
          gutterBottom
          fontWeight="bold"
        >
          Tính năng chính
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <MotionCard
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
                sx={{ height: '100%' }}
              >
                <CardContent>
                  <Box
                    sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.background.paper,
                        border: `2px solid ${theme.palette.primary.main}`,
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </MotionBox>

      {/* Benefits Section */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <MotionBox
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Paper sx={{ p: 4, height: '100%' }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                <LightbulbIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Lợi ích nổi bật
              </Typography>
              <List>
                {benefits.map((benefit, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={benefit} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </MotionBox>
        </Grid>

        <Grid item xs={12} md={6}>
          <MotionBox
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Paper sx={{ p: 4, height: '100%' }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Quy trình thực hiện
              </Typography>
              <Box sx={{ mt: 3 }}>
                {[
                  {
                    step: 1,
                    title: 'Đăng ký lĩnh vực',
                    desc: 'Chọn lĩnh vực nghiên cứu phù hợp',
                  },
                  {
                    step: 2,
                    title: 'Phân công hướng dẫn',
                    desc: 'Được phân công giảng viên hướng dẫn',
                  },
                  {
                    step: 3,
                    title: 'Thực hiện dự án',
                    desc: 'Tiến hành nghiên cứu và báo cáo định kỳ',
                  },
                  {
                    step: 4,
                    title: 'Đánh giá kết quả',
                    desc: 'Bảo vệ và nhận đánh giá từ hội đồng',
                  },
                ].map((item, index) => (
                  <Box
                    key={index}
                    sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
                  >
                    <Chip
                      label={item.step}
                      color="primary"
                      sx={{ mr: 2, minWidth: 32 }}
                    />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </MotionBox>
        </Grid>
      </Grid>

      {/* Call to Action */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        sx={{ textAlign: 'center' }}
      >
        <Paper
          sx={{
            p: 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
            border: `1px solid ${theme.palette.primary.main}30`,
          }}
        >
          <GroupIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Bắt đầu hành trình nghiên cứu của bạn
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}
          >
            Tham gia cùng hàng nghìn sinh viên và giảng viên trong việc xây dựng
            một cộng đồng nghiên cứu khoa học mạnh mẽ và sáng tạo.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<StarIcon />}
            onClick={() => router.push('/dean/theme/field-pool')}
          >
            Khám phá ngay
          </Button>
        </Paper>
      </MotionBox>
    </Container>
  );
}
