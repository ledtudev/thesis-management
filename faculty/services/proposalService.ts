import api from '@/lib/axios';
import { ApiResponse } from '@/state/api.interface';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BasicFaculty, BasicStudent } from './service';
import { openFileInNewTab } from './storageService';

export const ProposalOutlineStatusT = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  REJECTED: 'REJECTED',
  APPROVED: 'APPROVED',
  LOCKED: 'LOCKED',
} as const;

export const ProposedProjectStatusT = {
  TOPIC_SUBMISSION_PENDING: 'TOPIC_SUBMISSION_PENDING',
  TOPIC_PENDING_ADVISOR: 'TOPIC_PENDING_ADVISOR',
  TOPIC_REQUESTED_CHANGES: 'TOPIC_REQUESTED_CHANGES',
  TOPIC_APPROVED: 'TOPIC_APPROVED',
  OUTLINE_PENDING_SUBMISSION: 'OUTLINE_PENDING_SUBMISSION',
  OUTLINE_PENDING_ADVISOR: 'OUTLINE_PENDING_ADVISOR',
  OUTLINE_REQUESTED_CHANGES: 'OUTLINE_REQUESTED_CHANGES',
  OUTLINE_REJECTED: 'OUTLINE_REJECTED',
  OUTLINE_APPROVED: 'OUTLINE_APPROVED',
  PENDING_HEAD: 'PENDING_HEAD',
  REQUESTED_CHANGES_HEAD: 'REQUESTED_CHANGES_HEAD',
  REJECTED_BY_HEAD: 'REJECTED_BY_HEAD',
  APPROVED_BY_HEAD: 'APPROVED_BY_HEAD',
} as const;

// Types
export type ProposalOutlineStatus = keyof typeof ProposalOutlineStatusT;
export type ProposedProjectStatus = keyof typeof ProposedProjectStatusT;

export interface ProposalComment {
  id: string;
  content: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  attachments?: string[];
}

export interface ProposedProjectComment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  proposedProjectId: string;
  commenterStudentId: string | null;
  commenterFacultyId: string | null;
  CommenterStudent?: BasicStudent;
  CommenterFacultyMember?: BasicFaculty;
}

export interface ProposalOutline {
  id?: string;
  introduction?: string;
  objectives?: string;
  methodology?: string;
  expectedResults?: string;
  status?: string;
  fileId?: string;
  updatedAt?: string;
  createdAt?: string;
  proposedProjectId?: string;
  file?: {
    id?: string;
    originalName?: string;
    mimeType?: string;
    fileSize?: number;
  };
}

export interface ProposedProjectMember {
  id?: string;
  proposedProjectId?: string;
  studentId?: string | null;
  facultyMemberId?: string | null;
  role?: string;
  status?: string;
  assignedAt?: string;
  Student?: BasicStudent;
  FacultyMember?: BasicFaculty;
}

export interface FieldPool {
  id: string;
  name: string;
  description: string;
  longDescription?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  registrationDeadline: string;
}

export interface ProjectAllocation {
  id: string;
  topicTitle: string;
  allocatedAt: string;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  createdById: string;
  lecturerId: string;
  version: number;
  status: string;
  isDeleted: boolean;
}

export interface ProposedProject {
  id: string;
  projectAllocationId: string;
  title: string;
  description?: string;
  status: ProposedProjectStatus;
  createdAt: string;
  updatedAt: string;
  proposalDeadline?: string | null;
  topicLockDate?: string | null;
  approvedAt?: string | null;
  approvedById?: string | null;
  createdByStudentId?: string | null;
  createdByFacultyId?: string | null;
  fieldPoolId?: string;
  version?: number;
  proposalOutlineId?: string | null;
  ProposedProjectMember?: ProposedProjectMember[];
  ProposedProjectComment?: ProposedProjectComment[];
  ProjectAllocation?: ProjectAllocation;
  FieldPool?: FieldPool;
  ProposalOutline?: ProposalOutline | null;
}

// Request/Response types
export interface FindProposedProjectDto {
  page?: number;
  limit?: number;
  status?: ProposedProjectStatus | ProposedProjectStatus[];
  lecturerId?: string;
  studentId?: string;
  facultyId?: string;
  fieldPoolId?: string;
  projectAllocationId?: string;
  keyword?: string;
  orderBy?: string;
  asc?: 'asc' | 'desc';
}

