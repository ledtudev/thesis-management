import { ApiProperty } from '@nestjs/swagger';
import { ProjectT as PrismaProjectT } from '@prisma/client';
import { z } from 'zod';

// --------------------------- ENUMS ------------------------

export const ProjectStatusEnum = z.enum([
  'IN_PROGRESS',
  'WAITING_FOR_EVALUATION',
  'COMPLETED',
  'ON_HOLD',
  'CANCELLED',
]);
export type ProjectStatusT = z.infer<typeof ProjectStatusEnum>;

// Using ProposedProjectMemberStatusT as per schema.prisma for ProjectMember.status
export const ProjectMemberStatusEnum = z.enum(['ACTIVE', 'REMOVED']);
export type ProjectMemberStatusT = z.infer<typeof ProjectMemberStatusEnum>;

// Define common roles for ProjectMember, role is String? in prisma so this is for guidance
export const ProjectMemberRoleEnum = z.enum([
  'SUPERVISOR', // Main supervising lecturer
  'CO_SUPERVISOR', // Additional supervising lecturer
  'STUDENT_LEAD', // Student leading the project
  'STUDENT_MEMBER', // Student member
  'CONSULTANT', // External or internal consultant
  'HEAD_OF_DEPARTMENT', // Added for clarity if used for permissions
]);
export type ProjectMemberRoleT = z.infer<typeof ProjectMemberRoleEnum>;

export const FileTypeEnum = z.enum([
  'PDF',
  'WORD',
  'PRESENTATION',
  'SPREADSHEET',
  'AUTOCAD',
  'IMAGE',
  'VIDEO',
  'CODE',
  'DATASET',
  'OTHER',
]);
export type FileT = z.infer<typeof FileTypeEnum>;

// --------------------------- BASIC SCHEMAS ------------------------

export const UserBasicSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  profilePicture: z.string().url().nullable().optional(),
});

export const StudentBasicSchema = UserBasicSchema.extend({
  studentCode: z.string(),
  facultyId: z.string().nullable().optional(),
});

export const FacultyMemberBasicSchema = UserBasicSchema.extend({
  facultyCode: z.string().nullable().optional(),
  facultyId: z.string().nullable().optional(),
});

export const FileBasicSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  originalName: z.string(),
  fileUrl: z.string().url().nullable().optional(),
  filePath: z.string().nullable().optional(),
  fileType: FileTypeEnum,
  mimeType: z.string(),
  fileSize: z.number().int(),
  uploadedAt: z.date(),
});

export const DivisionBasicSchema = z.object({
  id: z.string(),
  name: z.string(),
  divisionCode: z.string().nullable().optional(),
});

export const FieldPoolBasicSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
});

export const DomainBasicSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
});

export const ProposalOutlineBasicSchema = z.object({
  id: z.string(),
  introduction: z.string(),
  objectives: z.string(),
  methodology: z.string(),
  expectedResults: z.string(),
  fileId: z.string().nullable().optional(),
  File: FileBasicSchema.nullable().optional(),
  // status: z.string(),
});

// --------------------------- PROJECT MEMBER ------------------------
export const ProjectMemberSchema = z.object({
  id: z.string(),
  projectId: z.string().nullable().optional(),
  studentId: z.string().nullable().optional(),
  facultyMemberId: z.string().nullable().optional(),
  role: z.string().nullable().optional(), // Consider using ProjectMemberRoleEnum if roles are strictly defined
  status: ProjectMemberStatusEnum.default('ACTIVE'),
  assignedAt: z.date(),
  Student: StudentBasicSchema.nullable().optional(),
  FacultyMember: FacultyMemberBasicSchema.nullable().optional(),
});
export type ProjectMember = z.infer<typeof ProjectMemberSchema>;

export const AddProjectMemberDtoSchema = z
  .object({
    studentId: z.string().optional(),
    facultyMemberId: z.string().optional(),
    role: z.string(), // Or ProjectMemberRoleEnum
  })
  .refine((data) => data.studentId || data.facultyMemberId, {
    message: 'Either studentId or facultyMemberId must be provided',
    path: ['studentId', 'facultyMemberId'],
  });
