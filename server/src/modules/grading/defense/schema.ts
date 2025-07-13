import { ApiProperty } from '@nestjs/swagger';
import { DefenseCommitteeRoleT, DefenseCommitteeStatusT } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { errorMessages } from 'src/common/constant/errors';
import { stringToDate } from 'src/common/pipe';
import { paginationSchema } from 'src/common/schema/pagination.schema';
import { z } from 'zod';

export const defenseCommitteeSchema = z.object({
  id: z.string(),
  name: z.string().min(3, errorMessages.minLength('Tên hội đồng', 3)),
  description: z.string().optional().nullable(),
  defenseDate: stringToDate('startDate'),
  location: z.string().optional().nullable(),
  status: z.nativeEnum(DefenseCommitteeStatusT),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  projectId: z.string(),
  createdById: z.string(),
  version: z.number().int().positive().optional(),
});

export type DefenseCommitteeType = z.infer<typeof defenseCommitteeSchema>;

export const createDefenseCommitteeDtoSchema = defenseCommitteeSchema
  .pick({
    name: true,
    description: true,
    defenseDate: true,
    location: true,
    projectId: true,
  })
  .required()
  .partial({
    description: true,
    location: true,
  });

export class CreateDefenseCommitteeDto extends createZodDto(
  createDefenseCommitteeDtoSchema,
) {
  @ApiProperty({
    description: 'Tên hội đồng bảo vệ',
    example: 'Hội đồng bảo vệ đồ án tốt nghiệp - Nhóm 1',
  })
  name: string;

  @ApiProperty({
    description: 'Mô tả về hội đồng (tùy chọn)',
    example: 'Hội đồng đánh giá các đề tài liên quan đến trí tuệ nhân tạo',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Ngày bảo vệ',
    example: '2023-06-30T09:00:00Z',
  })
  defenseDate: Date;

  @ApiProperty({
    description: 'Địa điểm bảo vệ (tùy chọn)',
    example: 'Phòng họp 305, Tòa H1',
    required: false,
  })
  location?: string;

  @ApiProperty({
    description: 'ID của dự án được bảo vệ',
    example: 'ckqv5fw0h0000mp08bze17q8x',
  })
  projectId: string;
}

export const defenseMemberSchema = z.object({
  id: z.string(),
  role: z.nativeEnum(DefenseCommitteeRoleT),
  defenseCommitteeId: z.string(),
  facultyMemberId: z.string(),
  version: z.number().int().positive().optional(),
});

export type DefenseMemberType = z.infer<typeof defenseMemberSchema>;

export const createDefenseMemberDtoSchema = defenseMemberSchema
  .pick({
    role: true,
    facultyMemberId: true,
  })
  .required();

export class CreateDefenseMemberDto extends createZodDto(
  createDefenseMemberDtoSchema,
) {
  @ApiProperty({
    description: 'Vai trò trong hội đồng',
    enum: DefenseCommitteeRoleT,
    example: DefenseCommitteeRoleT.CHAIRMAN,
  })
  role: DefenseCommitteeRoleT;

  @ApiProperty({
    description: 'ID của giảng viên',
    example: 'ckqv5fw0h0000mp08bze17q8x',
  })
  facultyMemberId: string;
}

export const updateDefenseCommitteeDtoSchema = defenseCommitteeSchema
  .pick({
    name: true,
    description: true,
    defenseDate: true,
    location: true,
    status: true,
  })
  .partial();

export class UpdateDefenseCommitteeDto extends createZodDto(
  updateDefenseCommitteeDtoSchema,
) {
  @ApiProperty({
    description: 'Tên hội đồng bảo vệ',
    example: 'Hội đồng bảo vệ đồ án tốt nghiệp - Nhóm 1',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'Mô tả về hội đồng',
    example: 'Hội đồng đánh giá các đề tài liên quan đến trí tuệ nhân tạo',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Ngày bảo vệ',
    example: '2023-06-30T09:00:00Z',
    required: false,
  })
  defenseDate?: Date;

  @ApiProperty({
    description: 'Địa điểm bảo vệ',
    example: 'Phòng họp 305, Tòa H1',
    required: false,
  })
  location?: string;

  @ApiProperty({
    description: 'Trạng thái hội đồng',
    enum: DefenseCommitteeStatusT,
    example: DefenseCommitteeStatusT.SCHEDULED,
    required: false,
  })
  status?: DefenseCommitteeStatusT;
}

