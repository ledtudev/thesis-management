import { ApiProperty } from '@nestjs/swagger';
import {
  DefenseCommitteeRoleT,
  EvaluatorRole,
  ProjectEvaluationStatusT,
} from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { paginationSchema } from 'src/common/schema/pagination.schema';
import { z } from 'zod';

// --- Project Evaluation Schemas ---
export const evaluationSchema = z.object({
  id: z.string().optional(),
  projectId: z.string(),
  finalScore: z.number().min(0).max(10).optional().nullable(),
  status: z.nativeEnum(ProjectEvaluationStatusT).optional(),
  advisorWeight: z.number().min(0).max(1).optional().nullable(),
  committeeWeight: z.number().min(0).max(1).optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  version: z.number().int().positive().optional(),
});

export type EvaluationType = z.infer<typeof evaluationSchema>;

// Create evaluation schema
export const createEvaluationDtoSchema = evaluationSchema
  .pick({
    projectId: true,
    status: true,
    advisorWeight: true,
    committeeWeight: true,
  })
  .required({
    projectId: true,
    status: true,
    advisorWeight: true,
    committeeWeight: true,
  });

export class CreateEvaluationDto extends createZodDto(
  createEvaluationDtoSchema,
) {}
export class UpdateEvaluationDto extends createZodDto(
  createEvaluationDtoSchema.partial(),
) {}
// Find evaluation schema with filters for role
export const findEvaluationDtoSchema = paginationSchema
  .extend({
    keyword: z.string().optional(),
    status: z.nativeEnum(ProjectEvaluationStatusT).optional(),
    projectId: z.string().optional(),
    defenseRole: z.nativeEnum(DefenseCommitteeRoleT).optional(),
    defenseMemberId: z.string().optional(),
    orderBy: z
      .enum(['createdAt', 'updatedAt', 'finalScore', 'status'])
      .default('createdAt'),
    asc: z.enum(['asc', 'desc']).default('desc'),
  })
  .partial();

export class FindEvaluationDto extends createZodDto(findEvaluationDtoSchema) {
  @ApiProperty({
    description: 'Từ khóa tìm kiếm',
    required: false,
  })
  keyword?: string;

  @ApiProperty({
    description: 'Trạng thái đánh giá',
    enum: ProjectEvaluationStatusT,
    required: false,
  })
  status?: ProjectEvaluationStatusT;

  @ApiProperty({
    description: 'ID của dự án',
    required: false,
  })
  projectId?: string;

  @ApiProperty({
    description: 'Vai trò của người dùng trong hội đồng',
    enum: DefenseCommitteeRoleT,
    required: false,
  })
  defenseRole?: DefenseCommitteeRoleT;

  @ApiProperty({
    description: 'ID của thành viên hội đồng',
    required: false,
  })
  defenseMemberId?: string;

  @ApiProperty({
    description: 'Sắp xếp theo',
    enum: ['createdAt', 'updatedAt', 'finalScore', 'status'],
    required: false,
    default: 'createdAt',
  })
  orderBy?: 'createdAt' | 'updatedAt' | 'finalScore' | 'status';

  @ApiProperty({
    description: 'Thứ tự sắp xếp',
    enum: ['asc', 'desc'],
    required: false,
    default: 'desc',
  })
  asc?: 'asc' | 'desc';

  @ApiProperty({
    description: 'Số trang',
    required: false,
    type: Number,
    default: 1,
  })
  page?: number;

  @ApiProperty({
    description: 'Số lượng mỗi trang',
    required: false,
    type: Number,
    default: 10,
  })
  limit?: number;
}

// Finalize evaluation schema
export const finalizeEvaluationDtoSchema = z.object({
  advisorWeight: z.number().min(0).max(1),
  committeeWeight: z.number().min(0).max(1),
  status: z
    .nativeEnum(ProjectEvaluationStatusT)
    .default(ProjectEvaluationStatusT.EVALUATED),
});

export class FinalizeEvaluationDto extends createZodDto(
  finalizeEvaluationDtoSchema,
) {
  @ApiProperty({
    description: 'Trọng số điểm của giáo viên hướng dẫn (0-1)',
    minimum: 0,
    maximum: 1,
    example: 0.4,
  })
  advisorWeight: number;

  @ApiProperty({
    description: 'Trọng số điểm của hội đồng (0-1)',
    minimum: 0,
    maximum: 1,
    example: 0.6,
  })
  committeeWeight: number;

  @ApiProperty({
    description: 'Trạng thái đánh giá',
    enum: ProjectEvaluationStatusT,
    example: ProjectEvaluationStatusT.EVALUATED,
    default: ProjectEvaluationStatusT.EVALUATED,
  })
  status: ProjectEvaluationStatusT = ProjectEvaluationStatusT.EVALUATED;
}

// --- Project Evaluation Score Schemas ---
export const evaluationScoreSchema = z.object({
  id: z.string().optional(),
  evaluationId: z.string(),
  evaluatorId: z.string().optional(),
  role: z.nativeEnum(EvaluatorRole),
  score: z.number().min(0).max(10),
  comment: z.string().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  version: z.number().int().positive().optional(),
});

export type EvaluationScoreType = z.infer<typeof evaluationScoreSchema>;

// Create or update score schema
export const createEvaluationScoreDtoSchema = evaluationScoreSchema
  .pick({
    evaluationId: true,
    role: true,
    score: true,
    comment: true,
  })
  .required({
    evaluationId: true,
    role: true,
    score: true,
  })
  .partial({
    comment: true,
  });

export class CreateEvaluationScoreDto extends createZodDto(
  createEvaluationScoreDtoSchema,
) {
  @ApiProperty({
    description: 'ID của đánh giá dự án',
    example: 'ckqv5fw0h0000mp08bze17q8x',
  })
  evaluationId: string;

  @ApiProperty({
    description: 'Vai trò người đánh giá',
    enum: EvaluatorRole,
    example: EvaluatorRole.COMMITTEE,
  })
  role: EvaluatorRole;

  @ApiProperty({
    description: 'Điểm đánh giá (0-10)',
    minimum: 0,
    maximum: 10,
    example: 8.5,
  })
  score: number;

  @ApiProperty({
    description: 'Nhận xét đánh giá',
    required: false,
    example: 'Dự án có tiềm năng phát triển tốt',
  })
  comment?: string;
}

// Update score schema
export const updateEvaluationScoreDtoSchema = evaluationScoreSchema
  .pick({
    score: true,
    comment: true,
  })
  .partial()
  .refine((data) => data.score !== undefined || data.comment !== undefined, {
    message: 'Cần cung cấp ít nhất 1 trường để cập nhật',
  });

export class UpdateEvaluationScoreDto extends createZodDto(
  updateEvaluationScoreDtoSchema,
) {
  @ApiProperty({
    description: 'Điểm đánh giá (0-10)',
    minimum: 0,
    maximum: 10,
    required: false,
  })
  score?: number;

  @ApiProperty({
    description: 'Nhận xét đánh giá',
    required: false,
  })
  comment?: string;
}
