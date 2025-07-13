'use client';
import {
  Assignment,
  Help,
  HowToReg,
  Person,
  PlayArrow,
  School,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid2,
  Link,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';

export default function Page() {
  const theme = useTheme();
  return (
    <Box>
      <Grid2 spacing={4}>
        <Grid2
          size={{
            xs: 12,
            md: 7,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              mb: 4,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{ p: 3, bgcolor: theme.palette.primary.main, color: 'white' }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <PlayArrow sx={{ mr: 1 }} /> Video Hướng Dẫn Đăng Ký Đề Tài
              </Typography>
            </Box>
            <Box
              sx={{
                p: 0,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  paddingTop: '56.25%',
                  width: '100%',
                }}
              >
                <iframe
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  src="https://www.youtube.com/embed/oafyFIOqtsw?si=UWPHEgxatTreaU9Y"
                  title="Hướng dẫn đăng ký đề tài"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </Box>
              <Box sx={{ p: 3 }}>
                <Typography variant="body2" paragraph>
                  Video hướng dẫn này sẽ giúp bạn hiểu rõ quy trình đăng ký đề
                  tài, cách chọn lĩnh vực nghiên cứu và giảng viên hướng dẫn phù
                  hợp với mục tiêu học tập của bạn.
                </Typography>
                <Typography variant="body2">
                  Hãy xem video này trước khi bắt đầu quá trình đăng ký để đảm
                  bảo bạn hiểu rõ các bước cần thực hiện.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid2>

        <Grid2
          size={{
            xs: 12,
            md: 5,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              mb: 4,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{ p: 3, bgcolor: theme.palette.primary.main, color: 'white' }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <HowToReg sx={{ mr: 1 }} /> Quy Trình Đăng Ký
              </Typography>
            </Box>
            <Box sx={{ p: 3, flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2 }}>
                  1
                </Avatar>
                <Typography variant="body1">
                  Chọn lĩnh vực đề tài bạn quan tâm
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2 }}>
                  2
                </Avatar>
                <Typography variant="body1">
                  Tìm và chọn giảng viên hướng dẫn
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2 }}>
                  3
                </Avatar>
                <Typography variant="body1">
                  Đăng ký đề tài theo thứ tự ưu tiên
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2 }}>
                  4
                </Avatar>
                <Typography variant="body1">
                  Theo dõi trạng thái phê duyệt
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2 }}>
                  5
                </Avatar>
                <Typography variant="body1">
                  Xác nhận đề tài cuối cùng
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid2>
      </Grid2>

      <Typography
        variant="h5"
        gutterBottom
        fontWeight="bold"
        sx={{ mt: 4, mb: 3 }}
      >
        Bắt đầu đăng ký
      </Typography>

      <Grid2 container spacing={3}>
        <Grid2
          size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}
        >
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 6,
              },
              borderRadius: 3,
            }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: theme.palette.primary.main,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Assignment sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Lĩnh Vực Đề Tài
              </Typography>
            </Box>
            <CardContent sx={{ flexGrow: 1, pt: 3 }}>
              <Typography variant="body2" paragraph>
                Khám phá các lĩnh vực nghiên cứu khác nhau và chọn lĩnh vực phù
                hợp với sở thích và mục tiêu học tập của bạn.
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() =>
                  document
                    .querySelector('[aria-label="Lĩnh Vực Đề Tài"]')
                    ?.click()
                }
                sx={{ borderRadius: 4 }}
              >
                Xem Lĩnh Vực
              </Button>
            </CardActions>
          </Card>
        </Grid2>

        <Grid2
          size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}
        >
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 6,
              },
              borderRadius: 3,
            }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: theme.palette.primary.main,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Person sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Giảng Viên
              </Typography>
            </Box>
            <CardContent sx={{ flexGrow: 1, pt: 3 }}>
              <Typography variant="body2" paragraph>
                Tìm kiếm và chọn giảng viên hướng dẫn phù hợp với lĩnh vực
                nghiên cứu của bạn. Xem thông tin chi tiết về các đề tài họ đang
                hướng dẫn.
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() =>
                  document
                    .querySelector('[aria-label="Chọn Giảng Viên"]')
                    ?.click()
                }
                sx={{ borderRadius: 4 }}
              >
                Chọn Giảng Viên
              </Button>
            </CardActions>
          </Card>
        </Grid2>

        <Grid2
          size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}
        >
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 6,
              },
              borderRadius: 3,
            }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: theme.palette.primary.main,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <School sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Trạng Thái Đăng Ký
              </Typography>
            </Box>
            <CardContent sx={{ flexGrow: 1, pt: 3 }}>
              <Typography variant="body2" paragraph>
                Theo dõi trạng thái đăng ký đề tài của bạn. Xem thông tin về các
                đề tài đã đăng ký và tình trạng phê duyệt.
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() =>
                  document
                    .querySelector('[aria-label="Trạng Thái Đăng Ký"]')
                    ?.click()
                }
                sx={{ borderRadius: 4 }}
              >
                Xem Trạng Thái
              </Button>
            </CardActions>
          </Card>
        </Grid2>
      </Grid2>

      <Paper
        elevation={2}
        sx={{
          mt: 4,
          p: 3,
          borderRadius: 2,
          bgcolor: theme.palette.grey[50],
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Help
            sx={{ mr: 2, color: theme.palette.primary.main, fontSize: 28 }}
          />
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Cần hỗ trợ?
            </Typography>
            <Typography variant="body2">
              Nếu bạn gặp khó khăn trong quá trình đăng ký hoặc có thắc mắc, vui
              lòng liên hệ với phòng đào tạo hoặc gửi email đến{' '}
              <Link
                href="mailto:support@university.edu"
                style={{ color: theme.palette.primary.main }}
              >
                support@university.edu
              </Link>
              .
            </Typography>
            <Typography variant="body2">
              Thời gian hỗ trợ: Thứ Hai - Thứ Sáu, 8:00 - 17:00
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
