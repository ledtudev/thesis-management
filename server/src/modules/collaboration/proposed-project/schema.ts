import { ApiProperty } from '@nestjs/swagger';
import { ProposalOutlineStatusT, ProposedProjectStatusT } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { paginationSchema } from 'src/common/schema/pagination.schema';
import { z } from 'zod';

// Giai đoạn 1: Khởi tạo đề xuất từ ProjectAllocation
export const createProposedProjectTriggerSchema = z.object({
  projectAllocationId: z.string().uuid('ID Phân công không hợp lệ'),
});

export class CreateProposedProjectTriggerDto extends createZodDto(
  createProposedProjectTriggerSchema,
) {
  @ApiProperty({
    description: 'ID của phân công dự án',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  projectAllocationId: string;
}

// Giai đoạn 2: Sinh viên cập nhật tên đề tài
export const updateProposedProjectSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  description: z.string().min(10, 'Mô tả không được quá ngắn').optional(),
  submitToAdvisor: z.boolean().optional(), // Nếu true, chuyển status thành PENDING_ADVISOR
});

export class UpdateProposedProjectDto extends createZodDto(
  updateProposedProjectSchema,
) {
  @ApiProperty({
    description: 'Tiêu đề đề tài',
    example: 'Ứng dụng AI trong nghiên cứu y học',
  })
  title: string;

  @ApiProperty({
    description: 'Mô tả chi tiết về đề tài',
    example: 'Nghiên cứu về ứng dụng trí tuệ nhân tạo trong chẩn đoán y học...',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Gửi cho giảng viên hướng dẫn xem xét',
    example: true,
    required: false,
  })
  submitToAdvisor?: boolean;
}

// Schema chung cho việc cập nhật trạng thái
export const updateStatusSchema = z.object({
  status: z.nativeEnum(ProposedProjectStatusT),
  comment: z.string().optional(),
  facultyId: z.string().uuid('ID Khoa không hợp lệ').optional(),
});

export class UpdateStatusDto extends createZodDto(updateStatusSchema) {
  @ApiProperty({
    description: 'Trạng thái mới',
    enum: ProposedProjectStatusT,
  })
  status: ProposedProjectStatusT;

  @ApiProperty({
    description: 'Bình luận/Phản hồi khi thay đổi trạng thái',
    example: 'Cần chỉnh sửa thêm mục tiêu nghiên cứu',
    required: false,
  })
  comment?: string;

