'use client';

import { useResetPassword } from '@/services/authService';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowBack,
  LockReset,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
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
  Snackbar,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

// Form schema with password validation
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
      .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
      .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 số')
      .regex(/[^A-Za-z0-9]/, 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

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
            width: { xs: 200, md: 280 },
            height: { xs: 200, md: 280 },
            backgroundColor: alpha('#fff', 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            mb: 4,
          }}
        >
          <LockReset sx={{ fontSize: { xs: 80, md: 120 } }} />
        </Box>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
          Đặt lại mật khẩu
        </Typography>
        <Typography
          variant="body1"
          align="center"
          sx={{ maxWidth: '80%', mx: 'auto', mb: 2 }}
        >
          Tạo mật khẩu mới an toàn cho tài khoản của bạn
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
      /> */}
    </Box>
  );
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const theme = useTheme();
  const searchParams = useSearchParams();
  const { mutate: resetPassword, error, isPending } = useResetPassword();
  const [token, setToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Get token from URL
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setTokenError(
        'Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại mật khẩu.',
      );
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  // Initialize the form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      setTokenError(
        'Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại mật khẩu.',
      );
      return;
    }

    resetPassword(
      {
        token,
        newPassword: data.password,
        confirmPassword: data.confirmPassword,
      },
      {
        onSuccess: (response) => {
          if (response.data.success) {
            setSuccessMessage('Mật khẩu đã được đặt lại thành công.');
          }
        },
      },
    );
  };

  const handleCloseSuccess = () => {
    setSuccessMessage(null);
    router.push('/auth/login');
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
          height: { xs: 'auto', md: 550 },
        }}
      >
        {/* Form Side */}
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
            <LockReset color="primary" sx={{ fontSize: 40, mr: 1 }} />
            <Typography
              variant="h5"
              component="h1"
              fontWeight="bold"
              color="primary"
            >
              Đặt lại mật khẩu
            </Typography>
          </Box>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Typography variant="h5" component="h1" fontWeight="bold" mb={1}>
              Tạo mật khẩu mới
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Nhập mật khẩu mới cho tài khoản của bạn
            </Typography>
          </motion.div>

          {tokenError ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Alert
                severity="error"
                sx={{
                  mb: 3,
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
                {tokenError}
              </Alert>
              <Button
                variant="contained"
                color="primary"
                component={Link}
                href="/auth/forgot-password"
                startIcon={<ArrowBack />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  py: 1.5,
                  px: 3,
                  fontWeight: 'bold',
                }}
              >
                Quay lại khôi phục mật khẩu
              </Button>
            </Box>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
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
                  {error.message}
                </Alert>
              )}

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
                      mb: 3,
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
                    <InputLabel htmlFor="password">Mật khẩu mới</InputLabel>
                    <OutlinedInput
                      {...field}
                      id="password"
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
                      label="Mật khẩu mới"
                      startAdornment={
                        <InputAdornment position="start">
                          <LockReset color="primary" />
                        </InputAdornment>
                      }
                    />
                    {errors.password && (
                      <FormHelperText>{errors.password.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    error={!!errors.confirmPassword}
                    sx={{
                      mb: 3,
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
                    <InputLabel htmlFor="confirm-password">
                      Xác nhận mật khẩu mới
                    </InputLabel>
                    <OutlinedInput
                      {...field}
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      disabled={isPending}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            edge="end"
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      }
                      label="Xác nhận mật khẩu mới"
                      startAdornment={
                        <InputAdornment position="start">
                          <LockReset color="primary" />
                        </InputAdornment>
                      }
                    />
                    {errors.confirmPassword && (
                      <FormHelperText>
                        {errors.confirmPassword.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Button
                  component={Link}
                  href="/auth/login"
                  variant="outlined"
                  color="primary"
                  size="large"
                  disabled={isPending}
                  startIcon={<ArrowBack />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    flex: 1,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0px 4px 8px ${alpha(
                        theme.palette.primary.main,
                        0.2,
                      )}`,
                    },
                  }}
                >
                  Quay lại
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={isPending}
                  sx={{
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
                    flex: 2,
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
                    'Đặt lại mật khẩu'
                  )}
                </Button>
              </Box>
            </form>
          )}

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

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          variant="filled"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
