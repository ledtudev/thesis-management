import api from '@/lib/axios';
import { ApiResponse } from '@/state/api.interface';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Enums
export enum StudentSelectionStatusT {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum LecturerSelectionStatusT {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ProjectAllocationStatusT {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// Basic Types
export interface BasicStudent {
  id: string;
  fullName: string;
  studentCode: string;
  email: string;
  profilePicture?: string;
  Department?: {
    id: string;
    name: string;
  };
}

export interface BasicFaculty {
  id: string;
  fullName: string;
  facultyCode?: string;
  email: string;
  profilePicture?: string;
  Department?: {
    id: string;
    name: string;
  };
}

export interface FieldPool {
  id: string;
  name: string;
  description?: string;
}

// Student Selection Types
export interface StudentSelection {
  id: string;
  priority: number;
  topicTitle?: string | null;
  description?: string | null;
  status: StudentSelectionStatusT;
  createdAt: string;
  updatedAt?: string;
  studentId: string;
  lecturerId?: string | null;
  fieldPoolId?: string | null;
  student?: BasicStudent;
  lecturer?: BasicFaculty;
  fieldPool?: FieldPool;
}

// Lecturer Selection Types
export interface LecturerSelection {
  id: string;
  lecturerId: string;
  fieldPoolId?: string | null;
  capacity: number;
  currentCapacity: number;
  status: LecturerSelectionStatusT;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  departmentName?: string;
  Lecturer?: BasicFaculty;
  FieldPool?: FieldPool;
}

// Project Allocation Types
export interface ProjectAllocation {
  id: string;
  topicTitle: string;
  status: ProjectAllocationStatusT;
  allocatedAt?: string;
  createdAt: string;
  updatedAt?: string;
  studentId: string;
  lecturerId: string;
  createdById: string;
  student?: BasicStudent;
  lecturer?: BasicFaculty;
  createdBy?: BasicFaculty;
}

// DTOs for Student Selections
export interface UpdateStudentSelectionStatusDto {
  status: StudentSelectionStatusT;
  comment?: string;
}

export interface BulkUpdateStudentSelectionsDto {
  selectionIds: string[];
  status: StudentSelectionStatusT;
  comment?: string;
}

// DTOs for Lecturer Selections
export interface CreateLecturerSelectionDto {
  capacity: number;
  fieldPoolId?: string;
  isActive?: boolean;
}

export interface UpdateLecturerSelectionDto {
  capacity?: number;
  isActive?: boolean;
  status?: LecturerSelectionStatusT;
  isDeleted?: boolean;
}

export interface UpdateLecturerSelectionStatusDto {
  status: LecturerSelectionStatusT;
  comment?: string;
}

export interface BulkUpdateLecturerSelectionsDto {
  selectionIds: string[];
  status: LecturerSelectionStatusT;
  comment?: string;
}

// DTOs for Project Allocations
export interface CreateProjectAllocationDto {
  topicTitle: string;
  studentId: string;
  lecturerId: string;
}

export interface UpdateProjectAllocationDto {
  topicTitle?: string;
  lecturerId?: string;
}

export interface UpdateProjectAllocationStatusDto {
  status: ProjectAllocationStatusT;
}

export interface BulkUpdateProjectAllocationStatusDto {
  ids: string[];
  status: ProjectAllocationStatusT;
  createProposals?: boolean;
}

export interface BulkCreateProjectAllocationsDto {
  allocations: CreateProjectAllocationDto[];
}

export interface AutoAllocateDto {
  departmentId?: string;
  maxStudentsPerLecturer?: number;
  fieldPoolId?: string;
}

// Query Parameters
export interface EnrollmentQueryParams {
  page?: number;
  limit?: number;
  keyword?: string;
  departmentId?: string;
  fieldPoolId?: string;
  status?: string;
  orderBy?: string;
  asc?: 'asc' | 'desc';
}

export interface StudentSelectionQueryParams extends EnrollmentQueryParams {
  lecturerId?: string;
  studentId?: string;
  priority?: number;
}

export interface LecturerSelectionQueryParams extends EnrollmentQueryParams {
  lecturerId?: string;
  isActive?: boolean;
}

export interface ProjectAllocationQueryParams extends EnrollmentQueryParams {
  studentId?: string;
  lecturerId?: string;
}

// Recommendation Types
export interface AllocationRecommendation {
  studentId: string;
  lecturerId: string;
  topicTitle: string;
  score: number;
  reasons: string[];
  student: BasicStudent;
  lecturer: BasicFaculty;
}

export interface RecommendationExportParams {
  format?: 'json' | 'excel';
  departmentId?: string;
  maxStudentsPerLecturer?: number;
}

// Statistics Types
export interface EnrollmentStatistics {
  totalStudents: number;
  totalLecturers: number;
  totalSelections: number;
  totalAllocations: number;
  pendingStudentSelections: number;
  approvedStudentSelections: number;
  rejectedStudentSelections: number;
  pendingLecturerSelections: number;
  approvedLecturerSelections: number;
  rejectedLecturerSelections: number;
  pendingAllocations: number;
  approvedAllocations: number;
  rejectedAllocations: number;
  allocationRate: number;
  averageSelectionsPerStudent: number;
  averageCapacityPerLecturer: number;
}

// API Functions
const enrollmentApi = {
  // Student Selections
  getStudentSelections: (params: StudentSelectionQueryParams) =>
    api.get<ApiResponse<StudentSelection[]>>('/student-selection', { params }),

  updateStudentSelectionStatus: (
    id: string,
    dto: UpdateStudentSelectionStatusDto,
  ) =>
    api.patch<ApiResponse<StudentSelection>>(
      `/student-selection/${id}/status`,
      dto,
    ),

  bulkUpdateStudentSelectionStatus: (dto: BulkUpdateStudentSelectionsDto) =>
    api.patch<ApiResponse<any>>('/student-selection/bulk-status', dto),

  // Lecturer Selections
  getLecturerSelections: (params: LecturerSelectionQueryParams) =>
    api.get<ApiResponse<LecturerSelection[]>>('/lecturer-selections', {
      params,
    }),

  createLecturerSelection: (dto: CreateLecturerSelectionDto) =>
    api.post<ApiResponse<LecturerSelection>>('/lecturer-selections', dto),

  updateLecturerSelection: (id: string, dto: UpdateLecturerSelectionDto) =>
    api.patch<ApiResponse<LecturerSelection>>(
      `/lecturer-selections/${id}`,
      dto,
    ),

  updateLecturerSelectionStatus: (
    id: string,
    dto: UpdateLecturerSelectionStatusDto,
  ) =>
    api.patch<ApiResponse<LecturerSelection>>(
      `/lecturer-selections/${id}/status`,
      dto,
    ),

  deleteLecturerSelection: (id: string) =>
    api.delete<ApiResponse<any>>(`/lecturer-selections/${id}/dean`),

  // Project Allocations
  getProjectAllocations: (params: ProjectAllocationQueryParams) =>
    api.get<ApiResponse<ProjectAllocation[]>>('/project-allocations', {
      params,
    }),

  createProjectAllocation: (dto: CreateProjectAllocationDto) =>
    api.post<ApiResponse<ProjectAllocation>>('/project-allocations', dto),

  updateProjectAllocation: (id: string, dto: UpdateProjectAllocationDto) =>
    api.patch<ApiResponse<ProjectAllocation>>(
      `/project-allocations/${id}`,
      dto,
    ),

  updateProjectAllocationStatus: (
    id: string,
    dto: UpdateProjectAllocationStatusDto,
  ) =>
    api.patch<ApiResponse<ProjectAllocation>>(
      `/project-allocations/${id}/status`,
      dto,
    ),

  bulkUpdateProjectAllocationStatus: (
    dto: BulkUpdateProjectAllocationStatusDto,
  ) => api.patch<ApiResponse<any>>('/project-allocations/bulk-status', dto),

  deleteProjectAllocation: (id: string) =>
    api.delete<ApiResponse<any>>(`/project-allocations/${id}`),

  // Bulk Operations
  bulkCreateProjectAllocations: (dto: BulkCreateProjectAllocationsDto) =>
    api.post<ApiResponse<ProjectAllocation[]>>(
      '/project-allocations/bulk',
      dto,
    ),

  uploadProjectAllocations: (
    file: File,
    skipExisting = false,
    skipDepartmentCheck = false,
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ApiResponse<any>>('/project-allocations/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { skipExisting, skipDepartmentCheck },
    });
  },

