import { FileT } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const uploadFileSchema = z.object({
  description: z.string().optional(),
});

const updateFileSchema = z.object({
  isArchived: z.boolean().optional().default(false),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});

const uploadAvatarSchema = z.object({
  file: z
    .instanceof(Buffer)
    .refine(
      (file) => {
        if (!file || typeof file !== 'object') return false;
        return (file as any).mimetype?.startsWith('image/');
      },
      {
        message: 'Only image files are allowed',
      },
    )
    .refine(
      (file) => {
        if (!file || typeof file !== 'object') return false;
        return (file as any).size <= MAX_FILE_SIZE;
      },
      {
        message: `File size must not exceed ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      },
    ),
});

const uploadProposalSchema = z.object({
  proposalOutlineId: z.string().optional(),
});

const uploadProjectReportSchema = z.object({
  fileType: z.nativeEnum(FileT, {
    errorMap: () => ({ message: 'Loại file không hợp lệ' }),
  }),
  description: z.string().optional(),
  projectFinalReportId: z.string().optional(),
});

const fileResponseSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  originalName: z.string(),
  filePath: z.string().nullable(),
  fileType: z.nativeEnum(FileT),
  mimeType: z.string(),
  fileSize: z.number().int(),
  checksum: z.string().optional().nullable(),
  uploadedByStudentId: z.string().optional().nullable(),
  uploadedByFacultyId: z.string().optional().nullable(),
  uploadedAt: z.date(),
  lastAccessed: z.date().optional().nullable(),
  isPublic: z.boolean(),
  isArchived: z.boolean(),
  metadata: z.record(z.any()).optional().nullable(),
});

const projectReportFileSchema = z.object({
  id: z.string(),
  finalReportId: z.string(),
  fileType: z.nativeEnum(FileT),
  fileUrl: z.string(),
  fileSize: z.number().optional(),
  isArchived: z.boolean(),
  description: z.string().optional().nullable(),
  uploadedById: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class UploadFileDto extends createZodDto(uploadFileSchema) {}
export class UpdateFileDto extends createZodDto(updateFileSchema) {}
export class UploadAvatarDto extends createZodDto(uploadAvatarSchema) {}
export class UploadProposalDto extends createZodDto(uploadProposalSchema) {}
export class UploadProjectReportDto extends createZodDto(
  uploadProjectReportSchema,
) {}
export class FileResponseDto extends createZodDto(fileResponseSchema) {}
export class ProjectReportFileDto extends createZodDto(
  projectReportFileSchema,
) {}
