import api from '@/lib/axios';
import { ApiResponse } from '@/state/api.interface';
import { useQuery } from '@tanstack/react-query';

// Faculty interfaces
export interface Faculty {
  id: string;
  fullName: string;
  email: string;
  facultyCode: string;
  profilePicture?: string;
  rank?: string;
  bio?: string;
  department?: {
    id: string;
    name: string;
  };
  status: string;
  topics?: Array<{
    id: string;
    topicTitle: string;
    capacity?: number;
    currentCapacity?: number;
    description?: string;
  }>;
}

export interface FindFacultyDto {
  fullName?: string;
  departmentId?: string;
  page?: number;
  limit?: number;
  orderBy?: 'fullName' | 'createdAt' | 'email';
  asc?: 'asc' | 'desc';
}

export interface FacultyResponse {
  data: Faculty[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Function to get faculty members from user's department
const fetchFacultiesFromMyDepartment = (
  params: Omit<FindFacultyDto, 'departmentId'> = {},
) => {
  // We don't need to pass departmentId as it will be taken from the request.requester
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== '',
    ),
  );

  return api.get<ApiResponse<FacultyResponse>>('/faculties/same-department', {
    params: filteredParams,
  });
};

// Function to get faculty members for student registration
const fetchFacultiesForStudents = (
  params: Omit<FindFacultyDto, 'departmentId'> = {},
) => {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== '',
    ),
  );

  return api.get<ApiResponse<FacultyResponse>>('/faculties', {
    params: filteredParams,
  });
};

// Function to get faculty by ID
const fetchFacultyById = (id: string) => {
  return api.get<ApiResponse<Faculty>>(`/faculties/${id}`);
};

// React Query hooks
export const useFacultiesFromMyDepartment = (
  params: Omit<FindFacultyDto, 'departmentId'> = {},
) => {
  return useQuery({
    queryKey: ['facultiesFromMyDepartment', params],
    queryFn: () => fetchFacultiesFromMyDepartment(params),
  });
};

// Hook to get faculty members for student registration
export const useFacultiesForStudents = (
  params: Omit<FindFacultyDto, 'departmentId'> = {},
) => {
  return useQuery({
    queryKey: ['facultiesForStudents', params],
    queryFn: () => fetchFacultiesForStudents(params),
  });
};

export const useFacultyById = (id?: string) => {
  return useQuery({
    queryKey: ['faculty', id],
    queryFn: () => fetchFacultyById(id!),
    enabled: !!id,
  });
};