export interface UpdateProposedProjectDto {
  title?: string;
  description?: string;
  submitToAdvisor?: boolean;
}

export interface UpdateProposedProjectTitleDto {
  title: string;
  description?: string;
}

export interface SubmitProposalOutlineDto {
  introduction: string;
  objectives: string;
  methodology: string;
  expectedResults: string;
  fileId?: string;
  proposedProjectId: string;
  submitForReview?: boolean;
}

export interface ReviewProposalOutlineDto {
  status: 'APPROVED' | 'REQUESTED_CHANGES' | 'REJECTED';
  comment?: string;
}

export interface ChangeProjectStatusDto {
  status: ProposedProjectStatus;
  comment?: string;
}

export interface BulkStatusUpdateDto {
  projectIds: string[];
  status: ProposedProjectStatus;
  comment?: string;
}

export interface ManageProposedMemberDto {
  studentId: string;
  action: 'add' | 'remove';
  role?: string;
}

export interface FileUploadParams {
  file: File;
  context: string;
  description?: string;
  onProgress?: (progress: number) => void;
}

// Default refetch interval for real-time effect (30 seconds)
export const REAL_TIME_REFETCH_INTERVAL = 30 * 1000;

// API calls
const fetchProposedProjects = (params: FindProposedProjectDto) =>
  api.get<
    ApiResponse<{
      data: ProposedProject[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>
  >('/proposed-projects', { params });

// New API calls for dean and head views
const fetchProposedProjectsByDean = (params: FindProposedProjectDto) =>
  api.get<
    ApiResponse<{
      data: ProposedProject[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>
  >('/proposed-projects/dean', { params });

const fetchProposedProjectsByHead = (params: FindProposedProjectDto) =>
  api.get<
    ApiResponse<{
      data: ProposedProject[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
      divisionInfo?: {
        id: string;
        name: string;
      };
    }>
  >('/proposed-projects/head', { params });

const fetchProposedProject = (id: string) =>
  api.get<ApiResponse<ProposedProject>>(`/proposed-projects/${id}`);

const updateProposedProject = (id: string, data: UpdateProposedProjectDto) =>
  api.put<ApiResponse<ProposedProject>>(`/proposed-projects/${id}`, data);

const updateProposedProjectTitle = (
  id: string,
  data: UpdateProposedProjectTitleDto,
) =>
  api.put<ApiResponse<ProposedProject>>(`/proposed-projects/${id}/title`, data);

const submitProposalOutline = (data: SubmitProposalOutlineDto) =>
  api.post<ApiResponse<ProposalOutline>>('/proposal-outlines', data);

const reviewProposalOutline = (
  outlineId: string,
  data: ReviewProposalOutlineDto,
) =>
  api.put<ApiResponse<ProposalOutline>>(
    `/proposed-projects/outline/${outlineId}/review`,
    data,
  );

const departmentHeadReview = (
  id: string,
  data: { status: ProposedProjectStatus; comment?: string },
) =>
  api.put<ApiResponse<ProposedProject>>(
    `/proposed-projects/${id}/head-review`,
    data,
  );

const finalApproval = (
  id: string,
  data: { status: 'APPROVED_BY_HEAD'; comment?: string },
) =>
  api.put<ApiResponse<ProposedProject>>(
    `/proposed-projects/${id}/final-approval`,
    data,
  );

const changeProposedProjectStatus = (
  id: string,
  data: ChangeProjectStatusDto,
) =>
  api.put<ApiResponse<ProposedProject>>(
    `/proposed-projects/${id}/status`,
    data,
  );

const bulkUpdateStatus = (data: BulkStatusUpdateDto) =>
  api.post<
    ApiResponse<{
      processed: number;
      total: number;
      results: Array<{
        id: string;
        title: string;
        oldStatus: ProposedProjectStatus;
        newStatus: ProposedProjectStatus;
        success: boolean;
      }>;
    }>
  >('/proposed-projects/bulk-status-update', data);

const bulkUpdateStatusByLecturer = (data: BulkStatusUpdateDto) =>
  api.post<
    ApiResponse<{
      processed: number;
      total: number;
      results: Array<{
        id: string;
        title: string;
        oldStatus: ProposedProjectStatus;
        newStatus: ProposedProjectStatus;
        success: boolean;
      }>;
    }>
  >('/proposed-projects/bulk-status-update/lecturer', data);

const bulkUpdateStatusByDepartmentHead = (data: BulkStatusUpdateDto) =>
  api.post<
    ApiResponse<{
      processed: number;
      total: number;
      results: Array<{
        id: string;
        title: string;
        oldStatus: ProposedProjectStatus;
        newStatus: ProposedProjectStatus;
        success: boolean;
      }>;
    }>
  >('/proposed-projects/bulk-status-update/department-head', data);

const bulkUpdateStatusByDean = (data: BulkStatusUpdateDto) =>
  api.post<
    ApiResponse<{
      processed: number;
      total: number;
      results: Array<{
        id: string;
        title: string;
        oldStatus: ProposedProjectStatus;
        newStatus: ProposedProjectStatus;
        success: boolean;
      }>;
    }>
  >('/proposed-projects/bulk-status-update/dean', data);

const fetchProposedProjectComments = (proposedProjectId: string) =>
  api.get<ApiResponse<ProposedProjectComment[]>>('/proposed-project-comments', {
    params: { proposedProjectId },
  });

const createProposedProjectComment = (data: {
  proposedProjectId: string;
  content: string;
}) =>
  api.post<ApiResponse<ProposedProjectComment>>(
    '/proposed-project-comments',
    data,
  );

const manageProposedProjectMembers = (
  id: string,
  data: ManageProposedMemberDto,
) =>
  api.post<ApiResponse<ProposedProjectMember>>(
    `/proposed-projects/${id}/members`,
    data,
  );

const uploadFile = (params: FileUploadParams) => {
  const { file, context, description, onProgress } = params;
  const formData = new FormData();
  formData.append('file', file);
  if (context) formData.append('context', context);
  if (description) formData.append('description', description);

  return api.post<ApiResponse<{ id: string }>>('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        onProgress(percentCompleted);
      }
    },
  });
};

// Fetch proposals waiting for advisor review
const fetchProposalsWaitingForAdvisorReview = (lecturerId?: string) =>
  api.get<
    ApiResponse<{
      data: ProposedProject[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>
  >('/proposed-projects', {
    params: {
      lecturerId,
      status: ['TOPIC_PENDING_ADVISOR', 'OUTLINE_PENDING_ADVISOR'],
      limit: 100, // Get more items for comprehensive view
    },
  });

// Fetch outlines waiting for advisor review
const fetchOutlinesWaitingForReview = (lecturerId?: string) =>
  api.get<
    ApiResponse<{
      data: ProposalOutline[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>
  >('/proposal-outlines', {
    params: {
      lecturerId,
      status: 'PENDING_REVIEW',
      limit: 100,
    },
  });

// Export API service
export const proposalService = {
  fetchProposedProjects,
  fetchProposedProjectsByDean,
  fetchProposedProjectsByHead,
  fetchProposedProject,
  updateProposedProject,
  updateProposedProjectTitle,
  submitProposalOutline,
  reviewProposalOutline,
  departmentHeadReview,
  finalApproval,
  changeProposedProjectStatus,
  bulkUpdateStatus,
  bulkUpdateStatusByLecturer,
  bulkUpdateStatusByDepartmentHead,
  bulkUpdateStatusByDean,
  fetchProposedProjectComments,
  createProposedProjectComment,
  manageProposedProjectMembers,
  uploadFile,
  fetchProposalsWaitingForAdvisorReview,
  fetchOutlinesWaitingForReview,
  openFileInNewTab,
};

// React Query hooks
export const useProposedProjects = (
  params: FindProposedProjectDto = {},
  options = {},
) => {
  return useQuery({
    queryKey: ['proposedProjects', params],
    queryFn: () => proposalService.fetchProposedProjects(params),
    select: (response) => {
      // Correctly extract the nested data structure
      return {
        data: response.data.data.data,
        pagination: response.data.data.pagination,
      };
    },
    ...options,
  });
};

export const useProposedProjectsByDean = (
  params: FindProposedProjectDto = {},
  options = {},
) => {
  return useQuery({
    queryKey: ['proposedProjectsByDean', params],
    queryFn: () => proposalService.fetchProposedProjectsByDean(params),
    select: (response) => {
      return {
        data: response.data.data.data,
        pagination: response.data.data.pagination,
      };
    },
    ...options,
  });
};

export const useProposedProjectsByHead = (
  params: FindProposedProjectDto = {},
  options = {},
) => {
  return useQuery({
    queryKey: ['proposedProjectsByHead', params],
    queryFn: () => proposalService.fetchProposedProjectsByHead(params),
    select: (response) => {
      return {
        data: response.data.data.data,
        pagination: response.data.data.pagination,
        divisionInfo: response.data.data.divisionInfo,
      };
    },
    ...options,
  });
};

export const useLecturerPendingReviews = (
  options = {},
  enableRealtime = true,
  lecturerId?: string,
) => {
  return useQuery({
    queryKey: ['lecturerPendingReviews', lecturerId],
    queryFn: () =>
      proposalService.fetchProposalsWaitingForAdvisorReview(lecturerId),
    select: (response) => {
      // Correctly extract the nested data structure
      return {
        data: response.data.data.data,
        pagination: response.data.data.pagination,
      };
    },
    refetchInterval: enableRealtime ? REAL_TIME_REFETCH_INTERVAL : undefined,
    ...options,
  });
};

export const useOutlinesWaitingForReview = (
  lecturerId?: string,
  enableRealtime = true,
  options = {},
) => {
  return useQuery({
    queryKey: ['outlinesWaitingForReview', lecturerId],
    queryFn: () => proposalService.fetchOutlinesWaitingForReview(lecturerId),
    select: (response) => {
      return {
        data: response.data.data.data,
        pagination: response.data.data.pagination,
      };
    },
    refetchInterval: enableRealtime ? REAL_TIME_REFETCH_INTERVAL : undefined,
    ...options,
  });
};

export const useProposedProject = (
  id: string,
  enableRealtime = false,
  options = {},
) => {
  return useQuery({
    queryKey: ['proposedProject', id],
    queryFn: () => proposalService.fetchProposedProject(id),
    enabled: !!id,

    refetchInterval: enableRealtime ? REAL_TIME_REFETCH_INTERVAL : undefined,
    ...options,
  });
};

export const useUpdateProposedProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      id: string;
      updateData: UpdateProposedProjectDto;
    }) => proposalService.updateProposedProject(params.id, params.updateData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['proposedProject', variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ['proposedProjects'] });
      queryClient.invalidateQueries({ queryKey: ['lecturerPendingReviews'] });
      queryClient.invalidateQueries({ queryKey: ['outlinesWaitingForReview'] });
    },
  });
};

