import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DivisionRoleT,
  FacultyMemberRoleT,
  Prisma,
  ProjectAllocationStatusT,
  ProjectMemberStatusT,
  ProjectT,
  StudentSelectionStatusT,
} from '@prisma/client';
import * as ExcelJS from 'exceljs';
import { AuthPayload } from 'src/common/interface';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { BasicFaculty, BasicStudent } from 'src/common/schema/prisma.schema';
import { uuidv7 } from 'uuidv7';
import { LecturerSelectionService } from '../lecturer-selection/lecturer-selection.service';
import { StudentSelectionService } from '../student-selection/student-selection.service';
import {
  BulkUpdateStatusDto,
  CreateProjectAllocationDto,
  FindByLecturerDto,
  FindByStudentDto,
  FindProjectAllocationDto,
  RecommendationExportDto,
  UpdateProjectAllocationDto,
} from './schema';

const LECTURER = FacultyMemberRoleT.LECTURER;
const DEAN = FacultyMemberRoleT.DEAN;
// DEPARTMENT_HEAD no longer exists in schema, using LECTURER instead
const TBM = LECTURER;
const HEAD = DivisionRoleT.HEAD;

const MEMBER_ROLES = {
  ADVISOR: 'ADVISOR',
  STUDENT: 'STUDENT',
  MEMBER: 'MEMBER',
  LEADER: 'LEADER',
};

