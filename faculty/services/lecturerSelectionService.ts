import api from '@/lib/axios';
import { ApiResponse } from '@/state/api.interface';
import { useAuthStore } from '@/state/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Types
export enum LecturerSelectionStatusT {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

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
  Lecturer?: { id: string; fullName: string };
}

export interface CreateLecturerSelectionDto {
  fieldPoolId?: string | null;
  capacity: number;
}

export interface UpdateLecturerSelectionDto {
  capacity?: number;
  isActive?: boolean;
  fieldPoolId?: string | null;
}

export interface UpdateLecturerSelectionStatusDto {
  status: LecturerSelectionStatusT;
  comment?: string | null;
}

export interface LecturerSelectionFilter {
  status?: LecturerSelectionStatusT;
  isActive?: boolean;
  keyword?: string;
  page?: number;
  limit?: number;
}

export interface Lecturer {
  id: string;
  fullName: string;
  facultyCode?: string;
  departmentId?: string;
  Department?: { id: string; name: string };
}

export interface LecturerPreferencesQueryParams {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: LecturerSelectionStatusT;
  departmentId?: string;
  fieldPoolId?: string;
  isActive?: boolean;
  orderBy?: string;
  asc?: 'asc' | 'desc';
}

// API calls
const fetchMyLecturerSelections = (filters?: LecturerSelectionFilter) => {
  const { user } = useAuthStore.getState();
  return api.get<ApiResponse<LecturerSelection[]>>('/lecturer-selections', {
    params: { ...filters, lecturerId: user?.id },
  });
};

const fetchLecturerSelectionById = (id: string) =>
  api.get<ApiResponse<LecturerSelection>>(`/lecturer-selections/${id}`);

const fetchLecturerSelectionsByFieldPool = (
  fieldPoolId: string,
  filters?: LecturerSelectionFilter,
) =>
  api.get<ApiResponse<LecturerSelection[]>>('/lecturer-selections', {
    params: { ...filters, fieldPoolId },
  });

const fetchLecturerPreferences = (params: LecturerPreferencesQueryParams) =>
  api.get<ApiResponse<LecturerSelection[]>>('/lecturer-selections', { params });

const createLecturerSelection = (data: CreateLecturerSelectionDto) =>
  api.post<ApiResponse<LecturerSelection>>('/lecturer-selections', data);

const updateLecturerSelection = (
  id: string,
  data: UpdateLecturerSelectionDto,
) =>
  api.patch<ApiResponse<LecturerSelection>>(`/lecturer-selections/${id}`, data);

const updateLecturerSelectionStatus = (
  id: string,
  data: UpdateLecturerSelectionStatusDto,
) =>
  api.patch<ApiResponse<LecturerSelection>>(
    `/lecturer-selections/${id}/status/owner`,
    data,
  );

const deleteLecturerSelection = (id: string) =>
  api.delete<ApiResponse<null>>(`/lecturer-selections/${id}/owner`);

const fetchLecturersByDepartment = (
  departmentId?: string,
  params?: { keyword?: string; page?: number; limit?: number },
) =>
  api.get<ApiResponse<Lecturer[]>>('/users/lecturers', {
    params: { ...params, departmentId },
  });

// React Query hooks
const useMyLecturerSelections = (filters?: LecturerSelectionFilter) =>
  useQuery({
    queryKey: ['myLecturerSelections', filters],
    queryFn: () => fetchMyLecturerSelections(filters),
  });

const useLecturerSelectionById = (id?: string) =>
  useQuery({
    queryKey: ['lecturerSelection', id],
    queryFn: () => fetchLecturerSelectionById(id || ''),
    enabled: !!id,
  });

const useLecturerSelectionsByFieldPool = (
  fieldPoolId?: string,
  filters?: LecturerSelectionFilter,
) =>
  useQuery({
    queryKey: ['lecturerSelectionsByFieldPool', fieldPoolId, filters],
    queryFn: () =>
      fetchLecturerSelectionsByFieldPool(fieldPoolId || '', filters),
    enabled: !!fieldPoolId,
  });

const useLecturerPreferences = (params: LecturerPreferencesQueryParams) =>
  useQuery({
    queryKey: ['lecturerPreferences', params],
    queryFn: () => fetchLecturerPreferences(params),
  });

const useLecturersByDepartment = (
  departmentId?: string,
  params?: { keyword?: string; page?: number; limit?: number },
) =>
  useQuery({
    queryKey: ['lecturersByDepartment', departmentId, params],
    queryFn: () => fetchLecturersByDepartment(departmentId, params),
    enabled: !!departmentId,
  });

const useCreateLecturerSelection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLecturerSelection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLecturerSelections'] });
      queryClient.invalidateQueries({
        queryKey: ['lecturerSelectionsByFieldPool'],
      });
      queryClient.invalidateQueries({ queryKey: ['lecturerPreferences'] });
    },
  });
};

const useUpdateLecturerSelection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: UpdateLecturerSelectionDto;
    }) => updateLecturerSelection(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['myLecturerSelections'] });
      queryClient.invalidateQueries({ queryKey: ['lecturerSelection', id] });
      queryClient.invalidateQueries({
        queryKey: ['lecturerSelectionsByFieldPool'],
      });
      queryClient.invalidateQueries({ queryKey: ['lecturerPreferences'] });
    },
  });
};

const useUpdateLecturerSelectionStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: UpdateLecturerSelectionStatusDto;
    }) => updateLecturerSelectionStatus(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['myLecturerSelections'] });
      queryClient.invalidateQueries({ queryKey: ['lecturerSelection', id] });
      queryClient.invalidateQueries({ queryKey: ['studentSelections'] });
      queryClient.invalidateQueries({
        queryKey: ['lecturerSelectionsByFieldPool'],
      });
      queryClient.invalidateQueries({ queryKey: ['lecturerPreferences'] });
    },
  });
};

const useDeleteLecturerSelection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLecturerSelection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLecturerSelections'] });
      queryClient.invalidateQueries({
        queryKey: ['lecturerSelectionsByFieldPool'],
      });
      queryClient.invalidateQueries({ queryKey: ['lecturerPreferences'] });
    },
  });
};

export {
  useCreateLecturerSelection,
  useDeleteLecturerSelection,
  useLecturerPreferences,
  useLecturersByDepartment,
  useLecturerSelectionById,
  useLecturerSelectionsByFieldPool,
  useMyLecturerSelections,
  useUpdateLecturerSelection,
  useUpdateLecturerSelectionStatus,
};
