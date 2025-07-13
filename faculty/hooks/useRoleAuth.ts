import { useAuthStore } from '@/state/authStore';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

// Define role types based on the schema
export enum UserRole {
  ADMIN = 'ADMIN',
  DEAN = 'DEAN',
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',
  SECRETARY = 'SECRETARY',
  LECTURER = 'LECTURER',
}

export const useRoleAuth = () => {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const hasRequiredRole = useCallback(
    (checkRoles?: UserRole | UserRole[]) => {
      if (!checkRoles) return true; // If no specific roles required, access is granted (or based on isAuthenticated)
      if (!isAuthenticated || !user || !user.roles || !user.roles.length)
        return false;

      const rolesToCheckArray = Array.isArray(checkRoles)
        ? checkRoles
        : [checkRoles];
      if (!rolesToCheckArray.length) return true; // Similar to no specific roles

      return rolesToCheckArray.some((role) => user.roles.includes(role));
    },
    [user, isAuthenticated],
  );

  const checkAccess = useCallback(
    (checkRoles?: UserRole | UserRole[], customRedirectUrl?: string) => {
      const redirectUrl = customRedirectUrl || '/access-denied';
      if (!isAuthenticated) {
        router.push('/auth/login');
        return false;
      }

      if (checkRoles) {
        const rolesToCheckArray = Array.isArray(checkRoles)
          ? checkRoles
          : [checkRoles];
        if (
          rolesToCheckArray.length > 0 &&
          !hasRequiredRole(rolesToCheckArray)
        ) {
          router.push(redirectUrl);
          return false;
        }
      }
      return true;
    },
    [isAuthenticated, router, hasRequiredRole],
  );

  return {
    isAuthenticated,
    userRoles: user?.roles || [],
    hasRequiredRole,
    checkAccess,
    currentUser: user,
  };
};