export const findDefenseCommitteeDtoSchema = paginationSchema
  .extend({
    keyword: z.string(),
    facultyId: z.string(),
    status: z.nativeEnum(DefenseCommitteeStatusT),
    startDate: z.string(),
    endDate: z.string(),
    orderBy: z
      .enum(['createdAt', 'updatedAt', 'defenseDate', 'name', 'status'])
      .default('defenseDate'),
    asc: z.enum(['asc', 'desc']).default('asc'),
  })
  .partial();

export class FindDefenseCommitteeDto extends createZodDto(
  findDefenseCommitteeDtoSchema,
) {
  @ApiProperty({
    description: 'Từ khóa tìm kiếm (tên hội đồng, địa điểm...)',
    required: false,
  })
  keyword?: string;

  @ApiProperty({
    description: 'ID của khoa',
    required: false,
  })
  facultyId?: string;

  @ApiProperty({
    description: 'Trạng thái hội đồng',
    enum: DefenseCommitteeStatusT,
    required: false,
  })
  status?: DefenseCommitteeStatusT;

  @ApiProperty({
    description: 'Ngày bắt đầu tìm kiếm (YYYY-MM-DD)',
    required: false,
  })
  startDate?: string;

  @ApiProperty({
    description: 'Ngày kết thúc tìm kiếm (YYYY-MM-DD)',
    required: false,
  })
  endDate?: string;

  @ApiProperty({
    description: 'Sắp xếp theo',
    enum: ['createdAt', 'updatedAt', 'defenseDate', 'name', 'status'],
    required: false,
    default: 'defenseDate',
  })
  orderBy?: 'createdAt' | 'updatedAt' | 'defenseDate' | 'name' | 'status';

  @ApiProperty({
    description: 'Thứ tự sắp xếp',
    enum: ['asc', 'desc'],
    required: false,
    default: 'asc',
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

export const bulkCreateDefenseCommitteesDtoSchema = z.object({
  projectIds: z.array(z.string()).min(1, 'Cần ít nhất một project ID'),
  defaultLocation: z.string().optional(),
  defaultDefenseDate: z.date().optional(),
  committeeSizeMin: z.number().int().min(3).max(7).default(3),
  committeeSizeMax: z.number().int().min(3).max(7).default(5),
});

export class BulkCreateDefenseCommitteesDto extends createZodDto(
  bulkCreateDefenseCommitteesDtoSchema,
) {
  @ApiProperty({
    description: 'Danh sách ID các dự án cần tạo hội đồng',
    type: [String],
    example: ['ckqv5fw0h0000mp08bze17q8x', 'ckqv5fw0h0000mp08bze17q9y'],
  })
  projectIds: string[];

  @ApiProperty({
    description: 'Địa điểm mặc định cho tất cả hội đồng',
    required: false,
    example: 'Phòng họp 305, Tòa H1',
  })
  defaultLocation?: string;

  @ApiProperty({
    description: 'Ngày bảo vệ mặc định cho tất cả hội đồng',
    required: false,
  })
  defaultDefenseDate?: Date;

  @ApiProperty({
    description: 'Số lượng thành viên tối thiểu trong hội đồng',
    type: Number,
    minimum: 3,
    maximum: 7,
    default: 3,
  })
  committeeSizeMin: number = 3;

  @ApiProperty({
    description: 'Số lượng thành viên tối đa trong hội đồng',
    type: Number,
    minimum: 3,
    maximum: 7,
    default: 5,
  })
  committeeSizeMax: number = 5;
}

// New schema for searching faculty members for committee
export const findFacultyForCommitteeDtoSchema = paginationSchema
  .extend({
    keyword: z.string(),
    facultyId: z.string(),
    excludeAdvisorIds: z.array(z.string()),
    excludeCommitteeIds: z.array(z.string()),
    orderBy: z
      .enum(['fullName', 'facultyCode', 'createdAt'])
      .default('fullName'),
    asc: z.enum(['asc', 'desc']).default('asc'),
  })
  .partial();

export class FindFacultyForCommitteeDto extends createZodDto(
  findFacultyForCommitteeDtoSchema,
) {
  @ApiProperty({
    description: 'Từ khóa tìm kiếm (tên, mã giảng viên...)',
    required: false,
  })
  keyword?: string;

  @ApiProperty({
    description: 'ID của khoa',
    required: false,
  })
  facultyId?: string;

  @ApiProperty({
    description:
      'Danh sách ID giảng viên cần loại trừ (như giảng viên hướng dẫn)',
    type: [String],
    required: false,
  })
  excludeAdvisorIds?: string[];

  @ApiProperty({
    description: 'Danh sách ID hội đồng cần loại trừ thành viên',
    type: [String],
    required: false,
  })
  excludeCommitteeIds?: string[];

  @ApiProperty({
    description: 'Sắp xếp theo',
    enum: ['fullName', 'facultyCode', 'createdAt'],
    required: false,
    default: 'fullName',
  })
  orderBy?: 'fullName' | 'facultyCode' | 'createdAt';

  @ApiProperty({
    description: 'Thứ tự sắp xếp',
    enum: ['asc', 'desc'],
    required: false,
    default: 'asc',
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

// Schema for getting projects ready for defense
export const findProjectsReadyForDefenseDtoSchema = paginationSchema
  .extend({
    keyword: z.string(),
    facultyId: z.string(),
    divisionId: z.string(),
    fieldPoolId: z.string(),
    hasCommittee: z
      .union([z.boolean(), z.string()])
      .transform((val) => {
        if (typeof val === 'string') {
          return val.toLowerCase() === 'true';
        }
        return val;
      })
      .optional(),
    orderBy: z.enum(['title', 'createdAt', 'updatedAt']).default('updatedAt'),
    asc: z.enum(['asc', 'desc']).default('desc'),
  })
  .partial();

export class FindProjectsReadyForDefenseDto extends createZodDto(
  findProjectsReadyForDefenseDtoSchema,
) {
  @ApiProperty({
    description: 'Từ khóa tìm kiếm (tiêu đề dự án, tên sinh viên...)',
    required: false,
  })
  keyword?: string;

  @ApiProperty({
    description: 'ID của khoa',
    required: false,
  })
  facultyId?: string;

  @ApiProperty({
    description: 'ID của bộ môn',
    required: false,
  })
  divisionId?: string;

  @ApiProperty({
    description: 'ID của lĩnh vực',
    required: false,
  })
  fieldPoolId?: string;

  @ApiProperty({
    description: 'Lọc theo việc đã có hội đồng hay chưa',
    required: false,
  })
  hasCommittee?: boolean;

  @ApiProperty({
    description: 'Sắp xếp theo',
    enum: ['title', 'createdAt', 'updatedAt'],
    required: false,
    default: 'updatedAt',
  })
  orderBy?: 'title' | 'createdAt' | 'updatedAt';

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

// Schema for auto-assigning committee members
export const autoAssignCommitteeMembersDtoSchema = z.object({
  committeeId: z.string(),
  memberCount: z.number().int().min(3).max(7).default(5),
  excludeFacultyIds: z.array(z.string()).optional(),
});

export class AutoAssignCommitteeMembersDto extends createZodDto(
  autoAssignCommitteeMembersDtoSchema,
) {
  @ApiProperty({
    description: 'ID của hội đồng',
    example: 'ckqv5fw0h0000mp08bze17q8x',
  })
  committeeId: string;

  @ApiProperty({
    description: 'Số lượng thành viên cần thêm',
    type: Number,
    minimum: 3,
    maximum: 7,
    default: 5,
  })
  memberCount: number = 5;

  @ApiProperty({
    description: 'Danh sách ID giảng viên cần loại trừ',
    type: [String],
    required: false,
  })
  excludeFacultyIds?: string[];
}
