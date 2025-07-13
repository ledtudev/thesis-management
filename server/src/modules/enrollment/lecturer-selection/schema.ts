import { ApiProperty } from '@nestjs/swagger';
import { LecturerSelectionStatusT } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { errorMessages } from 'src/common/constant/errors';
import { paginationSchema } from 'src/common/schema/pagination.schema';
import { z } from 'zod';

export const lecturerSelectionSchema = z.object({
  id: z.string(),
  capacity: z.number().int().min(1).default(1),
  currentCapacity: z.number().int().min(0).default(0),
  status: z
    .nativeEnum(LecturerSelectionStatusT, {
      errorMap: () => ({ message: errorMessages.invalidStatus }),
    })
    .default('PENDING'),
  isActive: z.boolean().default(true),
  lecturerId: z.string(),
  fieldPoolId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  version: z.number().int().optional(),
  isDeleted: z.boolean().default(false),
});

export type LecturerSelectionType = z.infer<typeof lecturerSelectionSchema>;

export const createLecturerSelectionDtoSchema = lecturerSelectionSchema
  .pick({
    capacity: true,
    fieldPoolId: true,
    isActive: true,
  })
  .required();

export class CreateLecturerSelectionDto extends createZodDto(
  createLecturerSelectionDtoSchema,
) {
  @ApiProperty({
    description: 'Số lượng sinh viên tối đa',
    type: Number,
    example: 5,
    default: 1,
  })
  capacity: number;

  @ApiProperty({
    description: 'ID của lĩnh vực nghiên cứu',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  fieldPoolId: string;
}

export const findLecturerSelectionsDtoSchema = paginationSchema
  .extend({
    lecturerId: z.string().optional(),
    status: z.nativeEnum(LecturerSelectionStatusT).optional(),
    isActive: z.boolean().optional(),
    fieldPoolId: z.string().optional(),
    searchTerm: z.string().optional(),
    orderBy: z.enum(['createdAt', 'capacity']).default('createdAt'),
    asc: z.enum(['asc', 'desc']).default('desc'),
    isDeleted: z.boolean().optional(),
  })
  .partial();

export class FindLecturerSelectionsDto extends createZodDto(
  findLecturerSelectionsDtoSchema,
) {
  @ApiProperty({
    description: 'ID của giảng viên',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  lecturerId?: string;

  @ApiProperty({
    description: 'Trạng thái đăng ký',
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    required: false,
  })
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    type: Boolean,
    required: false,
  })
  isActive?: boolean;

  @ApiProperty({
    description: 'ID của lĩnh vực nghiên cứu',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  fieldPoolId?: string;

  @ApiProperty({
    description: 'Từ khóa tìm kiếm (fulltext)',
    type: String,
    required: false,
  })
  searchTerm?: string;

  @ApiProperty({
    description: 'Sắp xếp theo',
    enum: ['createdAt', 'capacity'],
    default: 'createdAt',
    required: false,
  })
  orderBy?: 'createdAt' | 'capacity';

  @ApiProperty({
    description: 'Thứ tự sắp xếp',
    enum: ['asc', 'desc'],
    default: 'desc',
    required: false,
  })
  asc?: 'asc' | 'desc';

  @ApiProperty({
    description: 'Trang',
    type: Number,
    default: 1,
    required: false,
  })
  page?: number;

  @ApiProperty({
    description: 'Số lượng mỗi trang',
    type: Number,
    default: 10,
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

export const updateLecturerSelectionDtoSchema = lecturerSelectionSchema
  .pick({
    capacity: true,
    isActive: true,
    status: true,
    isDeleted: true,
  })
  .partial();

export class UpdateLecturerSelectionDto extends createZodDto(
  updateLecturerSelectionDtoSchema,
) {
  @ApiProperty({
    description: 'Số lượng sinh viên tối đa',
    type: Number,
    example: 5,
    required: false,
  })
  capacity?: number;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    type: Boolean,
    required: false,
  })
  isActive?: boolean;

  @ApiProperty({
    description: 'Trạng thái đăng ký',
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    required: false,
  })
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';

  @ApiProperty({
    description: 'Đã xóa mềm',
    type: Boolean,
    required: false,
  })
  isDeleted?: boolean;
}

export const updateLecturerSelectionStatusDtoSchema = lecturerSelectionSchema
  .pick({
    status: true,
  })
  .required({
    status: true,
  });

export class UpdateLecturerSelectionStatusDto extends createZodDto(
  updateLecturerSelectionStatusDtoSchema,
) {
  @ApiProperty({
    description: 'Trạng thái đăng ký',
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    required: true,
  })
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const deleteLecturerSelectionDtoSchema = z.object({
  id: z.string(),
});

export class DeleteLecturerSelectionDto extends createZodDto(
  deleteLecturerSelectionDtoSchema,
) {
  @ApiProperty({
    description: 'ID của đăng ký giảng viên',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;
}
