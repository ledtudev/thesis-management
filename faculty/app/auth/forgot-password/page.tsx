'use client';

import { useForgotPassword } from '@/services/authService';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowBack, Email, Person, School } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputAdornment,
  Radio,
  RadioGroup,
  Snackbar,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

// Form schema
const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, 'Vui lòng nhập email hoặc mã số'),
  userType: z.enum(['FACULTY', 'STUDENT'], {
    required_error: 'Vui lòng chọn loại tài khoản',
  }),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

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
          <Email sx={{ fontSize: { xs: 80, md: 120 } }} />
        </Box>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
          Quên mật khẩu?
        </Typography>
        <Typography
          variant="body1"
          align="center"
          sx={{ maxWidth: '80%', mx: 'auto', mb: 2 }}
        >
          Nhập thông tin của bạn để nhận hướng dẫn khôi phục mật khẩu qua email
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

export default function ForgotPasswordPage() {
  const theme = useTheme();
  const { mutate: forgotPassword, isPending, error } = useForgotPassword();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      identifier: '',
      userType: 'STUDENT',
    },
  });

  // Handle form submission
  const onSubmit = async (data: ForgotPasswordForm) => {
    forgotPassword(
      {
        email: data.identifier,
        userType: data.userType,
      },
      {
        onSuccess: (response) => {
          if (response.data.success) {
            setSuccessMessage(
              'Hướng dẫn khôi phục mật khẩu đã được gửi vào email của bạn!',
            );
          }
        },
      },
    );
  };

  // Handle closing success message
  const handleCloseSuccess = () => {
    setSuccessMessage(null);
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
          height: { xs: 'auto', md: 520 },
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
            <Email color="primary" sx={{ fontSize: 40, mr: 1 }} />
            <Typography
              variant="h5"
              component="h1"
              fontWeight="bold"
              color="primary"
            >
              Quên mật khẩu
            </Typography>
          </Box>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Typography variant="h5" component="h1" fontWeight="bold" mb={1}>
              Khôi phục mật khẩu
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Nhập thông tin để nhận hướng dẫn đặt lại mật khẩu
            </Typography>
          </motion.div>

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
                {error.message || 'Có lỗi xảy ra. Vui lòng thử lại.'}
              </Alert>
            )}

            <Controller
              name="userType"
              control={control}
              render={({ field }) => (
                <FormControl
                  component="fieldset"
                  error={!!errors.userType}
                  sx={{
                    mb: 3,
                    width: '100%',
                  }}
                >
                  <FormLabel
                    component="legend"
                    sx={{
                      fontWeight: 500,
                      color: theme.palette.text.primary,
                      '&.Mui-focused': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    Bạn là
                  </FormLabel>
                  <RadioGroup
                    row
                    {...field}
                    sx={{
                      '& .MuiRadio-root': {
                        color: alpha(theme.palette.primary.main, 0.6),
                      },
                      '& .Mui-checked': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    <FormControlLabel
                      value="FACULTY"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Person sx={{ mr: 0.5, fontSize: 18 }} />
                          <Typography>Giảng viên</Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="STUDENT"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <School sx={{ mr: 0.5, fontSize: 18 }} />
                          <Typography>Sinh viên</Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                  {errors.userType && (
                    <FormHelperText error>
                      {errors.userType.message}
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="identifier"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={
                    field.value === 'FACULTY'
                      ? 'Mã giảng viên hoặc Email'
                      : 'Mã sinh viên hoặc Email'
                  }
                  variant="outlined"
                  margin="normal"
                  error={!!errors.identifier}
                  helperText={errors.identifier?.message}
                  disabled={isPending}
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
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
                  'Gửi yêu cầu'
                )}
              </Button>
            </Box>
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
