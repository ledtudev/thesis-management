import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DefenseCommitteeRoleT,
  DefenseCommitteeStatusT,
  FacultyMemberRoleT,
  Prisma,
  ProjectStatusT,
} from '@prisma/client';
import { AuthPayload } from 'src/common/interface';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { BasicFaculty } from 'src/common/schema/prisma.schema';
import { uuidv7 } from 'uuidv7';
import {
  AutoAssignCommitteeMembersDto,
  BulkCreateDefenseCommitteesDto,
  CreateDefenseCommitteeDto,
  CreateDefenseMemberDto,
  FindDefenseCommitteeDto,
  FindFacultyForCommitteeDto,
  FindProjectsReadyForDefenseDto,
  UpdateDefenseCommitteeDto,
} from './schema';

const LECTURER = FacultyMemberRoleT.LECTURER;
const DEAN = FacultyMemberRoleT.DEAN;

@Injectable()
export class DefenseService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new defense committee
   */
  async create(dto: CreateDefenseCommitteeDto, requesterId: string) {
    // Check if the project exists and has WAITING_FOR_EVALUATION status
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });

    if (!project) {
      throw new NotFoundException('Dự án không tồn tại');
    }

    if (project.status !== ProjectStatusT.WAITING_FOR_EVALUATION) {
      throw new BadRequestException(
        'Chỉ có thể tạo hội đồng cho dự án có trạng thái WAITING_FOR_EVALUATION',
      );
    }

    // Check if this project already has a defense committee
    const existingCommittee = await this.prisma.defenseCommittee.findUnique({
      where: { projectId: dto.projectId },
    });

    if (existingCommittee) {
      throw new BadRequestException(
        'Dự án này đã có hội đồng bảo vệ, không thể tạo thêm',
      );
    }

    // Validate that the requester is a valid faculty member
    // const facultyMember = await this.prisma.facultyMember.findUnique({
    //   where: { id: requesterId },
    //   include: {
    //     Role: true,
    //   },
    // });

    // if (!facultyMember) {
    //   throw new BadRequestException(
    //     'Người tạo hội đồng phải là thành viên khoa hợp lệ',
    //   );
    // }

    // Check if the faculty member has DEAN role
    // const isDean = facultyMember.Role.some((role) => role.role === 'DEAN');
    // if (!isDean) {
    //   throw new BadRequestException(
    //     'Chỉ trưởng khoa mới có quyền tạo hội đồng bảo vệ',
    //   );
    // }

    return this.prisma.defenseCommittee.create({
      data: {
        id: uuidv7(),
        name: dto.name,
        description: dto.description,
        defenseDate: dto.defenseDate,
        location: dto.location,
        status: DefenseCommitteeStatusT.PREPARING,
        projectId: dto.projectId,
        createdById: requesterId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        Project: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            Member: {
              select: {
                id: true,
                role: true,
                Student: {
                  select: {
                    id: true,
                    fullName: true,
                    studentCode: true,
                    email: true,
                    profilePicture: true,
                  },
                },
                FacultyMember: {
                  select: {
                    id: true,
                    fullName: true,
                    facultyCode: true,
                    email: true,
                    profilePicture: true,
                  },
                },
              },
            },
          },
        },
        Members: {
          include: {
            FacultyMember: {
              select: {
                id: true,
                fullName: true,
                facultyCode: true,
                email: true,
                profilePicture: true,
              },
            },
          },
        },
        CreatedByFacultyMember: {
          select: BasicFaculty,
        },
      },
    });
  }

  /**
   * Update a defense committee
   */
  async update(
    id: string,
    dto: UpdateDefenseCommitteeDto,
    requesterId: string,
  ) {
    const committee = await this.prisma.defenseCommittee.findUnique({
      where: { id },
    });

    if (!committee) {
      throw new NotFoundException('Hội đồng không tồn tại');
    }

    // Only allow updates to committees that are not yet finished
    if (
      committee.status === DefenseCommitteeStatusT.FINISHED ||
      committee.status === DefenseCommitteeStatusT.CANCELLED
    ) {
      throw new BadRequestException(
        'Không thể cập nhật hội đồng đã kết thúc hoặc đã hủy',
      );
    }

    return this.prisma.defenseCommittee.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        defenseDate: dto.defenseDate,
        location: dto.location,
        status: dto.status,
        updatedAt: new Date(),
        version: { increment: 1 },
      },
      include: {
        Project: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            Member: {
              select: {
                id: true,
                role: true,
                Student: {
                  select: {
                    id: true,
                    fullName: true,
                    studentCode: true,
                    email: true,
                    profilePicture: true,
                  },
                },
                FacultyMember: {
                  select: {
                    id: true,
                    fullName: true,
                    facultyCode: true,
                    email: true,
                    profilePicture: true,
                  },
                },
              },
            },
          },
        },
        Members: {
          include: {
            FacultyMember: {
              select: {
                id: true,
                fullName: true,
                facultyCode: true,
                email: true,
                profilePicture: true,
              },
            },
          },
        },
        CreatedByFacultyMember: {
          select: BasicFaculty,
        },
      },
    });
  }

  /**
   * Delete a defense committee
   */
  async delete(id: string, requesterId: string) {
    const committee = await this.prisma.defenseCommittee.findUnique({
      where: { id },
    });

    if (!committee) {
      throw new NotFoundException('Hội đồng không tồn tại');
    }

    // Only allow deletion of committees that are not yet ongoing or finished
    if (
      committee.status === DefenseCommitteeStatusT.ONGOING ||
      committee.status === DefenseCommitteeStatusT.FINISHED
    ) {
      throw new BadRequestException(
        'Không thể xóa hội đồng đang diễn ra hoặc đã kết thúc',
      );
    }

    // Delete all committee members first
    await this.prisma.defenseMember.deleteMany({
      where: { defenseCommitteeId: id },
    });

    // Then delete the committee
    return this.prisma.defenseCommittee.delete({
      where: { id },
    });
  }

  /**
   * Add a member to a defense committee
   */
  async addMember(
    committeeId: string,
    dto: CreateDefenseMemberDto,
    requesterId: string,
  ) {
    const committee = await this.prisma.defenseCommittee.findUnique({
      where: { id: committeeId },
      include: {
        Members: true,
      },
    });

    if (!committee) {
      throw new NotFoundException('Hội đồng không tồn tại');
    }

    // Check if faculty member exists
    const facultyMember = await this.prisma.facultyMember.findUnique({
      where: { id: dto.facultyMemberId },
    });

    if (!facultyMember) {
      throw new NotFoundException('Giảng viên không tồn tại');
    }

    // Check if faculty member is already in the committee
    const existingMember = committee.Members.find(
      (m) => m.facultyMemberId === dto.facultyMemberId,
    );

    if (existingMember) {
      throw new BadRequestException('Giảng viên đã là thành viên của hội đồng');
    }

    // Check if the role is already assigned
    if (dto.role === DefenseCommitteeRoleT.CHAIRMAN) {
      const existingChairman = committee.Members.find(
        (m) => m.role === DefenseCommitteeRoleT.CHAIRMAN,
      );
      if (existingChairman) {
        throw new BadRequestException('Hội đồng đã có chủ tịch');
      }
    }

    if (dto.role === DefenseCommitteeRoleT.SECRETARY) {
      const existingSecretary = committee.Members.find(
        (m) => m.role === DefenseCommitteeRoleT.SECRETARY,
      );
      if (existingSecretary) {
        throw new BadRequestException('Hội đồng đã có thư ký');
      }
    }

    // Create the new member
    return this.prisma.defenseMember.create({
      data: {
        id: uuidv7(),
        role: dto.role,
        defenseCommitteeId: committeeId,
        facultyMemberId: dto.facultyMemberId,
      },
      include: {
        FacultyMember: {
          select: {
            id: true,
            fullName: true,
            facultyCode: true,
            email: true,
            profilePicture: true,
          },
        },
      },
    });
  }

  /**
   * Remove a member from a defense committee
   */
  async removeMember(
    committeeId: string,
    memberId: string,
    requesterId: string,
  ) {
    const member = await this.prisma.defenseMember.findFirst({
      where: {
        id: memberId,
        defenseCommitteeId: committeeId,
      },
    });

    if (!member) {
      throw new NotFoundException('Thành viên hội đồng không tồn tại');
    }

    return this.prisma.defenseMember.delete({
      where: { id: memberId },
    });
  }

  /**
   * Find defense committees with pagination and filtering
   */
  async find(dto: FindDefenseCommitteeDto, user: AuthPayload) {
    const whereClause: Prisma.DefenseCommitteeWhereInput = {};
    const userRoles = user.roles || [];

    const isDean = userRoles.includes(DEAN);
    const isLecturer = userRoles.includes(LECTURER);

    // Role-based filtering
    if (isLecturer && !isDean) {
      // For lecturers (not deans), only show committees they're members of
      whereClause.Members = {
        some: {
          facultyMemberId: user.id,
        },
      };
    }
    // Deans can see all committees

    // Apply filters from DTO
    if (dto.keyword) {
      const keywordLower = dto.keyword.toLowerCase();
      const keywordFilter: Prisma.DefenseCommitteeWhereInput = {
        OR: [
          { name: { contains: keywordLower, mode: 'insensitive' } },
          { description: { contains: keywordLower, mode: 'insensitive' } },
          { location: { contains: keywordLower, mode: 'insensitive' } },
          {
            Project: { title: { contains: keywordLower, mode: 'insensitive' } },
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

    if (dto.status) {
      whereClause.status = dto.status;
    }

    if (dto.facultyId) {
      // Filter by faculty ID through project or members
      const facultyFilter: Prisma.DefenseCommitteeWhereInput = {
        OR: [
          {
            Project: {
              Division: {
                Faculty: {
                  id: dto.facultyId,
                },
              },
            },
          },
          {
            Members: {
              some: {
                FacultyMember: {
                  facultyId: dto.facultyId,
                },
              },
            },
          },
        ],
      };
      whereClause.AND = whereClause.AND
        ? [
            ...(Array.isArray(whereClause.AND)
              ? whereClause.AND
              : [whereClause.AND]),
            facultyFilter,
          ]
        : [facultyFilter];
    }

    // Date range filtering
    if (dto.startDate || dto.endDate) {
      const dateFilter: Prisma.DefenseCommitteeWhereInput = {};

      if (dto.startDate) {
        const startDate = new Date(dto.startDate);
        dateFilter.defenseDate = {
          gte: startDate,
        };
      }

      if (dto.endDate) {
        const endDate = new Date(dto.endDate);
        endDate.setHours(23, 59, 59, 999); // End of the day

        if (dateFilter.defenseDate) {
          (dateFilter.defenseDate as Prisma.DateTimeFilter).lte = endDate;
        } else {
          dateFilter.defenseDate = {
            lte: endDate,
          };
        }
      }

      whereClause.AND = whereClause.AND
        ? [
            ...(Array.isArray(whereClause.AND)
              ? whereClause.AND
              : [whereClause.AND]),
            dateFilter,
          ]
        : [dateFilter];
    }

    // Pagination and sorting
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const skip = (page - 1) * limit;

    const orderByField = dto.orderBy || 'defenseDate';
    const orderDirection: Prisma.SortOrder = dto.asc === 'asc' ? 'asc' : 'desc';
    const orderBy: Prisma.DefenseCommitteeOrderByWithRelationInput = {
      [orderByField]: orderDirection,
    };

    // Execute query with transaction to get data and count
    const [data, total] = await this.prisma.$transaction([
      this.prisma.defenseCommittee.findMany({
        where: whereClause,
        include: {
          Project: {
            select: {
              id: true,
              title: true,
              type: true,
              status: true,
              Member: {
                select: {
                  id: true,
                  role: true,
                  Student: {
                    select: {
                      id: true,
                      fullName: true,
                      studentCode: true,
                      email: true,
                      profilePicture: true,
                    },
                  },
                  FacultyMember: {
                    select: {
                      id: true,
                      fullName: true,
                      facultyCode: true,
                      email: true,
                      profilePicture: true,
                    },
                  },
                },
              },
            },
          },
          Members: {
            include: {
              FacultyMember: {
                select: {
                  id: true,
                  fullName: true,
                  facultyCode: true,
                  email: true,
                  profilePicture: true,
                },
              },
            },
          },
          CreatedByFacultyMember: {
            select: BasicFaculty,
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.defenseCommittee.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return { data, metadata: { page, limit, total, totalPages } };
  }

  /**
   * Find a defense committee by ID
   */
  async findById(id: string) {
    const committee = await this.prisma.defenseCommittee.findUnique({
      where: { id },
      include: {
        Project: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            Member: {
              select: {
                id: true,
                role: true,
                Student: {
                  select: {
                    id: true,
                    fullName: true,
                    studentCode: true,
                    email: true,
                    profilePicture: true,
                  },
                },
                FacultyMember: {
                  select: {
                    id: true,
                    fullName: true,
                    facultyCode: true,
                    email: true,
                    profilePicture: true,
                  },
                },
              },
            },
          },
        },
        Members: {
          include: {
            FacultyMember: {
              select: {
                id: true,
                fullName: true,
                facultyCode: true,
                email: true,
                profilePicture: true,
              },
            },
          },
        },
        CreatedByFacultyMember: {
          select: BasicFaculty,
        },
      },
    });

    if (!committee) {
      throw new NotFoundException('Hội đồng không tồn tại');
    }

    return committee;
  }

  /**
   * Get projects waiting for evaluation
   */
  async getWaitingProjects(user: AuthPayload) {
    const userRoles = user.roles || [];
    // const isDean = userRoles.includes(DEAN);

    // if (!isDean) {
    //   throw new ForbiddenException(
    //     'Chỉ trưởng khoa mới có quyền thực hiện chức năng này',
    //   );
    // }

    // Find projects with WAITING_FOR_EVALUATION status that don't have defense committees yet
    const projects = await this.prisma.project.findMany({
      where: {
        status: ProjectStatusT.WAITING_FOR_EVALUATION,
        DefenseCommittee: null, // No defense committee assigned yet
      },
      include: {
        Member: {
          select: {
            id: true,
            role: true,
            Student: {
              select: {
                id: true,
                fullName: true,
                studentCode: true,
                email: true,
                profilePicture: true,
              },
            },
            FacultyMember: {
              select: {
                id: true,
                fullName: true,
                facultyCode: true,
                email: true,
                profilePicture: true,
              },
            },
          },
        },
        Division: {
          select: {
            id: true,
            name: true,
            Faculty: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        FieldPool: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return projects;
  }

  /**
   * Bulk create defense committees for multiple projects
   */
  async bulkCreate(dto: BulkCreateDefenseCommitteesDto, requesterId: string) {
    const {
      projectIds,
      defaultLocation,
      defaultDefenseDate,
      committeeSizeMin,
      committeeSizeMax,
    } = dto;
    console.log('idaaaaaaa', requesterId);
    // Validate that the requester is a valid faculty member with DEAN role
    const facultyMember = await this.prisma.facultyMember.findUnique({
      where: { id: requesterId },
      include: {
        Role: true,
      },
    });

    if (!facultyMember) {
      throw new BadRequestException(
        'Người tạo hội đồng phải là thành viên khoa hợp lệ',
      );
    }

    // Check if the faculty member has DEAN role
    const isDean = facultyMember.Role.some((role) => role.role === 'DEAN');
    if (!isDean) {
      throw new BadRequestException(
        'Chỉ trưởng khoa mới có quyền tạo hội đồng bảo vệ',
      );
    }

    // Verify all projects exist and have correct status
    const projects = await this.prisma.project.findMany({
      where: {
        id: { in: projectIds },
      },
      include: {
        Member: {
          include: {
            FacultyMember: true,
          },
        },
        DefenseCommittee: true,
      },
    });

    if (projects.length !== projectIds.length) {
      throw new BadRequestException('Một số dự án không tồn tại');
    }

    // Check which projects have status WAITING_FOR_EVALUATION and no committee yet
    const validProjects = projects.filter(
      (p) =>
        p.status === ProjectStatusT.WAITING_FOR_EVALUATION &&
        !p.DefenseCommittee,
    );

    if (validProjects.length === 0) {
      throw new BadRequestException(
        'Không có dự án hợp lệ để tạo hội đồng (cần có trạng thái WAITING_FOR_EVALUATION và chưa có hội đồng)',
      );
    }

    // Get potential committee members (all faculty members except advisors of the projects)
    const allAdvisorIds = new Set(
      validProjects
        .flatMap((p) => p.Member)
        .filter((m) => m.FacultyMember)
        .map((m) => m.facultyMemberId)
        .filter(Boolean) as string[],
    );

    // Get all faculty members
    const facultyMembers = await this.prisma.facultyMember.findMany({
      where: {
        status: 'ACTIVE',
        Role: {
          some: {
            role: FacultyMemberRoleT.LECTURER,
          },
        },
      },
      select: {
        id: true,
        fullName: true,
        facultyCode: true,
        email: true,
        facultyId: true,
      },
    });

    // Remove advisors from potential committee members
    const potentialMembers = facultyMembers.filter(
      (f) => !allAdvisorIds.has(f.id),
    );

    if (potentialMembers.length < committeeSizeMin) {
      throw new BadRequestException(
        `Không đủ giảng viên để tạo hội đồng (cần ít nhất ${committeeSizeMin} giảng viên)`,
      );
    }

    // Create defense committees
    const results: any[] = [];
    for (const project of validProjects) {
      try {
        // Create a defense committee
        const committeeName = `Hội đồng bảo vệ: ${project.title}`;
        const committee = await this.prisma.defenseCommittee.create({
          data: {
            id: uuidv7(),
            name: committeeName,
            description: `Hội đồng bảo vệ cho dự án: ${project.title}`,
            defenseDate: defaultDefenseDate || new Date(),
            location: defaultLocation || 'Phòng họp khoa',
            status: DefenseCommitteeStatusT.PREPARING,
            projectId: project.id,
            createdById: requesterId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        // Randomly select committee members
        const committeeSize = Math.min(
          Math.max(committeeSizeMin, 3),
          Math.min(committeeSizeMax, potentialMembers.length, 7),
        );

        // Shuffle potential members array
        const shuffled = [...potentialMembers].sort(() => 0.5 - Math.random());
        const selectedMembers = shuffled.slice(0, committeeSize);

        // Create committee members with roles
        const members: any[] = [];
        for (let i = 0; i < selectedMembers.length; i++) {
          let role: DefenseCommitteeRoleT;
          if (i === 0) {
            role = DefenseCommitteeRoleT.CHAIRMAN;
          } else if (i === 1) {
            role = DefenseCommitteeRoleT.SECRETARY;
          } else if (i === 2) {
            role = DefenseCommitteeRoleT.REVIEWER;
          } else {
            role = DefenseCommitteeRoleT.MEMBER;
          }

          const member = await this.prisma.defenseMember.create({
            data: {
              id: uuidv7(),
              defenseCommitteeId: committee.id,
              facultyMemberId: selectedMembers[i].id,
              role,
            },
          });
          members.push(member);
        }

        // Return committee with members
        const createdCommittee = await this.findById(committee.id);
        results.push(createdCommittee);
      } catch (error) {
        console.error(
          `Error creating committee for project ${project.id}:`,
          error,
        );
        // Continue with other projects even if one fails
      }
    }

    return {
      totalRequested: projectIds.length,
      totalValid: validProjects.length,
      totalCreated: results.length,
      committees: results,
    };
  }

  /**
   * Find projects ready for defense with advanced filtering
   */
  async findProjectsReadyForDefense(
    dto: FindProjectsReadyForDefenseDto,
    user: AuthPayload,
  ) {
    const userRoles = user.roles || [];
    // const isDean = userRoles.includes(DEAN);

    // if (!isDean) {
    //   throw new ForbiddenException(
    //     'Chỉ trưởng khoa mới có quyền thực hiện chức năng này',
    //   );
    // }

    const {
      page = 1,
      limit = 10,
      keyword,
      facultyId,
      divisionId,
      fieldPoolId,
      hasCommittee,
      orderBy = 'updatedAt',
      asc = 'desc',
    } = dto;

    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions: Prisma.ProjectWhereInput = {
      status: ProjectStatusT.WAITING_FOR_EVALUATION,
    };

    // Filter by committee existence
    if (hasCommittee !== undefined) {
      if (hasCommittee) {
        whereConditions.DefenseCommittee = { isNot: null };
      } else {
        whereConditions.DefenseCommittee = null;
      }
    }

    // Filter by faculty
    if (facultyId) {
      whereConditions.Division = {
        facultyId: facultyId,
      };
    }

    // Filter by division
    if (divisionId) {
      whereConditions.divisionId = divisionId;
    }

    // Filter by field pool
    if (fieldPoolId) {
      whereConditions.fieldPoolId = fieldPoolId;
    }

    // Keyword search
    if (keyword) {
      whereConditions.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
        {
          Member: {
            some: {
              Student: {
                OR: [
                  { fullName: { contains: keyword, mode: 'insensitive' } },
                  { studentCode: { contains: keyword, mode: 'insensitive' } },
                ],
              },
            },
          },
        },
      ];
    }

    // Build order by
    const orderByClause: Prisma.ProjectOrderByWithRelationInput = {};
    orderByClause[orderBy] = asc;

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: orderByClause,
        include: {
          Member: {
            select: {
              id: true,
              role: true,
              Student: {
                select: {
                  id: true,
                  fullName: true,
                  studentCode: true,
                  email: true,
                  profilePicture: true,
                },
              },
              FacultyMember: {
                select: {
                  id: true,
                  fullName: true,
                  facultyCode: true,
                  email: true,
                  profilePicture: true,
                },
              },
            },
          },
          Division: {
            select: {
              id: true,
              name: true,
              Faculty: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          FieldPool: {
            select: {
              id: true,
              name: true,
            },
          },
          DefenseCommittee: {
            select: {
              id: true,
              name: true,
              status: true,
              defenseDate: true,
              location: true,
              Members: {
                select: {
                  id: true,
                  role: true,
                  FacultyMember: {
                    select: {
                      id: true,
                      fullName: true,
                      facultyCode: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.project.count({ where: whereConditions }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: projects,
      metadata: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Find faculty members available for committee assignment
   */
  async findFacultyForCommittee(
    dto: FindFacultyForCommitteeDto,
    user: AuthPayload,
  ) {
    const userRoles = user.roles || [];
    // const isDean = userRoles.includes(DEAN);

    // if (!isDean) {
    //   throw new ForbiddenException(
    //     'Chỉ trưởng khoa mới có quyền thực hiện chức năng này',
    //   );
    // }

    const {
      page = 1,
      limit = 10,
      keyword,
      facultyId,
      excludeAdvisorIds = [],
      excludeCommitteeIds = [],
      orderBy = 'fullName',
      asc = 'asc',
    } = dto;

    const skip = (page - 1) * limit;

    // Get faculty members already in specified committees
    const excludeFromCommittees =
      excludeCommitteeIds.length > 0
        ? await this.prisma.defenseMember.findMany({
            where: {
              defenseCommitteeId: { in: excludeCommitteeIds },
            },
            select: { facultyMemberId: true },
          })
        : [];

    const excludeFromCommitteeIds = excludeFromCommittees.map(
      (m) => m.facultyMemberId,
    );
    const allExcludeIds = [...excludeAdvisorIds, ...excludeFromCommitteeIds];

    // Build where conditions
    const whereConditions: Prisma.FacultyMemberWhereInput = {
      status: 'ACTIVE',
      Role: {
        some: {
          role: FacultyMemberRoleT.LECTURER,
        },
      },
    };

    // Exclude specified faculty members
    if (allExcludeIds.length > 0) {
      whereConditions.id = { notIn: allExcludeIds };
    }

    // Filter by faculty
    if (facultyId) {
      whereConditions.facultyId = facultyId;
    }

    // Keyword search
    if (keyword) {
      whereConditions.OR = [
        { fullName: { contains: keyword, mode: 'insensitive' } },
        { facultyCode: { contains: keyword, mode: 'insensitive' } },
        { email: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // Build order by
    const orderByClause: Prisma.FacultyMemberOrderByWithRelationInput = {};
    orderByClause[orderBy] = asc;

    const [facultyMembers, total] = await Promise.all([
      this.prisma.facultyMember.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: orderByClause,
        select: {
          id: true,
          fullName: true,
          facultyCode: true,
          email: true,
          profilePicture: true,
          Faculty: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.facultyMember.count({ where: whereConditions }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: facultyMembers,
      metadata: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Auto-assign committee members to a defense committee
   */
  async autoAssignCommitteeMembers(
    dto: AutoAssignCommitteeMembersDto,
    requesterId: string,
  ) {
    const { committeeId, memberCount, excludeFacultyIds = [] } = dto;

    // Check if committee exists
    const committee = await this.prisma.defenseCommittee.findUnique({
      where: { id: committeeId },
      include: {
        Members: {
          include: {
            FacultyMember: true,
          },
        },
        Project: {
          include: {
            Member: {
              where: {
                FacultyMember: { isNot: null },
              },
              include: {
                FacultyMember: true,
              },
            },
          },
        },
      },
    });

    if (!committee) {
      throw new NotFoundException('Hội đồng không tồn tại');
    }

    if (committee.status !== DefenseCommitteeStatusT.PREPARING) {
      throw new BadRequestException(
        'Chỉ có thể tự động phân công thành viên cho hội đồng đang chuẩn bị',
      );
    }

    // Get project advisors to exclude
    const projectAdvisorIds = committee.Project.Member.filter(
      (m) => m.FacultyMember,
    )
      .map((m) => m.facultyMemberId)
      .filter(Boolean) as string[];

    // Get current committee member IDs
    const currentMemberIds = committee.Members.map((m) => m.facultyMemberId);

    // Combine all exclusions
    const allExcludeIds = [
      ...projectAdvisorIds,
      ...currentMemberIds,
      ...excludeFacultyIds,
    ];

    // Find available faculty members
    const availableFaculty = await this.prisma.facultyMember.findMany({
      where: {
        status: 'ACTIVE',
        id: { notIn: allExcludeIds },
        Role: {
          some: {
            role: FacultyMemberRoleT.LECTURER,
          },
        },
      },
      select: {
        id: true,
        fullName: true,
        facultyCode: true,
        email: true,
      },
    });

    const currentMemberCount = committee.Members.length;
    const needToAdd = Math.max(0, memberCount - currentMemberCount);

    if (availableFaculty.length < needToAdd) {
      throw new BadRequestException(
        `Không đủ giảng viên khả dụng. Cần ${needToAdd} giảng viên nhưng chỉ có ${availableFaculty.length} giảng viên khả dụng`,
      );
    }

    // Randomly select faculty members
    const shuffled = [...availableFaculty].sort(() => 0.5 - Math.random());
    const selectedFaculty = shuffled.slice(0, needToAdd);

    // Determine roles for new members
    const existingRoles = committee.Members.map((m) => m.role);

    // Type the newMembers array properly
    const newMembers: Array<{
      id: string;
      role: DefenseCommitteeRoleT;
      defenseCommitteeId: string;
      facultyMemberId: string;
      version: number;
      FacultyMember: {
        id: string;
        fullName: string;
        facultyCode: string | null;
        email: string;
        profilePicture: string | null;
      };
    }> = [];

    for (let i = 0; i < selectedFaculty.length; i++) {
      // Assign role based on priority and availability
      let role: DefenseCommitteeRoleT = DefenseCommitteeRoleT.MEMBER;

      if (!existingRoles.includes(DefenseCommitteeRoleT.CHAIRMAN)) {
        role = DefenseCommitteeRoleT.CHAIRMAN;
      } else if (!existingRoles.includes(DefenseCommitteeRoleT.SECRETARY)) {
        role = DefenseCommitteeRoleT.SECRETARY;
      } else if (!existingRoles.includes(DefenseCommitteeRoleT.REVIEWER)) {
        role = DefenseCommitteeRoleT.REVIEWER;
      }

      const member = await this.prisma.defenseMember.create({
        data: {
          id: uuidv7(),
          defenseCommitteeId: committeeId,
          facultyMemberId: selectedFaculty[i].id,
          role,
        },
        include: {
          FacultyMember: {
            select: {
              id: true,
              fullName: true,
              facultyCode: true,
              email: true,
              profilePicture: true,
            },
          },
        },
      });

      newMembers.push(member);
      existingRoles.push(role);
    }

    return {
      addedMembers: newMembers,
      totalMembers: currentMemberCount + needToAdd,
      message: `Đã thêm ${needToAdd} thành viên vào hội đồng`,
    };
  }

  /**
   * Get current user information for debugging
   */
  async getCurrentUserInfo(requesterId: string) {
    const facultyMember = await this.prisma.facultyMember.findUnique({
      where: { id: requesterId },
      include: {
        Role: true,
        Faculty: true,
      },
    });

    const student = await this.prisma.student.findUnique({
      where: { id: requesterId },
      include: {
        Faculty: true,
      },
    });

    return {
      requesterId,
      facultyMember: facultyMember
        ? {
            id: facultyMember.id,
            fullName: facultyMember.fullName,
            facultyCode: facultyMember.facultyCode,
            email: facultyMember.email,
            roles: facultyMember.Role.map((r) => r.role),
            faculty: facultyMember.Faculty?.name,
          }
        : null,
      student: student
        ? {
            id: student.id,
            fullName: student.fullName,
            studentCode: student.studentCode,
            email: student.email,
            faculty: student.Faculty?.name,
          }
        : null,
    };
  }
}
