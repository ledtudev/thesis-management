import { ApiProperty } from '@nestjs/swagger';
import { StudentSelectionStatusT, UserT } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { errorMessages } from 'src/common/constant/errors';
import { stringToNumber } from 'src/common/pipe/zod-custom';
import { paginationSchema } from 'src/common/schema/pagination.schema';
import { z } from 'zod';

export const studentSelectionSchema = z.object({
  id: z.string(),
  priority: z.number().int().min(1, errorMessages.required('Thứ tự ưu tiên')),
  topicTitle: z
    .string()
    .min(3, errorMessages.minLength('Tiêu đề mong muốn', 3))
    .optional()
    .nullable(),
  description: z.string().optional().nullable(),
  status: z
    .nativeEnum(StudentSelectionStatusT, {
      errorMap: () => ({ message: errorMessages.invalidStatus }),
    })
    .default('PENDING'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  isDeleted: z.boolean().default(false),
  studentId: z.string(),
  lecturerId: z.string().optional().nullable(),
  fieldPoolId: z.string().optional().nullable(),
  preferredAt: z.date().optional(),
  approvedById: z
    .string()

    .optional()
    .nullable(),
  approvedByType: z.nativeEnum(UserT).optional().nullable(),
});

export type StudentSelectionType = z.infer<typeof studentSelectionSchema>;

export const createStudentSelectionDtoSchema = studentSelectionSchema
  .pick({
    priority: true,
    topicTitle: true,
    description: true,
    lecturerId: true,
    fieldPoolId: true,
  })
  .required({
    priority: true,
  })
  .superRefine((data, ctx) => {
    if (!data.lecturerId && !data.fieldPoolId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Phải chọn ít nhất Giảng viên hướng dẫn hoặc Đợt đăng ký nguyện vọng.',
      });
    }
  });

