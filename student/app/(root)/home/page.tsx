'use client';

import Header from '@/components/Header';
import { useGlobalStore } from '@/state';
import {
  Assignment,
  CheckCircle,
  Description,
  Group,
  MenuBook,
  School,
  Timeline,
  Upload,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
  useTheme,
} from '@mui/material';
import { useState } from 'react';

const HomePage = () => {
  const isDarkMode = useGlobalStore((state) => state.isDarkMode);
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      label: 'Đăng ký đề tài',
      description: 'Chọn và đăng ký đề tài nghiên cứu phù hợp với chuyên ngành',
      icon: <Assignment color="primary" />,
      details: [
        'Truy cập mục "Đăng ký đề tài"',
        'Xem danh sách các đề tài có sẵn',
        'Chọn đề tài phù hợp với năng lực và sở thích',
        'Điền thông tin đăng ký và gửi yêu cầu',
      ],
    },
    {
      label: 'Chờ phê duyệt',
      description:
        'Giảng viên hướng dẫn sẽ xem xét và phê duyệt đề tài của bạn',
      icon: <CheckCircle color="warning" />,
      details: [
        'Theo dõi trạng thái đề tài trong hệ thống',
        'Nhận thông báo khi có phản hồi từ giảng viên',
        'Chỉnh sửa đề tài nếu được yêu cầu',
        'Xác nhận khi đề tài được phê duyệt',
      ],
    },
    {
      label: 'Thực hiện đề cương',
      description: 'Soạn thảo và nộp đề cương chi tiết cho đề tài',
      icon: <Description color="info" />,
      details: [
        'Nghiên cứu và lập đề cương chi tiết',
        'Upload file đề cương lên hệ thống',
        'Trao đổi với giảng viên hướng dẫn',
        'Hoàn thiện đề cương theo góp ý',
      ],
    },
    {
      label: 'Thực hiện đồ án',
      description:
        'Tiến hành nghiên cứu và phát triển theo đề cương đã được duyệt',
      icon: <Timeline color="secondary" />,
      details: [
        'Thực hiện theo kế hoạch trong đề cương',
        'Báo cáo tiến độ định kỳ với GVHD',
        'Trao đổi và nhận hướng dẫn từ giảng viên',
        'Hoàn thành sản phẩm/nghiên cứu',
      ],
    },
    {
      label: 'Nộp báo cáo',
      description: 'Hoàn thiện và nộp báo cáo cuối kỳ',
      icon: <Upload color="success" />,
      details: [
        'Viết báo cáo tổng kết đồ án',
        'Chuẩn bị tài liệu thuyết minh',
        'Upload báo cáo và file đính kèm',
        'Đảm bảo đúng định dạng và thời hạn',
      ],
    },
    {
      label: 'Bảo vệ đồ án',
      description: 'Thuyết trình và bảo vệ đồ án trước hội đồng',
      icon: <School color="error" />,
      details: [
        'Chuẩn bị slide thuyết trình',
        'Ôn tập kiến thức liên quan',
        'Tham gia buổi bảo vệ đúng lịch',
        'Trả lời câu hỏi của hội đồng',
      ],
    },
  ];

  const features = [
    {
      title: 'Quản lý đề tài',
      description: 'Đăng ký, theo dõi và quản lý đề tài nghiên cứu của bạn',
      icon: <MenuBook fontSize="large" color="primary" />,
    },
    {
      title: 'Trao đổi với GVHD',
      description: 'Giao tiếp trực tiếp với giảng viên hướng dẫn qua hệ thống',
      icon: <Group fontSize="large" color="secondary" />,
    },
    {
      title: 'Nộp báo cáo',
      description:
        'Upload và quản lý các tài liệu, báo cáo liên quan đến đồ án',
      icon: <Upload fontSize="large" color="success" />,
    },
    {
      title: 'Theo dõi tiến độ',
      description: 'Xem trạng thái và tiến độ thực hiện đồ án theo thời gian',
      icon: <Timeline fontSize="large" color="warning" />,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Header name="Hướng dẫn sử dụng hệ thống - Sinh viên" />

      {/* Welcome Section */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          background: isDarkMode
            ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold" align="center">
          Chào mừng đến với Hệ thống Quản lý Đồ án
        </Typography>
        <Typography variant="h6" align="center" sx={{ opacity: 0.9 }}>
          Hệ thống hỗ trợ sinh viên quản lý toàn bộ quá trình thực hiện đồ án
          tốt nghiệp
        </Typography>
      </Paper>

      {/* Features Section */}
      <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
        Tính năng chính
      </Typography>
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              elevation={2}
              sx={{
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' },
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" gutterBottom fontWeight="medium">
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Process Guide */}
      <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
        Quy trình thực hiện đồ án
      </Typography>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                icon={step.icon}
                onClick={() => setActiveStep(index)}
                sx={{ cursor: 'pointer' }}
              >
                <Typography variant="h6" fontWeight="medium">
                  {step.label}
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {step.description}
                </Typography>
                <List dense>
                  {step.details.map((detail, detailIndex) => (
                    <ListItem key={detailIndex} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircle fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={detail}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Tips Section */}
      <Paper
        elevation={2}
        sx={{ p: 3, mt: 4, bgcolor: isDarkMode ? 'grey.900' : 'grey.50' }}
      >
        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
          💡 Lưu ý quan trọng
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <CheckCircle color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Thường xuyên kiểm tra email và thông báo từ hệ thống"
              secondary="Để không bỏ lỡ các thông tin quan trọng từ giảng viên"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircle color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Backup dữ liệu và tài liệu thường xuyên"
              secondary="Tránh mất mát dữ liệu quan trọng trong quá trình thực hiện"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircle color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Tuân thủ đúng thời hạn nộp bài và lịch trình"
              secondary="Đảm bảo hoàn thành các milestone đúng thời gian quy định"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircle color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Tích cực trao đổi với giảng viên hướng dẫn"
              secondary="Sử dụng tính năng chat để được hỗ trợ kịp thời"
            />
          </ListItem>
        </List>
      </Paper>
    </Container>
  );
};

export default HomePage;
