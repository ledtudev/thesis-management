// Main services export file - consolidates all service exports for easier imports

// Auth service
export * from './authService';
export { domainService };

// Domain service
import * as domainService from './domainService';

// Faculty services (preferred over lecturer services)
export * from './facultyService';
export { fieldPoolService };

// Field Pool service
import * as fieldPoolService from './fieldPoolService';

// Lecturer services (some are deprecated)
export * from './lecturerSelectionService';
export * from './lecturerService'; // Deprecated - use facultyService instead
export { lecturerTopicService };

// Lecturer topic service
import * as lecturerTopicService from './lecturerTopicService';

// Proposal services
export * from './proposalService';

// Storage service
export * from './storageService';

// Student selection and enrollment services
export * from './enrollmentStatusService';
export * from './studentSelectionService';
