import { AuthUserResponse } from '@/services/authService';
import { create } from 'zustand';

interface AuthStore {
  isAuthenticated: boolean;
  user: AuthUserResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: number | null;
  refreshTokenExpiresAt: number | null;
  setAuth: (
    user: AuthUserResponse | null,
    accessToken: string | null,
    refreshToken: string | null,
    accessTokenExpiresAt: number | null,
    refreshTokenExpiresAt: number | null,
  ) => void;
  clearAuth: () => void;
}

const initialState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  accessTokenExpiresAt: null,
  refreshTokenExpiresAt: null,
};
const loadFromLocalStorage = () => {
  // Check client side redering
  if (typeof window !== 'undefined') {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedAccessTokenExpiresAt = localStorage.getItem(
      'accessTokenExpiresAt',
    );
    const storedRefreshTokenExpiresAt = localStorage.getItem(
      'refreshTokenExpiresAt',
    );

    if (
      storedAccessToken &&
      storedAccessTokenExpiresAt
      // &&
      // Number(storedAccessTokenExpiresAt) > Date.now()
    ) {
      return {
        isAuthenticated: true,
        accessToken: storedAccessToken,
        refreshToken: storedRefreshToken || null,
        accessTokenExpiresAt: Number(storedAccessTokenExpiresAt),
        refreshTokenExpiresAt: storedRefreshTokenExpiresAt
          ? Number(storedRefreshTokenExpiresAt)
          : null,
      };
    }
  }
  return {
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    accessTokenExpiresAt: null,
    refreshTokenExpiresAt: null,
  };
};

export const useAuthStore = create<AuthStore>((set) => {
  const initial = loadFromLocalStorage();

  return {
    ...initial,
    user: null,

    setAuth: (
      user,
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    ) => {
      // Save to localStorage
      localStorage.setItem('accessToken', accessToken || '');
      localStorage.setItem(
        'accessTokenExpiresAt',
        accessTokenExpiresAt?.toString() || '',
      );
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem(
          'refreshTokenExpiresAt',
          refreshTokenExpiresAt?.toString() || '',
        );
      }

      set({
        isAuthenticated: !!user,
        user,
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
      });
    },

    clearAuth: () => {
      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('accessTokenExpiresAt');
      localStorage.removeItem('refreshTokenExpiresAt');

      set(initialState);
    },
  };
});
