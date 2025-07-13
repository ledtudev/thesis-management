import api from '@/lib/axios';
import { ApiResponse } from '@/state/api.interface';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Enums
export enum FacultyStatusT {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  RETIRED = 'RETIRED',
  RESIGNED = 'RESIGNED',
  ON_LEAVE = 'ON_LEAVE',
}

export enum FacultyRoleT {
  ADMIN = 'ADMIN',
  DEAN = 'DEAN',
  LECTURER = 'LECTURER',
}

export enum StudentStatusT {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  GRADUATED = 'GRADUATED',
  DROPPED_OUT = 'DROPPED_OUT',
  ON_LEAVE = 'ON_LEAVE',
}

export enum GenderT {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

// Basic Types
export interface FacultyRef {
  id: string;
  name: string;
}

export interface Paging {
  page: number;
  limit: number;
}

export interface ListResponse<T> {
  data: T[];
  paging: Paging;
  total: number;
}

// Faculty Types
export interface Faculty {
  id: string;
  facultyCode: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  status: FacultyStatusT;
  rank?: string;
  profilePicture?: string;
  bio?: string;
  facultyId?: string;
  Faculty?: FacultyRef;
  divisionIds?: string[];
  roles: FacultyRoleT[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateFacultyDto {
  facultyCode: string;
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  bio?: string;
  rank?: string;
  facultyId?: string;
  divisionIds?: string[];
  roles?: FacultyRoleT[];
}

export interface UpdateFacultyDto {
  facultyCode?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  bio?: string;
  rank?: string;
  status?: FacultyStatusT;
  facultyId?: string;
  divisionIds?: string[];
  profilePicture?: string;
}

export interface FindFacultyDto {
  facultyCode?: string;
  fullName?: string;
  email?: string;
  page?: number;
  limit?: number;
  orderBy?: 'fullName' | 'facultyCode' | 'email' | 'createdAt';
  asc?: 'asc' | 'desc';
  facultyId?: string;
  divisionId?: string;
  status?: FacultyStatusT;
  role?: FacultyRoleT;
}

export interface DeanAccountManagementDto {
  facultyId: string;
  action: 'ACTIVATE' | 'DEACTIVATE' | 'RESET_PASSWORD';
  reason?: string;
}

export interface BulkDeanAccountManagementDto {
  facultyIds: string[];
  action: 'ACTIVATE' | 'DEACTIVATE' | 'RESET_PASSWORD';
  reason?: string;
}

export interface AccountManagementResponse {
  success: boolean;
  message: string;
  data?: {
    processed: number;
    total: number;
    failed?: string[];
  };
}

// Student Types
export interface Student {
  id: string;
  studentCode: string;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: GenderT;
  admissionYear?: number;
  graduationYear?: number;
  currentGpa?: number;
  creditsEarned?: number;
  status: StudentStatusT;
  facultyId?: string;
  Faculty?: FacultyRef;
  majorCode?: string;
  programCode?: string;
  bio?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentDto {
  studentCode: string;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: GenderT;
  admissionYear?: number;
  graduationYear?: number;
  facultyId?: string;
  majorCode?: string;
  programCode?: string;
  bio?: string;
}

export interface UpdateStudentDto {
  studentCode?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: GenderT;
  admissionYear?: number;
  graduationYear?: number;
  currentGpa?: number;
  creditsEarned?: number;
  status?: StudentStatusT;
  facultyId?: string;
  majorCode?: string;
  programCode?: string;
  bio?: string;
  profilePicture?: string;
}

export interface FindStudentDto {
  studentCode?: string;
  fullName?: string;
  email?: string;
  page?: number;
  limit?: number;
  orderBy?: 'fullName' | 'studentCode' | 'email' | 'createdAt';
  asc?: 'asc' | 'desc';
  facultyId?: string;
  status?: StudentStatusT;
  majorCode?: string;
}

// API Functions
const userApi = {
  // Faculty APIs
  createFaculty: (dto: CreateFacultyDto) =>
    api.post<ApiResponse<Faculty>>('/faculties', dto),

  getFaculty: (id: string) => api.get<ApiResponse<Faculty>>(`/faculties/${id}`),

  getFaculties: (params: FindFacultyDto) =>
    api.get<ApiResponse<ListResponse<Faculty>>>('/faculties', {
      params,
    }),

  updateFaculty: (id: string, dto: UpdateFacultyDto) =>
    api.patch<ApiResponse<Faculty>>(`/faculties/${id}`, dto),

  deleteFaculty: (id: string) =>
    api.delete<ApiResponse<null>>(`/faculties/${id}`),

  addFacultyRole: (id: string, role: FacultyRoleT) =>
    api.post<ApiResponse<Faculty>>(`/faculties/${id}/roles`, { role }),

  removeFacultyRole: (id: string, role: string) =>
    api.delete<ApiResponse<Faculty>>(`/faculties/${id}/roles/${role}`),

  manageFacultyAccount: (dto: DeanAccountManagementDto) =>
    api.post<ApiResponse<AccountManagementResponse>>(
      '/faculties/manage-account',
      dto,
    ),

  bulkManageFacultyAccounts: (dto: BulkDeanAccountManagementDto) =>
    api.post<ApiResponse<AccountManagementResponse>>(
      '/faculties/bulk-manage-accounts',
      dto,
    ),

  // Student APIs
  createStudent: (dto: CreateStudentDto) =>
    api.post<ApiResponse<Student>>('/students', dto),

  getStudent: (id: string) => api.get<ApiResponse<Student>>(`/students/${id}`),

  getStudents: (params: FindStudentDto) =>
    api.get<ApiResponse<ListResponse<Student>>>('/students', {
      params,
    }),

  updateStudent: (id: string, dto: UpdateStudentDto) =>
    api.patch<ApiResponse<Student>>(`/students/${id}`, dto),

  deleteStudent: (id: string) =>
    api.delete<ApiResponse<null>>(`/students/${id}`),
};

// React Query Hooks
export const userHooks = {
  // Faculty Hooks
  useFaculties: (params: FindFacultyDto = {}) =>
    useQuery({
      queryKey: ['faculties', params],
      queryFn: () => userApi.getFaculties(params),
      select: (response) => response.data.data,
    }),

  // Alias for backward compatibility
  useLecturers: (params: FindFacultyDto = {}) =>
    useQuery({
      queryKey: ['faculties', params],
      queryFn: () => userApi.getFaculties(params),
      select: (response) => response.data.data,
    }),

  useFaculty: (id?: string) =>
    useQuery({
      queryKey: ['faculty', id],
      queryFn: () => userApi.getFaculty(id!),
      select: (response) => response.data.data,
      enabled: !!id,
    }),

  useCreateFaculty: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: userApi.createFaculty,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['faculties'] });
      },
    });
  },

  useUpdateFaculty: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, dto }: { id: string; dto: UpdateFacultyDto }) =>
        userApi.updateFaculty(id, dto),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['faculty', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['faculties'] });
      },
    });
  },

  useDeleteFaculty: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: userApi.deleteFaculty,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['faculties'] });
      },
    });
  },

  useAddFacultyRole: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, role }: { id: string; role: FacultyRoleT }) =>
        userApi.addFacultyRole(id, role),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['faculty', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['faculties'] });
      },
    });
  },

  useRemoveFacultyRole: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, role }: { id: string; role: string }) =>
        userApi.removeFacultyRole(id, role),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['faculty', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['faculties'] });
      },
    });
  },

  useManageFacultyAccount: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: userApi.manageFacultyAccount,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['faculties'] });
      },
    });
  },

  useBulkManageFacultyAccounts: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: userApi.bulkManageFacultyAccounts,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['faculties'] });
      },
    });
  },

  // Student Hooks
  useStudents: (params: FindStudentDto = {}) =>
    useQuery({
      queryKey: ['students', params],
      queryFn: () => userApi.getStudents(params),
      select: (response) => response.data.data,
    }),

  useStudent: (id?: string) =>
    useQuery({
      queryKey: ['student', id],
      queryFn: () => userApi.getStudent(id!),
      select: (response) => response.data.data,
      enabled: !!id,
    }),

  useCreateStudent: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: userApi.createStudent,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['students'] });
      },
    });
  },

  useUpdateStudent: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, dto }: { id: string; dto: UpdateStudentDto }) =>
        userApi.updateStudent(id, dto),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['student', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['students'] });
      },
    });
  },

  useDeleteStudent: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: userApi.deleteStudent,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['students'] });
      },
    });
  },
};

// Legacy exports for backward compatibility
export const userService = userApi;
export const {
  useFaculties: useLecturers,
  useFaculty: useLecturerById,
  useUpdateFaculty: useUpdateLecturerProfile,
  useStudents,
  useStudent: useStudentById,
} = userHooks;
