'use client';

import { useLogin } from '@/services/authService';
import { useAuthStore } from '@/state/authStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Person, School, Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { AxiosError } from 'axios';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

// Form schema
const loginSchema = z.object({
  code: z.string().min(1, 'Mã số không được để trống'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginForm = z.infer<typeof loginSchema>;

// Illustration component
const IllustrationSide = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        borderRadius: { xs: '0 0 24px 24px', md: '0 24px 24px 0' },
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        py: 4,
      }}
    >
      {/* Abstract shapes */}
      <Box
        sx={{
          position: 'absolute',
          top: '-5%',
          right: '-5%',
          width: '40%',
          height: '40%',
          borderRadius: '50%',
          background: alpha('#fff', 0.1),
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '50%',
          height: '50%',
          borderRadius: '50%',
          background: alpha('#fff', 0.1),
        }}
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Box
          sx={{
            width: { xs: 200, md: 300 },
            height: { xs: 200, md: 300 },
            backgroundColor: alpha('#fff', 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            mb: 4,
          }}
        >
          <School sx={{ fontSize: { xs: 80, md: 120 } }} />
        </Box>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
          UTC Research Hub
        </Typography>
        <Typography
          variant="body1"
          align="center"
          sx={{ maxWidth: '80%', mx: 'auto', mb: 2 }}
        >
          Hệ thống quản lý đề tài nghiên cứu khoa học của Trường Đại học Giao
          thông Vận tải
        </Typography>
      </motion.div>

      {/* <Box
        component="img"
        src="/images/utc-logo.png"
        alt="UTC Logo"
        sx={{
          width: 80,
          height: 80,
          objectFit: 'contain',
          mt: 'auto',
          opacity: 0.8,
          filter: 'brightness(0) invert(1)',
        }}
      />*/}
    </Box>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const theme = useTheme();
  const { setAuth } = useAuthStore();
  const { mutate: login, isPending } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize the form
  const facultyForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      code: 'GV.CNTT.001',
      password: '123456',
    },
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = facultyForm;

  const onSubmit = async (data: LoginForm) => {
    setErrorMessage('');
    login(
      {
        code: data.code,
        password: data.password,
        userType: 'FACULTY',
      },
      {
        onSuccess: (response) => {
          try {
            if (response?.data?.data) {
              const {
                accessToken,
                refreshToken,
                accessTokenExpiresIn,
                refreshTokenExpiresIn,
                user,
              } = response.data.data;

              if (!user || !accessToken || !refreshToken) {
                throw new Error('Dữ liệu phản hồi không hợp lệ');
              }

              const now = Date.now();
              const accessTokenExpiresAt = now + accessTokenExpiresIn * 1000;
              const refreshTokenExpiresAt = now + refreshTokenExpiresIn * 1000;

              setAuth(
                user,
                accessToken,
                refreshToken,
                accessTokenExpiresAt,
                refreshTokenExpiresAt,
              );

              toast.success('Đăng nhập thành công!');

              // Navigate to dashboard
              router.push('/');
            } else {
              throw new Error('Không nhận được dữ liệu đăng nhập');
            }
          } catch (error) {
            console.error('Login error:', error);
            const errorMsg =
              error instanceof Error
                ? error.message
                : 'Đã xảy ra lỗi khi đăng nhập';
            setErrorMessage(errorMsg);
            toast.error(errorMsg);
          }
        },
        onError: (error) => {
          console.error('Login API error:', error);

          let errorMsg = 'Đăng nhập thất bại';

          // Extract error message from API response if available
          if (error instanceof AxiosError && error.response?.data?.message) {
            errorMsg = String(error.response.data.message);
          } else if (error instanceof Error) {
            errorMsg = error.message;
          }

          setErrorMessage(errorMsg);
          toast.error(errorMsg);
        },
      },
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f7fa',
        px: 2,
      }}
    >
      <Card
        elevation={8}
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        sx={{
          width: '100%',
          maxWidth: 1000,
          borderRadius: 6,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          height: { xs: 'auto', md: 600 },
        }}
      >
        {/* Login Form Side */}
        <Box
          sx={{
            width: { xs: '100%', md: '50%' },
            p: { xs: 3, md: 5 },
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              justifyContent: 'center',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <School color="primary" sx={{ fontSize: 40, mr: 1 }} />
            <Typography
              variant="h5"
              component="h1"
              fontWeight="bold"
              color="primary"
            >
              UTC Research Hub
            </Typography>
          </Box>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Typography variant="h5" component="h1" fontWeight="bold" mb={1}>
              Đăng nhập hệ thống
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={4}>
              Nhập thông tin đăng nhập để tiếp tục
            </Typography>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {errorMessage && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  animation: 'fadeIn 0.5s ease-in-out',
                  '@keyframes fadeIn': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateY(-10px)',
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                  },
                }}
              >
                {errorMessage}
              </Alert>
            )}

            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Mã giảng viên"
                  variant="outlined"
                  margin="normal"
                  error={!!errors.code}
                  helperText={errors.code?.message}
                  disabled={isPending}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderWidth: '2px',
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  error={!!errors.password}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderWidth: '2px',
                      },
                    },
                  }}
                >
                  <InputLabel htmlFor="faculty-password">Mật khẩu</InputLabel>
                  <OutlinedInput
                    {...field}
                    id="faculty-password"
                    type={showPassword ? 'text' : 'password'}
                    disabled={isPending}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Mật khẩu"
                  />
                  {errors.password && (
                    <FormHelperText>{errors.password.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            <Box sx={{ textAlign: 'right', mt: 1, mb: 2 }}>
              <Link
                href="/auth/forgot-password"
                style={{ textDecoration: 'none' }}
              >
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{
                    fontWeight: 500,
                    transition: 'color 0.3s ease',
                    '&:hover': {
                      color: theme.palette.primary.dark,
                    },
                  }}
                >
                  Quên mật khẩu?
                </Typography>
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={isPending}
              sx={{
                mt: 1,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold',
                boxShadow: `0px 4px 14px ${alpha(
                  theme.palette.primary.main,
                  0.4,
                )}`,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(to right, transparent 0%, ${alpha(
                    '#fff',
                    0.2,
                  )} 50%, transparent 100%)`,
                  transition: 'all 0.6s ease',
                },
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0px 6px 20px ${alpha(
                    theme.palette.primary.main,
                    0.6,
                  )}`,
                  '&::after': {
                    left: '100%',
                  },
                },
              }}
            >
              {isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </form>

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 'auto', pt: 2 }}
          >
            © {new Date().getFullYear()} Trường Đại học Giao thông Vận tải
          </Typography>
        </Box>

        {/* Illustration Side */}
        <Box
          sx={{
            width: { xs: '100%', md: '50%' },
            display: 'flex',
            order: { xs: -1, md: 2 },
          }}
        >
          <IllustrationSide />
        </Box>
      </Card>
    </Box>
  );
}
