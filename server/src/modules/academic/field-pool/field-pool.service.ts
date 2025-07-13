import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { processDynamicFilters } from 'src/common/helper';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { ApiResponse, generateApiResponse } from 'src/common/response';
import { uuidv7 } from 'uuidv7';
import {
  createFieldPoolDto,
  FindFieldPoolDto,
  UpdateFieldPoolDto,
} from './schema';

@Injectable()
export class FieldPoolService {
  private readonly logger = new Logger(FieldPoolService.name);

  constructor(private readonly prisma: PrismaService) {}

  // 🟢 FieldPool
  async create(dto: createFieldPoolDto) {
    const id = uuidv7();
    const fieldPool = await this.prisma.fieldPool.create({
      data: {
        id,
        ...dto,
      },
    });

    return fieldPool;
  }

  async get(id: string) {
    const fieldPool = await this.prisma.fieldPool.findUnique({
      where: { id },
      include: {
        FieldPoolDomain: {
          include: {
            Domain: true,
          },
        },
        FieldPoolFaculty: {
          include: {
            Faculty: true,
          },
        },
        _count: {
          select: {
            LecturerSelection: true,
            StudentSelection: true,
            Project: true,
            FieldPoolDomain: true,
            FieldPoolFaculty: true,
          },
        },
      },
    });
    if (!fieldPool) {
      throw new NotFoundException(`Không tìm thấy field pool với ID: ${id}`);
    }

    return fieldPool;
  }

