// DEPRECATED: Use facultyService.ts instead.
// This file is kept for backward compatibility but all new code should use
// the faculty service which provides more comprehensive faculty information.

import {
  Faculty,
  FindFacultyDto,
  useFacultiesForStudents,
  useFacultyById,
} from './facultyService';

// Type alias for backward compatibility
export type Lecturer = Faculty;
export type FindLecturerDto = FindFacultyDto;

// Re-export the hooks with the old names
export const useLecturers = useFacultiesForStudents;
export const useLecturerById = useFacultyById;

// This function is deprecated
export const useLecturersByFieldPool = (fieldPoolId?: string, limit = 6) => {
  console.warn(
    'useLecturersByFieldPool is deprecated. Use useFacultiesForStudents with appropriate filters instead.',
  );
  return useFacultiesForStudents({
    limit,
  });
};
