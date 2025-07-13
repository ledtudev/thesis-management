import api from '@/lib/axios';
import { ApiResponse } from '@/state/api.interface';
import { useMutation, useQuery } from '@tanstack/react-query';

// Domain API calls
const fetchFieldPools = (queryParams: {
  name?: string;
  domain?: string;
  department?: string;
  departmentId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'name';
  asc?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  filters?: Record<string, FilterValue>;
}) => {
  const filteredParams = Object.fromEntries(
    Object.entries(queryParams).filter(
      ([, value]) => value !== undefined && value !== '',
    ),
  );

  return api.get<FieldPool[]>('/field-pool', {
    params: filteredParams,
  });
};

const fetchFieldPoolDetail = (id: string) => {
  return api.get<FieldPool>(`/field-pool/${id}`);
};

const fetchLecturersByFieldPool = (fieldPoolId: string) => {
  return api.get<ApiResponse<FieldPoolLecturer[]>>(
    `/field-pool/${fieldPoolId}/lecturers`,
    {},
  );
};

const createFieldPool = (fieldPool: {
  name: string;
  description: string;
  registrationDeadline: string;
}) => {
  return api.post<ApiResponse<FieldPool>>('/field-pool', fieldPool);
};

const deleteFieldPool = (fieldPoolId: string) => {
  return api.delete<ApiResponse<null>>(`/field-pool/${fieldPoolId}`);
};

// React Query hooks
const useFieldPools = (queryParams: {
  name?: string;
  domain?: string;
  department?: string;
  departmentId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'name';
  asc?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  filters?: Record<string, FilterValue>;
}) => {
  return useQuery({
    queryKey: ['fieldPools', queryParams],
    queryFn: () => fetchFieldPools(queryParams),
  });
};

const useFieldPoolDetail = (id?: string) => {
  return useQuery({
    queryKey: ['fieldPool', id],
    queryFn: () => fetchFieldPoolDetail(id || ''),
    enabled: !!id,
  });
};

const useLecturersByFieldPool = (fieldPoolId?: string) => {
  return useQuery({
    queryKey: ['fieldPoolLecturers', fieldPoolId],
    queryFn: () => fetchLecturersByFieldPool(fieldPoolId || ''),
    enabled: !!fieldPoolId,
  });
};

const useCreateFieldPool = () => {
  return useMutation({
    mutationFn: createFieldPool,
  });
};

const useDeleteFieldPool = () => {
  return useMutation({
    mutationFn: deleteFieldPool,
  });
};

export {
  useCreateFieldPool,
  useDeleteFieldPool,
  useFieldPoolDetail,
  useFieldPools,
  useLecturersByFieldPool,
};

// Types

export interface FilterValue {
  value: string | number | boolean | null;
  operator?: string;
}

export interface Domain {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface FieldPoolDomain {
  Domain: Domain;
}

export interface FieldPoolDepartment {
  Department: Department;
}

export interface FieldPoolTopic {
  id: string;
  title: string;
  description: string;
  // difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  // mentorName?: string;
  domain?: string[];
}

export interface FieldPoolLecturer {
  id: string;
  fullName: string;
  email: string;
  departmentId: string;
  Department?: Department;
  rank?: string;
  LecturerSelection?: Array<{
    id: string;
    topicTitle: string;
    description?: string;
    priority: number;
    capacity?: number;
    currentCapacity?: number;
    status?: string;
  }>;
}

export interface FieldPool {
  id: string;
  name: string;
  description: string;
  status: 'OPEN' | 'CLOSED' | 'HIDDEN';
  registrationDeadline: string;
  createdAt: string;
  updatedAt: string;
  longDescription: string;
  FieldPoolDomain?: FieldPoolDomain[];
  FieldPoolDepartment?: FieldPoolDepartment[];
  _count?: {
    LecturerSelection: number;
    StudentSelection: number;
    Project: number;
  };
  topics?: FieldPoolTopic[];
  studentCount?: number;
  projectCount?: number;
}
