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

  refreshAccessToken: () => Promise<boolean>;

  logout: () => Promise<void>;
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
  if (typeof window === 'undefined') {
    return initialState;
  }

  const storedAccessToken = localStorage.getItem('accessToken');
  const storedRefreshToken = localStorage.getItem('refreshToken');
  const storedAccessTokenExpiresAt = localStorage.getItem(
    'accessTokenExpiresAt',
  );
  const storedRefreshTokenExpiresAt = localStorage.getItem(
    'refreshTokenExpiresAt',
  );
  const storedUser = localStorage.getItem('user');

  if (
    storedAccessToken &&
    storedAccessTokenExpiresAt &&
    Number(storedAccessTokenExpiresAt) > Date.now()
  ) {
    return {
      isAuthenticated: true,
      accessToken: storedAccessToken,
      refreshToken: storedRefreshToken || null,
      accessTokenExpiresAt: Number(storedAccessTokenExpiresAt),
      refreshTokenExpiresAt: storedRefreshTokenExpiresAt
        ? Number(storedRefreshTokenExpiresAt)
        : null,
      user: storedUser ? JSON.parse(storedUser) : null,
    };
  } else if (storedAccessToken && storedAccessTokenExpiresAt) {
    console.log('Expired token found in localStorage');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessTokenExpiresAt');
    localStorage.removeItem('refreshTokenExpiresAt');
  }

  return initialState;
};

export const useAuthStore = create<AuthStore>((set, get) => {
  const initial = loadFromLocalStorage();

  return {
    ...initial,

    setAuth: (
      user,
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    ) => {
      // Save to localStorage
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem(
          'accessTokenExpiresAt',
          accessTokenExpiresAt?.toString() || '',
        );

        // Set cookie cho middleware
        document.cookie = `accessToken=${accessToken}; path=/; max-age=${Math.floor(
          (accessTokenExpiresAt
            ? accessTokenExpiresAt - Date.now()
            : 3600 * 1000) / 1000,
        )};`;
      }

      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem(
          'refreshTokenExpiresAt',
          refreshTokenExpiresAt?.toString() || '',
        );

        // Set cookie cho middleware
        document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${Math.floor(
          (refreshTokenExpiresAt
            ? refreshTokenExpiresAt - Date.now()
            : 7 * 24 * 3600 * 1000) / 1000,
        )};`;
      }

      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
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
      localStorage.removeItem('user');

      // Clear cookies
      document.cookie = 'accessToken=; path=/; max-age=0;';
      document.cookie = 'refreshToken=; path=/; max-age=0;';

      set(initialState);
    },

    refreshAccessToken: async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refreshToken: get().refreshToken,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        const { accessToken, user, expiresIn } = data;

        // Calculate new expiration time
        const accessTokenExpiresAt = Date.now() + expiresIn * 1000;

        set({
          accessToken,
          accessTokenExpiresAt,
          user,
          isAuthenticated: true,
        });

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem(
          'accessTokenExpiresAt',
          accessTokenExpiresAt.toString(),
        );
        localStorage.setItem('user', JSON.stringify(user));

        return true;
      } catch (error) {
        console.error('Failed to refresh token:', error);
        return false;
      }
    },

    logout: async () => {
      try {
        // Call logout API if needed
        if (get().accessToken) {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${get().accessToken}`,
              'Content-Type': 'application/json',
            },
          });
        }
      } catch (error) {
        console.error('Error during logout:', error);
      } finally {
        // Clear auth state regardless of API success
        get().clearAuth();
      }
    },
  };
});
