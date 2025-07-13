import api from '@/lib/axios';
import { useMutation, useQuery, UseQueryResult } from '@tanstack/react-query';

export interface DefenseMember {
  id: string;
  role: string;
  facultyMemberId: string;
  defenseCommitteeId: string;
  FacultyMember?: {
    id: string;
    fullName: string;
    facultyCode?: string;
    email: string;
    profilePicture?: string;
  };
}

export interface DefenseCommittee {
  id: string;
  name: string;
  description?: string;
  defenseDate: string;
  location?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  Project?: {
    id: string;
    title: string;
    type: string;
    status: string;
    Member: Array<{
      id: string;
      role?: string;
      Student?: {
        id: string;
        fullName: string;
        studentCode: string;
        email: string;
        profilePicture?: string;
      };
      FacultyMember?: {
        id: string;
        fullName: string;
        facultyCode?: string;
        email: string;
        profilePicture?: string;
      };
    }>;
  };
  Members: DefenseMember[];
  CreatedByFacultyMember?: {
    id: string;
    fullName: string;
    email: string;
  };
}

// New interfaces for enhanced functionality
export interface ProjectReadyForDefense {
  id: string;
  title: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  Member: Array<{
    id: string;
    role?: string;
    Student?: {
      id: string;
      fullName: string;
      studentCode: string;
      email: string;
      profilePicture?: string;
    };
    FacultyMember?: {
      id: string;
      fullName: string;
      facultyCode?: string;
      email: string;
      profilePicture?: string;
    };
  }>;
  Division?: {
    id: string;
    name: string;
    Faculty?: {
      id: string;
      name: string;
    };
  };
  FieldPool?: {
    id: string;
    name: string;
  };
  DefenseCommittee?: {
    id: string;
    name: string;
    status: string;
    defenseDate: string;
    location?: string;
    Members: Array<{
      id: string;
      role: string;
      FacultyMember: {
        id: string;
        fullName: string;
        facultyCode?: string;
      };
    }>;
  };
}

export interface AvailableFacultyMember {
  id: string;
  fullName: string;
  facultyCode?: string;
  email: string;
  profilePicture?: string;
  Faculty?: {
    id: string;
    name: string;
  };
}

