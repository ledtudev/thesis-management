import api from '@/lib/axios';
import { ApiResponse } from '@/state/api.interface';
import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

// Define interfaces for lecturer topics
export interface LecturerTopic {
  id: string;
  topicTitle: string;
  description?: string | null;
  capacity?: number;
  currentCapacity?: number;
  lecturerId: string;
  fieldPoolId?: string;
  status?: string;
}

export interface Lecturer {
  id: string;
  name: string;
  email: string;
  profilePicture?: string | null;
  bio?: string | null;
  rank?: string;
  department?: {
    id: string;
    name: string;
  };
  topics: LecturerTopic[];
}

// Interface for query parameters
export interface FindLecturerTopicsParams {
  departmentId?: string;
  status?: string;
  isActive?: boolean;
  fieldPoolId?: string;
  keyword?: string;
  page?: number;
  limit?: number;
}

// API functions
const fetchLecturerTopics = (params: FindLecturerTopicsParams = {}) => {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== '',
    ),
  );

  // Use the correct endpoint that returns lecturers with their available topics
  return api.get<ApiResponse<Lecturer[]>>('/lecturers/topics', {
    params: filteredParams,
  });
};

// React Query hooks
export const useLecturerTopics = (params: FindLecturerTopicsParams = {}) => {
  return useQuery<AxiosResponse<ApiResponse<Lecturer[]>>, Error, Lecturer[]>({
    queryKey: ['lecturerTopics', params],
    queryFn: () => fetchLecturerTopics(params),
    select: (response) => {
      // Extract the data from the API response
      return response.data.data || [];
    },
  });
};

// Hook to get all available topics for a specific lecturer
export const useLecturerTopicsByLecturer = (lecturerId?: string) => {
  return useQuery<AxiosResponse<ApiResponse<Lecturer[]>>, Error, Lecturer[]>({
    queryKey: ['lecturerTopics', { lecturerId }],
    queryFn: () => fetchLecturerTopics({}),
    enabled: !!lecturerId,
    select: (response) => {
      return response.data.data || [];
    },
  });
};

// Hook to get topics by department
export const useLecturerTopicsByDepartment = (departmentId?: string) => {
  return useQuery<AxiosResponse<ApiResponse<Lecturer[]>>, Error, Lecturer[]>({
    queryKey: ['lecturerTopics', { departmentId }],
    queryFn: () =>
      fetchLecturerTopics({ ...(departmentId ? { departmentId } : {}) }),
    enabled: !!departmentId,
    select: (response) => {
      return response.data.data || [];
    },
  });
};