export const useUpdateProposedProjectTitle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; title: string; description?: string }) =>
      proposalService.updateProposedProjectTitle(params.id, {
        title: params.title,
        description: params.description,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['proposedProject', variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ['proposedProjects'] });
      queryClient.invalidateQueries({ queryKey: ['lecturerPendingReviews'] });
    },
  });
};

export const useSubmitProposalOutline = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitProposalOutlineDto) =>
      proposalService.submitProposalOutline(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['proposedProject', variables.proposedProjectId],
      });
      queryClient.invalidateQueries({ queryKey: ['proposedProjects'] });
      queryClient.invalidateQueries({ queryKey: ['outlinesWaitingForReview'] });
    },
  });
};

export const useReviewProposalOutline = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      outlineId: string;
      reviewData: ReviewProposalOutlineDto;
    }) =>
      proposalService.reviewProposalOutline(
        params.outlineId,
        params.reviewData,
      ),
    onSuccess: (response) => {
      // Extract the project ID from the response data if available
      const responseData = response.data;

      // Use type guard to check if the property exists
      if (responseData && typeof responseData === 'object') {
        // Check for any property that might contain the project ID
        const projectId =
          'proposedProjectId' in responseData
            ? (responseData.proposedProjectId as string)
            : 'projectId' in responseData
            ? (responseData.projectId as string)
            : undefined;

        if (projectId) {
          queryClient.invalidateQueries({
            queryKey: ['proposedProject', projectId],
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ['proposedProjects'] });
      queryClient.invalidateQueries({ queryKey: ['lecturerPendingReviews'] });
      queryClient.invalidateQueries({ queryKey: ['outlinesWaitingForReview'] });
    },
  });
};

