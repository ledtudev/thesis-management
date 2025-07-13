import api from '@/lib/axios';
import { ApiResponse } from '@/state/api.interface';
import { useMutation, useQuery } from '@tanstack/react-query';

// StudentSelection API interfaces
export enum StudentSelectionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REQUESTED_CHANGES = 'REQUESTED_CHANGES',
  CONFIRMED = 'CONFIRMED',
}

export interface StudentSelection {
  id: string;
  priority: number;
  topicTitle?: string | null;
  description?: string | null;
  status: StudentSelectionStatus;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  lecturerId?: string | null;
  fieldPoolId?: string | null;
  lecturer?: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
    department?: {
      id: string;
      name: string;
    };
  };
  fieldPool?: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };
}

export interface CreateStudentSelectionDto {
  priority: number;
  topicTitle?: string;
  description?: string;
  lecturerId?: string;
  fieldPoolId?: string;
}

export interface UpdateStudentSelectionDto {
  priority?: number;
  topicTitle?: string | null;
  description?: string | null;
  lecturerId?: string | null;
  fieldPoolId?: string | null;
}

export interface FindStudentSelectionDto {
  studentId?: string;
  lecturerId?: string;
  fieldPoolId?: string;
  status?: StudentSelectionStatus;
  priority?: number;
  departmentId?: string;
  keyword?: string;
  orderBy?: 'createdAt' | 'updatedAt' | 'priority' | 'preferredAt';
  asc?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// API response interface
export interface StudentSelectionResponse {
  data: StudentSelection[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API functions
const fetchStudentSelections = (queryParams: FindStudentSelectionDto = {}) => {
  const filteredParams = Object.fromEntries(
    Object.entries(queryParams).filter(
      ([, value]) => value !== undefined && value !== '',
    ),
  );
  return api.get<ApiResponse<StudentSelectionResponse>>('/student-selection', {
    params: filteredParams,
  });
};

//  function to fetch the current student's selections
const fetchMyStudentSelections = (
  queryParams: Omit<FindStudentSelectionDto, 'studentId'> = {},
) => {
  const filteredParams = Object.fromEntries(
    Object.entries(queryParams).filter(
      ([, value]) => value !== undefined && value !== '',
    ),
  );
  return api.get<ApiResponse<StudentSelectionResponse>>(
    '/student-selection/me',
    {
      params: filteredParams,
    },
  );
};

const fetchStudentSelectionById = (id: string) => {
  return api.get<ApiResponse<StudentSelection>>(`/student-selection/${id}`);
};

const createStudentSelection = (data: CreateStudentSelectionDto) => {
  return api.post<ApiResponse<StudentSelection>>('/student-selection', data);
};

const updateStudentSelection = (
  id: string,
  data: UpdateStudentSelectionDto,
) => {
  return api.patch<ApiResponse<StudentSelection>>(
    `/student-selection/${id}`,
    data,
  );
};

const deleteStudentSelection = (id: string) => {
  return api.delete<ApiResponse<null>>(`/student-selection/${id}`);
};

// Function to update a student selection status by the owner (student)
const updateStudentSelectionStatus = (
  id: string,
  status: StudentSelectionStatus,
) => {
  return api.patch<ApiResponse<StudentSelection>>(
    `/student-selection/${id}/status/owner`,
    { status },
  );
};

// React Query hooks
export const useStudentSelections = (
  queryParams: FindStudentSelectionDto = {},
) => {
  return useQuery({
    queryKey: ['studentSelections', queryParams],
    queryFn: () => fetchStudentSelections(queryParams),
  });
};

// New hook to get the current student's selections
export const useMyStudentSelections = (
  queryParams: Omit<FindStudentSelectionDto, 'studentId'> = {},
) => {
  return useQuery({
    queryKey: ['myStudentSelections', queryParams],
    queryFn: () => fetchMyStudentSelections(queryParams),
  });
};

export const useStudentSelectionById = (id?: string) => {
  return useQuery({
    queryKey: ['studentSelection', id],
    queryFn: () => fetchStudentSelectionById(id!),
    enabled: !!id,
  });
};

export const useCreateStudentSelection = () => {
  return useMutation({
    mutationFn: createStudentSelection,
  });
};

export const useUpdateStudentSelection = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateStudentSelectionDto;
    }) => updateStudentSelection(id, data),
  });
};

export const useDeleteStudentSelection = () => {
  return useMutation({
    mutationFn: deleteStudentSelection,
  });
};

export const useUpdateStudentSelectionStatus = () => {
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: StudentSelectionStatus;
    }) => updateStudentSelectionStatus(id, status),
  });
};

// Helper hook to get student selections by field pool
export const useStudentSelectionsByFieldPool = (fieldPoolId?: string) => {
  return useQuery({
    queryKey: ['studentSelectionsByFieldPool', fieldPoolId],
    queryFn: () => fetchStudentSelections({ fieldPoolId }),
    enabled: !!fieldPoolId,
  });
};

// Helper hook to get student selections by lecturer
export const useStudentSelectionsByLecturer = (lecturerId?: string) => {
  return useQuery({
    queryKey: ['studentSelectionsByLecturer', lecturerId],
    queryFn: () => fetchStudentSelections({ lecturerId }),
    enabled: !!lecturerId,
  });
};

// Helper hook to get student selections by student
export const useStudentSelectionsByStudent = (studentId?: string) => {
  return useQuery({
    queryKey: ['studentSelectionsByStudent', studentId],
    queryFn: () => fetchStudentSelections({ studentId }),
    enabled: !!studentId,
  });
};
