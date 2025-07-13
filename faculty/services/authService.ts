import api from '@/lib/axios';
import { ApiResponse } from '@/state/api.interface';
import { useMutation } from '@tanstack/react-query';

// API calls
const loginUser = (data: LoginRequest) =>
  api.post<ApiResponse<AuthResponse>>('/auth/login', data);

const refreshToken = (refreshToken: string) =>
  api.post<ApiResponse<AuthResponse>>('/auth/refresh-token', { refreshToken });

const logoutUser = () => {
  // Lấy refreshToken từ localStorage
  const refreshToken = localStorage.getItem('refreshToken');

  // Gửi refreshToken lên server khi logout
  return api.post<ApiResponse<null>>('/auth/logout', { refreshToken });
};

const forgotPassword = (data: ForgotPasswordRequest) =>
  api.post<ApiResponse<null>>('/auth/forgot-password', data);

const resetPassword = (data: ResetPasswordRequest) =>
  api.post<ApiResponse<null>>('/auth/reset-password', data);

// React Query hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: refreshToken,
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: logoutUser,
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPassword,
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword,
  });
};
// Types
export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
  user: AuthUserResponse;
};

export type AuthUserResponse = {
  id: string;
  code: string;
  userType: 'FACULTY' | 'STUDENT';
  roles: string[];
  facultyCode: string;
  facultyId: string;
  fullName: string;
  email: string;
  profilePicture: string | null;
  rank: string | null;
};

export type LoginRequest = {
  code: string;
  password: string;
  userType: 'FACULTY' | 'STUDENT';
};

export type ForgotPasswordRequest = {
  email: string;
  userType: 'FACULTY' | 'STUDENT';
};

export type ResetPasswordRequest = {
  token: string;
  newPassword: string;
  confirmPassword: string;
};
