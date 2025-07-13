import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UpdateStudentSelectionDto } from 'src/modules/enrollment/student-selection/schema';
import { uuidv7 } from 'uuidv7';
import { PrismaService } from '../../../common/modules/prisma/prisma.service';
import { CreateStudentDto, FindStudentDto, UpdateStudentDto } from './schema';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStudentDto) {
    // Check for existing student with same code
    const existing = await this.prisma.student.findUnique({
      where: { studentCode: dto.studentCode },
    });
    if (existing) {
      throw new BadRequestException('Sinh viên với mã số này đã tồn tại.');
    }

    const id = uuidv7();
    const student = await this.prisma.student.create({
      data: {
        id,
        ...dto,
      },
      include: {
        Faculty: true,
      },
    });

    return student;
  }

  async get(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        password: true,
        refreshToken: true,
        profilePicture: true,
        fullName: true,
        studentCode: true,
        Faculty: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Không tìm thấy sinh viên với ID này.');
    }

    return student;
  }

  async find(dto: FindStudentDto) {
    const whereClause: Prisma.StudentWhereInput = {
      ...(dto.studentCode && {
        studentCode: {
          contains: dto.studentCode,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
      ...(dto.fullName && {
        fullName: {
          contains: dto.fullName,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
      ...(dto.email && {
        email: { contains: dto.email, mode: Prisma.QueryMode.insensitive },
      }),
      ...(dto.facultyId && {
        facultyId: dto.facultyId,
      }),
      ...(dto.status && {
        status: dto.status,
      }),
      ...(dto.majorCode && {
        majorCode: {
          contains: dto.majorCode,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
    };

    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const skip = (page - 1) * limit;

    const orderByField = dto.orderBy || 'createdAt';
    const orderDirection = dto.asc === 'asc' ? 'asc' : 'desc';

    const orderBy: Prisma.StudentOrderByWithRelationInput = {
      [orderByField]: orderDirection,
    };

    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          password: true,
          refreshToken: true,
          profilePicture: true,
          fullName: true,
          studentCode: true,
          status: true,
          Faculty: true,
          
          StudentSelection: {
            where: {
              isDeleted: false,
              status: 'APPROVED',
            },
            include: {
              FieldPool: true,
            }
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.student.count({ where: whereClause }),
    ]);

    return {
      data,
      paging: { page: page, limit: limit },
      total,
    };
  }

  async update(id: string, dto: UpdateStudentDto) {
    const student = await this.prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException('Không tìm thấy sinh viên với ID này.');
    }

    // Check for duplicate code if updating studentCode
    if (dto.studentCode && dto.studentCode !== student.studentCode) {
      const duplicate = await this.prisma.student.findUnique({
        where: { studentCode: dto.studentCode },
      });

      if (duplicate) {
        throw new BadRequestException(
          'Mã sinh viên đã tồn tại trong hệ thống.',
        );
      }
    }

    const updated = await this.prisma.student.update({
      where: { id },
      data: { ...dto },
      include: {
        Faculty: true,
      },
    });

    return updated;
  }

  async delete(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException('Không tìm thấy sinh viên với ID này.');
    }

    await this.prisma.student.delete({ where: { id } });

    return null;
  }

  async authenticate(code: string, password: string) {
    const user = await this.prisma.student.findUnique({
      where: { studentCode: code },
      select: {
        id: true,
        email: true,
        refreshToken: true,
        facultyId: true,
        profilePicture: true,
        fullName: true,
        studentCode: true,
        password: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Tài khoản không tồn tại hoặc đã bị khóa');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Mật khẩu không chính xác');
    }

    return {
      id: user.id,
      email: user.email,
      refreshToken: user.refreshToken,
      facultyId: user.facultyId,
      profilePicture: user.profilePicture,
      fullName: user.fullName,
      studentCode: user.studentCode,
    };
  }

  async updateRefreshToken(id: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    const updated = await this.prisma.student.update({
      where: { id },
      data: { refreshToken: hashedRefreshToken },
    });

    return updated;
  }

  // New methods for student selections
  async getStudentSelections(studentId: string) {
    // Ensure the student exists
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Không tìm thấy sinh viên với ID này.');
    }

    // Get all selections for the student
    const selections = await this.prisma.studentSelection.findMany({
      where: { studentId },
      include: {
        PreferredLecturer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        FieldPool: {
          select: {
            id: true,
            name: true,
            description: true,
            registrationDeadline: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform data for the response
    const transformedSelections = selections.map((selection) => ({
      ...selection,
      lecturerName: selection.PreferredLecturer?.fullName || null,
    }));

    return {
      data: transformedSelections,
      total: selections.length,
    };
  }

  async getStudentSelectionById(id: string, studentId: string) {
    const selection = await this.prisma.studentSelection.findUnique({
      where: { id },
      include: {
        PreferredLecturer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        FieldPool: {
          select: {
            id: true,
            name: true,
            description: true,
            registrationDeadline: true,
          },
        },
      },
    });

    if (!selection) {
      throw new NotFoundException('Không tìm thấy nguyện vọng với ID này.');
    }

    // Check if the selection belongs to the requesting student
    if (selection.studentId !== studentId) {
      throw new ForbiddenException('Bạn không có quyền xem nguyện vọng này.');
    }

    // Transform data for the response
    const transformedSelection = {
      ...selection,
      lecturerName: selection.PreferredLecturer?.fullName || null,
    };

    return transformedSelection;
  }

  async updateStudentSelection(
    id: string,
    studentId: string,
    dto: UpdateStudentSelectionDto,
  ) {
    // Check if the selection exists
    const selection = await this.prisma.studentSelection.findUnique({
      where: { id },
    });

    if (!selection) {
      throw new NotFoundException('Không tìm thấy nguyện vọng với ID này.');
    }

    // Check if the selection belongs to the requesting student
    if (selection.studentId !== studentId) {
      throw new ForbiddenException(
        'Bạn không có quyền chỉnh sửa nguyện vọng này.',
      );
    }

    // Check if the selection is in a state that can be updated
    if (selection.status !== 'PENDING') {
      throw new BadRequestException(
        'Không thể chỉnh sửa nguyện vọng đã được xử lý.',
      );
    }

    // Check that the deadline hasn't passed
    if (selection.fieldPoolId) {
      const fieldPool = await this.prisma.fieldPool.findUnique({
        where: { id: selection.fieldPoolId },
      });

      if (
        fieldPool?.registrationDeadline &&
        new Date(fieldPool.registrationDeadline) < new Date()
      ) {
        throw new BadRequestException(
          'Đã quá thời hạn đăng ký cho nguyện vọng này.',
        );
      }
    }

    // Update the selection
    const updated = await this.prisma.studentSelection.update({
      where: { id },
      data: {
        priority: dto.priority !== undefined ? dto.priority : undefined,
        topicTitle: dto.topicTitle !== undefined ? dto.topicTitle : undefined,
        description:
          dto.description !== undefined ? dto.description : undefined,
        lecturerId: dto.lecturerId !== undefined ? dto.lecturerId : undefined,
      },
      include: {
        PreferredLecturer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        FieldPool: {
          select: {
            id: true,
            name: true,
            description: true,
            registrationDeadline: true,
          },
        },
      },
    });

    // Transform data for the response
    const transformedUpdate = {
      ...updated,
      lecturerName: updated.PreferredLecturer?.fullName || null,
    };

    return transformedUpdate;
  }

  async deleteStudentSelection(id: string, studentId: string) {
    // Check if the selection exists
    const selection = await this.prisma.studentSelection.findUnique({
      where: { id },
    });

    if (!selection) {
      throw new NotFoundException('Không tìm thấy nguyện vọng với ID này.');
    }

    // Check if the selection belongs to the requesting student
    if (selection.studentId !== studentId) {
      throw new ForbiddenException('Bạn không có quyền xóa nguyện vọng này.');
    }

    // Check if the selection is in a state that can be deleted
    if (selection.status !== 'PENDING') {
      throw new BadRequestException('Không thể xóa nguyện vọng đã được xử lý.');
    }

    // Check that the deadline hasn't passed
    if (selection.fieldPoolId) {
      const fieldPool = await this.prisma.fieldPool.findUnique({
        where: { id: selection.fieldPoolId },
      });

      if (
        fieldPool?.registrationDeadline &&
        new Date(fieldPool.registrationDeadline) < new Date()
      ) {
        throw new BadRequestException(
          'Đã quá thời hạn để hủy đăng ký cho nguyện vọng này.',
        );
      }
    }

    // Delete the selection
    await this.prisma.studentSelection.delete({
      where: { id },
    });

    return {
      message: 'Xóa nguyện vọng thành công.',
    };
  }
}
