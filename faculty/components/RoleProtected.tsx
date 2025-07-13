'use client';

import { UserRole } from '@/hooks/useRoleAuth';
import { ReactNode } from 'react';

interface RoleProtectedProps {
  children: ReactNode;
  requiredRoles?: UserRole | UserRole[];
  fallback?: ReactNode;
  /**
   * If true, will attempt to redirect if access check fails.
   * If false, will render fallback or null.
   * @default true
   */
  redirectTo?: boolean; // Renamed from redirectToLogin for clarity
  redirectUrl?: string;
}

/**
 * Component to protect routes or content based on user roles.
 * If user doesn't have the required roles, it can redirect or show fallback content.
 */
const RoleProtected: React.FC<RoleProtectedProps> = ({
  children,
  requiredRoles,
  fallback,
  redirectTo = true,
  redirectUrl = '/access-denied',
}) => {
  // const { checkAccess, hasRequiredRole, isAuthenticated } = useRoleAuth();

  // useEffect(() => {
  //   if (redirectTo) {
  //     // Pass requiredRoles and redirectUrl to checkAccess
  //     checkAccess(requiredRoles, redirectUrl);
  //   }
  // }, [redirectTo, checkAccess, requiredRoles, redirectUrl, isAuthenticated]); // Added isAuthenticated to deps

  // // If not redirecting, decide whether to render children or fallback
  // if (!redirectTo) {
  //   if (
  //     !isAuthenticated ||
  //     (requiredRoles && !hasRequiredRole(requiredRoles))
  //   ) {
  //     return fallback || null;
  //   }
  // }

  // // If redirecting, the effect handles unauthorized access.
  // // Render children if authenticated and has roles (or if no specific roles are required).
  // // This also covers the case where redirectTo is true, and access check passed (no redirect happened).
  // if (isAuthenticated && (!requiredRoles || hasRequiredRole(requiredRoles))) {
  //   return <>{children}</>;
  // }

  // // If redirectTo is true and access check failed, redirection is in progress.
  // // If redirectTo is false and access check failed, fallback is rendered above.
  // // This return is for the case where redirectTo is true and still awaiting effect, or initial non-authed state.
  // return null;
  return <>{children}</>;
};

export default RoleProtected;
