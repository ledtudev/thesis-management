/**
 * Role-Based Access Control (RBAC) System for Faculty Application
 *
 * This module provides utilities for checking permissions based on user roles.
 */

import { useAuthStore } from '../state/authStore';

// Define all possible permissions in the system
export enum Permission {
  // User management
  VIEW_FACULTY = 'VIEW_FACULTY',
  MANAGE_FACULTY = 'MANAGE_FACULTY',
  MANAGE_FACULTY_ROLES = 'MANAGE_FACULTY_ROLES',
  VIEW_STUDENT = 'VIEW_STUDENT',
  MANAGE_STUDENT = 'MANAGE_STUDENT',

  // Proposal management
  VIEW_PROPOSALS = 'VIEW_PROPOSALS',
  CREATE_PROPOSAL = 'CREATE_PROPOSAL',
  EDIT_PROPOSAL = 'EDIT_PROPOSAL',
  APPROVE_PROPOSAL = 'APPROVE_PROPOSAL',
  REJECT_PROPOSAL = 'REJECT_PROPOSAL',

  // Advisor assignment
  ASSIGN_ADVISOR = 'ASSIGN_ADVISOR',
  VIEW_ASSIGNMENTS = 'VIEW_ASSIGNMENTS',

  // Outline management
  VIEW_OUTLINES = 'VIEW_OUTLINES',
  CREATE_OUTLINE = 'CREATE_OUTLINE',
  EDIT_OUTLINE = 'EDIT_OUTLINE',
  APPROVE_OUTLINE = 'APPROVE_OUTLINE',
  LOCK_OUTLINE = 'LOCK_OUTLINE',

  // Committee management
  CREATE_COMMITTEE = 'CREATE_COMMITTEE',
  MANAGE_COMMITTEE = 'MANAGE_COMMITTEE',

  // Score management
  VIEW_SCORES = 'VIEW_SCORES',
  EDIT_SCORES = 'EDIT_SCORES',
  EXPORT_SCORES = 'EXPORT_SCORES',

  // File management
  VIEW_FILES = 'VIEW_FILES',
  MANAGE_FILES = 'MANAGE_FILES',

  // Lecturer Selection
  CREATE_LECTURER_SELECTION = 'CREATE_LECTURER_SELECTION',
  VIEW_LECTURER_SELECTION_LIST = 'VIEW_LECTURER_SELECTION_LIST',
  VIEW_OWN_LECTURER_SELECTION = 'VIEW_OWN_LECTURER_SELECTION',
  VIEW_LECTURER_SELECTION_DETAIL = 'VIEW_LECTURER_SELECTION_DETAIL',
  UPDATE_LECTURER_SELECTION = 'UPDATE_LECTURER_SELECTION',
  UPDATE_LECTURER_SELECTION_STATUS = 'UPDATE_LECTURER_SELECTION_STATUS',
  DELETE_LECTURER_SELECTION = 'DELETE_LECTURER_SELECTION',
}

