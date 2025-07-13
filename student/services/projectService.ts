import api from '@/lib/axios';
import { ApiResponse } from '@/state/api.interface';
import { useMutation, useQuery } from '@tanstack/react-query';

// Types
export interface Project {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  field: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface ProjectQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  status?: string;
  type?: string;
  facultyId?: string;
  divisionId?: string;
  studentId?: string;
  lecturerId?: string;
}

export interface SubmitReportDto {
  projectId: string;
  mainReportFileId?: string;
  attachmentFileIds?: string[];
}

export interface CreateProjectCommentDto {
  projectId: string;
  content: string;
}

// API functions
const getProjects = async (params: ProjectQueryParams = {}) => {
  const { data } = await api.get<ApiResponse<any>>('/projects', { params });
  return data;
};

const getProjectById = async (id: string) => {
  const { data } = await api.get<ApiResponse<Project>>(`/projects/${id}`);
  return data;
};

const submitProjectReport = async (
  submitData: SubmitReportDto,
): Promise<any> => {
  const { data } = await api.post<ApiResponse<any>>(
    `/projects/${submitData.projectId}/reports`,
    {
      mainReportFileId: submitData.mainReportFileId || null,
      attachmentFileIds: submitData.attachmentFileIds || [],
    },
  );
  return data.data;
};

const addProjectComment = async (
  commentData: CreateProjectCommentDto,
): Promise<any> => {
  const { data } = await api.post<ApiResponse<any>>(
    `/projects/${commentData.projectId}/comments`,
    {
      content: commentData.content,
    },
  );
  return data.data;
};

const getProjectReports = async (projectId: string): Promise<any> => {
  const { data } = await api.get<ApiResponse<any>>(
    `/projects/${projectId}/reports`,
  );
  return data.data;
};

const getProjectComments = async (projectId: string): Promise<any> => {
  const { data } = await api.get<ApiResponse<any>>(
    `/projects/${projectId}/comments`,
  );
  return data.data;
};

// React Query hooks
export const useProjects = (params: ProjectQueryParams = {}) => {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => getProjects(params),
  });
};

export const useProjectById = (id?: string) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => getProjectById(id as string),
    enabled: !!id,
  });
};

export const useSubmitProjectReport = () => {
  return useMutation({
    mutationFn: submitProjectReport,
  });
};

export const useAddProjectComment = () => {
  return useMutation({
    mutationFn: addProjectComment,
  });
};

export const useProjectReports = (projectId?: string) => {
  return useQuery({
    queryKey: ['projectReports', projectId],
    queryFn: () => getProjectReports(projectId as string),
    enabled: !!projectId,
  });
};

export const useProjectComments = (projectId?: string) => {
  return useQuery({
    queryKey: ['projectComments', projectId],
    queryFn: () => getProjectComments(projectId as string),
    enabled: !!projectId,
  });
};
