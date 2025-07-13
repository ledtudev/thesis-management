import api from '@/lib/axios';
import { ApiResponse } from '@/state/api.interface';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  CreateAdvisorScoreDto,
  CreateCommitteeScoreDto,
  CreateEvaluationScoreDto,
  CreateProjectEvaluationDto,
  CreateProjectEvaluationScoreDto,
  Evaluation,
  EvaluationQueryDto,
  EvaluationScore,
  FinalizeEvaluationDto,
  FinalizeProjectEvaluationDto,
  PaginatedResponse,
  ProjectEvaluation,
  ProjectEvaluationQueryDto,
  ProjectEvaluationScore,
  UpdateEvaluationScoreDto,
  UpdateProjectEvaluationDto,
  UpdateProjectEvaluationScoreDto,
} from './evaluation.interface';

// ------------- Evaluation API Calls -------------
const fetchEvaluations = (params: EvaluationQueryDto) => {
  return api.get<ApiResponse<PaginatedResponse<Evaluation>>>('/evaluation', {
    params,
  });
};

const fetchEvaluationById = (id: string) => {
  return api.get<ApiResponse<Evaluation>>(`/evaluation/${id}`);
};

const finalizeEvaluation = (id: string, data: FinalizeEvaluationDto) => {
  return api.put<ApiResponse<Evaluation>>(`/evaluation/${id}/finalize`, data);
};

// ------------- Evaluation Score API Calls -------------
const createEvaluationScore = (data: CreateEvaluationScoreDto) => {
  return api.post<ApiResponse<EvaluationScore>>(`/evaluation/scores`, data);
};

const updateEvaluationScore = (
  scoreId: string,
  data: UpdateEvaluationScoreDto,
) => {
  return api.put<ApiResponse<EvaluationScore>>(
    `/evaluation/scores/${scoreId}`,
    data,
  );
};

// ------------- Legacy Project Evaluation API Calls -------------
const fetchProjectEvaluations = (params: ProjectEvaluationQueryDto) => {
  return api.get<ApiResponse<PaginatedResponse<ProjectEvaluation>>>(
    '/evaluation',
    { params },
  );
};

const fetchProjectEvaluationById = (id: string) => {
  return api.get<ApiResponse<ProjectEvaluation>>(`/evaluation/${id}`);
};

const fetchProjectEvaluationByProjectId = (projectId: string) => {
  return api.get<ApiResponse<ProjectEvaluation>>(
    `/evaluation/project/${projectId}`,
  );
};

const createProjectEvaluation = (data: CreateProjectEvaluationDto) => {
  return api.post<ApiResponse<ProjectEvaluation>>('/evaluation', data);
};

const updateProjectEvaluation = (
  id: string,
  data: UpdateProjectEvaluationDto,
) => {
  return api.put<ApiResponse<ProjectEvaluation>>(`/evaluation/${id}`, data);
};

const finalizeProjectEvaluation = (
  id: string,
  data: FinalizeProjectEvaluationDto,
) => {
  return api.put<ApiResponse<ProjectEvaluation>>(
    `/evaluation/${id}/finalize`,
    data,
  );
};

// ------------- Legacy Project Evaluation Score API Calls -------------
const fetchProjectEvaluationScores = (evaluationId: string) => {
  return api.get<ApiResponse<ProjectEvaluationScore[]>>(
    `/evaluation/${evaluationId}/scores`,
  );
};

const createProjectEvaluationScore = (
  data: CreateProjectEvaluationScoreDto,
) => {
  return api.post<ApiResponse<ProjectEvaluationScore>>(
    `/evaluation/scores`,
    data,
  );
};

const updateProjectEvaluationScore = (
  scoreId: string,
  data: UpdateProjectEvaluationScoreDto,
) => {
  return api.put<ApiResponse<ProjectEvaluationScore>>(
    `/evaluation/scores/${scoreId}`,
    data,
  );
};

const deleteProjectEvaluationScore = (scoreId: string) => {
  return api.delete<ApiResponse<null>>(`/evaluation/scores/${scoreId}`);
};

// ------------- Advisor & Committee Score API Calls -------------
const createAdvisorScore = (data: CreateAdvisorScoreDto) => {
  return api.post<ApiResponse<ProjectEvaluationScore>>(
    '/evaluation/advisor-score',
    data,
  );
};

const createCommitteeScore = (data: CreateCommitteeScoreDto) => {
  return api.post<ApiResponse<ProjectEvaluationScore>>(
    '/evaluation/committee-score',
    data,
  );
};

const fetchProjectsToEvaluate = () => {
  return api.get<
    ApiResponse<{
      advisorProjects: Array<{
        id: string;
        title: string;
        hasEvaluated: boolean;
        Member: unknown[];
        ProjectEvaluation: unknown;
        [key: string]: unknown;
      }>;
      committeeProjects: Array<{
        id: string;
        title: string;
        hasEvaluated: boolean;
        isChairman: boolean;
        Member: unknown[];
        DefenseCommittee: unknown;
        ProjectEvaluation: unknown;
        [key: string]: unknown;
      }>;
    }>
  >('/evaluation/projects-to-evaluate');
};