export const useDepartmentHeadReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      id: string;
      reviewData: { status: ProposedProjectStatus; comment?: string };
    }) => proposalService.departmentHeadReview(params.id, params.reviewData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['proposedProject', variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ['proposedProjects'] });
      queryClient.invalidateQueries({ queryKey: ['lecturerPendingReviews'] });
      queryClient.invalidateQueries({ queryKey: ['outlinesWaitingForReview'] });
    },
  });
};

export const useFinalApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      id: string;
      approvalData: { status: 'APPROVED_BY_HEAD'; comment?: string };
    }) => proposalService.finalApproval(params.id, params.approvalData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['proposedProject', variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ['proposedProjects'] });
      queryClient.invalidateQueries({ queryKey: ['lecturerPendingReviews'] });
      queryClient.invalidateQueries({ queryKey: ['outlinesWaitingForReview'] });
    },
  });
};

export const useChangeProposedProjectStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; statusData: ChangeProjectStatusDto }) =>
      proposalService.changeProposedProjectStatus(params.id, params.statusData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['proposedProject', variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ['proposedProjects'] });
      queryClient.invalidateQueries({ queryKey: ['lecturerPendingReviews'] });
      queryClient.invalidateQueries({ queryKey: ['outlinesWaitingForReview'] });
    },
  });
};

