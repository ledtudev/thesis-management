import api from '@/lib/axios';
import { ApiResponse } from '@/state/api.interface';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export enum ProjectStatusT {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REQUESTED_CHANGES = 'REQUESTED_CHANGES',
  WAITING_FOR_EVALUATION = 'WAITING_FOR_EVALUATION',
}

export enum ProjectT {
  GRADUATED = 'GRADUATED', // Luận văn tốt nghiệp
  RESEARCH = 'RESEARCH', // Nghiên cứu khoa học
  COMPETITION = 'COMPETITION', // Dự án thi đấu
  COLLABORATION = 'COLLABORATION', // Dự án hợp tác
}

export enum ProjectMemberRoleT {
  STUDENT_LEADER = 'STUDENT_LEADER',
  STUDENT_MEMBER = 'STUDENT_MEMBER',
  SUPERVISOR = 'SUPERVISOR',
  CO_SUPERVISOR = 'CO_SUPERVISOR',
  REVIEWER = 'REVIEWER',
}

export interface MinimalFile {
  id: string;
  originalName: string;
  url?: string;
  size?: number;
  mimeType?: string;
}

export interface MinimalUser {
  id: string;
  name?: string;
  fullName?: string;
  profilePicture?: string | null;
}

export interface MinimalStudent extends MinimalUser {
  studentCode?: string;
  facultyId?: string;
}

export interface MinimalFacultyMember extends MinimalUser {
  facultyCode?: string;
  facultyId?: string;
}

export interface MinimalDivision {
  id: string;
  name: string;
  Faculty?: MinimalFaculty; // Nested faculty info
}

export interface MinimalFaculty {
  id: string;
  name: string;
}

export interface MinimalFieldPool {
  id: string;
  name: string;
}

// Main Project-related Types
export interface ProjectMember {
  id: string;
  role: ProjectMemberRoleT | string;
  status: 'ACTIVE' | 'INACTIVE' | 'REMOVED';
  assignedAt: string;
  Student?: MinimalStudent;
  FacultyMember?: MinimalFacultyMember;
  studentId?: string | null;
  facultyMemberId?: string | null;
}

export interface ProjectAttachment {
  id: string;
  File: MinimalFile | null;
  fileId: string;
}

export interface ProjectFinalReport {
  id: string;
  submittedAt: string;
  description?: string | null;
  Student?: MinimalStudent;
  SubmittedByFacultyMember?: MinimalFacultyMember;
  MainReportFile?: MinimalFile | null;
  Attachments?: ProjectAttachment[];
}

export interface ProjectComment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  commenterStudentId?: string | null;
  commenterFacultyId?: string | null;
  CommenterStudent?: MinimalStudent;
  CommenterFacultyMember?: MinimalFacultyMember;
}

export interface Project {
  id: string;
  title: string;
  description?: string | null;
  field?: string | null;
  status: ProjectStatusT | string;
  type: ProjectT | string;
  createdAt: string;
  updatedAt: string;
  facultyId?: string;
  divisionId?: string;
  Division?: MinimalDivision;
  FieldPool?: MinimalFieldPool;
  ApprovedByFacultyMember?: MinimalFacultyMember;
  Member?: ProjectMember[];
  Comment?: ProjectComment[];
  FinalReport?: ProjectFinalReport[];
}

// DTOs for API calls
export interface CreateProjectCommentDto {
  projectId: string;
  content: string;
}

// Interface for project query filters
export interface ProjectQueryFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  keyword?: string;
  lecturerId?: string;
  facultyId?: string;
  divisionId?: string;
}

// --- React Query Keys ---
const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: ProjectQueryFilters) =>
    [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  comments: (projectId: string) =>
    [...projectKeys.detail(projectId), 'comments'] as const,
};

// --- API Fetching Functions ---
const fetchProjectById = (projectId: string) =>
  api.get<ApiResponse<Project>>(`/projects/${projectId}`);

const fetchProjects = (filters: ProjectQueryFilters = {}) => {
  const cleanedFilters = { ...filters };


  return api.get<ApiResponse<Project[]>>(`/projects`, {
    params: cleanedFilters,
  });
};

const fetchProjectComments = (projectId: string) =>
  api.get<ApiResponse<ProjectComment[]>>(`/projects/${projectId}/comments`);

const addProjectComment = (commentData: CreateProjectCommentDto) => {
  const { projectId, ...payload } = commentData;
  return api.post<ApiResponse<ProjectComment>>(
    `/projects/${projectId}/comments`,
    payload,
  );
};

// --- React Query Hooks ---
export const projectHooks = {
  useProjects: (filters: ProjectQueryFilters = {}) => {
    return useQuery({
      queryKey: projectKeys.list(filters),
      queryFn: async () => fetchProjects(filters),
      select: (response) => response.data,
    });
  },

  useProjectById: (projectId: string) => {
    return useQuery({
      queryKey: projectKeys.detail(projectId),
      queryFn: () => fetchProjectById(projectId),
      select: (response) => response,
      enabled: !!projectId,
    });
  },

  useProjectComments: (projectId: string) => {
    return useQuery({
      queryKey: projectKeys.comments(projectId),
      queryFn: () => fetchProjectComments(projectId),
      select: (response) => response.data,
      enabled: !!projectId,
    });
  },

  useAddProjectComment: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: addProjectComment,
      onSuccess: (response, variables) => {
        queryClient.invalidateQueries({
          queryKey: projectKeys.comments(variables.projectId),
        });
      },
    });
  },
};
