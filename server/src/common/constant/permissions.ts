// Define permissions for fine-grained access control
export enum PermissionT {
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

  // User management permissions
  VIEW_USERS = 'VIEW_USERS',
  MANAGE_USERS = 'MANAGE_USERS',
  EDIT_USERS = 'EDIT_USERS',
  DELETE_USERS = 'DELETE_USERS',

  // --- Lecturer Selection Permissions ---
  CREATE_LECTURER_SELECTION = 'CREATE_LECTURER_SELECTION',
  VIEW_LECTURER_SELECTION_LIST = 'VIEW_LECTURER_SELECTION_LIST',
  VIEW_OWN_LECTURER_SELECTION = 'VIEW_OWN_LECTURER_SELECTION',
  VIEW_LECTURER_SELECTION_DETAIL = 'VIEW_LECTURER_SELECTION_DETAIL',
  UPDATE_LECTURER_SELECTION = 'UPDATE_LECTURER_SELECTION',
  UPDATE_LECTURER_SELECTION_STATUS = 'UPDATE_LECTURER_SELECTION_STATUS',
  DELETE_LECTURER_SELECTION = 'DELETE_LECTURER_SELECTION',
  UPDATE_OWN_LECTURER_SELECTION_STATUS = 'UPDATE_OWN_LECTURER_SELECTION_STATUS',
  DELETE_ANY_LECTURER_SELECTION = 'DELETE_ANY_LECTURER_SELECTION',
  CREATE_STUDENT_SELECTION = 'CREATE_STUDENT_SELECTION',
  VIEW_OWN_STUDENT_SELECTION = 'VIEW_OWN_STUDENT_SELECTION',
  VIEW_STUDENT_SELECTION_DETAIL = 'VIEW_STUDENT_SELECTION_DETAIL',
  VIEW_STUDENT_SELECTION_LIST = 'VIEW_STUDENT_SELECTION_LIST',
  UPDATE_STUDENT_SELECTION = 'UPDATE_STUDENT_SELECTION',
  UPDATE_STUDENT_SELECTION_STATUS = 'UPDATE_STUDENT_SELECTION_STATUS',
  UPDATE_STUDENT_SELECTION_AS_LECTURER = 'UPDATE_STUDENT_SELECTION_AS_LECTURER',
  UPDATE_OWN_STUDENT_SELECTION_STATUS = 'UPDATE_OWN_STUDENT_SELECTION_STATUS',
  DELETE_OWN_STUDENT_SELECTION = 'DELETE_OWN_STUDENT_SELECTION',
  DELETE_STUDENT_SELECTION = 'DELETE_STUDENT_SELECTION',
  CREATE_PROJECT_ALLOCATION = 'CREATE_PROJECT_ALLOCATION',
  VIEW_PROJECT_ALLOCATION_LIST = 'VIEW_PROJECT_ALLOCATION_LIST',
  VIEW_PROJECT_ALLOCATION_DETAIL = 'VIEW_PROJECT_ALLOCATION_DETAIL',
  VIEW_PROJECT_ALLOCATION_RECOMMENDATIONS = 'VIEW_PROJECT_ALLOCATION_RECOMMENDATIONS',
  UPDATE_PROJECT_ALLOCATION = 'UPDATE_PROJECT_ALLOCATION',
  DELETE_PROJECT_ALLOCATION = 'DELETE_PROJECT_ALLOCATION',
  VIEW_PROJECT_ALLOCATION_RECOMMENDATION = 'VIEW_PROJECT_ALLOCATION_RECOMMENDATION',
}

/**
 * Permission Groups
 * Group related permissions together for better organization and management
 */
export const PermissionGroups = {
  PROPOSAL: {
    VIEW: PermissionT.VIEW_PROPOSALS,
    CREATE: PermissionT.CREATE_PROPOSAL,
    EDIT: PermissionT.EDIT_PROPOSAL,
    APPROVE: PermissionT.APPROVE_PROPOSAL,
    REJECT: PermissionT.REJECT_PROPOSAL,
  },
  OUTLINE: {
    VIEW: PermissionT.VIEW_OUTLINES,
    CREATE: PermissionT.CREATE_OUTLINE,
    EDIT: PermissionT.EDIT_OUTLINE,
    APPROVE: PermissionT.APPROVE_OUTLINE,
    LOCK: PermissionT.LOCK_OUTLINE,
  },
  COMMITTEE: {
    CREATE: PermissionT.CREATE_COMMITTEE,
    MANAGE: PermissionT.MANAGE_COMMITTEE,
  },
  SCORE: {
    VIEW: PermissionT.VIEW_SCORES,
    EDIT: PermissionT.EDIT_SCORES,
    EXPORT: PermissionT.EXPORT_SCORES,
  },
  ASSIGNMENT: {
    VIEW: PermissionT.VIEW_ASSIGNMENTS,
    ASSIGN: PermissionT.ASSIGN_ADVISOR,
  },
  USER: {
    VIEW: PermissionT.VIEW_USERS,
    MANAGE: PermissionT.MANAGE_USERS,
    EDIT: PermissionT.EDIT_USERS,
    DELETE: PermissionT.DELETE_USERS,
  },
  FACULTY: {
    VIEW: PermissionT.VIEW_FACULTY,
    MANAGE: PermissionT.MANAGE_FACULTY,
    MANAGE_ROLES: PermissionT.MANAGE_FACULTY_ROLES,
  },
  STUDENT: {
    VIEW: PermissionT.VIEW_STUDENT,
    MANAGE: PermissionT.MANAGE_STUDENT,
  },
  FILE: {
    VIEW: PermissionT.VIEW_FILES,
    MANAGE: PermissionT.MANAGE_FILES,
  },
  // --- Lecturer Selection Group ---
  LECTURER_SELECTION: {
    CREATE: PermissionT.CREATE_LECTURER_SELECTION,
    VIEW_LIST: PermissionT.VIEW_LECTURER_SELECTION_LIST,
    VIEW_OWN: PermissionT.VIEW_OWN_LECTURER_SELECTION,
    VIEW_DETAIL: PermissionT.VIEW_LECTURER_SELECTION_DETAIL,
    UPDATE: PermissionT.UPDATE_LECTURER_SELECTION,
    UPDATE_STATUS: PermissionT.UPDATE_LECTURER_SELECTION_STATUS,
    DELETE: PermissionT.DELETE_LECTURER_SELECTION,
  },
};