@Injectable()
export class ProjectAllocationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly studentSelectionService: StudentSelectionService,
    private readonly lecturerSelectionService: LecturerSelectionService,
  ) {}

  async getStatistics() {
    const [totalStudents, totalLecturers, totalSelections, totalAllocations] =
      await Promise.all([
        this.prisma.student.count(),
        this.prisma.facultyMember.count(),
        this.prisma.studentSelection.count(),
        this.prisma.projectAllocation.count(),
      ]);

    return {
      totalStudents,
      totalLecturers,
      totalSelections,
      totalAllocations,
    };
  }

  async create(dto: CreateProjectAllocationDto, requesterId: string) {
    const id = uuidv7();

    const allocation = await this.prisma.projectAllocation.create({
      data: {
        id,
        topicTitle: dto.topicTitle,
        studentId: dto.studentId,
        lecturerId: dto.lecturerId,
        createdById: requesterId,
        allocatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        Student: {
          select: BasicStudent,
        },
        Lecturer: {
          select: BasicFaculty,
        },
      },
    });

    // Automatically create a proposed project for this allocation
    try {
      await this.createProposalForAllocation(id, requesterId);
    } catch (error) {
      console.error(`Failed to create proposal for allocation ${id}:`, error);
      // Don't throw error here to avoid breaking the allocation creation
    }

    return allocation;
  }

  async find(dto: FindProjectAllocationDto, user: AuthPayload) {
    const whereClause: Prisma.ProjectAllocationWhereInput = {};
    const userRoles = user.roles || [];

    const isDean = userRoles.includes(DEAN);
    const isLecturer = userRoles.includes(LECTURER);
    const isStudent = !isDean && !isLecturer;

    // Apply DTO filters
    if (dto.studentId) {
      whereClause.studentId = dto.studentId;
    }
    if (dto.lecturerId) {
      whereClause.lecturerId = dto.lecturerId;
    }
    if (dto.departmentId) {
      whereClause.OR = [
        { Student: { Faculty: { id: dto.departmentId } } },
        { Lecturer: { Faculty: { id: dto.departmentId } } },
      ];
    }
    if (dto.status) {
      whereClause.status = dto.status;
    }

    if (dto.keyword) {
      const keywordLower = dto.keyword.toLowerCase();
      const keywordFilter: Prisma.ProjectAllocationWhereInput = {
        OR: [
          { topicTitle: { contains: keywordLower, mode: 'insensitive' } },
          {
            Student: {
              fullName: { contains: keywordLower, mode: 'insensitive' },
            },
          },
          {
            Student: {
              studentCode: { contains: keywordLower, mode: 'insensitive' },
            },
          },
          {
            Lecturer: {
              fullName: { contains: keywordLower, mode: 'insensitive' },
            },
          },
          {
            Lecturer: {
              facultyCode: { contains: keywordLower, mode: 'insensitive' },
            },
          },
          {
            Lecturer: {
              email: { contains: keywordLower, mode: 'insensitive' },
            },
          },
        ],
      };
      whereClause.AND = whereClause.AND
        ? [
            ...(Array.isArray(whereClause.AND)
              ? whereClause.AND
              : [whereClause.AND]),
            keywordFilter,
          ]
        : [keywordFilter];
    }

    const orderByField = dto.orderBy || 'allocatedAt';
    const orderDirection: Prisma.SortOrder = dto.asc === 'asc' ? 'asc' : 'desc';
    const orderBy: Prisma.ProjectAllocationOrderByWithRelationInput[] =
      orderByField === 'studentName'
        ? [{ Student: { fullName: orderDirection } }]
        : orderByField === 'lecturerName'
          ? [{ Lecturer: { fullName: orderDirection } }]
          : [{ [orderByField]: orderDirection }];

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.projectAllocation.findMany({
        where: whereClause,
        include: {
          Student: {
            select: BasicStudent,
          },
          Lecturer: {
            select: BasicFaculty,
          },
          CreatedByFacultyMember: { select: BasicFaculty },
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.projectAllocation.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return { data, metadata: { page, limit, total, totalPages } };
  }

  async findById(id: string) {
    const allocation = await this.prisma.projectAllocation.findUnique({
      where: { id },
      include: {
        Student: {
          select: BasicStudent,
        },
        Lecturer: {
          select: BasicFaculty,
        },
        CreatedByFacultyMember: { select: BasicFaculty },
      },
    });
    if (!allocation) {
      throw new NotFoundException(
        `Không tìm thấy phân công đề tài với ID: ${id}`,
      );
    }
    return allocation;
  }

  async update(
    id: string,
    dto: UpdateProjectAllocationDto,
    requesterId: string,
  ) {
    const existing = await this.prisma.projectAllocation.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(
        `Không tìm thấy phân công đề tài với ID: ${id}`,
      );
    }

    const updateData: Prisma.ProjectAllocationUpdateInput = {
      updatedAt: new Date(),
    };

    if (dto.lecturerId) {
      updateData.Lecturer = { connect: { id: dto.lecturerId } };
    }

    return this.prisma.projectAllocation.update({
      where: { id },
      data: updateData,
      include: {
        Student: { select: { id: true, fullName: true, studentCode: true } },
        Lecturer: { select: { id: true, fullName: true, facultyCode: true } },
      },
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.projectAllocation.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(
        `Không tìm thấy phân công đề tài với ID: ${id}`,
      );
    }

    await this.prisma.projectAllocation.delete({ where: { id } });
  }

  async findByStudent(studentId: string, dto: FindByStudentDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.ProjectAllocationWhereInput = { studentId };

    if (dto.searchTerm) {
      const searchTerm = dto.searchTerm.toLowerCase();
      whereClause.OR = [
        {
          topicTitle: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          Lecturer: {
            fullName: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        {
          Lecturer: {
            facultyCode: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    const orderByField = dto.orderBy || 'allocatedAt';
    const orderDirection: Prisma.SortOrder = dto.asc === 'asc' ? 'asc' : 'desc';

    let orderBy: Prisma.ProjectAllocationOrderByWithRelationInput;

    if (orderByField === 'lecturerName') {
      orderBy = { Lecturer: { fullName: orderDirection } };
    } else {
      orderBy = { [orderByField]: orderDirection };
    }

    const data = await this.prisma.projectAllocation.findMany({
      where: whereClause,
      include: {
        Lecturer: {
          select: {
            id: true,
            fullName: true,
            facultyCode: true,
            email: true,
            facultyId: true,
            Faculty: { select: { id: true, name: true } },
          },
        },
      },
      skip,
      take: limit,
      orderBy,
    });

    const total = await this.prisma.projectAllocation.count({
      where: whereClause,
    });

    const totalPages = Math.ceil(total / limit);
    return { data, metadata: { page, limit, total, totalPages } };
  }

  async findByLecturer(lecturerId: string, dto: FindByLecturerDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.ProjectAllocationWhereInput = { lecturerId };

    if (dto.searchTerm) {
      const searchTerm = dto.searchTerm.toLowerCase();
      whereClause.OR = [
        {
          topicTitle: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          Student: {
            fullName: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        {
          Student: {
            studentCode: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    const orderByField = dto.orderBy || 'allocatedAt';
    const orderDirection: Prisma.SortOrder = dto.asc === 'asc' ? 'asc' : 'desc';

    let orderBy: Prisma.ProjectAllocationOrderByWithRelationInput;

    if (orderByField === 'studentName') {
      orderBy = { Student: { fullName: orderDirection } };
    } else {
      orderBy = { [orderByField]: orderDirection };
    }

    const data = await this.prisma.projectAllocation.findMany({
      where: whereClause,
      include: {
        Student: {
          select: {
            id: true,
            fullName: true,
            studentCode: true,
            email: true,
            facultyId: true,
            Faculty: { select: { id: true, name: true } },
          },
        },
      },
      skip,
      take: limit,
      orderBy,
    });

    const total = await this.prisma.projectAllocation.count({
      where: whereClause,
    });

    const totalPages = Math.ceil(total / limit);
    return { data, metadata: { page, limit, total, totalPages } };
  }

  async getRecommendations(dto: RecommendationExportDto): Promise<any> {
    const { departmentId, maxStudentsPerLecturer, format } = dto;

    const studentSelectionWhere: Prisma.StudentSelectionWhereInput = {
      status: StudentSelectionStatusT.PENDING,
      lecturerId: { not: null },
    };

    if (departmentId) {
      studentSelectionWhere.OR = [
        { Student: { facultyId: departmentId } },
        {
          lecturerId: {
            in: await this.getLecturerIdsByFaculty(departmentId),
          },
        },
      ] as any;
    }

    const studentSelections = await this.prisma.studentSelection.findMany({
      where: studentSelectionWhere,
      include: {
        Student: {
          select: BasicStudent,
        },
      },
      orderBy: [{ studentId: 'asc' }, { priority: 'asc' }],
    });

    if (studentSelections.length === 0) {
      console.log('No approved student selections found for criteria.');
      return format === 'json'
        ? []
        : this.generateEmptyExcel('Không có dữ liệu đăng ký hợp lệ.');
    }

    const lecturerIds = studentSelections
      .map((sel) => sel.lecturerId)
      .filter((id) => !!id) as string[];

    const lecturerDetails =
      lecturerIds.length > 0
        ? await this.prisma.facultyMember.findMany({
            where: { id: { in: lecturerIds } },
            select: BasicFaculty,
          })
        : [];

    const lecturerMap = new Map(lecturerDetails.map((l) => [l.id, l]));

    const lecturerSelectionWhere: Prisma.LecturerSelectionWhereInput = {
      status: 'APPROVED',
      isDeleted: false,
    };
    if (departmentId) {
      lecturerSelectionWhere.Lecturer = { facultyId: departmentId };
    }
    const lecturerSelections = await this.prisma.lecturerSelection.findMany({
      where: lecturerSelectionWhere,
      select: {
        lecturerId: true,
        capacity: true,
        Lecturer: { select: BasicFaculty },
      },
    });

    const lecturerWorkload = new Map<
      string,
      { capacity: number; assignedCount: number; defaultTopicTitle: string }
    >();
    lecturerSelections.forEach((ls) => {
      const capacity = maxStudentsPerLecturer ?? ls.capacity;
      const current = lecturerWorkload.get(ls.lecturerId);
      if (!current) {
        lecturerWorkload.set(ls.lecturerId, {
          capacity,
          assignedCount: 0,
          defaultTopicTitle: `Đề tài nghiên cứu với ${ls.Lecturer?.fullName || 'giảng viên'}`,
        });
      } else {
        current.capacity = Math.max(current.capacity, capacity);
      }
    });

    const allocations: CreateProjectAllocationDto[] = [];
    const allocatedStudentIds = new Set<string>();

    const studentPreferences = studentSelections.reduce(
      (acc, sel) => {
        if (!acc[sel.studentId]) acc[sel.studentId] = [];
        if (sel.lecturerId && lecturerWorkload.has(sel.lecturerId)) {
          const lecturer = lecturerWorkload.get(sel.lecturerId);
          const defaultTopic =
            lecturer?.defaultTopicTitle || 'Đề tài nghiên cứu';
          acc[sel.studentId].push({
            lecturerId: sel.lecturerId,
            topicTitle: sel.topicTitle || defaultTopic,
            priority: sel.priority,
          });
        }
        return acc;
      },
      {} as Record<
        string,
        { lecturerId: string; topicTitle: string; priority: number }[]
      >,
    );

    for (const studentId in studentPreferences) {
      const preferences = studentPreferences[studentId];
      for (const pref of preferences) {
        const lecturer = lecturerWorkload.get(pref.lecturerId);
        if (lecturer && lecturer.assignedCount < lecturer.capacity) {
          allocations.push({
            studentId,
            lecturerId: pref.lecturerId,
            topicTitle: pref.topicTitle,
          });
          lecturer.assignedCount++;
          allocatedStudentIds.add(studentId);
          break;
        }
      }
    }

    const studentMap = new Map();
    studentSelections.forEach((selection) => {
      if (selection.Student) {
        studentMap.set(selection.Student.id, selection.Student);
      }
    });

    const uniqueStudentsFromSelections = Array.from(studentMap.values());
    const unallocatedStudents = uniqueStudentsFromSelections.filter(
      (s) => !allocatedStudentIds.has(s.id),
    );

    if (unallocatedStudents.length > 0) {
      console.log(
        `Attempting random allocation for ${unallocatedStudents.length} students.`,
      );
      const availableLecturers = Array.from(lecturerWorkload.entries())
        .filter(([_, data]) => data.assignedCount < data.capacity)
        .map(([id, data]) => ({
          id,
          remainingCapacity: data.capacity - data.assignedCount,
          defaultTopicTitle: data.defaultTopicTitle,
        }));

      if (availableLecturers.length > 0) {
        availableLecturers.sort(() => Math.random() - 0.5);

        unallocatedStudents.forEach((student) => {
          const potentialLecturers = availableLecturers.filter((l) => {
            const lecturerData = lecturerSelections.find(
              (ls) => ls.lecturerId === l.id,
            )?.Lecturer;

            return (
              l.remainingCapacity > 0 &&
              (!departmentId || lecturerData?.Faculty?.id === student.facultyId)
            );
          });

          if (potentialLecturers.length > 0) {
            const chosenLecturer = potentialLecturers[0];
            allocations.push({
              studentId: student.id,
              lecturerId: chosenLecturer.id,
              topicTitle:
                chosenLecturer.defaultTopicTitle ||
                'Đề tài được phân công ngẫu nhiên',
            });
            allocatedStudentIds.add(student.id);

            const lecturerData = lecturerWorkload.get(chosenLecturer.id)!;
            lecturerData.assignedCount++;
            chosenLecturer.remainingCapacity--;
            if (chosenLecturer.remainingCapacity <= 0) {
              const indexToRemove = availableLecturers.findIndex(
                (l) => l.id === chosenLecturer.id,
              );
              if (indexToRemove > -1)
                availableLecturers.splice(indexToRemove, 1);
            }
          } else {
            console.warn(
              `Could not find suitable random lecturer for student ${student.studentCode}`,
            );
          }
        });
      } else {
        console.warn(
          'No lecturers with remaining capacity for random allocation.',
        );
      }
    }

    const enrichedAllocations =
      await this.enrichAllocationsWithDetails(allocations);

    if (departmentId) {
      const filteredAllocations = enrichedAllocations.filter((allocation) => {
        const studentDept = allocation.student?.facultyId;
        const lecturerDept = allocation.lecturer?.facultyId;
        return studentDept === departmentId || lecturerDept === departmentId;
      });

      if (filteredAllocations.length === 0) {
        console.log(
          'No allocations match department criteria after filtering.',
        );
        return format === 'json'
          ? []
          : this.generateEmptyExcel(
              'Không có phân công hợp lệ cho khoa được chọn.',
            );
      }

      if (format === 'json') {
        return filteredAllocations;
      } else {
        return this.generateAllocationExcel(filteredAllocations);
      }
    }

    if (format === 'json') {
      return enrichedAllocations;
    } else {
      return this.generateAllocationExcel(enrichedAllocations);
    }
  }

  private async getLecturerIdsByFaculty(facultyId: string): Promise<string[]> {
    const lecturers = await this.prisma.facultyMember.findMany({
      where: { facultyId },
      select: { id: true },
    });
    return lecturers.map((l) => l.id);
  }

  async bulkCreate(
    allocationsDto: CreateProjectAllocationDto[],
    requesterId: string,
    facultyIdScope?: string,
    skipExisting: boolean = false,
  ) {
    if (!allocationsDto || allocationsDto.length === 0) {
      throw new BadRequestException(
        'Không có dữ liệu phân công nào được cung cấp.',
      );
    }

    const shouldSkipFacultyCheck = facultyIdScope === undefined;

    const requester = await this.prisma.facultyMember.findUnique({
      where: { id: requesterId },
      select: { id: true, facultyId: true },
    });

    if (!requester) {
      throw new BadRequestException(
        'Lỗi xác thực: ID người dùng không tồn tại trong bảng giảng viên. Chỉ giảng viên mới có thể tạo phân công.',
      );
    }

    if (!shouldSkipFacultyCheck && !facultyIdScope && requester.facultyId) {
      facultyIdScope = requester.facultyId;
      console.log(`Auto-using requester's faculty ID: ${facultyIdScope}`);
    }

    const studentIds = allocationsDto.map((a) => a.studentId);
    const lecturerIds = allocationsDto.map((a) => a.lecturerId);

    let skippedCount = 0;

    const uniqueStudentIds = new Set(studentIds);
    if (uniqueStudentIds.size !== studentIds.length) {
      const duplicateCounts = studentIds.reduce(
        (acc, id) => {
          acc[id] = (acc[id] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );
      const duplicates = Object.entries(duplicateCounts)
        .filter(([_, count]) => count > 1)
        .map(([id, _]) => id);
      throw new BadRequestException(
        `Sinh viên bị trùng lặp trong danh sách: ${duplicates.join(', ')}`,
      );
    }

    const existingAllocations = await this.prisma.projectAllocation.findMany({
      where: { studentId: { in: studentIds } },
      select: {
        studentId: true,
        Student: { select: { fullName: true, studentCode: true } },
      },
    });

    if (existingAllocations.length > 0) {
      const existingStudentIds = new Set(
        existingAllocations.map((a) => a.studentId),
      );

      if (!skipExisting) {
        const details = existingAllocations.map(
          (a) => `${a.Student.fullName} (${a.Student.studentCode})`,
        );
        throw new BadRequestException(
          `Các sinh viên sau đã được phân công: ${details.join(', ')}`,
        );
      } else {
        const originalCount = allocationsDto.length;
        allocationsDto = allocationsDto.filter(
          (dto) => !existingStudentIds.has(dto.studentId),
        );

        if (allocationsDto.length === 0) {
          return {
            success: true,
            count: 0,
            skipped: existingAllocations.length,
            message: `Tất cả ${existingAllocations.length} sinh viên đã được phân công trước đó.`,
          };
        }

        skippedCount = originalCount - allocationsDto.length;
        console.log(`Skipping ${skippedCount} already allocated students.`);

        const updatedStudentIds = allocationsDto.map((a) => a.studentId);
        const updatedLecturerIds = allocationsDto.map((a) => a.lecturerId);

        studentIds.length = 0;
        lecturerIds.length = 0;
        studentIds.push(...updatedStudentIds);
        lecturerIds.push(...updatedLecturerIds);
      }
    }

    const [students, lecturers] = await Promise.all([
      this.prisma.student.findMany({
        where: { id: { in: studentIds } },
        select: {
          id: true,
          facultyId: true,
          fullName: true,
          studentCode: true,
        },
      }),
      this.prisma.facultyMember.findMany({
        where: { id: { in: lecturerIds } },
        select: { id: true, facultyId: true, fullName: true },
      }),
    ]);

    const studentMap = new Map(students.map((s) => [s.id, s]));
    const lecturerMap = new Map(lecturers.map((l) => [l.id, l]));

    const missingStudentIds = studentIds.filter((id) => !studentMap.has(id));
    if (missingStudentIds.length > 0) {
      const lowerCaseStudents = await this.prisma.student.findMany({
        where: {
          id: {
            in: missingStudentIds.map((id) => id.toLowerCase()),
          },
        },
        select: {
          id: true,
          facultyId: true,
          fullName: true,
          studentCode: true,
        },
      });

      const lowerToStudentMap = new Map();
      lowerCaseStudents.forEach((student) => {
        lowerToStudentMap.set(student.id.toLowerCase(), student);
      });

      for (const allocation of allocationsDto) {
        if (missingStudentIds.includes(allocation.studentId)) {
          const lowerCaseId = allocation.studentId.toLowerCase();
          const matchedStudent = lowerToStudentMap.get(lowerCaseId);
          if (matchedStudent) {
            allocation.studentId = matchedStudent.id;
            studentMap.set(matchedStudent.id, matchedStudent);
          }
        }
      }

      const stillMissingIds = allocationsDto
        .filter((a) => missingStudentIds.includes(a.studentId))
        .filter((a) => !studentMap.has(a.studentId))
        .map((a) => a.studentId);

      if (stillMissingIds.length > 0) {
        throw new BadRequestException(
          `Không tìm thấy sinh viên với các ID: ${stillMissingIds.join(', ')}`,
        );
      }
    }

    const missingLecturerIds = lecturerIds.filter((id) => !lecturerMap.has(id));
    if (missingLecturerIds.length > 0) {
      const lowerCaseLecturers = await this.prisma.facultyMember.findMany({
        where: {
          id: {
            in: missingLecturerIds.map((id) => id.toLowerCase()),
          },
        },
        select: {
          id: true,
          facultyId: true,
          fullName: true,
        },
      });

      const lowerToLecturerMap = new Map();
      lowerCaseLecturers.forEach((lecturer) => {
        lowerToLecturerMap.set(lecturer.id.toLowerCase(), lecturer);
      });

      for (const allocation of allocationsDto) {
        if (missingLecturerIds.includes(allocation.lecturerId)) {
          const lowerCaseId = allocation.lecturerId.toLowerCase();
          const matchedLecturer = lowerToLecturerMap.get(lowerCaseId);
          if (matchedLecturer) {
            allocation.lecturerId = matchedLecturer.id;
            lecturerMap.set(matchedLecturer.id, matchedLecturer);
          }
        }
      }

      const stillMissingIds = allocationsDto
        .filter((a) => missingLecturerIds.includes(a.lecturerId))
        .filter((a) => !lecturerMap.has(a.lecturerId))
        .map((a) => a.lecturerId);

      if (stillMissingIds.length > 0) {
        throw new BadRequestException(
          `Không tìm thấy giảng viên với các ID: ${stillMissingIds.join(', ')}`,
        );
      }
    }

    if (facultyIdScope && !shouldSkipFacultyCheck) {
      console.log(`Validating department scope: ${facultyIdScope}`);
      const invalidDepartmentAllocations = allocationsDto.filter((alloc) => {
        const studentDept = studentMap.get(alloc.studentId)?.facultyId;
        const lecturerDept = lecturerMap.get(alloc.lecturerId)?.facultyId;

        return (
          studentDept !== facultyIdScope && lecturerDept !== facultyIdScope
        );
      });

      if (invalidDepartmentAllocations.length > 0) {
        if (skipExisting) {
          const originalCount = allocationsDto.length;
          allocationsDto = allocationsDto.filter((alloc) => {
            const studentDept = studentMap.get(alloc.studentId)?.facultyId;
            const lecturerDept = lecturerMap.get(alloc.lecturerId)?.facultyId;
            return (
              studentDept === facultyIdScope || lecturerDept === facultyIdScope
            );
          });

          const newSkippedCount = originalCount - allocationsDto.length;
          skippedCount += newSkippedCount;
          console.log(
            `Skipping ${newSkippedCount} allocations due to department mismatch.`,
          );

          if (allocationsDto.length === 0) {
            return {
              success: true,
              count: 0,
              skipped: skippedCount,
              message: `Tất cả sinh viên đã được phân công trước đó hoặc không thuộc khoa của bạn.`,
            };
          }

          const updatedStudentIds = allocationsDto.map((a) => a.studentId);
          const updatedLecturerIds = allocationsDto.map((a) => a.lecturerId);
          studentIds.length = 0;
          lecturerIds.length = 0;
          studentIds.push(...updatedStudentIds);
          lecturerIds.push(...updatedLecturerIds);
        } else {
          const details = invalidDepartmentAllocations.map(
            (a) =>
              `SV: ${studentMap.get(a.studentId)?.studentCode}, GV: ${lecturerMap.get(a.lecturerId)?.fullName}`,
          );
          throw new BadRequestException(
            `Phân công không hợp lệ (SV và GV không thuộc khoa ${facultyIdScope}): ${details.join('; ')}`,
          );
        }
      }
    } else {
      console.log('Skipping department validation check');
    }

    const projectAllocationIds: string[] = [];
    const dataToCreate = allocationsDto.map((allocation) => {
      const id = uuidv7();
      projectAllocationIds.push(id);
      return {
        id,
        topicTitle: allocation.topicTitle,
        studentId: allocation.studentId,
        lecturerId: allocation.lecturerId,
        createdById: requesterId,
        allocatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: ProjectAllocationStatusT.PENDING,
      };
    });

    console.log(`Creating ${dataToCreate.length} allocations with uuidv7 IDs`);

    const result = await this.prisma.projectAllocation.createMany({
      data: dataToCreate,
      skipDuplicates: false,
    });

    return {
      success: true,
      count: result.count,
      skipped: skippedCount || 0,
      message:
        result.count > 0
          ? `Đã tạo ${result.count} phân công với trạng thái PENDING.`
          : skippedCount > 0
            ? `Đã bỏ qua ${skippedCount} sinh viên đã được phân công trước đó.`
            : 'Không có phân công nào được tạo.',
    };
  }

  async parseExcelAllocations(
    buffer: Buffer,
  ): Promise<CreateProjectAllocationDto[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);

    return [];
  }

  private async enrichAllocationsWithDetails(
    allocations: CreateProjectAllocationDto[],
  ): Promise<any[]> {
    return [];
  }

  private async generateAllocationExcel(
    allocations: any[],
  ): Promise<{ buffer: Buffer; fileName: string; contentType: string }> {
    return {
      buffer: Buffer.from([]),
      fileName: 'allocations.xlsx',
      contentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  private async generateEmptyExcel(
    message: string,
  ): Promise<{ buffer: Buffer; fileName: string; contentType: string }> {
    return {
      buffer: Buffer.from([]),
      fileName: 'empty.xlsx',
      contentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  async updateStatus(
    id: string,
    status: ProjectAllocationStatusT,
    requesterId: string,
  ) {
    const existing = await this.prisma.projectAllocation.findUnique({
      where: { id },
      include: {
        Student: {
          select: {
            id: true,
            fullName: true,
            facultyId: true,
          },
        },
        Lecturer: {
          select: {
            id: true,
            fullName: true,
            facultyId: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Không tìm thấy phân công đề tài với ID: ${id}`,
      );
    }

    const requesterRoles = await this.prisma.facultyRole.findMany({
      where: { facultyMemberId: requesterId },
      select: { role: true },
    });

    // Check for division HEAD role
    const requesterDivisionRoles =
      await this.prisma.facultyMembershipDivision.findMany({
        where: { facultyMemberId: requesterId },
        select: { role: true },
      });

    if (!requesterRoles || requesterRoles.length === 0) {
      throw new BadRequestException('Không tìm thấy vai trò của người dùng.');
    }

    const isDean = requesterRoles.some((r) => r.role === DEAN);
    const isHead = requesterDivisionRoles.some((r) => r.role === HEAD);

    if (!isDean && !isHead) {
      throw new ForbiddenException(
        'Chỉ người có vai trò Trưởng khoa hoặc Trưởng bộ môn mới có thể cập nhật trạng thái phân công.',
      );
    }

    const requester = await this.prisma.facultyMember.findUnique({
      where: { id: requesterId },
      select: { facultyId: true },
    });

    if (requester?.facultyId) {
      const isOwnFaculty =
        existing.Student.facultyId === requester.facultyId ||
        existing.Lecturer.facultyId === requester.facultyId;

      if (!isOwnFaculty) {
        throw new ForbiddenException(
          'Bạn chỉ có thể quản lý phân công của khoa mình.',
        );
      }
    }

    const needsProposal =
      status === 'APPROVED' && existing.status !== 'APPROVED';

    const updated = await this.prisma.projectAllocation.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        Student: { select: { id: true, fullName: true, studentCode: true } },
        Lecturer: { select: { id: true, fullName: true, facultyCode: true } },
      },
    });

    if (needsProposal) {
      try {
        await this.createProposalForAllocation(id, requesterId);
      } catch (error) {
        console.error(`Failed to create proposal for allocation ${id}:`, error);
      }
    }

    // If HEAD approves the allocation, automatically create project from proposal
    if (isHead && status === 'APPROVED') {
      try {
        await this.createProjectFromProposal(id, requesterId);
      } catch (error) {
        console.error(
          `Failed to create project from proposal for allocation ${id}:`,
          error,
        );
      }
    }

    return updated;
  }

  async bulkUpdateStatus(dto: BulkUpdateStatusDto, requesterId: string) {
    const { ids, status, createProposals } = dto;

    if (ids.length === 0) {
      throw new BadRequestException('Danh sách ID phân công trống.');
    }

    const requesterRoles = await this.prisma.facultyRole.findMany({
      where: { facultyMemberId: requesterId },
      select: { role: true },
    });

    // Check for division HEAD role
    const requesterDivisionRoles =
      await this.prisma.facultyMembershipDivision.findMany({
        where: { facultyMemberId: requesterId },
        select: { role: true },
      });

    if (!requesterRoles || requesterRoles.length === 0) {
      throw new BadRequestException('Không tìm thấy vai trò của người dùng.');
    }

    const isDean = requesterRoles.some((r) => r.role === DEAN);
    const isHead = requesterDivisionRoles.some((r) => r.role === HEAD);

    if (!isDean && !isHead) {
      throw new ForbiddenException(
        'Chỉ người có vai trò Trưởng khoa hoặc Trưởng bộ môn mới có thể cập nhật trạng thái phân công.',
      );
    }

    const requester = await this.prisma.facultyMember.findUnique({
      where: { id: requesterId },
      select: { facultyId: true },
    });

    const deanFacultyId = requester?.facultyId;
    if (!deanFacultyId) {
      throw new BadRequestException('Người dùng không thuộc khoa nào.');
    }

    const allocations = await this.prisma.projectAllocation.findMany({
      where: { id: { in: ids } },
      include: {
        Student: {
          select: {
            id: true,
            fullName: true,
            facultyId: true,
            studentCode: true,
          },
        },
        Lecturer: {
          select: {
            id: true,
            fullName: true,
            facultyId: true,
            facultyCode: true,
          },
        },
      },
    });

    if (allocations.length !== ids.length) {
      throw new NotFoundException('Một số phân công không tồn tại.');
    }

    const departmentAllocations = allocations.filter(
      (allocation) =>
        allocation.Student.facultyId === deanFacultyId ||
        allocation.Lecturer.facultyId === deanFacultyId,
    );

    if (departmentAllocations.length !== allocations.length) {
      const unauthorizedIds = allocations
        .filter(
          (a) =>
            a.Student.facultyId !== deanFacultyId &&
            a.Lecturer.facultyId !== deanFacultyId,
        )
        .map((a) => a.id);

      throw new ForbiddenException(
        `Bạn không có quyền quản lý các phân công ngoài khoa: ${unauthorizedIds.join(', ')}`,
      );
    }

    const updatedAllocations = await this.prisma.$transaction(
      ids.map((id) =>
        this.prisma.projectAllocation.update({
          where: { id },
          data: {
            status,
            updatedAt: new Date(),
          },
        }),
      ),
    );

    if (status === 'APPROVED' && createProposals) {
      const proposalResults = await Promise.allSettled(
        ids.map((id) => this.createProposalForAllocation(id, requesterId)),
      );

      const failedProposals = proposalResults
        .filter((result) => result.status === 'rejected')
        .map((result, index) => ({
          id: ids[index],
          error: (result as PromiseRejectedResult).reason,
        }));

      const createdProposalsCount = proposalResults.filter(
        (result) => result.status === 'fulfilled',
      ).length;

      // If HEAD approves allocations, also create projects from proposals
      if (isHead) {
        const projectResults = await Promise.allSettled(
          ids.map((id) => this.createProjectFromProposal(id, requesterId)),
        );

        const failedProjects = projectResults
          .filter((result) => result.status === 'rejected')
          .map((result, index) => ({
            id: ids[index],
            error: (result as PromiseRejectedResult).reason,
          }));

        const createdProjectsCount = projectResults.filter(
          (result) => result.status === 'fulfilled',
        ).length;

        return {
          updatedCount: updatedAllocations.length,
          status,
          createdProposals: createdProposalsCount,
          createdProjects: createdProjectsCount,
          failedProposals:
            failedProposals.length > 0 ? failedProposals : undefined,
          failedProjects:
            failedProjects.length > 0 ? failedProjects : undefined,
        };
      }

      return {
        updatedCount: updatedAllocations.length,
        status,
        createdProposals: createdProposalsCount,
        failedProposals:
          failedProposals.length > 0 ? failedProposals : undefined,
      };
    }

    return {
      updatedCount: updatedAllocations.length,
      status,
    };
  }

  private async createProposalForAllocation(
    allocationId: string,
    requesterId: string,
  ): Promise<any> {
    const allocation = await this.prisma.projectAllocation.findUnique({
      where: { id: allocationId },
      include: {
        Student: { select: { id: true } },
        Lecturer: { select: { id: true } },
      },
    });

    if (!allocation) {
      throw new Error(`Allocation ${allocationId} not found`);
    }

    const existingProposal = await this.prisma.proposedProject.findFirst({
      where: { projectAllocationId: allocationId },
    });

    if (existingProposal) {
      return existingProposal;
    }

    const proposedProject = await this.prisma.proposedProject.create({
      data: {
        projectAllocationId: allocationId,
        title: `Đề xuất từ phân công: ${allocation.topicTitle}`,
        status: 'TOPIC_SUBMISSION_PENDING',
        createdByFacultyId: requesterId,
      },
    });

    // Create student member
    if (allocation.studentId) {
      await this.prisma.proposedProjectMember.create({
        data: {
          proposedProjectId: proposedProject.id,
          studentId: allocation.studentId,
          role: MEMBER_ROLES.STUDENT,
          status: 'ACTIVE',
        },
      });
    }

    // Create advisor member (faculty member)
    if (allocation.lecturerId) {
      await this.prisma.proposedProjectMember.create({
        data: {
          proposedProjectId: proposedProject.id,
          facultyMemberId: allocation.lecturerId,
          role: MEMBER_ROLES.ADVISOR,
          status: 'ACTIVE',
        },
      });
    }
    if (allocation.lecturerId) {
      await this.prisma.proposedProjectComment.create({
        data: {
          proposedProjectId: proposedProject.id,
          content: `Đề xuất từ phân công: ${allocation.topicTitle}`,
          commenterFacultyId: requesterId,
        },
      });
    }
    return proposedProject;
  }

  private async createProjectFromProposal(
    allocationId: string,
    requesterId: string,
  ): Promise<any> {
    // Find the proposed project for this allocation
    const proposedProject = await this.prisma.proposedProject.findFirst({
      where: { projectAllocationId: allocationId },
      include: {
        ProposedProjectMember: {
          where: { status: 'ACTIVE' },
          include: {
            Student: {
              select: { id: true, fullName: true, studentCode: true },
            },
            FacultyMember: {
              select: { id: true, fullName: true, facultyCode: true },
            },
          },
        },
        ProjectAllocation: {
          include: {
            Student: {
              select: { id: true, fullName: true, studentCode: true },
            },
            Lecturer: {
              select: { id: true, fullName: true, facultyCode: true },
            },
          },
        },
      },
    });

    if (!proposedProject) {
      console.log(`No proposed project found for allocation ${allocationId}`);
      return null;
    }

    // Check if project already exists by checking if proposal is already approved
    if (proposedProject.status === 'APPROVED_BY_HEAD') {
      console.log(`Project already created for proposal ${proposedProject.id}`);
      return null;
    }

    // Create the official project
    const project = await this.prisma.project.create({
      data: {
        type: ProjectT.RESEARCH,
        title: proposedProject.title,
        description:
          proposedProject.description ||
          `Dự án được tạo từ phân công: ${proposedProject.title}`,
        field: 'Research',
        status: 'IN_PROGRESS',
        approvedById: requesterId,
        fieldPoolId: proposedProject.fieldPoolId,
      },
    });

    // Create project members from proposed project members
    for (const member of proposedProject.ProposedProjectMember) {
      if (member.studentId) {
        await this.prisma.projectMember.create({
          data: {
            projectId: project.id,
            studentId: member.studentId,
            role: member.role || MEMBER_ROLES.STUDENT,
            status: ProjectMemberStatusT.ACTIVE,
          },
        });
      } else if (
        member.facultyMemberId &&
        member.role === MEMBER_ROLES.ADVISOR
      ) {
        await this.prisma.projectMember.create({
          data: {
            projectId: project.id,
            facultyMemberId: member.facultyMemberId,
            role: MEMBER_ROLES.ADVISOR,
            status: ProjectMemberStatusT.ACTIVE,
          },
        });
      }
    }

    // Update the proposed project status to approved by head
    await this.prisma.proposedProject.update({
      where: { id: proposedProject.id },
      data: {
        status: 'APPROVED_BY_HEAD',
        approvedById: requesterId,
        approvedAt: new Date(),
      },
    });

    console.log(
      `Successfully created project ${project.id} from proposal ${proposedProject.id}`,
    );
    return project;
  }
}
