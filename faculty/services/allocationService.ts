import api from '@/lib/axios';
import { ApiResponse } from '@/state/api.interface';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// Types
export interface AllocationQueryParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  keyword?: string;
  departmentId?: string;
  studentId?: string;
  lecturerId?: string;
  status?: string;
  orderBy?:
    | 'allocatedAt'
    | 'createdAt'
    | 'updatedAt'
    | 'topicTitle'
    | 'studentName'
    | 'lecturerName';
  asc?: string;
}

export interface ProjectAllocation {
  id: string;
  topicTitle: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  allocatedAt?: string;
  createdAt: string;
  updatedAt?: string;
  studentId: string;
  lecturerId: string;
  Student?: {
    id: string;
    fullName: string;
    studentCode: string;
    email: string;
    departmentId: string;
    Department?: {
      id: string;
      name: string;
    };
    StudentSelection?: Array<{
      id: string;
      topicTitle: string;
      description?: string;
      priority: number;
    }>;
  };
  Lecturer?: {
    id: string;
    fullName: string;
    email: string;
    departmentId: string;
    Department?: {
      id: string;
      name: string;
    };
    LecturerSelection?: Array<{
      id: string;
      topicTitle: string;
      description?: string;
      priority: number;
      capacity?: number;
      currentCapacity?: number;
      status?: string;
    }>;
  };
}

export interface NewAllocationData {
  studentId: string;
  lecturerId: string;
  topicTitle: string;
}

export interface UpdateAllocationData {
  id: string;
  topicTitle?: string;
  lecturerId?: string;
}

export interface BulkUploadResult {
  count: number;
  skipped?: number;
  errors?: string[];
}

export interface StudentPreference {
  id: string;
  topicTitle: string;
  description?: string;
  priority: number;
}

export interface LecturerPreference {
  id: string;
  topicTitle: string;
  description?: string;
  priority: number;
  capacity?: number;
  currentCapacity?: number;
  status?: string;
}

export interface ImportPreviewData {
  valid: boolean;
  data: ProjectAllocation[];
  errors?: string[];
}

// Add a new interface for bulk status update
export interface BulkUpdateStatusData {
  ids: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createProposals?: boolean;
}

// API calls
const fetchProjectAllocations = (params: AllocationQueryParams = {}) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.searchTerm) queryParams.append('keyword', params.searchTerm);
  if (params.keyword) queryParams.append('keyword', params.keyword);
  if (params.departmentId)
    queryParams.append('departmentId', params.departmentId);
  if (params.studentId) queryParams.append('studentId', params.studentId);
  if (params.lecturerId) queryParams.append('lecturerId', params.lecturerId);
  if (params.status) queryParams.append('status', params.status);
  if (params.orderBy) queryParams.append('orderBy', params.orderBy);
  if (params.asc) queryParams.append('asc', params.asc);

  return api.get<ApiResponse<ProjectAllocation[]>>(
    `/project-allocations?${queryParams.toString()}`,
  );
};

const fetchStudentAllocations = (
  studentId: string,
  params: Omit<AllocationQueryParams, 'studentId'> = {},
) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
  if (params.orderBy) queryParams.append('orderBy', params.orderBy);
  if (params.asc) queryParams.append('asc', params.asc);

  return api.get<ApiResponse<ProjectAllocation>>(
    `/project-allocations/student/${studentId}?${queryParams.toString()}`,
  );
};

const fetchLecturerAllocations = (
  lecturerId: string,
  params: Omit<AllocationQueryParams, 'lecturerId'> = {},
) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
  if (params.orderBy) queryParams.append('orderBy', params.orderBy);
  if (params.asc) queryParams.append('asc', params.asc);

  return api.get<ApiResponse<ProjectAllocation>>(
    `/project-allocations/lecturer/${lecturerId}?${queryParams.toString()}`,
  );
};

const fetchProjectAllocation = (id: string) => {
  return api.get<ApiResponse<ProjectAllocation>>(`/project-allocations/${id}`);
};

const createProjectAllocation = (data: NewAllocationData) => {
  return api.post<ApiResponse<ProjectAllocation>>('/project-allocations', data);
};

