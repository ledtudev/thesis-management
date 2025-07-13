import axios from 'axios';
import { useRefreshToken } from '../services/authService';
import { useAuthStore } from '../state/authStore';
import { ApiResponse } from '@/state/api.interface';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const { mutateAsync: refreshTokenMutation } = useRefreshToken();
        const response = await refreshTokenMutation(refreshToken);

        if (response.data && response.data.data) {
          const {
            accessToken,
            refreshToken: newRefreshToken,
            accessTokenExpiresIn,
            refreshTokenExpiresIn,
          } = response.data.data;
          const now = Date.now();
          const accessTokenExpiresAt = now + accessTokenExpiresIn * 1000;
          const refreshTokenExpiresAt = now + refreshTokenExpiresIn * 1000;

          useAuthStore
            .getState()
            .setAuth(
              useAuthStore.getState().user,
              accessToken,
              newRefreshToken,
              accessTokenExpiresAt,
              refreshTokenExpiresAt,
            );

          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        useAuthStore.getState().clearAuth();
      }
    }
    return Promise.reject(error.data as ApiResponse<null>);
  },
);

export default api;
