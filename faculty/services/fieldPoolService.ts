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

  return api.get<{
    message: string;
    data: FieldPool[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>('/field-pool', {
    params: filteredParams,
  });
};

const fetchFieldPoolDetail = (id: string) => {
  return api.get<FieldPool>(`/field-pool/${id}`);
};

// Dean-specific API calls
const createFieldPool = (fieldPool: {
  name: string;
  description: string;
  registrationDeadline: string;
}) => {
  // Convert datetime-local to ISO string
  const isoDeadline = new Date(fieldPool.registrationDeadline).toISOString();

  return api.post<ApiResponse<FieldPool>>('/field-pool', {
    ...fieldPool,
    registrationDeadline: isoDeadline,
  });
};

const updateFieldPool = (
  id: string,
  updates: {
    name?: string;
    description?: string;
    registrationDeadline?: string;
    status?: 'OPEN' | 'CLOSED' | 'HIDDEN';
  },
) => {
  // Convert datetime-local to ISO string if provided
  const updateData = { ...updates };
  if (updates.registrationDeadline) {
    updateData.registrationDeadline = new Date(
      updates.registrationDeadline,
    ).toISOString();
  }

  return api.patch<ApiResponse<FieldPool>>(`/field-pool/${id}`, updateData);
};

const extendRegistrationDeadline = (
  id: string,
  newDeadline: string,
  reason?: string,
) => {
  // Convert datetime-local to ISO string
  const isoDeadline = new Date(newDeadline).toISOString();

  return api.patch<ApiResponse<FieldPool>>(
    `/field-pool/${id}/extend-deadline`,
    {
      newDeadline: isoDeadline,
      reason,
    },
  );
};

const deleteFieldPool = (fieldPoolId: string) => {
  return api.delete<ApiResponse<null>>(`/field-pool/${fieldPoolId}`);
};

// Domain management
const addDomainToFieldPool = (fieldPoolId: string, domainId: string) => {
  return api.post<ApiResponse<null>>(
    `/field-pool/${fieldPoolId}/domains/${domainId}`,
  );
};

const removeDomainFromFieldPool = (fieldPoolId: string, domainId: string) => {
  return api.delete<ApiResponse<null>>(
    `/field-pool/${fieldPoolId}/domains/${domainId}`,
  );
};

const getFieldPoolDomains = (fieldPoolId: string) => {
  return api.get<ApiResponse<Domain[]>>(`/field-pool/${fieldPoolId}/domains`);
};

// Department management
const addDepartmentToFieldPool = (
  fieldPoolId: string,
  departmentId: string,
) => {
  return api.post<ApiResponse<null>>(
    `/field-pool/${fieldPoolId}/departments/${departmentId}`,
  );
};

const removeDepartmentFromFieldPool = (
  fieldPoolId: string,
  departmentId: string,
) => {
  return api.delete<ApiResponse<null>>(
    `/field-pool/${fieldPoolId}/departments/${departmentId}`,
  );
};

const getFieldPoolDepartments = (fieldPoolId: string) => {
  return api.get<ApiResponse<Department[]>>(
    `/field-pool/${fieldPoolId}/departments`,
  );
};

// Get available domains and departments
const fetchDomains = () => {
  return api.get<ApiResponse<Domain[]>>('/domain');
};

const fetchDepartments = () => {
  return api.get<ApiResponse<Department[]>>('/department');
};

// React Query hooks
export const fieldPoolHooks = {
  // Get field pools with filters
  useFieldPools: (params?: {
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
      queryKey: ['fieldPools', params],
      queryFn: () => fetchFieldPools(params || {}),
      select: (response) => response.data.data,
    });
  },

  // Get field pool by ID
  useFieldPool: (id?: string) => {
    return useQuery({
      queryKey: ['fieldPool', id],
      queryFn: () => fetchFieldPoolDetail(id!),
      enabled: !!id,
      select: (response) => response.data,
    });
  },

  // Create field pool
  useCreateFieldPool: () => {
    return useMutation({
      mutationFn: createFieldPool,
    });
  },

  // Update field pool
  useUpdateFieldPool: () => {
    return useMutation({
      mutationFn: ({
        id,
        ...updates
      }: { id: string } & {
        name?: string;
        description?: string;
        registrationDeadline?: string;
        status?: 'OPEN' | 'CLOSED' | 'HIDDEN';
      }) => updateFieldPool(id, updates),
    });
  },

  // Extend registration deadline
  useExtendRegistrationDeadline: () => {
    return useMutation({
      mutationFn: ({
        id,
        newDeadline,
        reason,
      }: {
        id: string;
        newDeadline: string;
        reason?: string;
      }) => extendRegistrationDeadline(id, newDeadline, reason),
    });
  },

  // Delete field pool
  useDeleteFieldPool: () => {
    return useMutation({
      mutationFn: deleteFieldPool,
    });
  },

  // Domain management hooks
  useAddDomainToFieldPool: () => {
    return useMutation({
      mutationFn: ({
        fieldPoolId,
        domainId,
      }: {
        fieldPoolId: string;
        domainId: string;
      }) => addDomainToFieldPool(fieldPoolId, domainId),
    });
  },

  useRemoveDomainFromFieldPool: () => {
    return useMutation({
      mutationFn: ({
        fieldPoolId,
        domainId,
      }: {
        fieldPoolId: string;
        domainId: string;
      }) => removeDomainFromFieldPool(fieldPoolId, domainId),
    });
  },

  useFieldPoolDomains: (fieldPoolId?: string) => {
    return useQuery({
      queryKey: ['fieldPoolDomains', fieldPoolId],
      queryFn: () => getFieldPoolDomains(fieldPoolId!),
      enabled: !!fieldPoolId,
      select: (response) => response.data.data,
    });
  },

  // Department management hooks
  useAddDepartmentToFieldPool: () => {
    return useMutation({
      mutationFn: ({
        fieldPoolId,
        departmentId,
      }: {
        fieldPoolId: string;
        departmentId: string;
      }) => addDepartmentToFieldPool(fieldPoolId, departmentId),
    });
  },

  useRemoveDepartmentFromFieldPool: () => {
    return useMutation({
      mutationFn: ({
        fieldPoolId,
        departmentId,
      }: {
        fieldPoolId: string;
        departmentId: string;
      }) => removeDepartmentFromFieldPool(fieldPoolId, departmentId),
    });
  },

  useFieldPoolDepartments: (fieldPoolId?: string) => {
    return useQuery({
      queryKey: ['fieldPoolDepartments', fieldPoolId],
      queryFn: () => getFieldPoolDepartments(fieldPoolId!),
      enabled: !!fieldPoolId,
      select: (response) => response.data.data,
    });
  },

  // Get available domains and departments
  useDomains: () => {
    return useQuery({
      queryKey: ['domains'],
      queryFn: fetchDomains,
      select: (response) => response.data.data,
    });
  },

  useDepartments: () => {
    return useQuery({
      queryKey: ['departments'],
      queryFn: fetchDepartments,
      select: (response) => response.data.data,
    });
  },
};

// Types and interfaces
export type FilterValue =
  | string
  | number
  | boolean
  | Date
  | string[]
  | number[];

export interface Domain {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  facultyId: string;
  createdAt: string;
  updatedAt: string;
  Faculty?: {
    id: string;
    name: string;
  };
}

export interface FieldPoolTopic {
  id: string;
  title: string;
  description?: string;
  fieldPoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FieldPoolDomain {
  Domain: Domain;
}

export interface FieldPoolDepartment {
  Department: Department;
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