const updateProjectAllocation = (
  id: string,
  data: Omit<UpdateAllocationData, 'id'>,
) => {
  return api.patch<ApiResponse<ProjectAllocation>>(
    `/project-allocations/${id}`,
    data,
  );
};

const deleteProjectAllocation = (id: string) => {
  return api.delete<ApiResponse<void>>(`/project-allocations/${id}`);
};

const uploadProjectAllocations = (
  file: File,
  format: 'json' | 'excel' = 'excel',
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('format', format);

  return api.post<ApiResponse<BulkUploadResult>>(
    '/project-allocations/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        skipExisting: true,
      },
    },
  );
};

const previewJsonImport = (file: File) => {
  return new Promise<ImportPreviewData>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        // Validate the JSON structure
        const errors: string[] = [];
        const allocations: ProjectAllocation[] = [];

        if (!Array.isArray(data)) {
          errors.push(
            'Dữ liệu JSON không hợp lệ, phải là một mảng các phân công',
          );
          resolve({ valid: false, data: [], errors });
          return;
        }

        data.forEach((item, index) => {
          if (!item.studentId) {
            errors.push(`Dòng ${index + 1}: Thiếu mã sinh viên`);
          }
          if (!item.lecturerId) {
            errors.push(`Dòng ${index + 1}: Thiếu mã giảng viên`);
          }
          if (!item.topicTitle) {
            errors.push(`Dòng ${index + 1}: Thiếu tiêu đề đề tài`);
          }

          allocations.push(item);
        });

        resolve({
          valid: errors.length === 0,
          data: allocations,
          errors: errors.length > 0 ? errors : undefined,
        });
      } catch (error) {
        resolve({
          valid: false,
          data: [],
          errors: [
            'Không thể đọc file JSON: ' +
              (error instanceof Error ? error.message : String(error)),
          ],
        });
      }
    };
    reader.onerror = () => {
      reject(new Error('Lỗi khi đọc file'));
    };
    reader.readAsText(file);
  });
};

const bulkCreateAllocations = (allocations: NewAllocationData[]) => {
  return api.post<ApiResponse<BulkUploadResult>>('/project-allocations/bulk', {
    allocations,
  });
};

const fetchAllocationRecommendations = (
  departmentId?: string,
  maxStudentsPerLecturer?: number,
  format: 'json' | 'excel' = 'json',
) => {
  const queryParams = new URLSearchParams();
  queryParams.append('format', format);

  if (departmentId) queryParams.append('departmentId', departmentId);
  if (maxStudentsPerLecturer)
    queryParams.append(
      'maxStudentsPerLecturer',
      maxStudentsPerLecturer.toString(),
    );

  // Agregar parámetro por defecto para max estudiantes si no se proporciona
  if (!maxStudentsPerLecturer) {
    queryParams.append('maxStudentsPerLecturer', '5'); // Valor por defecto
  }

  if (format === 'excel') {
    return `${
      api.defaults.baseURL
    }/project-allocations/recommendations?${queryParams.toString()}`;
  }

  console.log(
    `Requesting recommendations with params: ${queryParams.toString()}`,
  );
  return api.get<ApiResponse<ProjectAllocation[]>>(
    `/project-allocations/recommendations?${queryParams.toString()}`,
  );
};

const fetchStudentPreferences = (studentId: string) => {
  return api.get<ApiResponse<StudentPreference[]>>(
    `/student-selections/student/${studentId}`,
  );
};

const fetchLecturerPreferences = (lecturerId: string) => {
  return api.get<ApiResponse<LecturerPreference[]>>(
    `/lecturer-selections/lecturer/${lecturerId}`,
  );
};

// Fix the bulkUpdateStatus function in the API calls section
const bulkUpdateStatus = (data: BulkUpdateStatusData) => {
  return api.patch<ApiResponse<{ updatedCount: number; status: string }>>(
    '/project-allocations/bulk/status',
    data,
  );
};

// Service object
export const allocationService = {
  fetchProjectAllocations,
  fetchStudentAllocations,
  fetchLecturerAllocations,
  fetchProjectAllocation,
  createProjectAllocation,
  updateProjectAllocation,
  deleteProjectAllocation,
  uploadProjectAllocations,
  previewJsonImport,
  bulkCreateAllocations,
  fetchAllocationRecommendations,
  fetchStudentPreferences,
  fetchLecturerPreferences,
  bulkUpdateStatus,
};

