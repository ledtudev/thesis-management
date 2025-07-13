import api from '@/lib/axios';
import { ApiResponse } from '@/state/api.interface';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BasicFaculty, BasicStudent } from './service';

export enum StudentSelectionStatusT {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

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
}

export interface UpdateStudentSelectionStatusByLecturerDto {
  status: StudentSelectionStatusT;
  // comment?: string;
}

// Filters
export interface FindStudentSelectionsByLecturerFilter {
  lecturerId: string;
  status?: StudentSelectionStatusT;
  fieldPoolId?: string;
  topicId?: string;
  keyword?: string;
  page?: number;
  limit?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'priority';
  asc?: 'asc' | 'desc';
}

// API Calls
const getStudentSelectionsForLecturer = (
  filters: FindStudentSelectionsByLecturerFilter,
) => {
  return api.get<ApiResponse<StudentSelection>>(
    '/student-selection',
    {
      params: filters,
    },
  );
};

const updateStudentSelectionStatusByLecturer = (
  selectionId: string,
  dto: UpdateStudentSelectionStatusByLecturerDto,
) => {
  return api.patch<ApiResponse<StudentSelection>>(
    `/student-selection/${selectionId}/status/lecturer`,
    dto,
  );
};

// Service object
export const studentSelectionService = {
  getStudentSelectionsForLecturer,
  updateStudentSelectionStatusByLecturer,
};

// React Query Hooks
const useStudentSelectionsForLecturer = (
  filters: FindStudentSelectionsByLecturerFilter,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ['studentSelectionsForLecturer', filters],
    queryFn: () =>
      studentSelectionService.getStudentSelectionsForLecturer(filters),
    select: (response) => response.data.data,
    enabled:
      options?.enabled !== undefined ? options.enabled : !!filters.lecturerId,
  });
};

const useUpdateStudentSelectionStatusByLecturer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      selectionId: string;
      dto: UpdateStudentSelectionStatusByLecturerDto;
    }) =>
      studentSelectionService.updateStudentSelectionStatusByLecturer(
        params.selectionId,
        params.dto,
      ),
    onSuccess: (data) => {
      // Invalidate queries that display lists of student selections for the lecturer
      queryClient.invalidateQueries({
        queryKey: ['studentSelectionsForLecturer'], // Invalidate all lists for this lecturer
      });

      // Could also invalidate a specific selection if a query for individual selection details exists
      // queryClient.invalidateQueries({ queryKey: ['studentSelection', variables.selectionId] });

      // Potentially, if a lecturer selection (topic) aggregates student count, invalidate that too
      if (data.data.data.lecturerId) {
        // Or if selection links back to a specific LecturerSelection (topic)
        queryClient.invalidateQueries({
          queryKey: ['lecturerSelection', data.data.data.lecturerId],
        });
        queryClient.invalidateQueries({ queryKey: ['myLecturerSelections'] });
      }
    },
  });
};

// Hooks object
export const studentSelectionHooks = {
  useStudentSelectionsForLecturer,
  useUpdateStudentSelectionStatusByLecturer,
};

// Re-export hooks for backward compatibility
export {
  useStudentSelectionsForLecturer,
  useUpdateStudentSelectionStatusByLecturer,
};