const fetchEvaluationByDefenseCommitteeId = (defenseCommitteeId: string) => {
  return api.get<ApiResponse<ProjectEvaluation>>(
    `/evaluation/by-defense-committee/${defenseCommitteeId}`,
  );
};

// ------------- React Query Hooks for Evaluation -------------
export const useEvaluations = (params: EvaluationQueryDto) => {
  return useQuery({
    queryKey: ['evaluations', params],
    queryFn: () => fetchEvaluations(params),
  });
};

export const useEvaluationById = (id?: string) => {
  return useQuery({
    queryKey: ['evaluation', id],
    queryFn: () => fetchEvaluationById(id!),
    enabled: !!id,
  });
};

export const useFinalizeEvaluation = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FinalizeEvaluationDto }) =>
      finalizeEvaluation(id, data),
  });
};

// ------------- React Query Hooks for Evaluation Score -------------
export const useCreateEvaluationScore = () => {
  return useMutation({
    mutationFn: createEvaluationScore,
  });
};

export const useUpdateEvaluationScore = () => {
  return useMutation({
    mutationFn: ({
      scoreId,
      data,
    }: {
      scoreId: string;
      data: UpdateEvaluationScoreDto;
    }) => updateEvaluationScore(scoreId, data),
  });
};

// ------------- React Query Hooks for Legacy Project Evaluation -------------
export const useProjectEvaluations = (params: ProjectEvaluationQueryDto) => {
  return useQuery({
    queryKey: ['projectEvaluations', params],
    queryFn: () => fetchProjectEvaluations(params),
  });
};

export const useProjectEvaluationById = (id?: string) => {
  return useQuery({
    queryKey: ['projectEvaluation', id],
    queryFn: () => fetchProjectEvaluationById(id!),
    enabled: !!id,
  });
};

export const useProjectEvaluationByProjectId = (projectId?: string) => {
  return useQuery({
    queryKey: ['projectEvaluation', 'project', projectId],
    queryFn: () => fetchProjectEvaluationByProjectId(projectId!),
    enabled: !!projectId,
  });
};

export const useCreateProjectEvaluation = () => {
  return useMutation({
    mutationFn: createProjectEvaluation,
  });
};

export const useUpdateProjectEvaluation = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProjectEvaluationDto;
    }) => updateProjectEvaluation(id, data),
  });
};

export const useFinalizeProjectEvaluation = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: FinalizeProjectEvaluationDto;
    }) => finalizeProjectEvaluation(id, data),
  });
};

// ------------- React Query Hooks for Legacy Project Evaluation Score -------------
export const useProjectEvaluationScores = (evaluationId?: string) => {
  return useQuery({
    queryKey: ['projectEvaluationScores', evaluationId],
    queryFn: () => fetchProjectEvaluationScores(evaluationId!),
    enabled: !!evaluationId,
  });
};

export const useCreateProjectEvaluationScore = () => {
  return useMutation({
    mutationFn: createProjectEvaluationScore,
  });
};

export const useUpdateProjectEvaluationScore = () => {
  return useMutation({
    mutationFn: ({
      scoreId,
      data,
    }: {
      scoreId: string;
      data: UpdateProjectEvaluationScoreDto;
    }) => updateProjectEvaluationScore(scoreId, data),
  });
};

export const useDeleteProjectEvaluationScore = () => {
  return useMutation({
    mutationFn: deleteProjectEvaluationScore,
  });
};

// ------------- React Query Hooks for Advisor & Committee Scoring -------------
export const useCreateAdvisorScore = () => {
  return useMutation({
    mutationFn: createAdvisorScore,
  });
};

export const useCreateCommitteeScore = () => {
  return useMutation({
    mutationFn: createCommitteeScore,
  });
};

export const useProjectsToEvaluate = () => {
  return useQuery({
    queryKey: ['projectsToEvaluate'],
    queryFn: fetchProjectsToEvaluate,
  });
};

export const useEvaluationByDefenseCommitteeId = (
  defenseCommitteeId?: string,
) => {
  return useQuery({
    queryKey: ['evaluation', 'defenseCommittee', defenseCommitteeId],
    queryFn: () => fetchEvaluationByDefenseCommitteeId(defenseCommitteeId!),
    enabled: !!defenseCommitteeId,
  });
};

export const evaluationHooks = {
  // New API
  useEvaluations,
  useEvaluationById,
  useFinalizeEvaluation,
  useCreateEvaluationScore,
  useUpdateEvaluationScore,

  // Legacy API
  useProjectEvaluations,
  useProjectEvaluationById,
  useProjectEvaluationByProjectId,
  useCreateProjectEvaluation,
  useUpdateProjectEvaluation,
  useFinalizeProjectEvaluation,
  useProjectEvaluationScores,
  useCreateProjectEvaluationScore,
  useUpdateProjectEvaluationScore,
  useDeleteProjectEvaluationScore,
  useCreateAdvisorScore,
  useCreateCommitteeScore,
  useProjectsToEvaluate,
  useEvaluationByDefenseCommitteeId,
};