// React Query hooks
const useProjectAllocations = (params: AllocationQueryParams = {}) => {
  return useQuery({
    queryKey: ['project-allocations', params],
    queryFn: () => allocationService.fetchProjectAllocations(params),
    select: (response) => {
      const page = response.data.metadata?.page || 1;
      const limit = response.data.metadata?.limit || 10;
      const total = response.data.metadata?.total || 0;
      const totalPages = response.data.metadata?.totalPages || 1;

      return {
        data: response.data.data,
        metadata: {
          page,
          limit,
          total,
          totalPages,
        },
        message: response.data.message,
      };
    },
  });
};

const useStudentAllocations = (
  studentId: string,
  params: Omit<AllocationQueryParams, 'studentId'> = {},
) => {
  return useQuery({
    queryKey: ['student-allocations', studentId, params],
    queryFn: () => allocationService.fetchStudentAllocations(studentId, params),
    select: (response) => {
      const page = response.data.metadata?.page || 1;
      const limit = response.data.metadata?.limit || 10;
      const total = response.data.metadata?.total || 0;
      const totalPages = response.data.metadata?.totalPages || 1;

      return {
        data: response.data.data,
        metadata: {
          page,
          limit,
          total,
          totalPages,
        },
        message: response.data.message,
      };
    },
    enabled: !!studentId,
  });
};

const useLecturerAllocations = (
  lecturerId: string,
  params: Omit<AllocationQueryParams, 'lecturerId'> = {},
) => {
  return useQuery({
    queryKey: ['lecturer-allocations', lecturerId, params],
    queryFn: () =>
      allocationService.fetchLecturerAllocations(lecturerId, params),
    select: (response) => {
      const page = response.data.metadata?.page || 1;
      const limit = response.data.metadata?.limit || 10;
      const total = response.data.metadata?.total || 0;
      const totalPages = response.data.metadata?.totalPages || 1;

      return {
        data: response.data.data,
        metadata: {
          page,
          limit,
          total,
          totalPages,
        },
        message: response.data.message,
      };
    },
    enabled: !!lecturerId,
  });
};

const useProjectAllocation = (id: string) => {
  return useQuery({
    queryKey: ['project-allocation', id],
    queryFn: () => allocationService.fetchProjectAllocation(id),
    select: (response) => response.data.data,
    enabled: !!id,
  });
};

const useCreateProjectAllocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NewAllocationData) =>
      allocationService.createProjectAllocation(data),
    onSuccess: () => {
      toast.success('Đã tạo phân công đề tài thành công');
      queryClient.invalidateQueries({ queryKey: ['project-allocations'] });
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi tạo phân công: ${error.message}`);
    },
  });
};

const useUpdateProjectAllocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateAllocationData) =>
      allocationService.updateProjectAllocation(id, data),
    onSuccess: (_, variables) => {
      toast.success('Đã cập nhật phân công đề tài thành công');
      queryClient.invalidateQueries({ queryKey: ['project-allocations'] });
      queryClient.invalidateQueries({
        queryKey: ['project-allocation', variables.id],
      });
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi cập nhật phân công: ${error.message}`);
    },
  });
};

const useDeleteProjectAllocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => allocationService.deleteProjectAllocation(id),
    onSuccess: () => {
      toast.success('Đã xóa phân công đề tài thành công');
      queryClient.invalidateQueries({ queryKey: ['project-allocations'] });
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi xóa phân công: ${error.message}`);
    },
  });
};

const useBulkCreateProjectAllocations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, format }: { file: File; format: 'json' | 'excel' }) =>
      allocationService.uploadProjectAllocations(file, format),
    onSuccess: (response) => {
      const successCount = response.data.data.count || 0;
      const skippedCount = response.data.data.skipped || 0;

      if (successCount > 0) {
        toast.success(
          `Đã tạo ${successCount} phân công đề tài thành công${
            skippedCount > 0 ? `, bỏ qua ${skippedCount} bản ghi trùng lặp` : ''
          }`,
        );
      } else {
        toast.success(
          `Không có phân công mới nào được tạo${
            skippedCount > 0 ? `, bỏ qua ${skippedCount} bản ghi trùng lặp` : ''
          }`,
        );
      }

      queryClient.invalidateQueries({ queryKey: ['project-allocations'] });
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi tạo phân công hàng loạt: ${error.message}`);
    },
  });
};

