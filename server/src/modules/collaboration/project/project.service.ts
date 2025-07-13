import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FacultyMemberRoleT,
  Prisma,
  ProjectStatusT,
  ProjectT,
  UserT,
} from '@prisma/client';
import * as ExcelJS from 'exceljs';
import { AuthPayload } from 'src/common/interface';
import { ExcelService } from 'src/common/modules/excel/excel.service';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import {
  AddProjectMemberDto,
  CreateProjectCommentDto,
  ProjectQueryDto,
  SubmitProjectReportDto,
  UpdateProjectMemberDto,
  UpdateProjectStatusDto,
} from './schema';

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly excelService: ExcelService,
  ) {}

  async findMany(query: ProjectQueryDto, user: AuthPayload) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt:desc',
      status,
      type,
      facultyId,
      divisionId,
      studentId,
      lecturerId,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { field: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status as ProjectStatusT;
    }

    if (type) {
      where.type = type as ProjectT;
    }

    const userFacultyId = user.facultyId;

    if (user.userType === UserT.STUDENT) {
      where.Member = { some: { studentId: user.id, status: 'ACTIVE' } };
      if (facultyId && facultyId !== userFacultyId) {
        throw new ForbiddenException(
          'Students can only view projects within their own faculty.',
        );
      }
      if (userFacultyId && !facultyId)
        where.Division = { facultyId: userFacultyId };
    } else if (user.userType === UserT.FACULTY) {
      if (
        user.roles.includes(FacultyMemberRoleT.LECTURER) &&
        !user.roles.includes(FacultyMemberRoleT.DEAN) &&
        !user.roles.includes(FacultyMemberRoleT.ADMIN)
      ) {
        const lecturerSpecificWhere: Prisma.ProjectWhereInput[] = [
          { Member: { some: { facultyMemberId: user.id, status: 'ACTIVE' } } },
        ];
        if (user.facultyId)
          lecturerSpecificWhere.push({
            Division: { facultyId: user.facultyId },
          });
        where.OR = [...(where.OR || []), ...lecturerSpecificWhere];
        if (facultyId && facultyId !== user.facultyId) {
          throw new ForbiddenException(
            'Lecturers can only view projects within their own faculty or those they supervise.',
          );
        }
        if (!facultyId && user.facultyId)
          where.Division = { facultyId: user.facultyId };
      } else if (user.roles.includes(FacultyMemberRoleT.DEAN)) {
        if (facultyId && facultyId !== user.facultyId) {
          throw new ForbiddenException(
            'Deans can only manage projects within their own faculty.',
          );
        }
        if (user.facultyId) where.Division = { facultyId: user.facultyId };
        else if (!facultyId)
          throw new ForbiddenException(
            "Faculty ID is required for Dean's project view.",
          );
      }
      if (facultyId) {
        where.Division = { facultyId: facultyId };
      }
    }

    if (divisionId) where.divisionId = divisionId;
    if (studentId)
      where.Member = {
        ...where.Member,
        some: { ...where.Member?.some, studentId: studentId, status: 'ACTIVE' },
      };
    if (lecturerId)
      where.Member = {
        ...where.Member,
        some: {
          ...where.Member?.some,
          facultyMemberId: lecturerId,
          status: 'ACTIVE',
        },
      };

    const [sField, sOrder = 'desc'] = sortBy.split(':');
    const projects = await this.prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sField]: sOrder },
      include: {
        ApprovedByFacultyMember: {
          select: {
            id: true,
            fullName: true,
            facultyCode: true,
            profilePicture: true,
          },
        },
        Division: {
          select: {
            id: true,
            name: true,
            facultyId: true,
            Faculty: { select: { name: true, id: true } },
          },
        },
        FieldPool: { select: { id: true, name: true } },
        Member: {
          where: { status: 'ACTIVE' },
          orderBy: { assignedAt: 'asc' },
          include: {
            Student: {
              select: {
                id: true,
                fullName: true,
                studentCode: true,
                profilePicture: true,
                facultyId: true,
              },
            },
            FacultyMember: {
              select: {
                id: true,
                fullName: true,
                facultyCode: true,
                profilePicture: true,
                facultyId: true,
              },
            },
          },
        },
        _count: { select: { Member: true, Comment: true, FinalReport: true } },
      },
    });

    const total = await this.prisma.project.count({ where });

    return {
      data: projects.map((p) => ({
        ...p,
        faculty: p.Division?.Faculty?.name,
        facultyId: p.Division?.facultyId,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, user: AuthPayload) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        ApprovedByFacultyMember: {
          select: {
            id: true,
            fullName: true,
            facultyCode: true,
            profilePicture: true,
            facultyId: true,
          },
        },
        Division: {
          include: { Faculty: { select: { id: true, name: true } } },
        },
        FieldPool: true,
        Member: {
          where: { status: 'ACTIVE' },
          orderBy: { assignedAt: 'asc' },
          include: {
            Student: {
              select: {
                id: true,
                fullName: true,
                studentCode: true,
                profilePicture: true,
                facultyId: true,
              },
            },
            FacultyMember: {
              select: {
                id: true,
                fullName: true,
                facultyCode: true,
                profilePicture: true,
                facultyId: true,
                Role: { select: { role: true } },
              },
            },
          },
        },
        Comment: {
          orderBy: { createdAt: 'desc' },
          include: {
            CommenterStudent: { select: { id: true, fullName: true } },
            CommenterFacultyMember: { select: { id: true, fullName: true } },
          },
        },
        ProjectEvaluation: {
          include: {
            EvaluationScores: {
              include: {
                Evaluator: {
                  select: {
                    id: true,
                    fullName: true,
                    facultyCode: true,
                    profilePicture: true,
                    email: true,
                    rank: true,
                  },
                },
              },
              orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
            },
          },
        },
        DefenseCommittee: {
          include: {
            Members: {
              include: {
                FacultyMember: {
                  select: {
                    id: true,
                    fullName: true,
                    facultyCode: true,
                    profilePicture: true,
                    email: true,
                    rank: true,
                  },
                },
              },
            },
            CreatedByFacultyMember: {
              select: {
                id: true,
                fullName: true,
                facultyCode: true,
                profilePicture: true,
              },
            },
          },
        },
        ProposalOutline: { include: { File: true } },
        FinalReport: {
          orderBy: { submittedAt: 'desc' },
          include: {
            MainReportFile: true,
            Attachments: { include: { File: true } },
            ProjectReportComments: {
              orderBy: { createdAt: 'desc' },
              include: {
                CommenterStudent: { select: { id: true, fullName: true } },
                CommenterFacultyMember: {
                  select: { id: true, fullName: true },
                },
              },
            },
            Student: {
              select: {
                id: true,
                fullName: true,
                studentCode: true,
                profilePicture: true,
              },
            },
            SubmittedByFacultyMember: {
              select: {
                id: true,
                fullName: true,
                facultyCode: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    const userFacultyId = user.facultyId;

    if (user.userType === UserT.STUDENT) {
      const isMember = project.Member.some((m) => m.studentId === user.id);
      if (!isMember)
        throw new ForbiddenException(
          'Students can only view details of projects they are members of.',
        );
      if (
        project.Division?.facultyId &&
        project.Division.facultyId !== userFacultyId
      ) {
        throw new ForbiddenException(
          'Student cannot view project outside their faculty.',
        );
      }
    } else if (user.userType === UserT.FACULTY) {
      const isMember = project.Member.some(
        (m) => m.facultyMemberId === user.id,
      );
      const isDeanOfFaculty =
        user.roles.includes(FacultyMemberRoleT.DEAN) &&
        project.Division?.facultyId === user.facultyId;
      const isAdmin = user.roles.includes(FacultyMemberRoleT.ADMIN);
      if (
        !isAdmin &&
        !isDeanOfFaculty &&
        !isMember &&
        project.Division?.facultyId !== user.facultyId
      ) {
        throw new ForbiddenException(
          'You do not have permission to view this project.',
        );
      }
      if (
        !isAdmin &&
        !isDeanOfFaculty &&
        project.Division?.facultyId &&
        project.Division.facultyId !== user.facultyId &&
        !isMember
      ) {
        throw new ForbiddenException(
          'Faculty members can only view projects within their faculty or those they are involved in.',
        );
      }
    }

    // Enhance evaluation data with summarized information
    let enhancedProject = { ...project };

    if (project.ProjectEvaluation) {
      // Calculate average scores by role
      const scores = project.ProjectEvaluation.EvaluationScores || [];
      const advisorScores = scores.filter((score) => score.role === 'ADVISOR');
      const committeeScores = scores.filter(
        (score) => score.role === 'COMMITTEE',
      );

      const avgAdvisorScore = advisorScores.length
        ? advisorScores.reduce((sum, score) => sum + score.score, 0) /
          advisorScores.length
        : null;

      const avgCommitteeScore = committeeScores.length
        ? committeeScores.reduce((sum, score) => sum + score.score, 0) /
          committeeScores.length
        : null;

      // Add user-specific information
      const userScore = scores.find(
        (score) =>
          user.userType === UserT.FACULTY && score.evaluatorId === user.id,
      );

      const userRole = project.Member.find(
        (m) => m.facultyMemberId === user.id,
      )?.role;
      const defenseRole = project.DefenseCommittee?.Members.find(
        (m) => m.facultyMemberId === user.id,
      )?.role;

      // Use type assertion to avoid TypeScript error
      enhancedProject = {
        ...project,
        evaluationSummary: {
          avgAdvisorScore,
          avgCommitteeScore,
          finalScore: project.ProjectEvaluation.finalScore,
          status: project.ProjectEvaluation.status,
          hasUserScored: !!userScore,
          userScore: userScore?.score,
          userComment: userScore?.comment,
          advisorWeight: project.ProjectEvaluation.advisorWeight,
          committeeWeight: project.ProjectEvaluation.committeeWeight,
          totalEvaluators: scores.length,
          userContext: {
            isSupervisor: userRole === 'SUPERVISOR',
            isAdvisor: userRole === 'ADVISOR',
            defenseRole,
            canEdit: project.ProjectEvaluation.status !== 'EVALUATED',
            canFinalize:
              defenseRole === 'SECRETARY' &&
              project.ProjectEvaluation.status !== 'EVALUATED',
          },
        },
      } as any;
    }

    return enhancedProject;
  }

  async createProject(data: Prisma.ProjectCreateInput, user: AuthPayload) {
    if (
      !user.roles.includes(FacultyMemberRoleT.ADMIN) &&
      !user.roles.includes(FacultyMemberRoleT.DEAN)
    ) {
      throw new ForbiddenException(
        'Only ADMIN or DEAN can create projects directly.',
      );
    }
    // Ensure approvedById is correctly linked if it implies the creator or a specific role
    let projectData = { ...data };
    if (
      user.userType === UserT.FACULTY &&
      user.id &&
      !data.ApprovedByFacultyMember
    ) {
      projectData.ApprovedByFacultyMember = {
        connect: { id: user.id },
      };
    }

    const project = await this.prisma.project.create({
      data: projectData,
    });
    return project;
  }

  async updateProjectStatus(
    projectId: string,
    data: UpdateProjectStatusDto,
    user: AuthPayload,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        Division: true,
        Member: {
          select: {
            facultyMemberId: true,
            role: true,
            Student: { select: { id: true } },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    const isDeanOfFaculty =
      user.roles.includes(FacultyMemberRoleT.DEAN) &&
      project.Division?.facultyId === user.facultyId;
    const isAdmin = user.roles.includes(FacultyMemberRoleT.ADMIN);
    const isSupervisor = project.Member.some(
      (m) =>
        m.facultyMemberId === user.id &&
        (m.role === 'SUPERVISOR' || m.role === 'CO_SUPERVISOR'),
    );

    if (!isAdmin && !isDeanOfFaculty && !isSupervisor) {
      throw new ForbiddenException(
        'You do not have permission to update the status of this project.',
      );
    }
    if (isSupervisor && !isAdmin && !isDeanOfFaculty) {
      const allowedStatuses: ProjectStatusT[] = [
        ProjectStatusT.IN_PROGRESS,
        ProjectStatusT.WAITING_FOR_EVALUATION,
      ];
      if (
        !allowedStatuses.includes(data.status) ||
        !allowedStatuses.includes(project.status)
      ) {
        throw new ForbiddenException(
          'Supervisors have limited status change permissions.',
        );
      }
    }

    const updatedProject = await this.prisma.project.update({
      where: { id: projectId },
      data: { status: data.status },
    });
    // TODO: Add audit log for status change, including data.comment
    return updatedProject;
  }

  // --------------- PROJECT MEMBER MANAGEMENT (by Head/Dean/Admin) ---------------

  async addMember(
    projectId: string,
    data: AddProjectMemberDto,
    user: AuthPayload,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { Division: true, Member: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    const isDeanOfFaculty =
      user.roles.includes(FacultyMemberRoleT.DEAN) &&
      project.Division?.facultyId === user.facultyId;
    const isAdmin = user.roles.includes(FacultyMemberRoleT.ADMIN);
    const isSupervisor = project.Member?.some(
      (m) => m.facultyMemberId === user.id && m.role === 'SUPERVISOR',
    );

    if (!isAdmin && !isDeanOfFaculty && !(isSupervisor && data.studentId)) {
      throw new ForbiddenException(
        'You do not have permission to add members to this project.',
      );
    }

    const { studentId, facultyMemberId, role } = data;
    let memberExists;
    if (studentId)
      memberExists = await this.prisma.projectMember.findFirst({
        where: { projectId, studentId, status: 'ACTIVE' },
      });
    else if (facultyMemberId)
      memberExists = await this.prisma.projectMember.findFirst({
        where: { projectId, facultyMemberId, status: 'ACTIVE' },
      });
    if (memberExists)
      throw new BadRequestException(
        'This member is already active in the project.',
      );

    const newMember = await this.prisma.projectMember.create({
      data: { projectId, studentId, facultyMemberId, role, status: 'ACTIVE' },
    });
    return newMember;
  }

  async removeMember(projectId: string, memberId: string, user: AuthPayload) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { Division: true, Member: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    const memberToRemove = await this.prisma.projectMember.findUnique({
      where: { id: memberId },
    });
    if (!memberToRemove || memberToRemove.projectId !== projectId)
      throw new NotFoundException('Member not found in this project.');

    const isDeanOfFaculty =
      user.roles.includes(FacultyMemberRoleT.DEAN) &&
      project.Division?.facultyId === user.facultyId;
    const isAdmin = user.roles.includes(FacultyMemberRoleT.ADMIN);
    const isSupervisor = project.Member?.some(
      (m) => m.facultyMemberId === user.id && m.role === 'SUPERVISOR',
    );

    if (
      !isAdmin &&
      !isDeanOfFaculty &&
      !(isSupervisor && memberToRemove.studentId)
    ) {
      throw new ForbiddenException(
        'You do not have permission to remove this member.',
      );
    }
    return this.prisma.projectMember.update({
      where: { id: memberId },
      data: { status: 'REMOVED' },
    });
  }

  async updateMember(
    projectId: string,
    memberId: string,
    data: UpdateProjectMemberDto,
    user: AuthPayload,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { Division: true, Member: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    const memberToUpdate = await this.prisma.projectMember.findFirst({
      where: { id: memberId, projectId: projectId },
    });
    if (!memberToUpdate)
      throw new NotFoundException(
        `Member with ID ${memberId} not found in project ${projectId}.`,
      );

    const isDeanOfFaculty =
      user.roles.includes(FacultyMemberRoleT.DEAN) &&
      project.Division?.facultyId === user.facultyId;
    const isAdmin = user.roles.includes(FacultyMemberRoleT.ADMIN);
    const isSupervisor = project.Member?.some(
      (m) => m.facultyMemberId === user.id && m.role === 'SUPERVISOR',
    );

    if (
      !isAdmin &&
      !isDeanOfFaculty &&
      !(isSupervisor && memberToUpdate.studentId)
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this member.',
      );
    }
    return this.prisma.projectMember.update({
      where: { id: memberId },
      data: { role: data.role, status: data.status },
    });
  }

  // --------------- PROJECT REPORT SUBMISSION (by Student) ---------------

  async submitReport(
    projectId: string,
    data: SubmitProjectReportDto,
    user: AuthPayload,
  ) {
    if (user.userType !== UserT.STUDENT)
      throw new ForbiddenException('Only students can submit project reports.');
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { Member: true },
    });
    if (!project) throw new NotFoundException('Project not found.');
    const isStudentMember = project.Member.some(
      (m) => m.studentId === user.id && m.status === 'ACTIVE',
    );
    if (!isStudentMember)
      throw new ForbiddenException(
        'You are not an active member of this project and cannot submit a report.',
      );
    if (
      !data.mainReportFileId &&
      (!data.attachmentFileIds || data.attachmentFileIds.length === 0)
    ) {
      throw new BadRequestException(
        'A main report file or at least one attachment must be provided.',
      );
    }

    if (data.mainReportFileId) {
      const fileExists = await this.prisma.file.findUnique({
        where: { id: data.mainReportFileId },
      });
      if (!fileExists)
        throw new NotFoundException(
          `Main report file with ID ${data.mainReportFileId} not found.`,
        );
    }
    if (data.attachmentFileIds) {
      for (const fileId of data.attachmentFileIds) {
        const fileExists = await this.prisma.file.findUnique({
          where: { id: fileId },
        });
        if (!fileExists)
          throw new NotFoundException(
            `Attachment file with ID ${fileId} not found.`,
          );
      }
    }

    const reportDataCreate: Prisma.ProjectFinalReportCreateInput = {
      Project: { connect: { id: projectId } },
      Student: { connect: { id: user.id } },
      Attachments:
        data.attachmentFileIds && data.attachmentFileIds.length > 0
          ? {
              create: data.attachmentFileIds.map((fileId) => ({
                fileId: fileId,
              })),
            }
          : undefined,
    };

    if (data.mainReportFileId) {
      reportDataCreate.MainReportFile = {
        connect: { id: data.mainReportFileId },
      };
    }

    const finalReport = await this.prisma.projectFinalReport.create({
      data: reportDataCreate,
      include: {
        MainReportFile: true,
        Attachments: { include: { File: true } },
      },
    });
    return finalReport;
  }

  async getProjectReports(projectId: string, user: AuthPayload) {
    await this.findById(projectId, user);
    return this.prisma.projectFinalReport.findMany({
      where: { projectId },
      orderBy: { submittedAt: 'desc' },
      include: {
        MainReportFile: true,
        Attachments: { include: { File: true } },
        Student: { select: { id: true, fullName: true, studentCode: true } },
        SubmittedByFacultyMember: {
          select: { id: true, fullName: true, facultyCode: true },
        },
        ProjectReportComments: {
          orderBy: { createdAt: 'desc' },
          include: {
            CommenterStudent: {
              select: {
                id: true,
                fullName: true,
                studentCode: true,
                profilePicture: true,
              },
            },
            CommenterFacultyMember: {
              select: {
                id: true,
                fullName: true,
                facultyCode: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    });
  }

  async getProjectReportById(reportId: string, user: AuthPayload) {
    const report = await this.prisma.projectFinalReport.findUnique({
      where: { id: reportId },
      include: {
        Project: { include: { Division: true, Member: true } },
        MainReportFile: true,
        Attachments: { include: { File: true } },
        Student: { select: { id: true, fullName: true, studentCode: true } },
        SubmittedByFacultyMember: {
          select: { id: true, fullName: true, facultyCode: true },
        },
        ProjectReportComments: {
          orderBy: { createdAt: 'desc' },
          include: {
            CommenterStudent: {
              select: {
                id: true,
                fullName: true,
                studentCode: true,
                profilePicture: true,
              },
            },
            CommenterFacultyMember: {
              select: {
                id: true,
                fullName: true,
                facultyCode: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    });
    if (!report) throw new NotFoundException('Project report not found.');
    await this.findById(report.projectId, user);
    return report;
  }

  // --------------- PROJECT COMMENTS ---------------

  async addComment(
    projectId: string,
    data: CreateProjectCommentDto,
    user: AuthPayload,
  ) {
    await this.findById(projectId, user);
    return this.prisma.projectComment.create({
      data: {
        projectId,
        content: data.content,
        commenterStudentId:
          user.userType === UserT.STUDENT ? user.id : undefined,
        commenterFacultyMemberId:
          user.userType === UserT.FACULTY ? user.id : undefined,
      },
    });
  }

  async getComments(projectId: string, user: AuthPayload) {
    await this.findById(projectId, user);
    return this.prisma.projectComment.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        CommenterStudent: {
          select: {
            id: true,
            fullName: true,
            studentCode: true,
            profilePicture: true,
          },
        },
        CommenterFacultyMember: {
          select: {
            id: true,
            fullName: true,
            facultyCode: true,
            profilePicture: true,
          },
        },
      },
    });
  }

  // --------------- EXPORT PROJECTS ---------------

  async exportProjectsToExcel(query: ProjectQueryDto, user: AuthPayload) {
    const queryWithoutPagination = { ...query, page: 1, limit: 100000 };
    const projectsResponse = await this.findMany(queryWithoutPagination, user);
    const projectsData = projectsResponse.data;
    if (!projectsData || projectsData.length === 0) {
      throw new NotFoundException(
        'No projects found matching your criteria to export.',
      );
    }

    const data = projectsData.map((project) => {
      const studentMember = project.Member?.find((m) => m.Student);
      const facultyName = project.Division?.Faculty?.name;
      const divisionName = project.Division?.name;

      return [
        project.id,
        project.title,
        project.type,
        project.status,
        studentMember?.Student?.studentCode || 'N/A',
        studentMember?.Student?.fullName || 'N/A',
        facultyName || 'N/A',
        divisionName || 'N/A',
        project.createdAt
          ? new Date(project.createdAt).toLocaleDateString()
          : 'N/A',
        project.updatedAt
          ? new Date(project.updatedAt).toLocaleDateString()
          : 'N/A',
      ];
    });

    const columns: Partial<ExcelJS.Column>[] = [
      { header: 'ID', key: 'id', width: 30 },
      { header: 'Tên dự án', key: 'title', width: 40 },
      { header: 'Loại', key: 'type', width: 20 },
      { header: 'Trạng thái', key: 'status', width: 20 },
      { header: 'Mã sinh viên', key: 'studentCode', width: 20 },
      { header: 'Tên sinh viên', key: 'studentName', width: 30 },
      { header: 'Khoa', key: 'faculty', width: 30 },
      { header: 'Bộ môn', key: 'division', width: 30 },
      { header: 'Ngày tạo', key: 'createdAt', width: 15 },
      { header: 'Cập nhật', key: 'updatedAt', width: 15 },
    ];

    return this.excelService.createExcelFile(columns, data, 'Projects');
  }
}