  @ApiProperty({
    description: 'ID của khoa (khi Trưởng khoa phê duyệt)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  facultyId?: string;
}

// Tìm kiếm đề xuất dự án
export const findProposedProjectSchema = paginationSchema.extend({
  status: z.nativeEnum(ProposedProjectStatusT).optional(),
  advisorId: z.string().optional(),
  studentId: z.string().optional(),
  facultyId: z.string().optional(),
  fieldPoolId: z.string().optional(),
  projectAllocationId: z.string().optional(),
  keyword: z.string().optional(),
  orderBy: z
    .enum([
      'createdAt',
      'updatedAt',
      'title',
      'status',
      'studentName',
      'advisorName',
    ])
    .optional(),
  asc: z.enum(['asc', 'desc']).optional(),
});

export class FindProposedProjectDto extends createZodDto(
  findProposedProjectSchema,
) {
  @ApiProperty({
    description: 'Trạng thái đề xuất dự án',
    enum: ProposedProjectStatusT,
    required: false,
  })
  status?: ProposedProjectStatusT;

  @ApiProperty({
    description: 'ID của giảng viên hướng dẫn',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  advisorId?: string;

  @ApiProperty({
    description: 'ID của sinh viên',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  studentId?: string;

  @ApiProperty({
    description: 'ID của khoa',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  facultyId?: string;

  @ApiProperty({
    description: 'ID của đợt đăng ký',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  fieldPoolId?: string;

  @ApiProperty({
    description: 'ID của phân công dự án',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  projectAllocationId?: string;

  @ApiProperty({
    description: 'Từ khóa tìm kiếm',
    example: 'AI',
    required: false,
  })
  keyword?: string;

  @ApiProperty({
    description: 'Sắp xếp theo trường',
    enum: [
      'createdAt',
      'updatedAt',
      'title',
      'status',
      'studentName',
      'advisorName',
    ],
    required: false,
  })
  orderBy?:
    | 'createdAt'
    | 'updatedAt'
    | 'title'
    | 'status'
    | 'studentName'
    | 'advisorName';

  @ApiProperty({
    description: 'Hướng sắp xếp',
    enum: ['asc', 'desc'],
    required: false,
  })
  asc?: 'asc' | 'desc';

  @ApiProperty({
    description: 'Số trang',
    example: 1,
    required: false,
  })
  page?: number;

  @ApiProperty({
    description: 'Số lượng mỗi trang',
    example: 10,
    required: false,
  })
  limit?: number;
}

// Giai đoạn 3: GVHD duyệt tên đề tài
export const advisorReviewSchema = z.object({
  status: z.enum([
    ProposedProjectStatusT.TOPIC_APPROVED,
    ProposedProjectStatusT.TOPIC_REQUESTED_CHANGES,
    ProposedProjectStatusT.OUTLINE_REJECTED,
  ]),
  comment: z.string().optional(),
});

export class AdvisorReviewDto extends createZodDto(advisorReviewSchema) {
  @ApiProperty({
    description: 'Trạng thái sau khi GVHD duyệt',
    enum: [
      ProposedProjectStatusT.TOPIC_APPROVED,
      ProposedProjectStatusT.TOPIC_REQUESTED_CHANGES,
      ProposedProjectStatusT.OUTLINE_REJECTED,
    ],
  })
  status: 'TOPIC_APPROVED' | 'TOPIC_REQUESTED_CHANGES' | 'OUTLINE_REJECTED';

  @ApiProperty({
    description: 'Bình luận của GVHD',
    example: 'Tiêu đề cần cụ thể hơn',
    required: false,
  })
  comment?: string;
}

// Giai đoạn 4: TBM duyệt đề tài
export const departmentHeadReviewSchema = z.object({
  status: z.enum([
    ProposedProjectStatusT.PENDING_HEAD,
    ProposedProjectStatusT.REQUESTED_CHANGES_HEAD,
    ProposedProjectStatusT.REJECTED_BY_HEAD,
  ]),
  comment: z.string().optional(),
});

export class DepartmentHeadReviewDto extends createZodDto(
  departmentHeadReviewSchema,
) {
  @ApiProperty({
    description: 'Trạng thái sau khi Trưởng bộ môn duyệt',
    enum: [
      ProposedProjectStatusT.PENDING_HEAD,
      ProposedProjectStatusT.REQUESTED_CHANGES_HEAD,
      ProposedProjectStatusT.REJECTED_BY_HEAD,
    ],
  })
  status: 'PENDING_HEAD' | 'REQUESTED_CHANGES_HEAD' | 'REJECTED_BY_HEAD';

  @ApiProperty({
    description: 'Bình luận của TBM',
    example: 'Cần bổ sung thêm nguồn tài liệu tham khảo',
    required: false,
  })
  comment?: string;
}

// Giai đoạn 5: Trưởng khoa duyệt và tạo dự án chính thức
export const headApprovalSchema = z.object({
  status: z.literal(ProposedProjectStatusT.APPROVED_BY_HEAD),
  comment: z.string().optional(),
  facultyId: z.string().uuid('ID Khoa không hợp lệ').optional(),
});

export class HeadApprovalDto extends createZodDto(headApprovalSchema) {
  @ApiProperty({
    description: 'Trạng thái phê duyệt cuối cùng',
    enum: [ProposedProjectStatusT.APPROVED_BY_HEAD],
  })
  status: 'APPROVED_BY_HEAD';

  @ApiProperty({
    description: 'Bình luận của Trưởng khoa',
    example: 'Đã phê duyệt',
    required: false,
  })
  comment?: string;

  @ApiProperty({
    description: 'ID của khoa',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  facultyId?: string;
}

// Quản lý thành viên trong đề xuất dự án
export const manageProposedMemberSchema = z.object({
  studentId: z.string().uuid('ID Sinh viên không hợp lệ'),
  action: z.enum(['add', 'remove']),
  role: z.string().optional(), // Vai trò khi thêm thành viên
});

export class ManageProposedMemberDto extends createZodDto(
  manageProposedMemberSchema,
) {
  @ApiProperty({
    description: 'ID của sinh viên',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  studentId: string;

  @ApiProperty({
    description: 'Hành động: thêm hoặc xóa thành viên',
    enum: ['add', 'remove'],
  })
  action: 'add' | 'remove';

  @ApiProperty({
    description: 'Vai trò của thành viên',
    example: 'Thành viên chính',
    required: false,
  })
  role?: string;
}

// Giai đoạn 6: Sinh viên nộp đề cương chi tiết
export const submitProposalOutlineSchema = z.object({
  introduction: z.string().min(10, 'Phần giới thiệu quá ngắn'),
  objectives: z.string().min(10, 'Phần mục tiêu quá ngắn'),
  methodology: z.string().min(10, 'Phần phương pháp quá ngắn'),
  expectedResults: z.string().min(10, 'Phần kết quả dự kiến quá ngắn'),
  fileId: z.string().uuid('ID File không hợp lệ').optional(),
  proposedProjectId: z.string(),
  submitForReview: z.boolean().optional(), // Nếu true, chuyển status thành PENDING_REVIEW
});

export class SubmitProposalOutlineDto extends createZodDto(
  submitProposalOutlineSchema,
) {
  @ApiProperty({
    description: 'Phần giới thiệu đề cương',
    example: 'Nghiên cứu này tập trung vào...',
  })
  introduction: string;

  @ApiProperty({
    description: 'Mục tiêu nghiên cứu',
    example: 'Mục tiêu chính của nghiên cứu này là...',
  })
  objectives: string;

  @ApiProperty({
    description: 'Phương pháp nghiên cứu',
    example: 'Nghiên cứu sẽ sử dụng phương pháp...',
  })
  methodology: string;

  @ApiProperty({
    description: 'Kết quả dự kiến',
    example: 'Dự kiến sau khi hoàn thành nghiên cứu...',
  })
  expectedResults: string;

  @ApiProperty({
    description: 'ID của file đính kèm',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  fileId?: string;

  @ApiProperty({
    description: 'ID của đề xuất dự án',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  proposedProjectId: string;

  @ApiProperty({
    description: 'Gửi để xem xét',
    example: true,
    required: false,
  })
  submitForReview?: boolean;
}

// Giai đoạn 7: GVHD/TBM duyệt đề cương
export const reviewProposalOutlineSchema = z.object({
  status: z.enum([
    ProposalOutlineStatusT.APPROVED,
    ProposalOutlineStatusT.REQUESTED_CHANGES,
    ProposalOutlineStatusT.REJECTED,
  ]),
  comment: z.string().optional(),
});

export class ReviewProposalOutlineDto extends createZodDto(
  reviewProposalOutlineSchema,
) {
  @ApiProperty({
    description: 'Trạng thái sau khi xem xét',
    enum: [
      ProposalOutlineStatusT.APPROVED,
      ProposalOutlineStatusT.REQUESTED_CHANGES,
      ProposalOutlineStatusT.REJECTED,
    ],
  })
  status: 'APPROVED' | 'REQUESTED_CHANGES' | 'REJECTED';

  @ApiProperty({
    description: 'Bình luận khi xem xét',
    example: 'Cần bổ sung thêm phần tài liệu tham khảo',
    required: false,
  })
  comment?: string;
}

// Giai đoạn 8: Trưởng khoa khóa đề cương
export const lockProposalOutlineSchema = z.object({
  status: z.literal(ProposalOutlineStatusT.LOCKED),
});

export class LockProposalOutlineDto extends createZodDto(
  lockProposalOutlineSchema,
) {
  @ApiProperty({
    description: 'Trạng thái khóa',
    enum: [ProposalOutlineStatusT.LOCKED],
  })
  status: 'LOCKED';
}

/**
 * DTO for updating proposal title
 */
export const updateProposedProjectTitleSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(200).optional(),
});

export class UpdateProposedProjectTitleDto extends createZodDto(
  updateProposedProjectTitleSchema,
) {
  @ApiProperty({
    description: 'Tên đề tài mới',
    example: 'Tên đề tài mới',
  })
  title: string;

  @ApiProperty({
    description: 'Mô tả đề tài mới',
    example: 'Mô tả đề tài mới',
    required: false,
  })
  description?: string;
}

// For Excel export
export const exportProjectsToExcelSchema = z.object({
  advisorId: z.string().optional(),
  facultyId: z.string().optional(),
  status: z.nativeEnum(ProposedProjectStatusT).optional(),
  fieldPoolId: z.string().optional(),
  exportAll: z.boolean().optional(),
});

// Bulk Status Update
export const bulkStatusUpdateSchema = z.object({
  projectIds: z.array(z.string()),
  status: z.nativeEnum(ProposedProjectStatusT),
  comment: z.string().optional(),
});

export class BulkStatusUpdateDto extends createZodDto(bulkStatusUpdateSchema) {
  @ApiProperty({
    description: 'Array of project IDs to update',
    example: ['uuid-1', 'uuid-2'],
    type: [String],
  })
  projectIds: string[];

  @ApiProperty({
    description: 'New status to set for all projects',
    enum: ProposedProjectStatusT,
    example: 'TOPIC_APPROVED',
  })
  status: ProposedProjectStatusT;

  @ApiProperty({
    description: 'Optional comment to add to all projects',
    example: 'All projects approved in bulk action',
    required: false,
  })
  comment?: string;
}

export class ExportProjectsToExcelDto extends createZodDto(
  exportProjectsToExcelSchema,
) {
  @ApiProperty({
    description: 'ID của giảng viên hướng dẫn',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  advisorId?: string;

  @ApiProperty({
    description: 'ID của khoa',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  facultyId?: string;

  @ApiProperty({
    description: 'Trạng thái đề xuất dự án',
    enum: ProposedProjectStatusT,
    required: false,
  })
  status?: ProposedProjectStatusT;

  @ApiProperty({
    description: 'ID của đợt đăng ký',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  fieldPoolId?: string;

  @ApiProperty({
    description: 'Xuất tất cả dữ liệu',
    example: false,
    required: false,
  })
  exportAll?: boolean;
}
