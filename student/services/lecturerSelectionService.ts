import api from '@/lib/axios';
import { ApiResponse } from '@/state/api.interface';
import { useMutation, useQuery } from '@tanstack/react-query';

// Lecturer Selection API calls
const fetchLecturerSelections = (queryParams: FindLecturerSelectionDto) => {
  const filteredParams = Object.fromEntries(
    Object.entries(queryParams).filter(
      ([, value]) => value !== undefined && value !== '',
    ),
  );
  return api.get<ApiResponse<LecturerSelection[]>>('/lecturer-selection', {
    params: filteredParams,
  });
};

const fetchLecturerSelectionDetail = (id: string) => {
  return api.get<ApiResponse<LecturerSelection>>(`/lecturer-selection/${id}`);
};

const createLecturerSelection = (
  lecturerSelection: CreateLecturerSelectionDto,
) => {
  return api.post<ApiResponse<LecturerSelection>>(
    '/lecturer-selection',
    lecturerSelection,
  );
};

const updateLecturerSelection = ({
  id,
  data,
}: {
  id: string;
  data: UpdateLecturerSelectionDto;
}) => {
  return api.patch<ApiResponse<LecturerSelection>>(
    `/lecturer-selection/${id}`,
    data,
  );
};

const deleteLecturerSelection = (id: string) => {
  return api.delete<ApiResponse<null>>(`/lecturer-selection/${id}`);
};

// React Query hooks
const useLecturerSelections = (queryParams: FindLecturerSelectionDto) => {
  return useQuery({
    queryKey: ['lecturerSelections', queryParams],
    queryFn: () => fetchLecturerSelections(queryParams),
  });
};

const useLecturerSelectionDetail = (id?: string) => {
  return useQuery({
    queryKey: ['lecturerSelection', id],
    queryFn: () => fetchLecturerSelectionDetail(id || ''),
    enabled: !!id,
  });
};

const useCreateLecturerSelection = () => {
  return useMutation({
    mutationFn: createLecturerSelection,
  });
};

const useUpdateLecturerSelection = () => {
  return useMutation({
    mutationFn: updateLecturerSelection,
  });
};

const useDeleteLecturerSelection = () => {
  return useMutation({
    mutationFn: deleteLecturerSelection,
  });
};

const useLecturerSelectionsByFieldPool = (fieldPoolId?: string) => {
  return useQuery({
    queryKey: ['lecturerSelectionsByFieldPool', fieldPoolId],
    queryFn: () => fetchLecturerSelections({ fieldPoolId }),
    enabled: !!fieldPoolId,
  });
};

const useLecturerSelectionsByLecturer = (lecturerId?: string) => {
  return useQuery({
    queryKey: ['lecturerSelectionsByLecturer', lecturerId],
    queryFn: () => fetchLecturerSelections({ lecturerId }),
    enabled: !!lecturerId,
  });
};

export {
  useCreateLecturerSelection,
  useDeleteLecturerSelection,
  useLecturerSelectionDetail,
  useLecturerSelections,
  useLecturerSelectionsByFieldPool,
  useLecturerSelectionsByLecturer,
  useUpdateLecturerSelection,
};

// Types
export interface LecturerSelection {
  id?: string;
  position: number;
  studyFieldId: string;
  topicTitle: string;
  description?: string;
  lecturerId: string;
  fieldPoolId: string;
  capacity?: number;
  currentCapacity?: number;
  status?:
    | 'REQUESTED_CHANGES'
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'CONFIRMED';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lecturer?: {
    id: string;
    name: string;
    email: string;
    department?: {
      id: string;
      name: string;
    };
  };
  studyField?: {
    id: string;
    name: string;
  };
}

export interface CreateLecturerSelectionDto {
  position: number;
  studyFieldId: string;
  topicTitle: string;
  description?: string;
  lecturerId: string;
  fieldPoolId: string;
  capacity?: number;
  currentCapacity?: number;
  status?:
    | 'REQUESTED_CHANGES'
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'CONFIRMED';
  isActive?: boolean;
}

export interface UpdateLecturerSelectionDto {
  position?: number;
  studyFieldId?: string;
  topicTitle?: string;
  description?: string;
}

export interface FindLecturerSelectionDto {
  studyFieldId?: string;
  lecturerId?: string;
  fieldPoolId?: string;
  status?:
    | 'REQUESTED_CHANGES'
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'CONFIRMED';
  isActive?: boolean;
  keyword?: string;
  orderBy?: 'createdAt' | 'updatedAt' | 'position';
  asc?: 'asc' | 'desc';
  lecturerIds?: string[];
  studyFieldIds?: string[];
  page?: number;
  limit?: number;
  departmentId?: string;
}