export type AddProjectMemberDto = z.infer<typeof AddProjectMemberDtoSchema>;

export const UpdateProjectMemberDtoSchema = z.object({
  role: z.string().optional(), // Or ProjectMemberRoleEnum
  status: ProjectMemberStatusEnum.optional(),
});
export type UpdateProjectMemberDto = z.infer<
  typeof UpdateProjectMemberDtoSchema
>;

// --------------------------- PROJECT COMMENT ------------------------
export const ProjectCommentSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  projectId: z.string(),
  commenterStudentId: z.string().nullable().optional(),
  commenterFacultyMemberId: z.string().nullable().optional(),
  CommenterStudent: StudentBasicSchema.nullable().optional(),
  CommenterFacultyMember: FacultyMemberBasicSchema.nullable().optional(),
});
export type ProjectComment = z.infer<typeof ProjectCommentSchema>;

export const CreateProjectCommentDtoSchema = z.object({
  content: z.string().min(1),
});
export type CreateProjectCommentDto = z.infer<
  typeof CreateProjectCommentDtoSchema
>;

// --------------------------- PROJECT FINAL REPORT ------------------------
export const ReportAttachmentSchema = z.object({
  id: z.string(),
  fileId: z.string(),
  description: z.string().nullable().optional(),
  File: FileBasicSchema,
});

export const ProjectReportCommentSchema = z.object({
  id: z.string(),
  finalReportId: z.string(),
  content: z.string(),
  createdAt: z.date(),
  commenterStudentId: z.string().nullable().optional(),
  commenterFacultyMemberId: z.string().nullable().optional(),
  CommenterStudent: StudentBasicSchema.nullable().optional(),
  CommenterFacultyMember: FacultyMemberBasicSchema.nullable().optional(),
});

export const ProjectFinalReportSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  mainReportFileId: z.string().nullable().optional(),
  submittedAt: z.date(),
  updatedAt: z.date(),
  version: z.number().int(),
  studentId: z.string().nullable().optional(), // Student who submitted
  facultyMemberId: z.string().nullable().optional(), // Optional: faculty member who submitted/approved report
  description: z.string().nullable().optional(), // Added field for overall report description
  MainReportFile: FileBasicSchema.nullable().optional(),
  Attachments: z.array(ReportAttachmentSchema).optional(),
  ProjectReportComments: z.array(ProjectReportCommentSchema).optional(),
  Student: StudentBasicSchema.nullable().optional(), // Submitter
  SubmittedByFacultyMember: FacultyMemberBasicSchema.nullable().optional(), // If a faculty member submits/oversees
});
export type ProjectFinalReport = z.infer<typeof ProjectFinalReportSchema>;

export const SubmitProjectReportDtoSchema = z
  .object({
    mainReportFileId: z.string().optional().nullable(), // ID of an existing uploaded File entity
    attachmentFileIds: z.array(z.string()).optional().default([]), // IDs of attachment files
    description: z.string().optional().nullable(), // Overall description for the submission
  })
  .refine(
    (data) =>
      data.mainReportFileId ||
      (data.attachmentFileIds && data.attachmentFileIds.length > 0),
    {
      message:
        'At least a main report file or one attachment must be provided.',
      path: ['mainReportFileId'], // Or a more general path
    },
  );
export type SubmitProjectReportDto = z.infer<
  typeof SubmitProjectReportDtoSchema
>;