  async find(dto: FindFieldPoolDto) {
    const whereClause: Prisma.FieldPoolWhereInput = {
      FieldPoolFaculty:
        dto.facultyId || dto.department
          ? { some: { facultyId: dto.facultyId } }
          : undefined,
      name: dto.name ? { contains: dto.name, mode: 'insensitive' } : undefined,
      status: dto.status,
      OR: dto.search
        ? [
            { name: { contains: dto.search, mode: 'insensitive' } },
            { description: { contains: dto.search, mode: 'insensitive' } },
          ]
        : undefined,
      registrationDeadline:
        dto.startDate || dto.endDate
          ? {
              gte: dto.startDate,
              lte: dto.endDate,
            }
          : undefined,
      ...(dto.filters ? processDynamicFilters(dto.filters) : {}),
    };

    if (dto.facultyId) {
      const faculty = await this.prisma.faculty.findUnique({
        where: { id: dto.facultyId },
      });
      if (!faculty) {
        throw new NotFoundException(
          `Không tìm thấy field pool với facultyId: ${dto.facultyId}`,
        );
      }
    }

    const skip = ((dto.page || 1) - 1) * (dto.limit || 20);
    const orderBy = {
      [dto.orderBy || 'createdAt']: dto.asc === 'asc' ? 'asc' : 'desc',
    };

    const [data, total] = await Promise.all([
      this.prisma.fieldPool.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          registrationDeadline: true,
          createdAt: true,
          updatedAt: true,
          longDescription: true,
          FieldPoolDomain: {
            select: {
              Domain: { select: { name: true, description: true, id: true } },
            },
          },
          FieldPoolFaculty: {
            select: { Faculty: { select: { name: true, id: true } } },
          },
          _count: {
            select: {
              LecturerSelection: true,
              StudentSelection: true,
              Project: true,
              FieldPoolDomain: true,
              FieldPoolFaculty: true,
            },
          },
        },
        take: dto.limit,
        skip,
        orderBy: [orderBy],
      }),
      this.prisma.fieldPool.count({ where: whereClause }),
    ]);

    const pagination = {
      page: dto.page,
      limit: dto.limit,
      total,
      totalPages: Math.ceil(total / (dto.limit || 20)),
    };
    return {
      message:
        total > 0
          ? 'Lấy danh sách field pool thành công'
          : 'Không tìm thấy field pool phù hợp',
      data,
      pagination,
    };
  }

  async list() {
    const data = await this.prisma.fieldPool.findMany({
      select: {
        name: true,
        description: true,
        id: true,
        status: true,
        registrationDeadline: true,
        FieldPoolDomain: {
          select: {
            Domain: { select: { name: true, description: true, id: true } },
          },
        },
        FieldPoolFaculty: {
          select: { Faculty: { select: { name: true, id: true } } },
        },
        _count: {
          select: {
            LecturerSelection: true,
            StudentSelection: true,
            Project: true,
          },
        },
      },
    });

    return generateApiResponse('Lấy danh sách field pool thành công', data);
  }

  async update(id: string, dto: UpdateFieldPoolDto) {
    // Get current field pool data
    const currentFieldPool = await this.prisma.fieldPool.findUnique({
      where: { id },
    });

    if (!currentFieldPool) {
      throw new NotFoundException(`Không tìm thấy field pool với ID: ${id}`);
    }

    // Prepare update data
    const updateData: any = { ...dto };

    // Auto-update status based on registration deadline
    if (dto.registrationDeadline) {
      const newDeadline = new Date(dto.registrationDeadline);
      const now = new Date();

      // If new deadline is in the future and current status is CLOSED, automatically open it
      if (newDeadline > now && currentFieldPool.status === 'CLOSED') {
        updateData.status = 'OPEN';
        this.logger.log(
          `Auto-opening field pool ${id} due to extended deadline`,
        );
      }
      // If new deadline is in the past and current status is OPEN, automatically close it
      else if (newDeadline <= now && currentFieldPool.status === 'OPEN') {
        updateData.status = 'CLOSED';
        this.logger.log(`Auto-closing field pool ${id} due to past deadline`);
      }
    }

    const fieldPool = await this.prisma.fieldPool.update({
      where: { id },
      data: updateData,
      include: {
        FieldPoolDomain: {
          include: {
            Domain: true,
          },
        },
        FieldPoolFaculty: {
          include: {
            Faculty: true,
          },
        },
        _count: {
          select: {
            LecturerSelection: true,
            StudentSelection: true,
            Project: true,
            FieldPoolDomain: true,
            FieldPoolFaculty: true,
          },
        },
      },
    });

    const message =
      updateData.status !== currentFieldPool.status
        ? `Cập nhật field pool thành công. Trạng thái đã được tự động thay đổi thành ${updateData.status === 'OPEN' ? 'MỞ' : 'ĐÓNG'} dựa trên hạn đăng ký.`
        : 'Cập nhật field pool thành công';

    return generateApiResponse(message, fieldPool);
  }

  async delete(id: string) {
    await this.prisma.fieldPool.delete({ where: { id } });

    return generateApiResponse('Xóa field pool thành công', null);
  }

  // Specific method for extending registration deadline
  async extendDeadline(id: string, newDeadline: Date, reason?: string) {
    const currentFieldPool = await this.prisma.fieldPool.findUnique({
      where: { id },
    });

    if (!currentFieldPool) {
      throw new NotFoundException(`Không tìm thấy field pool với ID: ${id}`);
    }

    const now = new Date();
    const updateData: any = {
      registrationDeadline: newDeadline,
    };

    // Auto-open if extending to future date and currently closed
    if (newDeadline > now && currentFieldPool.status === 'CLOSED') {
      updateData.status = 'OPEN';
      this.logger.log(
        `Auto-opening field pool ${id} due to deadline extension to future date`,
      );
    }

    const fieldPool = await this.prisma.fieldPool.update({
      where: { id },
      data: updateData,
      include: {
        FieldPoolDomain: {
          include: {
            Domain: true,
          },
        },
        FieldPoolFaculty: {
          include: {
            Faculty: true,
          },
        },
        _count: {
          select: {
            LecturerSelection: true,
            StudentSelection: true,
            Project: true,
            FieldPoolDomain: true,
            FieldPoolFaculty: true,
          },
        },
      },
    });

    // Log the extension reason if provided
    if (reason) {
      this.logger.log(`Field pool ${id} deadline extended. Reason: ${reason}`);
    }

    const message =
      updateData.status === 'OPEN' && currentFieldPool.status === 'CLOSED'
        ? `Gia hạn đăng ký thành công. Lĩnh vực đã được tự động mở lại do hạn đăng ký được gia hạn đến tương lai.`
        : 'Gia hạn đăng ký thành công';

    return generateApiResponse(message, fieldPool);
  }

  // 🟡 FieldPool - Department (using Faculty table since Department doesn't exist in schema)
  async addDepartment(fieldPoolId: string, departmentId: string) {
    // Since FieldPoolDepartment doesn't exist, we'll use FieldPoolFaculty
    // This assumes departmentId is actually a facultyId
    const result = await this.prisma.fieldPoolFaculty.create({
      data: { fieldPoolId, facultyId: departmentId },
    });

    return generateApiResponse('Thêm khoa vào field pool thành công', result);
  }

  async removeDepartment(fieldPoolId: string, departmentId: string) {
    // Since FieldPoolDepartment doesn't exist, we'll use FieldPoolFaculty
    await this.prisma.fieldPoolFaculty.delete({
      where: {
        fieldPoolId_facultyId: { fieldPoolId, facultyId: departmentId },
      },
    });

    return generateApiResponse('Xóa khoa khỏi field pool thành công', null);
  }

  async getDepartments(fieldPoolId: string) {
    // Since FieldPoolDepartment doesn't exist, we'll return FieldPoolFaculty data
    const faculties = await this.prisma.fieldPoolFaculty.findMany({
      where: { fieldPoolId },
      include: {
        Faculty: true,
      },
    });

    return {
      message:
        faculties.length > 0
          ? 'Lấy danh sách khoa của field pool thành công'
          : 'Field pool không có khoa nào',
      data: faculties,
    };
  }

  // 🟠 FieldPool - Domain
  async addDomain(
    fieldPoolId: string,
    domainId: string,
  ): Promise<ApiResponse<any>> {
    const result = await this.prisma.fieldPoolDomain.create({
      data: { fieldPoolId, domainId },
    });

    return generateApiResponse('Thêm domain vào field pool thành công', result);
  }

  async removeDomain(fieldPoolId: string, domainId: string) {
    await this.prisma.fieldPoolDomain.delete({
      where: { fieldPoolId_domainId: { fieldPoolId, domainId } },
    });

    return generateApiResponse('Xóa domain khỏi field pool thành công', null);
  }

  async getDomains(fieldPoolId: string) {
    const domains = await this.prisma.fieldPoolDomain.findMany({
      where: { fieldPoolId },
      include: { Domain: true },
    });

    return {
      message:
        domains.length > 0
          ? 'Lấy danh sách domain của field pool thành công'
          : 'Field pool không có domain nào',
      data: domains,
    };
  }

  // 🟣 FieldPool - Lecturers
  async getLecturers(fieldPoolId: string): Promise<ApiResponse<any>> {
    // Verify the field pool exists
    const fieldPool = await this.prisma.fieldPool.findUnique({
      where: { id: fieldPoolId },
    });

    if (!fieldPool) {
      throw new NotFoundException(
        `Không tìm thấy field pool với ID: ${fieldPoolId}`,
      );
    }

    // Find all lecturers who have selections in this field pool
    const lecturers = await this.prisma.facultyMember.findMany({
      where: {
        LecturerSelection: {
          some: { fieldPoolId },
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        facultyId: true,
        Faculty: {
          select: {
            id: true,
            name: true,
          },
        },
        LecturerSelection: {
          where: { fieldPoolId },
          select: {
            id: true,
            capacity: true,
            currentCapacity: true,
            status: true,
          },
        },
      },
    });

    return generateApiResponse(
      lecturers.length > 0
        ? 'Lấy danh sách giảng viên của field pool thành công'
        : 'Field pool chưa có giảng viên nào',
      lecturers,
    );
  }

  // 🔵 FieldPool - Faculty (backward compatibility methods)
  async addDept(fieldPoolId: string, facultyId: string) {
    const result = await this.prisma.fieldPoolFaculty.create({
      data: { fieldPoolId, facultyId },
    });

    return generateApiResponse('Thêm khoa vào field pool thành công', result);
  }

  async removeDept(fieldPoolId: string, facultyId: string) {
    await this.prisma.fieldPoolFaculty.delete({
      where: { fieldPoolId_facultyId: { fieldPoolId, facultyId } },
    });

    return generateApiResponse('Xóa khoa khỏi field pool thành công', null);
  }

  async getDepts(fieldPoolId: string) {
    const faculties = await this.prisma.fieldPoolFaculty.findMany({
      where: { fieldPoolId },
      include: {
        Faculty: true,
      },
    });

    return {
      message:
        faculties.length > 0
          ? 'Lấy danh sách khoa của field pool thành công'
          : 'Field pool không có khoa nào',
      data: faculties,
    };
  }
}
