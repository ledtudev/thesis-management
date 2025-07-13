import api from '@/lib/axios';
import { ApiResponse } from '@/state/api.interface';
import { useMutation, useQuery } from '@tanstack/react-query';

// Domain API calls
const fetchDomains = (queryParams: DomainRequest) =>
  api.get<ApiResponse<Domain[]>>('/domain', { params: queryParams });

const createDomain = (data: CreateDomainRequest) =>
  api.post<ApiResponse<Domain>>('/domain/create', data);

const updateDomain = (id: string, data: UpdateDomainRequest) =>
  api.put<ApiResponse<Domain>>(`/domain/update/${id}`, data);

const deleteDomain = (id: string) =>
  api.delete<ApiResponse<null>>(`/domain/delete/${id}`);

export const domainService = {
  fetchDomains,
  createDomain,
  updateDomain,
  deleteDomain,
};

// React Query hooks
const useDomains = (queryParams: DomainRequest) => {
  return useQuery({
    queryKey: ['domains', queryParams],
    queryFn: () => domainService.fetchDomains(queryParams),
  });
};

const useCreateDomain = () => {
  return useMutation({
    mutationFn: (data: CreateDomainRequest) => domainService.createDomain(data),
  });
};

const useUpdateDomain = () => {
  return useMutation({
    mutationFn: (params: { id: string; data: UpdateDomainRequest }) =>
      domainService.updateDomain(params.id, params.data),
  });
};

const useDeleteDomain = () => {
  return useMutation({
    mutationFn: (id: string) => domainService.deleteDomain(id),
  });
};

export const domainHooks = {
  useDomains,
  useCreateDomain,
  useUpdateDomain,
  useDeleteDomain,
};

// Types
export interface Domain {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface DomainRequest {
  name?: string;
  departmentId?: string;
  page?: number;
  limit?: number;
}

export interface CreateDomainRequest {
  name: string;
  description: string;
}

export interface UpdateDomainRequest {
  name?: string;
  description?: string;
}

export interface Department {
  id: string;
  name: string;
  code?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DomainItem {
  id: string;
  name: string;
  code?: string;
  description?: string;
}

// API calls
export const fetchDomainData = (domain: string) => {
  return api.get<ApiResponse<DomainItem[]>>(`/domain/${domain}`);
};

export const fetchDepartments = () => {
  return api.get<ApiResponse<Department[]>>('/department');
};

// React Query hooks
export const useDomainData = (domain: string) => {
  return useQuery({
    queryKey: ['domain', domain],
    queryFn: () => fetchDomainData(domain),
  });
};

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => fetchDepartments(),
  });
};