export class CreateStudentSelectionDto extends createZodDto(
  createStudentSelectionDtoSchema,
) {
  @ApiProperty({
    description: 'Thứ tự ưu tiên',
    example: 1,
  })
  priority: number;

  @ApiProperty({
    description: 'Tiêu đề mong muốn',
    example: 'Đề tài mong muốn',
    required: false,
  })
  topicTitle?: string | null;

  @ApiProperty({
    description: 'Mô tả chi tiết',
    example: 'Mô tả chi tiết về đề tài',
    required: false,
  })
  description?: string | null;

  @ApiProperty({
    description: 'ID của giảng viên hướng dẫn',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  lecturerId?: string | null;

  @ApiProperty({
    description: 'ID của đợt đăng ký',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  fieldPoolId?: string | null;
}

export const findStudentSelectionDtoSchema = paginationSchema
  .extend({
    studentId: z.string(),
    lecturerId: z.string(),
    fieldPoolId: z.string(),
    status: z.nativeEnum(StudentSelectionStatusT),
    priority: stringToNumber('Thứ tự ưu tiên')
      .pipe(z.number().int().min(1))
      .optional(),
    departmentId: z.string(),
    keyword: z.string(),
    orderBy: z
      .enum(['createdAt', 'updatedAt', 'priority', 'preferredAt'])
      .default('priority'),
    asc: z.enum(['asc', 'desc']).default('asc'),
    isDeleted: z.boolean(),
  })
  .partial();

export class FindStudentSelectionDto extends createZodDto(
  findStudentSelectionDtoSchema,
) {
  @ApiProperty({
    description: 'ID của sinh viên',
    required: false,
  })
  studentId?: string;

  @ApiProperty({
    description: 'ID của giảng viên',
    required: false,
  })
  lecturerId?: string;

  @ApiProperty({
    description: 'ID của đợt đăng ký',
    required: false,
  })
  fieldPoolId?: string;

  @ApiProperty({
    description: 'Trạng thái của nguyện vọng',
    enum: StudentSelectionStatusT,
    required: false,
  })
  status?: StudentSelectionStatusT;

  @ApiProperty({
    description: 'Thứ tự ưu tiên',
    required: false,
  })
  priority?: number;

  @ApiProperty({
    description: 'ID của khoa',
    required: false,
  })
  departmentId?: string;

  @ApiProperty({
    description: 'Từ khóa tìm kiếm',
    required: false,
  })
  keyword?: string;

  @ApiProperty({
    description: 'Sắp xếp theo',
    enum: ['createdAt', 'updatedAt', 'priority', 'preferredAt'],
    required: false,
  })
  orderBy?: 'createdAt' | 'updatedAt' | 'priority' | 'preferredAt';

  @ApiProperty({
    description: 'Hướng sắp xếp',
    enum: ['asc', 'desc'],
    required: false,
  })
  asc?: 'asc' | 'desc';

  @ApiProperty({
    description: 'Số trang',
    required: false,
  })
  page?: number;

  @ApiProperty({
    description: 'Số lượng mỗi trang',
    required: false,
  })
  limit?: number;

  @ApiProperty({
    description: 'Đã xóa mềm',
    type: Boolean,
    required: false,
  })
  isDeleted?: boolean;
}

export const updateStudentSelectionDtoSchema = studentSelectionSchema
  .pick({
    priority: true,
    topicTitle: true,
    description: true,
    lecturerId: true,
    fieldPoolId: true,
  })
  .partial();

export class UpdateStudentSelectionDto extends createZodDto(
  updateStudentSelectionDtoSchema,
) {
  @ApiProperty({
    description: 'Thứ tự ưu tiên',
    example: 1,
    required: false,
  })
  priority?: number;

  @ApiProperty({
    description: 'Tiêu đề mong muốn',
    example: 'Đề tài mong muốn',
    required: false,
  })
  topicTitle?: string | null;

  @ApiProperty({
    description: 'Mô tả chi tiết',
    example: 'Mô tả chi tiết về đề tài',
    required: false,
  })
  description?: string | null;

  @ApiProperty({
    description: 'ID của giảng viên hướng dẫn',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  lecturerId?: string | null;

  @ApiProperty({
    description: 'ID của đợt đăng ký',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  fieldPoolId?: string | null;
}

export const updateStudentSelectionStatusDtoSchema = z
  .object({
    status: z.nativeEnum(StudentSelectionStatusT, {
      errorMap: () => ({ message: errorMessages.invalidStatus }),
    }),
  })
  .required({
    status: true,
  });

export class UpdateStudentSelectionStatusDto extends createZodDto(
  updateStudentSelectionStatusDtoSchema,
) {
  @ApiProperty({
    description: 'Trạng thái mới',
    enum: StudentSelectionStatusT,
    example: StudentSelectionStatusT.APPROVED,
  })
  status: StudentSelectionStatusT;

  @ApiProperty({
    description: 'Ghi chú',
    example: 'Đã duyệt nguyện vọng',
    required: false,
  })
  comment?: string;
}

export const bulkUpdateStudentSelectionStatusDtoSchema = z.object({
  selectionIds: z.array(z.string()).min(1, 'Cần ít nhất một nguyện vọng'),
  status: z.nativeEnum(StudentSelectionStatusT, {
    errorMap: () => ({ message: errorMessages.invalidStatus }),
  }),
  comment: z.string().optional(),
});

export class BulkUpdateStudentSelectionStatusDto extends createZodDto(
  bulkUpdateStudentSelectionStatusDtoSchema,
) {
  @ApiProperty({
    description: 'Danh sách ID nguyện vọng cần cập nhật',
    type: [String],
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ],
  })
  selectionIds: string[];

  @ApiProperty({
    description: 'Trạng thái mới',
    enum: StudentSelectionStatusT,
    example: StudentSelectionStatusT.APPROVED,
  })
  status: StudentSelectionStatusT;

  @ApiProperty({
    description: 'Ghi chú',
    example: 'Đã duyệt nguyện vọng hàng loạt',
    required: false,
  })
  comment?: string;
}
