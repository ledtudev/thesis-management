import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FacultyMemberRoleT, Prisma } from '@prisma/client';
import { AuthPayload } from 'src/common/interface';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { BasicStudent } from 'src/common/schema/prisma.schema';
import { uuidv7 } from 'uuidv7';
import {
  BulkUpdateStudentSelectionStatusDto,
  CreateStudentSelectionDto,
  FindStudentSelectionDto,
  UpdateStudentSelectionDto,
  UpdateStudentSelectionStatusDto,
} from './schema';

const LECTURER = FacultyMemberRoleT.LECTURER;
const DEAN = FacultyMemberRoleT.DEAN;
// Note: DEPARTMENT_HEAD appears to no longer exist in the schema, using LECTURER instead
const DEPARTMENT_HEAD = LECTURER;

@Injectable()
export class StudentSelectionService {
  constructor(private readonly prisma: PrismaService) {}

  async get(id: string) {
    const selection = await this.prisma.studentSelection.findFirst({
      where: { id, isDeleted: false },
      include: {
        Student: {
          select: BasicStudent,
        },
        FieldPool: {
          select: {
            id: true,
            name: true,
            description: true,
            FieldPoolDomain: {
              select: {
                Domain: {
                  select: {
                    name: true,
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!selection) {
      throw new NotFoundException(
        `Không tìm thấy đăng ký nguyện vọng với id: ${id}`,
      );
    }

    return selection;
  }

  async find(dto: FindStudentSelectionDto, user: AuthPayload) {
    const whereClause: Prisma.StudentSelectionWhereInput = {};
    const userRoles = user.roles || [];

    const isDean = userRoles.includes(DEAN);
    const isTBM = userRoles.includes(DEPARTMENT_HEAD);
    const isLecturer = userRoles.includes(LECTURER);
    const isStudent = !isDean && !isTBM && !isLecturer;

    // Role-based filtering
    if (isStudent) {
      // Students can only see their own selections
      whereClause.studentId = user.id;
    } else if (isLecturer && !isTBM && !isDean) {
      // Lecturers see selections where they are selected
      whereClause.lecturerId = user.id;
    } else if (isTBM && !isDean) {
      // Department heads see selections in their faculty
      if (!user.facultyId) {
        console.error(`TBM user ${user.id} is missing facultyId in payload.`);
        throw new ForbiddenException(
          'Không thể xác định khoa của trưởng bộ môn.',
        );
      }
      whereClause.Student = {
        Faculty: {
          id: user.facultyId,
        },
      };
    }

    // Apply DTO filters
    if (dto.studentId) {
      whereClause.studentId = dto.studentId;
    }

    if (dto.lecturerId) {
      whereClause.lecturerId = dto.lecturerId;
    }

    if (dto.fieldPoolId) {
      whereClause.fieldPoolId = dto.fieldPoolId;
    }

    if (dto.status) {
      whereClause.status = dto.status;
    }

    if (dto.priority) {
      whereClause.priority = dto.priority;
    }

    if (dto.departmentId) {
      whereClause.Student = {
        Faculty: {
          id: dto.departmentId,
        },
      };
    }

    // Filter by deletion status (default to showing non-deleted)
    whereClause.isDeleted = dto.isDeleted !== undefined ? dto.isDeleted : false;

    if (dto.keyword) {
      whereClause.OR = [
        {
          Student: {
            fullName: { contains: dto.keyword, mode: 'insensitive' as const },
          },
        },
        {
          Student: {
            studentCode: {
              contains: dto.keyword,
              mode: 'insensitive' as const,
            },
          },
        },
        {
          topicTitle: { contains: dto.keyword, mode: 'insensitive' as const },
        },
      ];
    }

    const orderByField = dto.orderBy || 'priority';
    const orderDirection: Prisma.SortOrder = dto.asc === 'asc' ? 'asc' : 'desc';
    const orderBy: Prisma.StudentSelectionOrderByWithRelationInput[] = [
      { [orderByField]: orderDirection },
    ];

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const skip = (page - 1) * limit;

    const selectFields: Prisma.StudentSelectionSelect = {
      id: true,
      studentId: true,
      lecturerId: true,
      priority: true,
      topicTitle: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      fieldPoolId: true,
      preferredAt: true,
      isDeleted: true,
      ApprovedByFacultyMember: {
        select: {
          id: true,
          fullName: true,
          profilePicture: true,
        },
      },
      Student: {
        select: {
          id: true,
          fullName: true,
          studentCode: true,
          Faculty: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },

      FieldPool: { select: { id: true, name: true } },
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.studentSelection.findMany({
        where: whereClause,
        select: selectFields,
        take: limit,
        skip,
        orderBy,
      }),
      this.prisma.studentSelection.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: { page, limit, total, totalPages },
    };
  }

  async create(dto: CreateStudentSelectionDto, requesterId: string) {
    const id = uuidv7();

    // Check student exists
    const student = await this.prisma.student.findUnique({
      where: { id: requesterId },
      select: { id: true },
    });

    if (!student) {
      throw new BadRequestException(
        `Không tìm thấy sinh viên với ID "${requesterId}".`,
      );
    }

    // Check for existing selection with same priority
    if (dto.priority) {
      const existingWithPriority = await this.prisma.studentSelection.findFirst(
        {
          where: {
            studentId: requesterId,
            priority: dto.priority,
            isDeleted: false,
          },
          select: { id: true },
        },
      );

      // if (existingWithPriority) {
      //   throw new BadRequestException(
      //     `Bạn đã đăng ký nguyện vọng với thứ tự ưu tiên ${dto.priority} rồi.`,
      //   );
      // }
    }

    // Check lecturer exists if specified
    if (dto.lecturerId) {
      const lecturerExists = await this.prisma.facultyMember.findUnique({
        where: { id: dto.lecturerId },
        select: { id: true },
      });
      if (!lecturerExists) {
        throw new BadRequestException(
          `Không tìm thấy giảng viên với ID "${dto.lecturerId}".`,
        );
      }
    }

    // Validate field pool exists if specified
    if (dto.fieldPoolId) {
      const fieldPoolExists = await this.prisma.fieldPool.findUnique({
        where: { id: dto.fieldPoolId },
        select: { id: true },
      });
      if (!fieldPoolExists) {
        throw new BadRequestException(
          `Đợt đăng ký (Field Pool) với ID "${dto.fieldPoolId}" không tồn tại.`,
        );
      }
    }

    // Ensure either lecturer or field pool is specified
    if (!dto.lecturerId && !dto.fieldPoolId) {
      throw new BadRequestException(
        'Phải chọn ít nhất Giảng viên hướng dẫn hoặc Đợt đăng ký nguyện vọng.',
      );
    }

    return this.prisma.studentSelection.create({
      data: {
        id,
        studentId: requesterId,
        lecturerId: dto.lecturerId,
        priority: dto.priority,
        topicTitle: dto.topicTitle,
        description: dto.description,
        fieldPoolId: dto.fieldPoolId,
        preferredAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        priority: true,
        topicTitle: true,
        status: true,
        studentId: true,
        lecturerId: true,
      },
    });
  }

  async updateByOwner(
    id: string,
    dto: UpdateStudentSelectionDto,
    requesterId: string,
  ) {
    const existing = await this.prisma.studentSelection.findFirst({
      where: { id, isDeleted: false },
      select: {
        status: true,
        topicTitle: true,
        studentId: true,
        lecturerId: true,
        priority: true,
        fieldPoolId: true,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Không tìm thấy đăng ký nguyện vọng với id: ${id}`,
      );
    }

    if (existing.studentId !== requesterId) {
      throw new ForbiddenException(
        'Bạn không có quyền cập nhật nguyện vọng này.',
      );
    }

    // Using specific string literals for status check instead of enum for type safety
    const nonEditableStatuses = ['APPROVED', 'CONFIRMED', 'REJECTED'] as const;

    if (nonEditableStatuses.includes(existing.status as any)) {
      throw new BadRequestException(
        `Không thể cập nhật nguyện vọng với trạng thái "${existing.status}".`,
      );
    }

    // Check for conflict if priority is being updated
    if (dto.priority && dto.priority !== existing.priority) {
      const priorityConflict = await this.prisma.studentSelection.findFirst({
        where: {
          studentId: existing.studentId,
          priority: dto.priority,
          id: { not: id },
          isDeleted: false,
        },
      });

      if (priorityConflict) {
        throw new BadRequestException(
          `Bạn đã đăng ký nguyện vọng với thứ tự ưu tiên ${dto.priority} rồi.`,
        );
      }
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (dto.priority !== undefined) updateData.priority = dto.priority;
    if (dto.topicTitle !== undefined) updateData.topicTitle = dto.topicTitle;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.lecturerId !== undefined) updateData.lecturerId = dto.lecturerId;
    if (dto.fieldPoolId !== undefined) updateData.fieldPoolId = dto.fieldPoolId;

    if (
      !updateData.lecturerId &&
      !updateData.fieldPoolId &&
      !existing.lecturerId &&
      !existing.fieldPoolId
    ) {
      throw new BadRequestException(
        'Phải chọn ít nhất Giảng viên hướng dẫn hoặc Đợt đăng ký nguyện vọng.',
      );
    }

    return this.prisma.studentSelection.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        priority: true,
        topicTitle: true,
        description: true,
        status: true,
        studentId: true,
        lecturerId: true,
        fieldPoolId: true,
        updatedAt: true,
      },
    });
  }

  async updateStatusByAdmin(
    id: string,
    dto: UpdateStudentSelectionStatusDto,
    approverId: string,
  ): Promise<any> {
    const existing = await this.prisma.studentSelection.findFirst({
      where: { id, isDeleted: false },
      select: {
        id: true,
        status: true,
        studentId: true,
        lecturerId: true,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Không tìm thấy đăng ký nguyện vọng với id: ${id}`,
      );
    }

    if (existing.status === dto.status) {
      return existing;
    }

    return this.prisma.studentSelection.update({
      where: { id },
      data: {
        status: dto.status,
        approvedByFacultyMemberId: approverId,
        updatedAt: new Date(),
      },
    });
  }

  async bulkUpdateStatus(
    dto: BulkUpdateStudentSelectionStatusDto,
    approverId: string,
  ): Promise<any> {
    // Validate that all selections exist
    const existingSelections = await this.prisma.studentSelection.findMany({
      where: {
        id: { in: dto.selectionIds },
        isDeleted: false,
      },
      select: { id: true },
    });

    if (existingSelections.length !== dto.selectionIds.length) {
      const foundIds = existingSelections.map((s) => s.id);
      const missingIds = dto.selectionIds.filter(
        (id) => !foundIds.includes(id),
      );
      throw new NotFoundException(
        `Không tìm thấy nguyện vọng với id: ${missingIds.join(', ')}`,
      );
    }

    // Update all selections
    const result = await this.prisma.studentSelection.updateMany({
      where: {
        id: { in: dto.selectionIds },
        isDeleted: false,
      },
      data: {
        status: dto.status,
        approvedByFacultyMemberId: approverId,
        updatedAt: new Date(),
      },
    });

    return {
      updated: result.count,
      status: dto.status,
      comment: dto.comment,
    };
  }

  async deleteByOwner(id: string, requesterId: string): Promise<any> {
    const existing = await this.prisma.studentSelection.findFirst({
      where: { id, isDeleted: false },
      select: { id: true, status: true, studentId: true },
    });

    if (!existing) {
      throw new NotFoundException(
        `Không tìm thấy đăng ký nguyện vọng với id: ${id}`,
      );
    }

    if (existing.studentId !== requesterId) {
      throw new ForbiddenException('Bạn không có quyền xóa nguyện vọng này.');
    }

    const nonDeletableStatuses = ['APPROVED', 'CONFIRMED'] as const;

    if (nonDeletableStatuses.includes(existing.status as any)) {
      throw new BadRequestException(
        `Không thể xóa nguyện vọng đã được phê duyệt hoặc xác nhận.`,
      );
    }

    return this.prisma.studentSelection.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedAt: new Date(),
      },
    });
  }
}
