import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FacultyMemberRoleT, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { BasicFaculty } from 'src/common/schema/prisma.schema';
import { uuidv7 } from 'uuidv7';
import {
  CreateLecturerSelectionDto,
  FindLecturerSelectionsDto,
  UpdateLecturerSelectionDto,
} from './schema';

@Injectable()
export class LecturerSelectionService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new lecturer selection
  async create(dto: CreateLecturerSelectionDto, requesterId: string) {
    // Check if field pool exists if provided
    if (dto.fieldPoolId) {
      const fieldPoolExists = await this.prisma.fieldPool.findUnique({
        where: { id: dto.fieldPoolId },
      });

      if (!fieldPoolExists) {
        throw new NotFoundException('Lĩnh vực không tồn tại.');
      }

      // Check if lecturer already has a selection in this field pool (including soft deleted ones)
      const existingSelection = await this.prisma.lecturerSelection.findFirst({
        where: {
          lecturerId: requesterId,
          fieldPoolId: dto.fieldPoolId,
          // Don't filter by isDeleted to catch all existing records
        },
      });

      if (existingSelection) {
        if (existingSelection.isDeleted) {
          // If there's a soft-deleted record, restore it instead of creating new
          return this.prisma.lecturerSelection.update({
            where: { id: existingSelection.id },
            data: {
              capacity: dto.capacity,
              isDeleted: false,
              status: 'PENDING',
            },
            include: {
              Lecturer: {
                select: BasicFaculty,
              },
              FieldPool: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          });
        } else {
          throw new BadRequestException(
            'Giảng viên đã đăng ký trong lĩnh vực này.',
          );
        }
      }
    }

    const id = uuidv7();

    try {
      // Create the selection
      return await this.prisma.lecturerSelection.create({
        data: {
          id,
          lecturerId: requesterId,
          fieldPoolId: dto.fieldPoolId || null,
          capacity: dto.capacity,
        },
        include: {
          Lecturer: {
            select: BasicFaculty,
          },
          FieldPool: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });
    } catch (error) {
      // Handle unique constraint violation
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Giảng viên đã đăng ký trong lĩnh vực này.',
        );
      }
      throw error;
    }
  }

  // Find all lecturer selections with filtering
  async findAll(dto: FindLecturerSelectionsDto) {
    const whereClause: Prisma.LecturerSelectionWhereInput = {};

    if (dto.lecturerId) {
      whereClause.lecturerId = dto.lecturerId;
    }

    if (dto.fieldPoolId) {
      whereClause.fieldPoolId = dto.fieldPoolId;
    }

    if (dto.status) {
      whereClause.status = dto.status;
    }

    // Filter by deleted status (default to showing non-deleted)
    whereClause.isDeleted = dto.isDeleted !== undefined ? dto.isDeleted : false;

    // Add fulltext search functionality
    if (dto.searchTerm) {
      const searchTerm = dto.searchTerm.toLowerCase();
      whereClause.OR = [
        // Search in lecturer details
        {
          Lecturer: {
            OR: [
              { fullName: { contains: searchTerm, mode: 'insensitive' } },
              { facultyCode: { contains: searchTerm, mode: 'insensitive' } },
              { email: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
        },
        // Search in field pool if needed
        {
          FieldPool: {
            name: { contains: searchTerm, mode: 'insensitive' },
          },
        },
      ];
    }

    const { page = 1, limit = 10 } = dto;
    const skip = (page - 1) * limit;

    const orderBy: Prisma.LecturerSelectionOrderByWithRelationInput = {
      [dto.orderBy || 'createdAt']: dto.asc || 'desc',
    };

    const [data, total] = await Promise.all([
      this.prisma.lecturerSelection.findMany({
        where: whereClause,
        include: {
          Lecturer: {
            select: BasicFaculty,
          },
          FieldPool: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.lecturerSelection.count({ where: whereClause }),
    ]);

    return {
      data,
      metadata: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // Find one lecturer selection by ID
  async findOne(id: string) {
    const selection = await this.prisma.lecturerSelection.findFirst({
      where: { id, isDeleted: false },
      include: {
        Lecturer: {
          select: BasicFaculty,
        },
        FieldPool: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!selection) {
      throw new NotFoundException(`Không tìm thấy đăng ký với ID ${id}`);
    }

    return selection;
  }

  // Update a lecturer selection - restricted for lecturers to update own selections
  async update(
    id: string,
    dto: UpdateLecturerSelectionDto,
    requesterId: string,
  ) {
    const existingSelection = await this.prisma.lecturerSelection.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existingSelection) {
      throw new NotFoundException(`Không tìm thấy đăng ký với ID ${id}`);
    }

    // Only the owner can update their own selection
    if (existingSelection.lecturerId !== requesterId) {
      throw new ForbiddenException(
        'Bạn không có quyền cập nhật đăng ký của giảng viên khác.',
      );
    }

    const data: Prisma.LecturerSelectionUpdateInput = {};

    if (dto.capacity !== undefined) {
      data.capacity = dto.capacity;
    }

    return this.prisma.lecturerSelection.update({
      where: { id },
      data,
      include: {
        Lecturer: {
          select: BasicFaculty,
        },
        FieldPool: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
  }

  // Update status by dean
  async updateStatusByDean(id: string, status: string, requesterId: string) {
    const existing = await this.prisma.lecturerSelection.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      throw new NotFoundException(`Không tìm thấy đăng ký với ID ${id}`);
    }

    // Check if requester is dean or admin
    const requesterRoles = await this.prisma.facultyRole.findMany({
      where: { facultyMemberId: requesterId },
      select: { role: true },
    });

    const isAdmin = requesterRoles.some(
      (r) =>
        r.role === FacultyMemberRoleT.ADMIN ||
        r.role === FacultyMemberRoleT.DEAN,
    );

    if (!isAdmin) {
      throw new ForbiddenException(
        'Bạn không có quyền cập nhật trạng thái đăng ký. Chỉ Dean hoặc Admin mới có quyền này.',
      );
    }

    return this.prisma.lecturerSelection.update({
      where: { id },
      data: {
        status: status as any,
        updatedAt: new Date(),
      },
      include: {
        Lecturer: {
          select: BasicFaculty,
        },
        FieldPool: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
  }

  // Soft delete by owner (lecturer)
  async deleteByOwner(id: string, lecturerId: string) {
    const existing = await this.prisma.lecturerSelection.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      throw new NotFoundException(`Không tìm thấy đăng ký với ID ${id}`);
    }

    // Only the owner can delete their own selection
    if (existing.lecturerId !== lecturerId) {
      throw new ForbiddenException(
        'Bạn không có quyền xóa đăng ký của giảng viên khác.',
      );
    }

    // Check if any students are enrolled
    const enrolledStudents = await this.prisma.studentSelection.count({
      where: {
        lecturerId: existing.lecturerId,
        fieldPoolId: existing.fieldPoolId,
        isDeleted: false,
      },
    });

    if (enrolledStudents > 0) {
      throw new BadRequestException(
        'Không thể xóa đăng ký đã có sinh viên đăng ký.',
      );
    }

    // Soft delete
    await this.prisma.lecturerSelection.update({
      where: { id },
      data: { isDeleted: true },
    });

    return { id, message: 'Đã xóa mềm đăng ký' };
  }

  // Soft delete by dean or admin
  async deleteByDean(id: string, requesterId: string) {
    const existing = await this.prisma.lecturerSelection.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      throw new NotFoundException(`Không tìm thấy đăng ký với ID ${id}`);
    }

    // Check if requester is dean or admin
    const requesterRoles = await this.prisma.facultyRole.findMany({
      where: { facultyMemberId: requesterId },
      select: { role: true },
    });

    const isAdmin = requesterRoles.some(
      (r) =>
        r.role === FacultyMemberRoleT.ADMIN ||
        r.role === FacultyMemberRoleT.DEAN,
    );

    if (!isAdmin) {
      throw new ForbiddenException(
        'Bạn không có quyền xóa đăng ký. Chỉ Dean hoặc Admin mới có quyền này.',
      );
    }

    // Soft delete
    await this.prisma.lecturerSelection.update({
      where: { id },
      data: { isDeleted: true },
    });

    return { id, message: 'Đã xóa mềm đăng ký bởi admin' };
  }

  // Hard delete (legacy, kept for reference)
  async hardDelete(id: string) {
    await this.prisma.lecturerSelection.delete({ where: { id } });
    return { id, message: 'Xóa hoàn toàn thành công' };
  }
}
