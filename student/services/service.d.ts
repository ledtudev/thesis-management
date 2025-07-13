import {
  CreateStudentSelectionDto,
  FindStudentSelectionDto,
  StudentSelection,
  StudentSelectionResponse,
  StudentSelectionStatus,
  UpdateStudentSelectionDto,
} from './studentSelectionService';

// Faculty/Lecturer types
import { Faculty, FacultyResponse, FindFacultyDto } from './facultyService';

// Field Pool types
import {
  FieldPool,
  FieldPoolDepartment,
  FieldPoolDomain,
  FieldPoolTopic,
} from './fieldPoolService';

// Enrollment status types
import {
  AllocationStatus,
  EnrollmentLecturerSelection,
  EnrollmentStatus,
  FieldPoolRegistration,
  ProjectAllocation,
} from './enrollmentStatusService';

// Lecturer Selection types
import {
  LecturerSelection,
  LecturerSelectionStatus,
} from './lecturerSelectionService';

// Proposal types
import { Proposal, ProposalOutlineStatusT } from './proposalService';

// Re-export all types for global use throughout the application
export {
  // Enrollment status types
  AllocationStatus,
  CreateStudentSelectionDto,
  EnrollmentLecturerSelection,
  EnrollmentStatus,
  // Faculty/Lecturer types
  Faculty,
  FacultyResponse,

  // Field Pool types
  FieldPool,
  FieldPoolDepartment,
  FieldPoolDomain,
  FieldPoolRegistration,
  FieldPoolTopic,
  FindFacultyDto,
  FindStudentSelectionDto,
  // Lecturer Selection types
  LecturerSelection,
  LecturerSelectionStatus,
  ProjectAllocation,
  // Proposal types
  Proposal,
  ProposalOutlineStatusT,
  // Student selection types
  StudentSelection,
  StudentSelectionResponse,
  StudentSelectionStatus,
  UpdateStudentSelectionDto,
};
