// 'use client';

// import { useAuthStore } from '@/state/authStore';
// import { usePathname, useRouter } from 'next/navigation';
// import { ReactNode, useEffect, useRef } from 'react';

// // Mapping URL thân thiện với internal route và role
// const ROUTE_PERMISSION_MAP: Record<
//   string,
//   { internalPath: string; roles: string[] }
// > = {
//   '/dashboard': {
//     internalPath: '/admin/dashboard',
//     roles: ['ADMIN'],
//   },
//   '/dean': {
//     internalPath: '/dean',
//     roles: ['DEAN'],
//   },
//   '/lecturer': {
//     internalPath: '/lecturer',
//     roles: ['LECTURER'],
//   },
//   '/subjects': {
//     internalPath: '/subject-head/dashboard',
//     roles: ['DEPARTMENT_HEAD'],
//   },
//   '/teaching': {
//     internalPath: '/faculty/home',
//     roles: ['FACULTY'],
//   },
// };

// interface ProtectedRouteProps {
//   children: ReactNode;
// }

// export default function ProtectedRoute({ children }: ProtectedRouteProps) {
//   const { isAuthenticated, user } = useAuthStore();
//   const router = useRouter();
//   const pathname = usePathname();
//   const checkPerformed = useRef(false);

//   useEffect(() => {
//     if (checkPerformed.current) return;

//     if (isAuthenticated === undefined) return;

//     if (pathname.startsWith('/auth/')) return;

//     if (!isAuthenticated) {
//       checkPerformed.current = true;
//       router.push('/auth/login');
//       return;
//     }

//     if (!user || !user.roles || user.roles.length === 0) {
//       checkPerformed.current = true;
//       router.push('/access-denied');
//       return;
//     }

//     const currentPath = Object.keys(ROUTE_PERMISSION_MAP).find((path) =>
//       pathname.startsWith(path),
//     );

//     if (currentPath) {
//       const { roles } = ROUTE_PERMISSION_MAP[currentPath];
//       const hasPermission = roles.some((role) => user.roles.includes(role));

//       if (!hasPermission) {
//         checkPerformed.current = true;
//         router.push('/access-denied');
//         return;
//       }
//     }

//     checkPerformed.current = true;
//   }, [isAuthenticated, pathname, router, user]);

//   if (!isAuthenticated || !user) {
//     return null;
//   }

//   return <>{children}</>;
// }
