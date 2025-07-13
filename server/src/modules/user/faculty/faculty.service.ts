import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  FacultyMemberRoleT,
  FacultyMemberStatusT,
  Prisma,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthPayload } from 'src/common/interface';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { uuidv7 } from 'uuidv7';
import {
  BulkDeanAccountManagementDto,
  CreateFacultyDto,
  DeanAccountManagementDto,
  FindFacultyDto,
  UpdateFacultyDto,
} from './schema';
@Injectable()
export class FacultyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFacultyDto) {
    const id = uuidv7();
    const { roles, divisionIds, ...facultyData } = dto;

    // Check for existing faculty with same code
    const existing = await this.prisma.facultyMember.findUnique({
      where: { facultyCode: facultyData.facultyCode },
    });
    if (existing) {
      throw new BadRequestException('Giảng viên với mã số này đã tồn tại.');
    }

    const faculty = await this.prisma.$transaction(async (tx) => {
      // Create the faculty member
      const faculty = await tx.facultyMember.create({
        data: {
          id,
          ...facultyData,
        },
      });

      // Create roles for the faculty member if provided
      if (roles && roles.length > 0) {
        await Promise.all(
          roles.map((role) =>
            tx.facultyRole.create({
              data: {
                id: uuidv7(),
                facultyMemberId: faculty.id,
                role: role as FacultyMemberRoleT,
              },
            }),
          ),
        );
      }

      // Link faculty to divisions if provided
      if (divisionIds && divisionIds.length > 0) {
        await Promise.all(
          divisionIds.map((divisionId) =>
            tx.facultyMembershipDivision.create({
              data: {
                id: uuidv7(),
                divisionId,
                facultyMemberId: faculty.id,
                role: 'LECTURER',
              },
            }),
          ),
        );
      }

      // Return the faculty member with relationships
      return tx.facultyMember.findUnique({
        where: { id: faculty.id },
        include: {
          Faculty: true,
          Role: true,
          FacultyMembershipDivision: {
            include: {
              Division: true,
            },
          },
        },
      });
    });