const useAllocationRecommendations = (
  departmentId?: string,
  maxStudentsPerLecturer?: number,
) => {
  return useQuery({
    queryKey: [
      'allocation-recommendations',
      departmentId,
      maxStudentsPerLecturer,
    ],
    queryFn: () => {
      // Return a promise that always resolves to an axios response
      const result = allocationService.fetchAllocationRecommendations(
        departmentId,
        maxStudentsPerLecturer,
        'json',
      );
      // Ensure result is a Promise of AxiosResponse
      if (typeof result === 'string') {
        throw new Error('Unexpected string result');
      }
      return result;
    },
    select: (response) => response.data.data,
    enabled: false, // Only run when explicitly requested
    staleTime: 0, // Always consider data stale to force refresh when requested
    gcTime: 60000, // Cache result for 1 minute (formerly cacheTime)
    retry: 3, // Retry failed requests 3 times
  });
};

const getRecommendationsExcelUrl = (
  departmentId?: string,
  maxStudentsPerLecturer?: number,
): string => {
  const result = allocationService.fetchAllocationRecommendations(
    departmentId,
    maxStudentsPerLecturer,
    'excel',
  );
  // Ensure result is a string
  if (typeof result !== 'string') {
    throw new Error('Expected string URL');
  }
  return result;
};

const useStudentPreferences = (studentId: string) => {
  return useQuery({
    queryKey: ['student-preferences', studentId],
    queryFn: () => allocationService.fetchStudentPreferences(studentId),
    select: (response) => response.data.data,
    enabled: !!studentId,
  });
};

const useLecturerPreferences = (lecturerId: string) => {
  return useQuery({
    queryKey: ['lecturer-preferences', lecturerId],
    queryFn: () => allocationService.fetchLecturerPreferences(lecturerId),
    select: (response) => response.data.data,
    enabled: !!lecturerId,
  });
};

const usePreviewJsonImport = (file: File | null) => {
  return useQuery({
    queryKey: ['preview-json-import', file],
    queryFn: () => allocationService.previewJsonImport(file as File),
    enabled: !!file,
  });
};

const useBulkCreateAllocations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (allocations: NewAllocationData[]) =>
      allocationService.bulkCreateAllocations(allocations),
    onSuccess: (response) => {
      const successCount = response.data.data.count || 0;

      if (successCount > 0) {
        toast.success(`Đã tạo ${successCount} phân công đề tài thành công`);
      } else {
        toast.success('Không có phân công mới nào được tạo');
      }

      queryClient.invalidateQueries({ queryKey: ['project-allocations'] });
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi tạo phân công hàng loạt: ${error.message}`);
    },
  });
};

// Add the useBulkUpdateStatus hook implementation
const useBulkUpdateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkUpdateStatusData) =>
      allocationService.bulkUpdateStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-allocations'] });
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi cập nhật trạng thái: ${error.message}`);
    },
  });
};

// Hooks object
export const allocationHooks = {
  useProjectAllocations,
  useStudentAllocations,
  useLecturerAllocations,
  useProjectAllocation,
  useCreateProjectAllocation,
  useUpdateProjectAllocation,
  useDeleteProjectAllocation,
  useBulkCreateProjectAllocations,
  useAllocationRecommendations,
  useStudentPreferences,
  useLecturerPreferences,
  usePreviewJsonImport,
  useBulkCreateAllocations,
  getRecommendationsExcelUrl,
  useBulkUpdateStatus,
};

// Re-export hooks for backward compatibility
export {
  getRecommendationsExcelUrl,
  useAllocationRecommendations,
  useBulkCreateAllocations,
  useBulkCreateProjectAllocations,
  useCreateProjectAllocation,
  useDeleteProjectAllocation,
  useLecturerAllocations,
  useLecturerPreferences,
  usePreviewJsonImport,
  useProjectAllocation,
  useProjectAllocations,
  useStudentAllocations,
  useStudentPreferences,
  useUpdateProjectAllocation,
};
