import api from '@/lib/axios';
import { ApiResponse } from '@/state/api.interface';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Define interface for proposal status
export const ProposedProjectStatusEnum = {
  PENDING_ADVISOR: 'PENDING_ADVISOR',
  REQUESTED_CHANGES_ADVISOR: 'REQUESTED_CHANGES_ADVISOR',
  REJECTED_BY_ADVISOR: 'REJECTED_BY_ADVISOR',
  ADVISOR_APPROVED: 'ADVISOR_APPROVED',
  PENDING_HEAD: 'PENDING_HEAD',
  REQUESTED_CHANGES_HEAD: 'REQUESTED_CHANGES_HEAD',
  REJECTED_BY_HEAD: 'REJECTED_BY_HEAD',
  APPROVED_BY_HEAD: 'APPROVED_BY_HEAD',
  TOPIC_SUBMISSION_PENDING: 'TOPIC_SUBMISSION_PENDING',
  TOPIC_PENDING_ADVISOR: 'TOPIC_PENDING_ADVISOR',
  TOPIC_REQUESTED_CHANGES: 'TOPIC_REQUESTED_CHANGES',
  TOPIC_APPROVED: 'TOPIC_APPROVED',
  OUTLINE_PENDING_SUBMISSION: 'OUTLINE_PENDING_SUBMISSION',
  OUTLINE_PENDING_ADVISOR: 'OUTLINE_PENDING_ADVISOR',
  OUTLINE_REQUESTED_CHANGES: 'OUTLINE_REQUESTED_CHANGES',
  OUTLINE_REJECTED: 'OUTLINE_REJECTED',
  OUTLINE_APPROVED: 'OUTLINE_APPROVED',
} as const;

export type ProposedProjectStatus = keyof typeof ProposedProjectStatusEnum;

// Interfaces for Proposal
export interface ProposedProject {
  id: string;
  title: string;
  description?: string;
  status: ProposedProjectStatus;
  createdAt: string;
  updatedAt: string;
  advisorId?: string;
  advisor?: {
    id: string;
    fullName: string;
  };
  ProposedProjectMember?: ProposedProjectMember[];
  ProposalOutline?: ProposalOutline;
  ProposedProjectComment?: ProposedProjectComment[];
}

export interface ProposedProjectMember {
  id: string;
  studentId?: string | null;
  facultyMemberId?: string | null;
  role?: string;
  status: string;
  Student?: {
    id: string;
    fullName: string;
    studentCode?: string;
    email?: string;
    profilePicture?: string | null;
    Faculty?: {
      id: string;
      name: string;
      facultyCode: string;
    };
  } | null;
  FacultyMember?: {
    id: string;
    fullName: string;
    email?: string;
    profilePicture?: string | null;
    Faculty?: {
      id: string;
      name: string;
      facultyCode: string;
    };
  } | null;
}

export interface ProposalOutline {
  id: string;
  introduction: string;
  objectives: string;
  methodology: string;
  expectedResults: string;
  status: string;
  fileId?: string;
  updatedAt?: string;
  file?: {
    id: string;
    originalName: string;
    url: string;
    mimeType?: string;
    fileSize?: number;
  };
}

// DTOs for proposal operations
export interface UpdateProposedProjectDto {
  title: string;
  description?: string;
  submitToAdvisor?: boolean;
}

export interface UpdateProposedProjectTitleDto {
  title: string;
  description?: string;
}

export interface SubmitProposalOutlineDto {
  proposedProjectId: string;
  introduction: string;
  objectives: string;
  methodology: string;
  expectedResults: string;
  fileId?: string;
  submitForReview?: boolean;
}

export interface FindProposedProjectDto {
  status?: ProposedProjectStatus;
  advisorId?: string;
  studentId?: string;
  departmentId?: string;
  fieldPoolId?: string;
  projectAllocationId?: string;
  keyword?: string;
  orderBy?:
    | 'createdAt'
    | 'updatedAt'
    | 'title'
    | 'status'
    | 'studentName'
    | 'advisorName';
  asc?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// DTO for commenting
export interface CreateCommentDto {
  proposedProjectId: string;
  content: string;
}

// Interface for comment responses
export interface ProposedProjectComment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  proposedProjectId: string;
  commenterStudentId?: string;
  commenterFacultyId?: string;
  CommenterStudent?: {
    id: string;
    fullName: string;
    studentCode: string;
    profilePicture?: string;
  };
  CommenterFacultyMember?: {
    id: string;
    fullName: string;
    profilePicture?: string;
    Faculty?: {
      id: string;
      name: string;
      facultyCode: string;
    };
  };
  ProposedProject?: {
    id: string;
    title: string;
  };
}