/**
 * Role Permissions Mapping
 * Maps each role to its allowed permissions
 */
export const RolePermissions = {
  ADMIN: [
    PermissionGroups.PROPOSAL.VIEW,
    PermissionGroups.PROPOSAL.CREATE,
    PermissionGroups.PROPOSAL.EDIT,
    PermissionGroups.PROPOSAL.APPROVE,
    PermissionGroups.PROPOSAL.REJECT,
    PermissionGroups.ASSIGNMENT.VIEW,
    PermissionGroups.ASSIGNMENT.ASSIGN,
    PermissionGroups.OUTLINE.VIEW,
    PermissionGroups.OUTLINE.CREATE,
    PermissionGroups.OUTLINE.EDIT,
    PermissionGroups.OUTLINE.APPROVE,
    PermissionGroups.OUTLINE.LOCK,
    PermissionGroups.COMMITTEE.CREATE,
    PermissionGroups.COMMITTEE.MANAGE,
    PermissionGroups.SCORE.VIEW,
    PermissionGroups.SCORE.EDIT,
    PermissionGroups.SCORE.EXPORT,
    PermissionGroups.USER.VIEW,
    PermissionGroups.USER.MANAGE,
    PermissionGroups.USER.EDIT,
    PermissionGroups.USER.DELETE,
    PermissionGroups.FACULTY.VIEW,
    PermissionGroups.FACULTY.MANAGE,
    PermissionGroups.FACULTY.MANAGE_ROLES,
    PermissionGroups.STUDENT.VIEW,
    PermissionGroups.STUDENT.MANAGE,
    PermissionGroups.FILE.VIEW,
    PermissionGroups.FILE.MANAGE,
    PermissionGroups.LECTURER_SELECTION.CREATE,
    PermissionGroups.LECTURER_SELECTION.VIEW_LIST,
    PermissionGroups.LECTURER_SELECTION.VIEW_OWN,
    PermissionGroups.LECTURER_SELECTION.VIEW_DETAIL,
    PermissionGroups.LECTURER_SELECTION.UPDATE,
    PermissionGroups.LECTURER_SELECTION.UPDATE_STATUS,
    PermissionGroups.LECTURER_SELECTION.DELETE,
  ],
  DEAN: [
    PermissionGroups.PROPOSAL.VIEW,
    PermissionGroups.PROPOSAL.APPROVE,
    PermissionGroups.PROPOSAL.REJECT,
    PermissionGroups.ASSIGNMENT.ASSIGN,
    PermissionGroups.ASSIGNMENT.VIEW,
    PermissionGroups.OUTLINE.VIEW,
    PermissionGroups.OUTLINE.APPROVE,
    PermissionGroups.OUTLINE.LOCK,
    PermissionGroups.COMMITTEE.CREATE,
    PermissionGroups.COMMITTEE.MANAGE,
    PermissionGroups.SCORE.VIEW,
    PermissionGroups.SCORE.EDIT,
    PermissionGroups.SCORE.EXPORT,
    PermissionGroups.FILE.VIEW,
    PermissionGroups.FILE.MANAGE,
    PermissionGroups.LECTURER_SELECTION.VIEW_LIST,
    PermissionGroups.LECTURER_SELECTION.VIEW_DETAIL,
    PermissionGroups.LECTURER_SELECTION.UPDATE_STATUS,
    PermissionGroups.LECTURER_SELECTION.VIEW_OWN,
  ],
  DEPARTMENT_HEAD: [
    PermissionGroups.PROPOSAL.VIEW,
    PermissionGroups.PROPOSAL.APPROVE,
    PermissionGroups.PROPOSAL.REJECT,
    PermissionGroups.ASSIGNMENT.VIEW,
    PermissionGroups.OUTLINE.VIEW,
    PermissionGroups.OUTLINE.APPROVE,
    PermissionGroups.SCORE.VIEW,
    PermissionGroups.FILE.VIEW,
    PermissionGroups.FILE.MANAGE,
    PermissionGroups.LECTURER_SELECTION.VIEW_LIST,
    PermissionGroups.LECTURER_SELECTION.VIEW_DETAIL,
    PermissionGroups.LECTURER_SELECTION.UPDATE_STATUS,
    PermissionGroups.LECTURER_SELECTION.VIEW_OWN,
  ],
  HEAD: [
    PermissionGroups.PROPOSAL.VIEW,
    PermissionGroups.PROPOSAL.APPROVE,
    PermissionGroups.PROPOSAL.REJECT,
    PermissionGroups.ASSIGNMENT.VIEW,
    PermissionGroups.OUTLINE.VIEW,
    PermissionGroups.OUTLINE.APPROVE,
    PermissionGroups.SCORE.VIEW,
    PermissionGroups.FILE.VIEW,
    PermissionGroups.FILE.MANAGE,
    PermissionGroups.LECTURER_SELECTION.VIEW_LIST,
    PermissionGroups.LECTURER_SELECTION.VIEW_DETAIL,
    PermissionGroups.LECTURER_SELECTION.UPDATE_STATUS,
    PermissionGroups.LECTURER_SELECTION.VIEW_OWN,
  ],
  ADVISOR: [
    PermissionGroups.PROPOSAL.VIEW,
    PermissionGroups.ASSIGNMENT.VIEW,
    PermissionGroups.OUTLINE.VIEW,
    PermissionGroups.OUTLINE.EDIT,
    PermissionGroups.SCORE.VIEW,
    PermissionGroups.FILE.VIEW,
    PermissionGroups.LECTURER_SELECTION.VIEW_LIST,
  ],
  REVIEWER: [
    PermissionGroups.OUTLINE.VIEW,
    PermissionGroups.SCORE.VIEW,
    PermissionGroups.SCORE.EDIT,
    PermissionGroups.FILE.VIEW,
  ],
  SECRETARY: [
    PermissionGroups.SCORE.VIEW,
    PermissionGroups.SCORE.EDIT,
    PermissionGroups.SCORE.EXPORT,
    PermissionGroups.FILE.VIEW,
  ],
  LECTURER: [
    PermissionGroups.PROPOSAL.VIEW,
    PermissionGroups.ASSIGNMENT.VIEW,
    PermissionGroups.OUTLINE.VIEW,
    PermissionGroups.FILE.VIEW,
    PermissionGroups.LECTURER_SELECTION.CREATE,
    PermissionGroups.LECTURER_SELECTION.VIEW_LIST,
    PermissionGroups.LECTURER_SELECTION.VIEW_OWN,
    PermissionGroups.LECTURER_SELECTION.VIEW_DETAIL,
    PermissionGroups.LECTURER_SELECTION.UPDATE,
    PermissionGroups.LECTURER_SELECTION.DELETE,
  ],
  STUDENT: [
    PermissionGroups.PROPOSAL.CREATE,
    PermissionGroups.PROPOSAL.EDIT,
    PermissionGroups.OUTLINE.VIEW,
    PermissionGroups.OUTLINE.CREATE,
    PermissionGroups.OUTLINE.EDIT,
    PermissionGroups.SCORE.VIEW,
    PermissionGroups.FILE.VIEW,
    PermissionGroups.LECTURER_SELECTION.VIEW_LIST,
  ],
};

