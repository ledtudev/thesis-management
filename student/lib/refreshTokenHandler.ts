import { useAuthStore } from '@/state/authStore';
import axios from 'axios';

/**
 * Setup axios interceptors to handle token refresh
 */
export const setupRefreshTokenInterceptor = () => {
  // Request interceptor
  axios.interceptors.request.use(
    async (config) => {
      const authStore = useAuthStore.getState();
      const { accessToken, accessTokenExpiresAt, refreshToken } = authStore;

      // Check if token exists and is about to expire (within 10 seconds)
      if (
        accessToken &&
        accessTokenExpiresAt &&
        accessTokenExpiresAt < Date.now() + 10000
      ) {
        // Token is about to expire, try to refresh it
        if (refreshToken && typeof refreshToken === 'string') {
          const refreshSuccess = await authStore.refreshAccessToken();

          if (refreshSuccess) {
            // Token refreshed successfully, update the request with the new token
            const newAccessToken = useAuthStore.getState().accessToken;
            if (newAccessToken && config.headers) {
              config.headers.Authorization = `Bearer ${newAccessToken}`;
            }
          } else {
            // Token refresh failed, logout the user
            await authStore.logout();
          }
        } else {
          // No refresh token, logout the user
          await authStore.logout();
        }
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If the error is 401 (Unauthorized) and hasn't been retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const authStore = useAuthStore.getState();
        const refreshSuccess = await authStore.refreshAccessToken();

        if (refreshSuccess) {
          // Token refreshed successfully, update the request with the new token
          const newAccessToken = useAuthStore.getState().accessToken;
          if (newAccessToken) {
            axios.defaults.headers.common[
              'Authorization'
            ] = `Bearer ${newAccessToken}`;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            // Retry the original request
            return axios(originalRequest);
          }
        } else {
          // Token refresh failed, logout the user
          await authStore.logout();
        }
      }

      return Promise.reject(error);
    },
  );
};