    return faculty;
  }

  async get(id: string) {
    const faculty = await this.prisma.facultyMember.findUnique({
      where: { id },
      include: {
        Faculty: true,
        Role: true,
        FacultyMembershipDivision: {
          include: {
            Division: true,
          },
        },
      },
    });

    if (!faculty) {
      throw new NotFoundException('Không tìm thấy giảng viên với ID này.');
    }

    return faculty;
  }

  async find(dto: FindFacultyDto) {
    const { page = 1, limit = 10 } = dto;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.FacultyMemberWhereInput = {};

    if (dto.role) {
      whereClause.Role = {
        some: {
          role: dto.role as FacultyMemberRoleT,
        },
      };
    }

    if (dto.status) {
      whereClause.status = dto.status;
    }

    if (dto.facultyId) {
      whereClause.facultyId = dto.facultyId;
    }

    if (dto.divisionId) {
      whereClause.FacultyMembershipDivision = {
        some: {
          divisionId: dto.divisionId,
        },
      };
    }

    if (dto.facultyCode) {
      whereClause.facultyCode = {
        contains: dto.facultyCode,
        mode: 'insensitive',
      };
    }

    if (dto.fullName) {
      const searchTerm = dto.fullName.toLowerCase();
      whereClause.OR = [
        { fullName: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { facultyCode: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (dto.email) {
      whereClause.email = {
        contains: dto.email,
        mode: 'insensitive',
      };
    }

    const orderBy: Prisma.FacultyMemberOrderByWithRelationInput = {
      [dto.orderBy || 'createdAt']: dto.asc || 'desc',
    };

    const [data, total] = await Promise.all([
      this.prisma.facultyMember.findMany({
        where: whereClause,
        select: {
          id: true,
          fullName: true,
          facultyCode: true,
          bio: true,
          email: true,
          status: true,
          profilePicture: true,
          phoneNumber: true,
          rank: true,
          facultyId: true,
          createdAt: true,
          updatedAt: true,
          Role: {
            select: {
              id: true,
              role: true,
            },
          },
          Faculty: {
            select: {
              id: true,
              name: true,
              facultyCode: true,
            },
          },

          FacultyMembershipDivision: {
            select: {
              id: true,
              role: true,
              Division: {
                select: {
                  id: true,
                  name: true,
                  divisionCode: true,
                },
              },
            },
          },
        },
        skip,
        take: dto.limit,
        orderBy,
      }),
      this.prisma.facultyMember.count({ where: whereClause }),
    ]);

    return {
      data,
      paging: { page: dto.page, limit: dto.limit },
      total,
    };
  }

  async update(id: string, dto: UpdateFacultyDto) {
    const { divisionIds, ...updateData } = dto;
    const existingFaculty = await this.prisma.facultyMember.findUnique({
      where: { id },
      include: {
        FacultyMembershipDivision: true,
      },
    });

    if (!existingFaculty) {
      throw new NotFoundException('Không tìm thấy giảng viên với ID này.');
    }

    if (dto.facultyCode && dto.facultyCode !== existingFaculty.facultyCode) {
      const duplicate = await this.prisma.facultyMember.findUnique({
        where: { facultyCode: dto.facultyCode },
      });

      if (duplicate) {
        throw new BadRequestException(
          'Mã giảng viên đã tồn tại trong hệ thống.',
        );
      }
    }

    // Start transaction to update faculty member and their division associations
    const result = await this.prisma.$transaction(async (tx) => {
      // Update the faculty member
      const updated = await tx.facultyMember.update({
        where: { id },
        data: updateData,
      });

      // Update division memberships if provided
      if (divisionIds && divisionIds.length > 0) {
        // First remove existing division memberships
        await tx.facultyMembershipDivision.deleteMany({
          where: {
            facultyMemberId: id,
          },
        });

        // Then create new ones
        await Promise.all(
          divisionIds.map((divisionId) =>
            tx.facultyMembershipDivision.create({
              data: {
                id: uuidv7(),
                divisionId,
                facultyMemberId: id,
                role: 'LECTURER',
              },
            }),
          ),
        );
      }

      // Return updated faculty with relationships
      return tx.facultyMember.findUnique({
        where: { id },
        include: {
          Faculty: true,
          Role: true,
          FacultyMembershipDivision: {
            include: {
              Division: true,
            },
          },
        },
      });
    });

    return result;
  }

  async delete(id: string) {
    const existingFaculty = await this.prisma.facultyMember.findUnique({
      where: { id },
      include: {
        Role: true,
        FacultyMembershipDivision: true,
      },
    });

    if (!existingFaculty) {
      throw new NotFoundException('Không tìm thấy giảng viên với ID này.');
    }

    // Delete in a transaction to handle related entities
    await this.prisma.$transaction(async (tx) => {
      // Delete faculty roles first
      if (existingFaculty.Role && existingFaculty.Role.length > 0) {
        await tx.facultyRole.deleteMany({
          where: {
            facultyMemberId: id,
          },
        });
      }

      // Delete division associations
      if (
        existingFaculty.FacultyMembershipDivision &&
        existingFaculty.FacultyMembershipDivision.length > 0
      ) {
        await tx.facultyMembershipDivision.deleteMany({
          where: {
            facultyMemberId: id,
          },
        });
      }

      // Delete faculty member
      await tx.facultyMember.delete({ where: { id } });
    });
    return null;
  }

  async addRole(facultyId: string, role: string) {
    const existingFaculty = await this.prisma.facultyMember.findUnique({
      where: { id: facultyId },
    });

    if (!existingFaculty) {
      throw new NotFoundException('Không tìm thấy giảng viên với ID này.');
    }

    const existingRole = await this.prisma.facultyRole.findFirst({
      where: {
        facultyMemberId: facultyId,
        role: role as FacultyMemberRoleT,
      },
    });

    if (existingRole) {
      throw new BadRequestException('Giảng viên đã có vai trò này.');
    }

    await this.prisma.facultyRole.create({
      data: {
        id: uuidv7(),
        facultyMemberId: facultyId,
        role: role as FacultyMemberRoleT,
      },
    });

    const updated = await this.prisma.facultyMember.findUnique({
      where: { id: facultyId },
      include: {
        Faculty: true,
        Role: true,
        FacultyMembershipDivision: {
          include: {
            Division: true,
          },
        },
      },
    });

    return updated;
  }

  async removeRole(facultyId: string, role: string) {
    const existingFaculty = await this.prisma.facultyMember.findUnique({
      where: { id: facultyId },
      include: {
        Role: true,
      },
    });

    if (!existingFaculty) {
      throw new NotFoundException('Không tìm thấy giảng viên với ID này.');
    }

    const existingRole = existingFaculty.Role.find(
      (r) => r.role === (role as FacultyMemberRoleT),
    );

    if (!existingRole) {
      throw new BadRequestException('Giảng viên không có vai trò này.');
    }

    await this.prisma.facultyRole.delete({
      where: {
        id: existingRole.id,
      },
    });

    const updated = await this.prisma.facultyMember.findUnique({
      where: { id: facultyId },
      include: {
        Faculty: true,
        Role: true,
      },
    });

    return updated;
  }

  async authenticate(code: string, password: string) {
    const faculty = await this.prisma.facultyMember.findUnique({
      where: { facultyCode: code, status: FacultyMemberStatusT.ACTIVE },
      select: {
        id: true,
        facultyCode: true,
        facultyId: true,
        profilePicture: true,
        fullName: true,
        email: true,
        refreshToken: true,
        Role: true,
        password: true,
      },
    });

    if (!faculty) {
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác.');
    }

    const passwordValid = await bcrypt.compare(password, faculty.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác.');
    }

    return {
      id: faculty.id,
      facultyCode: faculty.facultyCode,
      facultyId: faculty.facultyId,
      profilePicture: faculty.profilePicture,
      fullName: faculty.fullName,
      email: faculty.email,
      roles: faculty.Role.map((r) => r.role),
      refreshToken: faculty.refreshToken,
    };
  }

  async updateRefreshToken(id: string, refreshToken: string) {
    await this.prisma.facultyMember.update({
      where: { id },
      data: { refreshToken },
    });
  }

  async manageFacultyAccount(
    dto: DeanAccountManagementDto,
    user: AuthPayload,
  ): Promise<any> {
    // Check if user is dean
    const isDean = user.roles?.includes('DEAN');
    let newPassword;
    if (!isDean) {
      throw new ForbiddenException(
        'Bạn không có quyền thực hiện hành động này',
      );
    }

    const faculty = await this.prisma.facultyMember.findUnique({
      where: { id: dto.facultyId },
      include: {
        Faculty: true,
      },
    });

    if (!faculty) {
      throw new NotFoundException('Không tìm thấy giảng viên');
    }

    // Check if faculty belongs to dean's faculty
    if (faculty.facultyId !== user.facultyId) {
      throw new ForbiddenException(
        'Bạn không có quyền quản lý giảng viên của khoa khác',
      );
    }

    switch (dto.action) {
      case 'ACTIVATE':
        await this.prisma.facultyMember.update({
          where: { id: dto.facultyId },
          data: {
            status: FacultyMemberStatusT.ACTIVE,
          },
        });
        break;

      case 'DEACTIVATE':
        await this.prisma.facultyMember.update({
          where: { id: dto.facultyId },
          data: {
            status: FacultyMemberStatusT.INACTIVE,
          },
        });
        break;

      case 'RESET_PASSWORD':
        // Generate random password
        newPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.prisma.facultyMember.update({
          where: { id: dto.facultyId },
          data: {
            password: hashedPassword,
          },
        });

        // TODO: Send email with new password
        break;
    }

    return {
      message: 'Thực hiện hành động thành công',
      newPassword: dto.action === 'RESET_PASSWORD' ? newPassword : undefined,
    };
  }

  async bulkManageFacultyAccounts(
    dto: BulkDeanAccountManagementDto,
    user: AuthPayload,
  ): Promise<any> {
    // Check if user is dean
    const isDean = user.roles?.includes('DEAN');
    if (!isDean) {
      throw new ForbiddenException(
        'Bạn không có quyền thực hiện hành động này',
      );
    }

    // Get all faculties
    const faculties = await this.prisma.facultyMember.findMany({
      where: {
        id: {
          in: dto.facultyIds,
        },
      },
      include: {
        Faculty: true,
      },
    });

    // Check if all faculties belong to dean's faculty
    const invalidFaculties = faculties.filter(
      (faculty) => faculty.facultyId !== user.facultyId,
    );

    if (invalidFaculties.length > 0) {
      throw new ForbiddenException(
        'Bạn không có quyền quản lý giảng viên của khoa khác',
      );
    }

    const results: Array<{
      facultyId: string;
      success: boolean;
      message?: string;
      newPassword?: string;
      error?: string;
    }> = [];

    for (const facultyId of dto.facultyIds) {
      try {
        const result = await this.manageFacultyAccount(
          {
            facultyId,
            action: dto.action,
            reason: dto.reason,
          },
          user,
        );
        results.push({
          facultyId,
          success: true,
          ...result,
        });
      } catch (error) {
        results.push({
          facultyId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      message: 'Thực hiện hành động hàng loạt thành công',
      results,
    };
  }

  async findForStudents(dto: FindFacultyDto, requesterId: string) {
    const { page = 1, limit = 10 } = dto;
    const skip = (page - 1) * limit;

    // Get the requester's information to determine their faculty/department
    const requester = await this.prisma.student.findUnique({
      where: { id: requesterId },
      include: { Faculty: true },
    });

    if (!requester) {
      throw new NotFoundException('Không tìm thấy thông tin sinh viên.');
    }

    const whereClause: Prisma.FacultyMemberWhereInput = {
      // Only show active lecturers
      status: FacultyMemberStatusT.ACTIVE,
      // Only show lecturers with LECTURER role
      Role: {
        some: {
          role: FacultyMemberRoleT.LECTURER,
        },
      },
      // Optionally filter by same faculty as student
      facultyId: requester.facultyId,
    };

    if (dto.fullName) {
      const searchTerm = dto.fullName.toLowerCase();
      whereClause.OR = [
        { fullName: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { facultyCode: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.FacultyMemberOrderByWithRelationInput = {
      [dto.orderBy || 'fullName']: dto.asc || 'asc',
    };

    const [data, total] = await Promise.all([
      this.prisma.facultyMember.findMany({
        where: whereClause,
        include: {
          Faculty: true,
          Role: true,
          // Include lecturer selections to show capacity info
          LecturerSelection: {
            where: {
              isDeleted: false,
              status: 'APPROVED',
            },
            include: {
              FieldPool: {
                select: {
                  id: true,
                  name: true,
                  status: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.facultyMember.count({ where: whereClause }),
    ]);

    // Transform data to include topics/capacity information
    const transformedData = data.map((faculty) => ({
      ...faculty,
      topics: faculty.LecturerSelection.map((selection) => ({
        id: selection.id,
        topicTitle: selection.FieldPool?.name || 'Chủ đề nghiên cứu',
        capacity: selection.capacity,
        currentCapacity: selection.currentCapacity,
        description: selection.FieldPool?.name,
        fieldPoolId: selection.fieldPoolId,
        status: selection.status,
      })),
    }));

    return {
      data: transformedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findFromSameDepartment(dto: FindFacultyDto, requesterId: string) {
    const { page = 1, limit = 10 } = dto;
    const skip = (page - 1) * limit;

    // Get the requester's faculty information
    const requester = await this.prisma.facultyMember.findUnique({
      where: { id: requesterId },
      include: { Faculty: true },
    });

    if (!requester) {
      throw new NotFoundException('Không tìm thấy thông tin giảng viên.');
    }

    const whereClause: Prisma.FacultyMemberWhereInput = {
      // Same faculty as requester
      facultyId: requester.facultyId,
      // Exclude the requester themselves
      NOT: {
        id: requesterId,
      },
      // Only show active faculty
      status: FacultyMemberStatusT.ACTIVE,
    };

    if (dto.fullName) {
      const searchTerm = dto.fullName.toLowerCase();
      whereClause.OR = [
        { fullName: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { facultyCode: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.FacultyMemberOrderByWithRelationInput = {
      [dto.orderBy || 'fullName']: dto.asc || 'asc',
    };

    const [data, total] = await Promise.all([
      this.prisma.facultyMember.findMany({
        where: whereClause,
        include: {
          Faculty: true,
          Role: true,
          LecturerSelection: {
            where: {
              isDeleted: false,
            },
            include: {
              FieldPool: {
                select: {
                  id: true,
                  name: true,
                  status: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.facultyMember.count({ where: whereClause }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