export const useBulkUpdateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkStatusUpdateDto) =>
      proposalService.bulkUpdateStatus(data),
    onSuccess: () => {
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['proposedProjects'] });
      queryClient.invalidateQueries({ queryKey: ['lecturerPendingReviews'] });
      queryClient.invalidateQueries({ queryKey: ['outlinesWaitingForReview'] });
    },
  });
};

export const useBulkUpdateStatusByLecturer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkStatusUpdateDto) =>
      proposalService.bulkUpdateStatusByLecturer(data),
    onSuccess: () => {
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['proposedProjects'] });
      queryClient.invalidateQueries({ queryKey: ['lecturerPendingReviews'] });
      queryClient.invalidateQueries({ queryKey: ['outlinesWaitingForReview'] });
    },
  });
};

export const useBulkUpdateStatusByDepartmentHead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkStatusUpdateDto) =>
      proposalService.bulkUpdateStatusByDepartmentHead(data),
    onSuccess: () => {
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['proposedProjects'] });
      queryClient.invalidateQueries({ queryKey: ['lecturerPendingReviews'] });
      queryClient.invalidateQueries({ queryKey: ['outlinesWaitingForReview'] });
    },
  });
};

export const useBulkUpdateStatusByDean = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkStatusUpdateDto) =>
      proposalService.bulkUpdateStatusByDean(data),
    onSuccess: () => {
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['proposedProjects'] });
      queryClient.invalidateQueries({ queryKey: ['lecturerPendingReviews'] });
      queryClient.invalidateQueries({ queryKey: ['outlinesWaitingForReview'] });
    },
  });
};

export const useProposedProjectComments = (
  proposedProjectId: string,
  enableRealtime = true,
  options = {},
) => {
  return useQuery({
    queryKey: ['proposedProjectComments', proposedProjectId],
    queryFn: () =>
      proposalService.fetchProposedProjectComments(proposedProjectId),
    enabled: !!proposedProjectId,
    refetchInterval: enableRealtime ? REAL_TIME_REFETCH_INTERVAL : undefined,
    ...options,
  });
};

export const useCreateProposedProjectComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { proposedProjectId: string; content: string }) =>
      proposalService.createProposedProjectComment(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['proposedProjectComments', variables.proposedProjectId],
      });
      queryClient.invalidateQueries({
        queryKey: ['proposedProject', variables.proposedProjectId],
      });
    },
  });
};

export const useManageProposedProjectMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; data: ManageProposedMemberDto }) =>
      proposalService.manageProposedProjectMembers(params.id, params.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['proposedProject', variables.id],
      });
    },
  });
};

export const useFileUpload = () => {
  return useMutation({
    mutationFn: (params: FileUploadParams) =>
      proposalService.uploadFile(params),
  });
};

// Export all hooks together
export const proposalHooks = {
  useProposedProjects,
  useProposedProjectsByDean,
  useProposedProjectsByHead,
  useLecturerPendingReviews,
  useOutlinesWaitingForReview,
  useProposedProject,
  useUpdateProposedProject,
  useUpdateProposedProjectTitle,
  useSubmitProposalOutline,
  useReviewProposalOutline,
  useDepartmentHeadReview,
  useFinalApproval,
  useChangeProposedProjectStatus,
  useBulkUpdateStatus,
  useBulkUpdateStatusByLecturer,
  useBulkUpdateStatusByDepartmentHead,
  useBulkUpdateStatusByDean,
  useProposedProjectComments,
  useCreateProposedProjectComment,
  useManageProposedProjectMembers,
  useFileUpload,
};