export interface CommentResponse {
  data: ProposedProjectComment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API calls
const fetchProposedProjects = async (
  queryParams: FindProposedProjectDto = {},
): Promise<{
  data: ProposedProject[];
  total: number;
  page: number;
  limit: number;
}> => {
  const filteredParams = Object.fromEntries(
    Object.entries(queryParams).filter(
      ([, value]) => value !== undefined && value !== '',
    ),
  );

  const { data } = await api.get<
    ApiResponse<{
      data: ProposedProject[];
      total: number;
      page: number;
      limit: number;
    }>
  >('/proposed-projects', {
    params: filteredParams,
  });

  return data.data || { data: [], total: 0, page: 1, limit: 10 };
};

const fetchProposedProjectById = async (
  id: string,
): Promise<ProposedProject> => {
  const { data } = await api.get<ApiResponse<ProposedProject>>(
    `/proposed-projects/${id}`,
  );
  return data.data as ProposedProject;
};

const updateProposedProject = async ({
  id,
  updateData,
}: {
  id: string;
  updateData: UpdateProposedProjectDto;
}): Promise<ProposedProject> => {
  const { data } = await api.put<ApiResponse<ProposedProject>>(
    `/proposed-projects/${id}`,
    updateData,
  );
  return data.data as ProposedProject;
};

const updateProposedProjectTitle = async ({
  id,
  title,
}: {
  id: string;
  title: string;
}): Promise<ProposedProject> => {
  // Validate input
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid project ID');
  }

  if (!title || typeof title !== 'string' || title.length < 5) {
    throw new Error('Title must be at least 5 characters long');
  }

  try {
    const { data } = await api.put<ApiResponse<ProposedProject>>(
      `/proposed-projects/${id}/title`,
      { title },
    );
    return data.data as ProposedProject;
  } catch (error) {
    console.error('Error updating proposal title:', error);
    throw error;
  }
};

const submitProposalOutline = async (
  outlineData: SubmitProposalOutlineDto,
): Promise<ProposalOutline> => {
  const { data } = await api.post<ApiResponse<ProposalOutline>>(
    '/proposed-projects/outline',
    outlineData,
  );
  return data.data as ProposalOutline;
};

const createComment = async (
  commentData: CreateCommentDto,
): Promise<ProposedProjectComment> => {
  // Validate the proposedProjectId
  if (
    !commentData.proposedProjectId ||
    typeof commentData.proposedProjectId !== 'string'
  ) {
    throw new Error('ID dự án không hợp lệ');
  }

  try {
    const { data } = await api.post<ApiResponse<ProposedProjectComment>>(
      '/proposed-project-comments',
      commentData,
    );
    return data.data as ProposedProjectComment;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

const fetchComments = async (proposedProjectId: string) => {
  if (!proposedProjectId || typeof proposedProjectId !== 'string') {
    console.warn(
      'fetchComments: Invalid proposedProjectId:',
      proposedProjectId,
    );
    return [];
  }

  // Additional validation for UUID format (if your IDs are UUIDs)
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(proposedProjectId)) {
    console.warn(
      'fetchComments: proposedProjectId is not a valid UUID:',
      proposedProjectId,
    );
    return [];
  }

  try {
    console.log(
      'fetchComments: Fetching comments for proposedProjectId:',
      proposedProjectId,
    );
    const { data } = await api.get<ApiResponse<CommentResponse>>(
      '/proposed-project-comments',
      {
        params: { proposedProjectId },
      },
    );
    console.log('fetchComments: Response data:', data);
    return data.data || [];
  } catch (error) {
    console.error(
      'Error fetching comments for proposedProjectId:',
      proposedProjectId,
      error,
    );

    // Check if it's a validation error
    const apiError = error as {
      response?: {
        data?: {
          error?: {
            code?: string;
            details?: Array<{ field: string; message: string }>;
          };
        };
      };
    };

    if (apiError.response?.data?.error?.code === 'VALIDATION_ERROR') {
      console.error(
        'Validation error details:',
        apiError.response.data.error.details,
      );
      // Return empty array instead of throwing for validation errors
      return [];
    }

    throw error;
  }
};

// Hooks for React components
export const useProposedProjects = (
  queryParams: FindProposedProjectDto = {},
) => {
  return useQuery({
    queryKey: ['proposedProjects', queryParams],
    queryFn: () => fetchProposedProjects(queryParams),
  });
};

export const useProposedProjectById = (id?: string) => {
  return useQuery({
    queryKey: ['proposedProject', id],
    queryFn: () => fetchProposedProjectById(id || ''),
    enabled: !!id,
  });
};

export const useUpdateProposedProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProposedProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proposedProject', data.id] });
      queryClient.invalidateQueries({ queryKey: ['proposedProjects'] });
    },
  });
};

export const useUpdateProposedProjectTitle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProposedProjectTitle,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proposedProject', data.id] });
      queryClient.invalidateQueries({ queryKey: ['proposedProjects'] });
    },
  });
};

export const useSubmitProposalOutline = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitProposalOutline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposedProjects'] });
    },
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['proposalComments', variables.proposedProjectId],
      });
    },
    onError: (error) => {
      console.error('Error in comment mutation:', error);
    },
  });
};

export const useComments = (proposedProjectId?: string) => {
  return useQuery({
    queryKey: ['proposalComments', proposedProjectId],
    queryFn: () => fetchComments(proposedProjectId || ''),
    enabled: !!proposedProjectId && typeof proposedProjectId === 'string',
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      const apiError = error as {
        response?: {
          data?: {
            error?: {
              code?: string;
            };
          };
        };
      };

      if (apiError.response?.data?.error?.code === 'VALIDATION_ERROR') {
        return false;
      }

      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