  // Recommendations
  getRecommendations: (params: RecommendationExportParams) =>
    api.get<ApiResponse<AllocationRecommendation[]>>(
      '/project-allocations/recommendations',
      { params },
    ),

  downloadRecommendationsExcel: (params: RecommendationExportParams) =>
    api.get('/project-allocations/recommendations', {
      params: { ...params, format: 'excel' },
      responseType: 'blob',
    }),

  // Auto Allocation
  autoAllocate: (dto: AutoAllocateDto) =>
    api.post<ApiResponse<ProjectAllocation[]>>(
      '/project-allocations/auto-allocate',
      dto,
    ),

  // Statistics
  getEnrollmentStatistics: (params?: { departmentId?: string }) =>
    api.get<ApiResponse<EnrollmentStatistics>>(
      '/project-allocations/statistics',
      { params },
    ),

  // By Student/Lecturer
  getProjectAllocationsByStudent: (
    studentId: string,
    params: EnrollmentQueryParams,
  ) =>
    api.get<ApiResponse<ProjectAllocation[]>>(
      `/project-allocations/student/${studentId}`,
      { params },
    ),

  getProjectAllocationsByLecturer: (
    lecturerId: string,
    params: EnrollmentQueryParams,
  ) =>
    api.get<ApiResponse<ProjectAllocation[]>>(
      `/project-allocations/lecturer/${lecturerId}`,
      { params },
    ),
};

// React Query Hooks
export const enrollmentHooks = {
  // Student Selections
  useStudentSelections: (params: StudentSelectionQueryParams) =>
    useQuery({
      queryKey: ['studentSelections', params],
      queryFn: () => enrollmentApi.getStudentSelections(params),
      select: (response) => response,
    }),

  useUpdateStudentSelectionStatus: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({
        id,
        dto,
      }: {
        id: string;
        dto: UpdateStudentSelectionStatusDto;
      }) => enrollmentApi.updateStudentSelectionStatus(id, dto),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['studentSelections'] });
        queryClient.invalidateQueries({ queryKey: ['enrollmentStatistics'] });
      },
    });
  },

  useBulkUpdateStudentSelectionStatus: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: enrollmentApi.bulkUpdateStudentSelectionStatus,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['studentSelections'] });
        queryClient.invalidateQueries({ queryKey: ['enrollmentStatistics'] });
      },
    });
  },

  // Lecturer Selections
  useLecturerSelections: (params: LecturerSelectionQueryParams) =>
    useQuery({
      queryKey: ['lecturerSelections', params],
      queryFn: () => enrollmentApi.getLecturerSelections(params),
      select: (response) => response?.data?.data || [],
    }),

  useUpdateLecturerSelectionStatus: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({
        id,
        dto,
      }: {
        id: string;
        dto: UpdateLecturerSelectionStatusDto;
      }) => enrollmentApi.updateLecturerSelectionStatus(id, dto),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lecturerSelections'] });
        queryClient.invalidateQueries({ queryKey: ['enrollmentStatistics'] });
      },
    });
  },

  useBulkUpdateLecturerSelectionStatus: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({
        ids,
        status,
      }: {
        ids: string[];
        status: LecturerSelectionStatusT;
      }) =>
        Promise.all(
          ids.map((id) =>
            enrollmentApi.updateLecturerSelectionStatus(id, { status }),
          ),
        ),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lecturer-selections'] });
      },
    });
  },

  // Project Allocations
  useProjectAllocations: (params: ProjectAllocationQueryParams) =>
    useQuery({
      queryKey: ['projectAllocations', params],
      queryFn: () => enrollmentApi.getProjectAllocations(params),
      select: (response) => response?.data?.data || [],
    }),

  useCreateProjectAllocation: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: enrollmentApi.createProjectAllocation,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projectAllocations'] });
        queryClient.invalidateQueries({ queryKey: ['enrollmentStatistics'] });
      },
    });
  },

  useUpdateProjectAllocation: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({
        id,
        dto,
      }: {
        id: string;
        dto: UpdateProjectAllocationDto;
      }) => enrollmentApi.updateProjectAllocation(id, dto),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projectAllocations'] });
      },
    });
  },

  useUpdateProjectAllocationStatus: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({
        id,
        dto,
      }: {
        id: string;
        dto: UpdateProjectAllocationStatusDto;
      }) => enrollmentApi.updateProjectAllocationStatus(id, dto),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projectAllocations'] });
        queryClient.invalidateQueries({ queryKey: ['enrollmentStatistics'] });
      },
    });
  },

  useBulkUpdateProjectAllocationStatus: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: enrollmentApi.bulkUpdateProjectAllocationStatus,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projectAllocations'] });
        queryClient.invalidateQueries({ queryKey: ['enrollmentStatistics'] });
      },
    });
  },

  useBulkCreateProjectAllocations: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: enrollmentApi.bulkCreateProjectAllocations,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projectAllocations'] });
        queryClient.invalidateQueries({ queryKey: ['enrollmentStatistics'] });
      },
    });
  },

  useDeleteProjectAllocation: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: enrollmentApi.deleteProjectAllocation,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projectAllocations'] });
        queryClient.invalidateQueries({ queryKey: ['enrollmentStatistics'] });
      },
    });
  },

  // Recommendations
  useRecommendations: (params: RecommendationExportParams) =>
    useQuery({
      queryKey: ['allocationRecommendations', params],
      queryFn: () => enrollmentApi.getRecommendations(params),
      select: (response) => response?.data || { data: [] },
    }),

  useAutoAllocate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: enrollmentApi.autoAllocate,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projectAllocations'] });
        queryClient.invalidateQueries({ queryKey: ['enrollmentStatistics'] });
      },
    });
  },

  // Statistics
  useEnrollmentStatistics: (params?: { departmentId?: string }) =>
    useQuery({
      queryKey: ['enrollmentStatistics', params],
      queryFn: () => enrollmentApi.getEnrollmentStatistics(params),
      select: (response) => response?.data?.data || null,
    }),

  // File Operations
  useUploadProjectAllocations: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({
        file,
        skipExisting = false,
        skipDepartmentCheck = false,
      }: {
        file: File;
        skipExisting?: boolean;
        skipDepartmentCheck?: boolean;
      }) =>
        enrollmentApi.uploadProjectAllocations(
          file,
          skipExisting,
          skipDepartmentCheck,
        ),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projectAllocations'] });
        queryClient.invalidateQueries({ queryKey: ['enrollmentStatistics'] });
      },
    });
  },

  useDownloadRecommendations: () => {
    return useMutation({
      mutationFn: enrollmentApi.downloadRecommendationsExcel,
    });
  },

  // Export
  useExportAllocations: () => {
    return useMutation({
      mutationFn: enrollmentApi.downloadRecommendationsExcel,
    });
  },
};

export default enrollmentHooks;