export interface ApiResponse<T> {
  message?: string;
  data: T;
  metadata?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DefenseQueryParams {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: string;
  facultyId?: string;
  startDate?: string;
  endDate?: string;
  orderBy?: string;
  asc?: 'asc' | 'desc';
}

// New query params for projects ready for defense
export interface ProjectsReadyForDefenseParams {
  page?: number;
  limit?: number;
  keyword?: string;
  facultyId?: string;
  divisionId?: string;
  fieldPoolId?: string;
  hasCommittee?: boolean;
  orderBy?: 'title' | 'createdAt' | 'updatedAt';
  asc?: 'asc' | 'desc';
}

// New query params for available faculty
export interface AvailableFacultyParams {
  page?: number;
  limit?: number;
  keyword?: string;
  facultyId?: string;
  excludeAdvisorIds?: string[];
  excludeCommitteeIds?: string[];
  orderBy?: 'fullName' | 'facultyCode' | 'createdAt';
  asc?: 'asc' | 'desc';
}

export interface CreateDefenseCommitteeDto {
  name: string;
  description?: string;
  defenseDate: Date;
  location?: string;
  projectId: string;
}

export interface UpdateDefenseCommitteeDto {
  name?: string;
  description?: string;
  defenseDate?: Date;
  location?: string;
  status?: string;
}

export interface CreateDefenseMemberDto {
  role: string;
  facultyMemberId: string;
}

export interface BulkCreateDefenseCommitteesDto {
  projectIds: string[];
  defaultLocation?: string;
  defaultDefenseDate?: Date;
  committeeSizeMin?: number;
  committeeSizeMax?: number;
}

export interface AutoAssignMembersDto {
  memberCount: number;
  excludeFacultyIds?: string[];
}

export interface MinimalFacultyMember {
  id: string;
  fullName: string;
  facultyCode?: string;
  email: string;
  profilePicture?: string;
  facultyId?: string;
}

const defenseHooks = {
  // Get defense committees with filters
  useDefenseCommittees: (
    params?: DefenseQueryParams,
  ): UseQueryResult<ApiResponse<DefenseCommittee[]>> => {
    return useQuery({
      queryKey: ['defenseCommittees', params],
      queryFn: async () => {
        const { data } = await api.get<ApiResponse<DefenseCommittee[]>>(
          '/defense-committees',
          {
            params,
          },
        );
        return data;
      },
    });
  },

  // Get defense committee by ID
  useDefenseCommitteeById: (
    id?: string,
  ): UseQueryResult<ApiResponse<DefenseCommittee>> => {
    return useQuery({
      queryKey: ['defenseCommittee', id],
      queryFn: async () => {
        const { data } = await api.get<ApiResponse<DefenseCommittee>>(
          `/defense-committees/${id}`,
        );
        return data;
      },
      enabled: !!id,
    });
  },

  // Get defense committee by project ID
  useDefenseCommitteeByProjectId: (
    projectId?: string,
  ): UseQueryResult<ApiResponse<DefenseCommittee>> => {
    return useQuery({
      queryKey: ['defenseCommitteeByProject', projectId],
      queryFn: async () => {
        const { data } = await api.get<ApiResponse<DefenseCommittee>>(
          `/defense-committees/by-project/${projectId}`,
        );
        return data;
      },
      enabled: !!projectId,
    });
  },

  // Get projects waiting for evaluation
  useWaitingProjects: (): UseQueryResult<
    ApiResponse<ProjectReadyForDefense[]>
  > => {
    return useQuery({
      queryKey: ['waitingProjects'],
      queryFn: async () => {
        const { data } = await api.get<ApiResponse<ProjectReadyForDefense[]>>(
          '/defense-committees/waiting-projects',
        );
        return data;
      },
    });
  },

  // NEW: Get projects ready for defense with advanced filtering
  useProjectsReadyForDefense: (
    params?: ProjectsReadyForDefenseParams,
  ): UseQueryResult<ApiResponse<ProjectReadyForDefense[]>> => {
    return useQuery({
      queryKey: ['projectsReadyForDefense', params],
      queryFn: async () => {
        const { data } = await api.get<ApiResponse<ProjectReadyForDefense[]>>(
          '/defense-committees/projects-ready-for-defense',
          { params },
        );
        return data;
      },
    });
  },

  // NEW: Get available faculty for committee assignment
  useAvailableFaculty: (
    params?: AvailableFacultyParams,
  ): UseQueryResult<ApiResponse<AvailableFacultyMember[]>> => {
    return useQuery({
      queryKey: ['availableFaculty', params],
      queryFn: async () => {
        const { data } = await api.get<ApiResponse<AvailableFacultyMember[]>>(
          '/defense-committees/available-faculty',
          { params },
        );
        return data;
      },
    });
  },

  // Create defense committee
  useCreateDefenseCommittee: () => {
    return useMutation({
      mutationFn: async (committee: CreateDefenseCommitteeDto) => {
        const { data } = await api.post('/defense-committees', committee);
        return data;
      },
    });
  },

  // Bulk create defense committees
  useBulkCreateDefenseCommittees: () => {
    return useMutation({
      mutationFn: async (dto: BulkCreateDefenseCommitteesDto) => {
        const { data } = await api.post('/defense-committees/bulk', dto);
        return data;
      },
    });
  },

  // Update defense committee
  useUpdateDefenseCommittee: () => {
    return useMutation({
      mutationFn: async ({
        id,
        ...updates
      }: UpdateDefenseCommitteeDto & { id: string }) => {
        const { data } = await api.patch(`/defense-committees/${id}`, updates);
        return data;
      },
    });
  },

  // Delete defense committee
  useDeleteDefenseCommittee: () => {
    return useMutation({
      mutationFn: async (id: string) => {
        const { data } = await api.delete(`/defense-committees/${id}`);
        return data;
      },
    });
  },

  // Add member to defense committee
  useAddDefenseMember: () => {
    return useMutation({
      mutationFn: async ({
        committeeId,
        ...member
      }: CreateDefenseMemberDto & { committeeId: string }) => {
        const { data } = await api.post(
          `/defense-committees/${committeeId}/members`,
          member,
        );
        return data;
      },
    });
  },

  // Remove member from defense committee
  useRemoveDefenseMember: () => {
    return useMutation({
      mutationFn: async ({
        committeeId,
        memberId,
      }: {
        committeeId: string;
        memberId: string;
      }) => {
        const { data } = await api.delete(
          `/defense-committees/${committeeId}/members/${memberId}`,
        );
        return data;
      },
    });
  },

  // NEW: Auto-assign committee members
  useAutoAssignMembers: () => {
    return useMutation({
      mutationFn: async ({
        committeeId,
        ...dto
      }: AutoAssignMembersDto & { committeeId: string }) => {
        const { data } = await api.post(
          `/defense-committees/${committeeId}/auto-assign-members`,
          dto,
        );
        return data;
      },
    });
  },

  // Get faculty members
  useFacultyMembers: () => {
    return useQuery({
      queryKey: ['facultyMembers'],
      queryFn: async () => {
        const { data } = await api.get<ApiResponse<MinimalFacultyMember[]>>(
          '/faculties',
        );
        return data.data;
      },
    });
  },
};

export { defenseHooks };
