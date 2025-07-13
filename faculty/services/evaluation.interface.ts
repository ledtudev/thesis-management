export enum ProjectEvaluationStatusT {
  PENDING = 'PENDING',
  EVALUATED = 'EVALUATED',
}

export enum EvaluatorRole {
  ADVISOR = 'ADVISOR',
  COMMITTEE = 'COMMITTEE',
}

export enum DefenseCommitteeRoleT {
  CHAIRMAN = 'CHAIRMAN',
  SECRETARY = 'SECRETARY',
  REVIEWER = 'REVIEWER',
  MEMBER = 'MEMBER',
}

// Basic interfaces for related models to avoid 'any'
export interface BasicProject {
  id: string;
  title: string;
  // Add other essential project fields if needed for display
}

export interface BasicFacultyMember {
  id: string;
  fullName: string;
  facultyCode?: string;
  profilePicture?: string;
  email?: string;
  // Add other essential faculty fields if needed
}

export interface BasicStudent {
  id: string;
  fullName?: string | null;
  studentCode?: string | null;
}

export interface ProjectMember {
  id: string;
  role: string; // Could be 'ADVISOR', 'CO_SUPERVISOR', 'STUDENT', etc.
  Student?: BasicStudent | null;
  FacultyMember?: BasicFacultyMember | null;
}

export interface DefenseMember {
  id: string;
  role: DefenseCommitteeRoleT;
  facultyMemberId: string;
  FacultyMember?: BasicFacultyMember;
}

export interface DefenseCommittee {
  id: string;
  name: string;
  location?: string;
  defenseDate: string;
  Members: DefenseMember[];
}

// ------------- Evaluation Criteria Interfaces -------------
export interface EvaluationCriteria {
  id: string;
  name: string;
  description?: string;
  weight: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  FacultyMember?: BasicFacultyMember; // Relation
}

export interface CreateEvaluationCriteriaDto {
  name: string;
  description?: string;
  weight: number;
}

export interface UpdateEvaluationCriteriaDto {
  name?: string;
  description?: string;
  weight?: number;
}

export interface EvaluationCriteriaQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  createdById?: string;
}

// ------------- Project Evaluation Interfaces -------------
export interface ProjectEvaluation {
  id: string;
  projectId: string;
  finalScore?: number | null;
  status: ProjectEvaluationStatusT;
  advisorWeight?: number | null;
  committeeWeight?: number | null;
  createdAt: string;
  updatedAt: string;
  Project?: BasicProject & { Member?: ProjectMember[] }; // Using BasicProject
  EvaluationScores?: ProjectEvaluationScore[];
}

export interface CreateProjectEvaluationDto {
  projectId: string;
  status?: ProjectEvaluationStatusT;
  advisorWeight?: number;
  committeeWeight?: number;
}

export interface UpdateProjectEvaluationDto {
  status?: ProjectEvaluationStatusT;
  advisorWeight?: number;
  committeeWeight?: number;
  finalScore?: number;
}

export interface FinalizeProjectEvaluationDto {
  advisorWeight: number;
  committeeWeight: number;
  status?: ProjectEvaluationStatusT;
}

export interface ProjectEvaluationQueryDto {
  page?: number;
  limit?: number;
  keyword?: string;
  orderBy?: string;
  asc?: 'asc' | 'desc';
  status?: ProjectEvaluationStatusT;
  projectId?: string;
}

// ------------- Project Evaluation Score Interfaces -------------
export interface ProjectEvaluationScore {
  id: string;
  evaluationId: string;
  evaluatorId: string;
  role: EvaluatorRole;
  score: number;
  comment?: string | null;
  Evaluator?: BasicFacultyMember;
}

export interface CreateProjectEvaluationScoreDto {
  evaluationId: string;
  role: EvaluatorRole;
  score: number;
  comment?: string;
}

// Đơn giản hóa cho giáo viên nhập điểm
export interface CreateAdvisorScoreDto {
  projectId: string;
  score: number;
  comment?: string;
}

export interface CreateCommitteeScoreDto {
  projectId: string;
  score: number;
  comment?: string;
}

export interface UpdateProjectEvaluationScoreDto {
  score?: number;
  comment?: string;
}

export interface FindProjectEvaluationScoreDto {
  evaluationId?: string;
  role?: EvaluatorRole;
  evaluatorId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ------------- NEW INTERFACES FOR UPDATED API -------------

// Updated evaluation interfaces
export interface Evaluation extends ProjectEvaluation {
  userRole?: string;
  hasScored?: boolean;
  userScore?: number;
  userContext?: {
    id?: string;
    isSupervisor: boolean;
    defenseRole?: DefenseCommitteeRoleT;
    hasScored: boolean;
    canEdit: boolean;
    canFinalize: boolean;
  };
  scores?: EvaluationScore[];
}

export interface EvaluationScore extends ProjectEvaluationScore {}

export interface EvaluationQueryDto extends ProjectEvaluationQueryDto {
  defenseRole?: DefenseCommitteeRoleT;
  defenseMemberId?: string;
}

export interface CreateEvaluationScoreDto
  extends CreateProjectEvaluationScoreDto {}

export interface UpdateEvaluationScoreDto
  extends UpdateProjectEvaluationScoreDto {}

export interface FinalizeEvaluationDto extends FinalizeProjectEvaluationDto {}