// Map roles to their permissions
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: Object.values(Permission) as Permission[], // Admin has all permissions

  DEAN: [
    Permission.VIEW_FACULTY,
    Permission.VIEW_STUDENT,
    Permission.VIEW_PROPOSALS,
    Permission.APPROVE_PROPOSAL,
    Permission.REJECT_PROPOSAL,
    Permission.ASSIGN_ADVISOR,
    Permission.VIEW_ASSIGNMENTS,
    Permission.VIEW_OUTLINES,
    Permission.APPROVE_OUTLINE,
    Permission.LOCK_OUTLINE,
    Permission.CREATE_COMMITTEE,
    Permission.MANAGE_COMMITTEE,
    Permission.VIEW_SCORES,
    Permission.EDIT_SCORES,
    Permission.EXPORT_SCORES,
    Permission.VIEW_FILES,
    Permission.MANAGE_FILES,
    Permission.VIEW_LECTURER_SELECTION_LIST,
    Permission.VIEW_LECTURER_SELECTION_DETAIL,
    Permission.UPDATE_LECTURER_SELECTION_STATUS,
    Permission.VIEW_OWN_LECTURER_SELECTION,
  ],

  DEPARTMENT_HEAD: [
    Permission.VIEW_FACULTY,
    Permission.VIEW_STUDENT,
    Permission.VIEW_PROPOSALS,
    Permission.APPROVE_PROPOSAL,
    Permission.REJECT_PROPOSAL,
    Permission.VIEW_ASSIGNMENTS,
    Permission.VIEW_OUTLINES,
    Permission.APPROVE_OUTLINE,
    Permission.VIEW_SCORES,
    Permission.VIEW_FILES,
    Permission.MANAGE_FILES,
    Permission.VIEW_LECTURER_SELECTION_LIST,
    Permission.VIEW_LECTURER_SELECTION_DETAIL,
    Permission.UPDATE_LECTURER_SELECTION_STATUS,
    Permission.VIEW_OWN_LECTURER_SELECTION,
  ],

  ADVISOR: [
    Permission.VIEW_PROPOSALS,
    Permission.VIEW_ASSIGNMENTS,
    Permission.VIEW_OUTLINES,
    Permission.EDIT_OUTLINE,
    Permission.VIEW_SCORES,
    Permission.VIEW_FILES,
    Permission.VIEW_LECTURER_SELECTION_LIST,
  ],

  REVIEWER: [
    Permission.VIEW_OUTLINES,
    Permission.VIEW_SCORES,
    Permission.EDIT_SCORES,
    Permission.VIEW_FILES,
  ],

  SECRETARY: [
    Permission.VIEW_SCORES,
    Permission.EDIT_SCORES,
    Permission.EXPORT_SCORES,
    Permission.VIEW_FILES,
  ],

  LECTURER: [
    Permission.VIEW_PROPOSALS,
    Permission.VIEW_ASSIGNMENTS,
    Permission.VIEW_OUTLINES,
    Permission.VIEW_FILES,
    Permission.CREATE_LECTURER_SELECTION,
    Permission.VIEW_LECTURER_SELECTION_LIST,
    Permission.VIEW_OWN_LECTURER_SELECTION,
    Permission.VIEW_LECTURER_SELECTION_DETAIL,
    Permission.UPDATE_LECTURER_SELECTION,
    Permission.DELETE_LECTURER_SELECTION,
  ],
};

/**
 * Checks if the current user has the required permission
 * @param permission The permission to check
 * @returns boolean indicating if user has permission
 */
export function useHasPermission(permission: Permission): boolean {
  const { user } = useAuthStore();

  if (!user || !user.roles || user.roles.length === 0) {
    return false;
  }

  // Check if any of the user's roles have the required permission
  return user.roles.some((role) => {
    const rolePermissions = ROLE_PERMISSIONS[role];
    return rolePermissions?.includes(permission);
  });
}

/**
 * Checks if the current user has all of the required permissions
 * @param permissions Array of permissions to check
 * @returns boolean indicating if user has all permissions
 */
export function useHasAllPermissions(permissions: Permission[]): boolean {
  return permissions.every((permission) => useHasPermission(permission));
}

/**
 * Checks if the current user has any of the required permissions
 * @param permissions Array of permissions to check
 * @returns boolean indicating if user has any of the permissions
 */
export function useHasAnyPermission(permissions: Permission[]): boolean {
  return permissions.some((permission) => useHasPermission(permission));
}

/**
 * Hook to get all permissions for the current user
 * @returns Array of permissions the user has
 */
export function useUserPermissions(): Permission[] {
  const { user } = useAuthStore();

  if (!user || !user.roles || user.roles.length === 0) {
    return [];
  }

  // Get unique permissions from all user roles
  const allPermissions: Permission[] = user.roles.flatMap(
    (role) => ROLE_PERMISSIONS[role] || [],
  );

  // Use Set to deduplicate permissions
  return [...new Set(allPermissions)];
}