/**
 * Helper function to get permissions for a role
 * @param role - The role to get permissions for
 * @returns Array of permissions for the role
 */
export const getPermissionsForRole = (role: string): PermissionT[] => {
  const roleKey = role === 'STUDENT_ROLE' ? 'STUDENT' : role;
  return RolePermissions[roleKey] || [];
};

/**
 * Helper function to get permissions for multiple roles
 * @param roles - Array of roles to get permissions for
 * @returns Array of unique permissions for all roles
 */
export const getPermissionsForRoles = (roles: string[]): PermissionT[] => {
  const permissions = roles.flatMap((role) => {
    const roleKey = role === 'STUDENT_ROLE' ? 'STUDENT' : role;
    return RolePermissions[roleKey] || [];
  });
  return [...new Set(permissions)]; // Remove duplicates
};

/**
 * Helper function to check if a role has a specific permission
 * @param role - The role to check
 * @param permission - The permission to check for
 * @returns Boolean indicating if the role has the permission
 */
export const roleHasPermission = (
  role: string,
  permission: PermissionT,
): boolean => {
  const roleKey = role === 'STUDENT_ROLE' ? 'STUDENT' : role;
  return RolePermissions[roleKey]?.includes(permission) || false;
};

/**
 * Helper function to check if any of the roles have a specific permission
 * @param roles - Array of roles to check
 * @param permission - The permission to check for
 * @returns Boolean indicating if any role has the permission
 */
export const rolesHavePermission = (
  roles: string[],
  permission: PermissionT,
): boolean => {
  const userPermissions = getPermissionsForRoles(roles);
  return userPermissions.includes(permission);
};