// --------------------------- PROJECT ------------------------
export const ProjectSchema = z.object({
  id: z.string(),
  projectType: z.nativeEnum(PrismaProjectT), // Corrected: Was 'type' and used UserT
  title: z.string(),
  description: z.string().nullable().optional(),
  field: z.string(), // e.g., "Software Engineering"
  status: ProjectStatusEnum,
  createdAt: z.date(),
  updatedAt: z.date(),
  proposalDeadline: z.date().nullable().optional(),
  topicLockDate: z.date().nullable().optional(),
  customFields: z.record(z.any()).nullable().optional(), // JSON field
  approvedById: z.string().nullable().optional(), // FacultyMember ID
  fieldPoolId: z.string().nullable().optional(),
  divisionId: z.string().nullable().optional(),
  version: z.number().int(),

  // Basic relations often included
  ApprovedByFacultyMember: FacultyMemberBasicSchema.nullable().optional(),
  Division: DivisionBasicSchema.nullable().optional(),
  FieldPool: FieldPoolBasicSchema.nullable().optional(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const ProjectDetailSchema = ProjectSchema.extend({
  Member: z.array(ProjectMemberSchema).optional(),
  Comment: z.array(ProjectCommentSchema).optional(),
  ProposalOutline: ProposalOutlineBasicSchema.nullable().optional(),
  FinalReport: z.array(ProjectFinalReportSchema).optional(),
  // Domain: z.array(ProjectDomainSchema) // Requires ProjectDomainSchema with DomainBasicSchema
});
export type ProjectDetail = z.infer<typeof ProjectDetailSchema>;

// --------------------------- DTOs for API ------------------------

export const GeneralQueryDtoSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(), // e.g., "createdAt:desc"
});
export type GeneralQueryDto = z.infer<typeof GeneralQueryDtoSchema>;

export const ProjectQueryDtoSchema = GeneralQueryDtoSchema.extend({
  status: ProjectStatusEnum.optional(),
  type: z.nativeEnum(PrismaProjectT).optional(),
  facultyId: z.string().optional(),
  divisionId: z.string().optional(),
  studentId: z.string().optional(),
  lecturerId: z.string().optional(),
});

export class ProjectQueryDto {
  @ApiProperty({
    description: 'Số trang (bắt đầu từ 1)',
    example: 1,
    required: false,
    type: Number,
  })
  page?: number;

  @ApiProperty({
    description: 'Số lượng bản ghi trên mỗi trang',
    example: 10,
    required: false,
    type: Number,
  })
  limit?: number;

  @ApiProperty({
    description: 'Từ khóa tìm kiếm (tìm trong tiêu đề, mô tả, lĩnh vực)',
    example: 'hệ thống quản lý',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    description: 'Sắp xếp theo trường (format: field:order)',
    example: 'createdAt:desc',
    required: false,
    type: String,
  })
  sortBy?: string;

  @ApiProperty({
    description: 'Trạng thái dự án',
    enum: [
      'PENDING',
      'IN_PROGRESS',
      'WAITING_FOR_EVALUATION',
      'COMPLETED',
      'CANCELLED',
    ],
    example: 'IN_PROGRESS',
    required: false,
  })
  status?: string;

  @ApiProperty({
    description: 'Loại dự án',
    enum: ['GRADUATED', 'INTERNSHIP', 'RESEARCH'],
    example: 'GRADUATED',
    required: false,
  })
  type?: string;

  @ApiProperty({
    description: 'ID của khoa (để lọc dự án theo khoa)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    type: String,
  })
  facultyId?: string;

  @ApiProperty({
    description: 'ID của bộ môn (để lọc dự án theo bộ môn)',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
    type: String,
  })
  divisionId?: string;

  @ApiProperty({
    description: 'ID của sinh viên (để lọc dự án mà sinh viên tham gia)',
    example: '123e4567-e89b-12d3-a456-426614174002',
    required: false,
    type: String,
  })
  studentId?: string;

  @ApiProperty({
    description:
      'ID của giảng viên (để lọc dự án mà giảng viên hướng dẫn/tham gia)',
    example: '123e4567-e89b-12d3-a456-426614174003',
    required: false,
    type: String,
  })
  lecturerId?: string;
}

export const UpdateProjectStatusDtoSchema = z.object({
  status: ProjectStatusEnum,
  comment: z.string().optional().nullable(),
});
export type UpdateProjectStatusDto = z.infer<
  typeof UpdateProjectStatusDtoSchema
>;

// --------------------------- API RESPONSE SCHEMAS ------------------------

export const ProjectResponseSchema = ProjectSchema; // Basic project info
export const ProjectDetailResponseSchema = ProjectDetailSchema; // Detailed project info
export const ProjectMemberResponseSchema = z.array(ProjectMemberSchema);
export const ProjectCommentResponseSchema = z.array(ProjectCommentSchema);
export const ProjectFinalReportResponseSchema = ProjectFinalReportSchema;

// Helper for paginated responses
export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(
  itemSchema: T,
) {
  return z.object({
    data: z.array(itemSchema),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    totalPages: z.number().int(),
  });
}

// Swagger DTO class for UpdateProjectStatusDto
export class UpdateProjectStatusDtoClass {
  @ApiProperty({
    description: 'Trạng thái mới của dự án',
    enum: [
      'PENDING',
      'IN_PROGRESS',
      'WAITING_FOR_EVALUATION',
      'COMPLETED',
      'CANCELLED',
    ],
    example: 'IN_PROGRESS',
  })
  status: string;

  @ApiProperty({
    description: 'Ghi chú về việc thay đổi trạng thái',
    example: 'Dự án đã được phê duyệt và bắt đầu thực hiện',
    required: false,
    type: String,
  })
  comment?: string;
}

// Swagger DTO class for AddProjectMemberDto
export class AddProjectMemberDtoClass {
  @ApiProperty({
    description:
      'ID của sinh viên (chỉ định một trong studentId hoặc facultyMemberId)',
    example: '123e4567-e89b-12d3-a456-426614174002',
    required: false,
    type: String,
  })
  studentId?: string;

  @ApiProperty({
    description:
      'ID của giảng viên (chỉ định một trong studentId hoặc facultyMemberId)',
    example: '123e4567-e89b-12d3-a456-426614174003',
    required: false,
    type: String,
  })
  facultyMemberId?: string;

  @ApiProperty({
    description: 'Vai trò của thành viên trong dự án',
    example: 'ADVISOR',
    enum: ['STUDENT', 'ADVISOR', 'MEMBER', 'LEADER'],
    type: String,
  })
  role: string;
}

// Swagger DTO class for UpdateProjectMemberDto
export class UpdateProjectMemberDtoClass {
  @ApiProperty({
    description: 'Vai trò mới của thành viên',
    example: 'LEADER',
    enum: ['STUDENT', 'ADVISOR', 'MEMBER', 'LEADER'],
    required: false,
    type: String,
  })
  role?: string;

  @ApiProperty({
    description: 'Trạng thái của thành viên',
    enum: ['ACTIVE', 'INACTIVE', 'REMOVED'],
    example: 'ACTIVE',
    required: false,
  })
  status?: string;
}

// Swagger DTO class for CreateProjectCommentDto
export class CreateProjectCommentDtoClass {
  @ApiProperty({
    description: 'Nội dung bình luận',
    example: 'Dự án đang tiến triển tốt, cần bổ sung thêm tài liệu tham khảo.',
    minLength: 1,
    type: String,
  })
  content: string;
}

// Swagger DTO class for SubmitProjectReportDto
export class SubmitProjectReportDtoClass {
  @ApiProperty({
    description: 'ID của file báo cáo chính',
    example: '123e4567-e89b-12d3-a456-426614174004',
    required: false,
    type: String,
  })
  mainReportFileId?: string;

  @ApiProperty({
    description: 'Danh sách ID của các file đính kèm',
    example: [
      '123e4567-e89b-12d3-a456-426614174005',
      '123e4567-e89b-12d3-a456-426614174006',
    ],
    required: false,
    type: [String],
  })
  attachmentFileIds?: string[];

  @ApiProperty({
    description: 'Mô tả tổng quan về báo cáo',
    example: 'Báo cáo cuối kỳ về hệ thống quản lý thư viện',
    required: false,
    type: String,
  })
  description?: string;
}
