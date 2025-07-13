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
  ProjectMemberStatusT,
  ProjectT,
  ProposalOutlineStatusT,
  ProposedProjectMemberStatusT,
  ProposedProjectStatusT,
  UserT,
} from '@prisma/client';
import * as Excel from 'exceljs';
import { AuthPayload } from 'src/common/interface';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { BasicFaculty, BasicStudent } from 'src/common/schema/prisma.schema';
import {
  AdvisorReviewDto,
  BulkStatusUpdateDto,
  CreateProposedProjectTriggerDto,
  DepartmentHeadReviewDto,
  ExportProjectsToExcelDto,
  FindProposedProjectDto,
  HeadApprovalDto,
  LockProposalOutlineDto,
  ManageProposedMemberDto,
  ReviewProposalOutlineDto,
  SubmitProposalOutlineDto,
  UpdateProposedProjectDto,
  UpdateStatusDto,
} from './schema';
import { uuidv7 } from 'uuidv7';

const MEMBER_ROLES = {
  ADVISOR: 'ADVISOR',
  STUDENT: 'STUDENT',
  MEMBER: 'MEMBER',
  LEADER: 'LEADER',
};

@Injectable()
export class ProposedProjectService {
  constructor(private prisma: PrismaService) {}

  // PHASE 1: Initialize proposal from ProjectAllocation
  async createFromAllocation(
    dto: CreateProposedProjectTriggerDto,
    user: AuthPayload,
  ): Promise<any> {
    const allocation = await this.prisma.projectAllocation.findUnique({
      where: { id: dto.projectAllocationId, isDeleted: false },
      select: {
        id: true,
        topicTitle: true,
        lecturerId: true,
        studentId: true,
      },
    });

    if (!allocation) {
      throw new NotFoundException('Chưa tìm thấy phân công dự án');
    }

    const existingProposal = await this.prisma.proposedProject.findUnique({
      where: { projectAllocationId: dto.projectAllocationId },
    });

    if (existingProposal) {
      throw new BadRequestException(
        'Đã tồn tại dự án đề xuất cho phân công này',
      );
    }

    // Create ProposedProject
    const proposedProject = await this.prisma.proposedProject.create({
      data: {
        projectAllocationId: allocation.id,
        title: allocation.topicTitle || 'Đề tài chưa được xác định',
        status: ProposedProjectStatusT.TOPIC_SUBMISSION_PENDING,
        createdByFacultyId: user.id,
      },
    });

    // Create ProposedProjectMember for student in allocation
    await this.prisma.proposedProjectMember.create({
      data: {
        proposedProjectId: proposedProject.id,
        studentId: allocation.studentId,
        role: MEMBER_ROLES.STUDENT,
        status: ProposedProjectMemberStatusT.ACTIVE,
      },
    });

    // Create ProposedProjectMember for advisor  if available
    if (allocation.lecturerId) {
      await this.prisma.proposedProjectMember.create({
        data: {
          proposedProjectId: proposedProject.id,
          facultyMemberId: allocation.lecturerId,
          role: MEMBER_ROLES.ADVISOR,
          status: ProposedProjectMemberStatusT.ACTIVE,
        },
      });
    }

    return proposedProject;
  }

  // PHASE 2: Student updates project title
  async updateProposedProject(
    id: string,
    dto: UpdateProposedProjectDto,
    user: AuthPayload,
  ): Promise<any> {
    const proposedProject = await this.prisma.proposedProject.findUnique({
      where: { id },
      select: {
        status: true,
        ProposedProjectMember: {
          where: {
            status: ProposedProjectMemberStatusT.ACTIVE,
          },
          select: {
            studentId: true,
          },
        },
      },
    });

    if (!proposedProject) {
      throw new NotFoundException(
        'Đề xuất dự án không tồn tại hoặc đã được duyệt',
      );
    }

    // Check permissions: Student must be an ACTIVE member of the proposal
    const canUpdate =
      user.userType === UserT.STUDENT &&
      proposedProject.ProposedProjectMember.some(
        (member) => member.studentId === user.id,
      );

    if (!canUpdate) {
      throw new ForbiddenException('Không có quyền cập nhật đề xuất dự án');
    }

    // Update status if student wants to submit to advisor for approval
    const status = dto.submitToAdvisor
      ? ProposedProjectStatusT.TOPIC_PENDING_ADVISOR
      : proposedProject.status;

    // Update ProposedProject
    const updatedProposedProject = await this.prisma.proposedProject.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        status,
      },
    });

    return updatedProposedProject;
  }

  // PHASE 3: Advisor reviews project title
  async advisorReview(
    id: string,
    dto: AdvisorReviewDto,
    user: AuthPayload,
  ): Promise<any> {
    const proposedProject = await this.prisma.proposedProject.findUnique({
      where: { id },
      include: {
        ProposedProjectMember: {
          where: {
            status: ProposedProjectMemberStatusT.ACTIVE,
            role: MEMBER_ROLES.ADVISOR,
          },
          select: {
            facultyMemberId: true,
            role: true,
            status: true,
          },
        },
      },
    });

    if (!proposedProject) {
      throw new NotFoundException('Project proposal not found');
    }

    // Check permissions: Must be the ADVISOR of the proposal
    const isAdvisor =
      user.userType === UserT.FACULTY &&
      proposedProject.ProposedProjectMember.some(
        (member) => member.facultyMemberId === user.id,
      );

    if (!isAdvisor) {
      throw new ForbiddenException('Không có quyền đánh giá đề xuất dự án này');
    }

    // Update status
    const updatedProposedProject = await this.prisma.proposedProject.update({
      where: { id },
      data: {
        status: dto.status,
      },
    });

    // Add comment if provided
    if (dto.comment) {
      await this.prisma.proposedProjectComment.create({
        data: {
          proposedProjectId: id,
          content: dto.comment,
          commenterFacultyId: user.id,
        },
      });
    }

    return updatedProposedProject;
  }

  /**
   * Review by division head (formerly department head)
   * This method allows division heads to review project proposals
   */
  async departmentHeadReview(
    id: string,
    dto: DepartmentHeadReviewDto,
    user: AuthPayload,
  ): Promise<any> {
    if (user.userType !== UserT.FACULTY) {
      throw new ForbiddenException(
        'Chỉ Trưởng bộ môn mới có quyền đánh giá đề xuất',
      );
    }

    const userDivision = await this.prisma.facultyMembershipDivision.findFirst({
      where: {
        facultyMemberId: user.id,
        role: DivisionRoleT.HEAD,
      },
      select: {
        divisionId: true,
      },
    });

    if (!userDivision) {
      throw new ForbiddenException(
        'Bạn không có quyền Trưởng bộ môn để đánh giá đề xuất',
      );
    }

    // Get the project and check if any advisor belongs to the head's division
    const proposedProject = await this.prisma.proposedProject.findUnique({
      where: { id },
      include: {
        ProposedProjectMember: {
          where: {
            status: ProposedProjectMemberStatusT.ACTIVE,
            role: MEMBER_ROLES.ADVISOR,
          },
          include: {
            FacultyMember: {
              include: {
                FacultyMembershipDivision: {
                  where: {
                    divisionId: userDivision.divisionId,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!proposedProject) {
      throw new NotFoundException('Không tìm thấy đề xuất dự án');
    }

    // Check if any advisor belongs to the head's division
    const hasPermission = proposedProject.ProposedProjectMember.some(
      (member) => {
        const divisions = member.FacultyMember?.FacultyMembershipDivision;
        return divisions && divisions.length > 0;
      },
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'Bạn không có quyền đánh giá đề xuất này vì giảng viên hướng dẫn không thuộc bộ môn của bạn',
      );
    }

    // Update status
    const updatedProposedProject = await this.prisma.proposedProject.update({
      where: { id },
      data: {
        status: dto.status,
      },
    });

    // Add comment if provided
    if (dto.comment) {
      await this.prisma.proposedProjectComment.create({
        data: {
          proposedProjectId: id,
          content: dto.comment,
          commenterFacultyId: user.id,
        },
      });
    }

    return updatedProposedProject;
  }

  // PHASE 5: Faculty head approves and creates official project
  async approveByHeadFacultyMember(
    id: string,
    dto: HeadApprovalDto,
    user: AuthPayload,
  ) {
    // Check if the proposed project exists
    const proposedProject = await this.prisma.proposedProject.findUnique({
      where: { id },
      include: {
        ProposedProjectMember: {
          where: {
            status: ProposedProjectMemberStatusT.ACTIVE,
            role: MEMBER_ROLES.ADVISOR,
          },
          include: {
            FacultyMember: {
              select: {
                id: true,
                facultyId: true,
              },
            },
          },
        },
      },
    });

    if (!proposedProject) {
      throw new NotFoundException(`Không tìm thấy đề xuất dự án với ID: ${id}`);
    }

    // Check if the project is at the right stage
    if (proposedProject.status !== ProposedProjectStatusT.PENDING_HEAD) {
      throw new BadRequestException(
        `Không thể phê duyệt đề xuất dự án không ở trạng thái chờ trưởng bộ môn/khoa duyệt`,
      );
    }

    // Ensure the user is the head of the advisor's faculty
    const isDean = proposedProject.ProposedProjectMember.some(
      (member) => member.FacultyMember?.facultyId === user.facultyId,
    );

    if (!isDean) {
      throw new ForbiddenException(
        `Bạn không có quyền phê duyệt đề xuất dự án này`,
      );
    }

    // Update the proposed project status to approved
    const updated = await this.prisma.proposedProject.update({
      where: { id },
      data: {
        status: dto.status,
        approvedById: user.id,
        approvedAt: new Date(),
      },
      include: {
        ProjectAllocation: {
          include: {
            Student: true,
            Lecturer: true,
          },
        },
      },
    });

    // Create a new official project if approved
    if (dto.status === ProposedProjectStatusT.APPROVED_BY_HEAD) {
      // Use facultyId from dto or from user's AuthPayload
      const facultyId = dto.facultyId || user.facultyId;
      if (!facultyId) {
        throw new BadRequestException(
          `Không tìm thấy thông tin khoa để tạo dự án chính thức`,
        );
      }
      // Create the official project
      await this.createOfficialProject(proposedProject, user.id);
    }

    return updated;
  }

  async approveByHeadForFinalProject(
    id: string,
    dto: HeadApprovalDto,
    user: AuthPayload,
  ) {
    const facultyId = user.id;
    if (!facultyId) {
      throw new BadRequestException('Bạn chưa được gán cho khoa nào');
    }

    // Find the proposal
    const proposal = await this.prisma.proposedProject.findUnique({
      where: { id },
      include: {
        ProposalOutline: true,
        ProposedProjectMember: {
          where: {
            status: ProposedProjectMemberStatusT.ACTIVE,
          },
        },
        ProjectAllocation: {
          include: {
            Lecturer: true,
            Student: true,
          },
        },
      },
    });

    if (!proposal) {
      throw new NotFoundException('Không tìm thấy đề xuất dự án');
    }

    // Check if the outline has been completed and approved
    if (
      !proposal.ProposalOutline ||
      proposal.ProposalOutline.status !== ProposalOutlineStatusT.APPROVED
    ) {
      throw new BadRequestException(
        'Đề cương dự án chưa được phê duyệt hoặc chưa hoàn thành',
      );
    }

    // Update the proposal to approved and create the project
    const updated = await this.prisma.proposedProject.update({
      where: { id },
      data: {
        status: ProposedProjectStatusT.APPROVED_BY_HEAD,
        approvedById: user.id,
        approvedAt: new Date(),
      },
      include: {
        ProjectAllocation: {
          include: {
            Student: {
              select: BasicStudent,
            },
            Lecturer: {
              select: BasicFaculty,
            },
          },
        },
        ProposalOutline: true,
      },
    });

    // Create the official project
    await this.createOfficialProject(proposal, user.id);

    return updated;
  }

  // Helper method to create official project
  private async createOfficialProject(
    proposedProject: any,
    approvedById: string,
  ): Promise<any> {
    const divisionId = await this.prisma.facultyMembershipDivision.findFirst({
      select: {
        divisionId: true,
      },
      where: {
        facultyMemberId: approvedById,
      },
    });
    // Create the official project
    const project = await this.prisma.project.create({
      data: {
        id: uuidv7(),
        type: ProjectT.RESEARCH,
        title: proposedProject.title,
        description: proposedProject.description,
        field: proposedProject.field || 'Thesis',
        status: 'WAITING_FOR_EVALUATION',
        approvedById: approvedById,
        fieldPoolId: proposedProject.fieldPoolId,
        divisionId: divisionId?.divisionId || null,
      },
    });
    if (
      proposedProject.ProposedProjectMember &&
      Array.isArray(proposedProject.ProposedProjectMember)
    ) {
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
    }

    return project;
  }

  // Member management in project proposal
  async manageMembers(
    id: string,
    dto: ManageProposedMemberDto,
    user: AuthPayload,
  ): Promise<any> {
    // Check if ProposedProject exists
    const proposedProject = await this.prisma.proposedProject.findUnique({
      where: { id },
      include: {
        ProposedProjectMember: {
          where: {
            facultyMemberId: user.id,
            role: MEMBER_ROLES.ADVISOR,
          },
        },
      },
    });

    if (!proposedProject) {
      throw new NotFoundException('Project proposal not found');
    }

    // Check permissions: Must be the ADVISOR of the proposal
    const isAdvisor =
      user.userType === UserT.FACULTY &&
      proposedProject.ProposedProjectMember.length > 0;

    if (!isAdvisor) {
      throw new ForbiddenException(
        'No permission to manage project proposal members',
      );
    }

    // Add/Remove member
    if (dto.action === 'add') {
      // Check if student is already a member
      const existingMember = await this.prisma.proposedProjectMember.findFirst({
        where: {
          proposedProjectId: id,
          studentId: dto.studentId,
        },
      });

      if (existingMember) {
        // If member exists but is REMOVED, update to ACTIVE
        if (existingMember.status === ProposedProjectMemberStatusT.REMOVED) {
          return this.prisma.proposedProjectMember.update({
            where: {
              id: existingMember.id,
            },
            data: {
              status: ProposedProjectMemberStatusT.ACTIVE,
              role: dto.role || MEMBER_ROLES.STUDENT,
            },
          });
        } else {
          throw new BadRequestException(
            'Student is already a member of this project proposal',
          );
        }
      }

      // Add new member
      return this.prisma.proposedProjectMember.create({
        data: {
          proposedProjectId: id,
          studentId: dto.studentId,
          role: dto.role || MEMBER_ROLES.STUDENT,
          status: ProposedProjectMemberStatusT.ACTIVE,
        },
      });
    } else {
      // Find the member to remove
      const memberToRemove = await this.prisma.proposedProjectMember.findFirst({
        where: {
          proposedProjectId: id,
          studentId: dto.studentId,
        },
      });

      if (!memberToRemove) {
        throw new NotFoundException(
          'Member not found in this project proposal',
        );
      }

      // Mark as REMOVED
      return this.prisma.proposedProjectMember.update({
        where: {
          id: memberToRemove.id,
        },
        data: {
          status: ProposedProjectMemberStatusT.REMOVED,
        },
      });
    }
  }

  // GIAI ĐOẠN 6: Sinh viên nộp đề cương chi tiết
  async submitProposalOutline(
    dto: SubmitProposalOutlineDto,
    user: AuthPayload,
  ): Promise<any> {
    // Kiểm tra ProposedProject tồn tại
    const proposedProject = await this.prisma.proposedProject.findUnique({
      where: { id: dto.proposedProjectId },
      include: {
        ProposedProjectMember: true,
        ProposalOutline: true,
      },
    });

    if (!proposedProject) {
      throw new NotFoundException('Không tìm thấy đề xuất dự án');
    }

    // Kiểm tra quyền hạn: SV phải là thành viên ACTIVE của đề xuất
    const canSubmit =
      user.userType === UserT.STUDENT &&
      proposedProject.ProposedProjectMember.some(
        (member) =>
          member.studentId === user.id &&
          member.status === ProposedProjectMemberStatusT.ACTIVE,
      );

    if (!canSubmit) {
      throw new ForbiddenException('Không có quyền nộp đề cương');
    }

    // Kiểm tra trạng thái của đề xuất - chỉ cho phép nộp đề cương khi đề tài đã được phê duyệt
    const allowedStatuses = [
      ProposedProjectStatusT.TOPIC_APPROVED,
      ProposedProjectStatusT.OUTLINE_PENDING_SUBMISSION,
      ProposedProjectStatusT.OUTLINE_REQUESTED_CHANGES,
      ProposedProjectStatusT.OUTLINE_APPROVED,
    ];

    if (!allowedStatuses.includes(proposedProject.status as any)) {
      throw new BadRequestException(
        'Chỉ được phép nộp đề cương khi đề tài đã được phê duyệt (TOPIC_APPROVED)',
      );
    }

    let updatedOutline;

    // Cập nhật hoặc tạo mới ProposalOutline
    if (proposedProject.ProposalOutline) {
      // Cập nhật ProposalOutline hiện có
      updatedOutline = await this.prisma.proposalOutline.update({
        where: { id: proposedProject.ProposalOutline.id },
        data: {
          introduction: dto.introduction,
          objectives: dto.objectives,
          methodology: dto.methodology,
          expectedResults: dto.expectedResults,
          fileId: dto.fileId,
          status: ProposalOutlineStatusT.PENDING_REVIEW,
        },
      });
    } else {
      // Tạo mới ProposalOutline nếu chưa có
      updatedOutline = await this.prisma.proposalOutline.create({
        data: {
          introduction: dto.introduction,
          objectives: dto.objectives,
          methodology: dto.methodology,
          expectedResults: dto.expectedResults,
          fileId: dto.fileId,
          status: ProposalOutlineStatusT.PENDING_REVIEW,
        },
      });

      // Liên kết ProposalOutline với ProposedProject
      await this.prisma.proposedProject.update({
        where: { id: dto.proposedProjectId },
        data: {
          proposalOutlineId: updatedOutline.id,
        },
      });
    }

    if (proposedProject.status === ProposedProjectStatusT.TOPIC_APPROVED) {
      await this.prisma.proposedProject.update({
        where: { id: dto.proposedProjectId },
        data: {
          status: ProposedProjectStatusT.OUTLINE_PENDING_ADVISOR,
        },
      });
    }

    return updatedOutline;
  }

  // GIAI ĐOẠN 7: GVHD/TBM duyệt đề cương
  async reviewProposalOutline(
    id: string,
    dto: ReviewProposalOutlineDto,
    user: AuthPayload,
  ): Promise<any> {
    // Kiểm tra ProposalOutline tồn tại
    const proposalOutline = await this.prisma.proposalOutline.findUnique({
      where: { id },
      include: {
        ProposedProject: {
          include: {
            ProposedProjectMember: {
              where: {
                status: ProposedProjectMemberStatusT.ACTIVE,
              },
            },
          },
        },
      },
    });

    if (!proposalOutline) {
      throw new NotFoundException('Không tìm thấy đề cương');
    }

    // Kiểm tra quyền hạn: Phải là GVHD hoặc TBM
    const isFaculty = user.userType === UserT.FACULTY;
    if (!isFaculty) {
      throw new ForbiddenException('Không có quyền duyệt đề cương');
    }

    // TODO: Thêm kiểm tra chi tiết quyền theo vai trò (GVHD hoặc TBM)

    // Cập nhật trạng thái outline
    const updatedOutline = await this.prisma.proposalOutline.update({
      where: { id },
      data: {
        status: dto.status,
      },
    });

    // Cập nhật trạng thái ProposedProject khi outline được approve
    if (dto.status === 'APPROVED' && proposalOutline.ProposedProject?.[0]) {
      // When lecturer approves outline, automatically move to PENDING_HEAD for department head review
      const proposedProject = await this.prisma.proposedProject.update({
        where: { id: proposalOutline.ProposedProject[0].id },
        data: {
          status: ProposedProjectStatusT.PENDING_HEAD,
          approvedById: user.id,
          approvedAt: new Date(),
        },
        include: {
          ProposedProjectMember: {
            where: {
              status: ProposedProjectMemberStatusT.ACTIVE,
            },
          },
        },
      });

      // Note: Official project creation should happen when department head approves, not lecturer
      // await this.createOfficialProject(proposedProject, user.id);
    } else if (
      dto.status === 'REQUESTED_CHANGES' &&
      proposalOutline.ProposedProject?.[0]
    ) {
      await this.prisma.proposedProject.update({
        where: { id: proposalOutline.ProposedProject[0].id },
        data: {
          status: ProposedProjectStatusT.OUTLINE_REQUESTED_CHANGES,
        },
      });
    } else if (
      dto.status === 'REJECTED' &&
      proposalOutline.ProposedProject?.[0]
    ) {
      await this.prisma.proposedProject.update({
        where: { id: proposalOutline.ProposedProject[0].id },
        data: {
          status: ProposedProjectStatusT.OUTLINE_REJECTED,
        },
      });
    }

    // Thêm bình luận nếu có
    if (dto.comment) {
      await this.prisma.proposedProjectComment.create({
        data: {
          proposedProjectId: proposalOutline.ProposedProject[0].id,
          content: dto.comment,
          commenterFacultyId: user.id,
        },
      });
    }

    return updatedOutline;
  }

  // GIAI ĐOẠN 8: Trưởng khoa khóa đề cương
  async lockProposalOutline(
    id: string,
    dto: LockProposalOutlineDto,
    user: AuthPayload,
  ): Promise<any> {
    // Kiểm tra ProposalOutline tồn tại
    const proposalOutline = await this.prisma.proposalOutline.findUnique({
      where: { id },
    });

    if (!proposalOutline) {
      throw new NotFoundException('Không tìm thấy đề cương');
    }

    // Kiểm tra quyền hạn: Phải là TK
    if (user.userType !== UserT.FACULTY) {
      throw new ForbiddenException('Không có quyền khóa đề cương');
    }

    // TODO: Thêm kiểm tra quyền TK dựa trên department của user

    // Cập nhật trạng thái
    const updatedOutline = await this.prisma.proposalOutline.update({
      where: { id },
      data: {
        status: dto.status,
      },
    });

    return updatedOutline;
  }

  // Search for project proposals
  async find(dto: FindProposedProjectDto, user: AuthPayload): Promise<any> {
    const {
      page = 1,
      limit = 10,
      status,
      advisorId,
      studentId,
      facultyId,
      fieldPoolId,
      projectAllocationId,
      keyword,
      orderBy = 'createdAt',
      asc = 'desc',
    } = dto;

    // Build search conditions
    const whereClause: Prisma.ProposedProjectWhereInput = {};
    const andConditions: Prisma.ProposedProjectWhereInput[] = [];

    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    // Filter by advisor - store in AND array to avoid overriding
    if (advisorId) {
      andConditions.push({
        ProposedProjectMember: {
          some: {
            facultyMemberId: advisorId,
            role: MEMBER_ROLES.ADVISOR,
            status: ProposedProjectMemberStatusT.ACTIVE,
          },
        },
      });
    }

    // Filter by student - store in AND array to avoid overriding
    if (studentId) {
      andConditions.push({
        ProposedProjectMember: {
          some: {
            studentId,
            status: ProposedProjectMemberStatusT.ACTIVE,
          },
        },
      });
    }

    // Filter by faculty - store in AND array to avoid overriding
    if (facultyId) {
      andConditions.push({
        ProposedProjectMember: {
          some: {
            FacultyMember: {
              facultyId,
            },
            status: ProposedProjectMemberStatusT.ACTIVE,
          },
        },
      });
    }

    // Add AND conditions to the whereClause if any exist
    if (andConditions.length > 0) {
      whereClause.AND = andConditions;
    }

    // Filter by field pool
    if (fieldPoolId) {
      whereClause.fieldPoolId = fieldPoolId;
    }

    // Filter by allocation
    if (projectAllocationId) {
      whereClause.projectAllocationId = projectAllocationId;
    }

    // Search by keyword
    if (keyword) {
      whereClause.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // Filter by permissions
    if (user.userType === UserT.STUDENT) {
      // Students can only see their proposals
      const studentCondition: Prisma.ProposedProjectWhereInput = {
        ProposedProjectMember: {
          some: {
            studentId: user.id,
            status: ProposedProjectMemberStatusT.ACTIVE,
          },
        },
      };

      if (whereClause.AND) {
        // If AND already exists as an array, add to it
        if (Array.isArray(whereClause.AND)) {
          whereClause.AND = [...whereClause.AND, studentCondition];
        } else {
          // If AND exists but is not an array, make it an array
          whereClause.AND = [whereClause.AND, studentCondition];
        }
      } else {
        // If AND doesn't exist, create it
        whereClause.AND = [studentCondition];
      }
    } else if (user.userType === UserT.FACULTY) {
      // Faculty can see proposals they advise or based on role
      // Only apply this filter if advisorId wasn't explicitly provided
      if (!advisorId) {
        const facultyCondition: Prisma.ProposedProjectWhereInput = {
          ProposedProjectMember: {
            some: {
              facultyMemberId: user.id,
              status: ProposedProjectMemberStatusT.ACTIVE,
            },
          },
        };

        if (whereClause.AND) {
          // If AND already exists as an array, add to it
          if (Array.isArray(whereClause.AND)) {
            whereClause.AND = [...whereClause.AND, facultyCondition];
          } else {
            // If AND exists but is not an array, make it an array
            whereClause.AND = [whereClause.AND, facultyCondition];
          }
        } else {
          // If AND doesn't exist, create it
          whereClause.AND = [facultyCondition];
        }
      }
    }

    // Determine sort direction
    const orderDirection: Prisma.SortOrder = asc === 'asc' ? 'asc' : 'desc';

    // Build sort condition
    let orderByClause: any = { [orderBy]: orderDirection };

    // Sort by student or advisor name requires special handling
    if (orderBy === 'studentName' || orderBy === 'advisorName') {
      // Default to createdAt as these require complex joins
      orderByClause = { createdAt: orderDirection };
    }

    // Execute query with optimized includes to reduce redundancy
    const [data, total] = await Promise.all([
      this.prisma.proposedProject.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: orderByClause,
        include: {
          ProposedProjectMember: {
            where: {
              status: ProposedProjectMemberStatusT.ACTIVE,
            },
            include: {
              Student: {
                select: BasicStudent,
              },
              FacultyMember: {
                select: BasicFaculty,
              },
            },
          },
          ProposedProjectComment: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 5,
            select: {
              id: true,
              content: true,
              createdAt: true,
              CommenterStudent: {
                select: {
                  id: true,
                  fullName: true,
                  profilePicture: true,
                },
              },
              CommenterFacultyMember: {
                select: {
                  id: true,
                  fullName: true,
                  profilePicture: true,
                },
              },
            },
          },
          ProjectAllocation: {
            select: {
              id: true,
              topicTitle: true,
              status: true,
            },
          },
          FieldPool: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          ProposalOutline: {
            select: {
              id: true,
              status: true,
              updatedAt: true,
            },
          },
        },
      }),
      this.prisma.proposedProject.count({
        where: whereClause,
      }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findByDean(
    dto: FindProposedProjectDto,
    user: AuthPayload,
  ): Promise<any> {
    if (user.userType !== UserT.FACULTY) {
      throw new ForbiddenException(
        'Chỉ Trưởng khoa mới có quyền truy cập trang này',
      );
    }

    const isDean = await this.prisma.facultyRole.findFirst({
      where: {
        facultyMemberId: user.id,
        role: FacultyMemberRoleT.DEAN,
      },
    });

    if (!isDean) {
      throw new ForbiddenException(
        'Bạn không có quyền Trưởng khoa để truy cập',
      );
    }

    const {
      page = 1,
      limit = 10,
      status,
      advisorId,
      studentId,
      facultyId,
      fieldPoolId,
      projectAllocationId,
      keyword,
      orderBy = 'createdAt',
      asc = 'desc',
    } = dto;

    // Build search conditions
    const whereClause: Prisma.ProposedProjectWhereInput = {};
    const andConditions: Prisma.ProposedProjectWhereInput[] = [];
    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    // Filter by advisor - store in AND array to avoid overriding
    if (advisorId) {
      andConditions.push({
        ProposedProjectMember: {
          some: {
            facultyMemberId: advisorId,
            role: MEMBER_ROLES.ADVISOR,
            status: ProposedProjectMemberStatusT.ACTIVE,
          },
        },
      });
    }

    // Filter by student - store in AND array to avoid overriding
    if (studentId) {
      andConditions.push({
        ProposedProjectMember: {
          some: {
            studentId,
            status: ProposedProjectMemberStatusT.ACTIVE,
          },
        },
      });
    }

    // Filter by faculty - use user's faculty if not provided
    // Deans can only see proposals from their own faculty
    const facultyIdToUse = facultyId || user.facultyId;

    if (!facultyIdToUse) {
      throw new BadRequestException('Không tìm thấy thông tin khoa của bạn');
    }

    andConditions.push({
      ProposedProjectMember: {
        some: {
          FacultyMember: {
            facultyId: facultyIdToUse,
          },
          status: ProposedProjectMemberStatusT.ACTIVE,
        },
      },
    });

    // Add AND conditions to the whereClause if any exist
    if (andConditions.length > 0) {
      whereClause.AND = andConditions;
    }

    // Filter by field pool
    if (fieldPoolId) {
      whereClause.fieldPoolId = fieldPoolId;
    }

    // Filter by allocation
    if (projectAllocationId) {
      whereClause.projectAllocationId = projectAllocationId;
    }

    // Search by keyword
    if (keyword) {
      whereClause.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // Determine sort direction
    const orderDirection: Prisma.SortOrder = asc === 'asc' ? 'asc' : 'desc';

    // Build sort condition
    let orderByClause: any = { [orderBy]: orderDirection };

    // Sort by student or advisor name requires special handling
    if (orderBy === 'studentName' || orderBy === 'advisorName') {
      // Default to createdAt as these require complex joins
      orderByClause = { createdAt: orderDirection };
    }

    // Execute query with optimized includes to reduce redundancy
    const [data, total] = await Promise.all([
      this.prisma.proposedProject.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: orderByClause,
        include: {
          ProposedProjectMember: {
            where: {
              status: ProposedProjectMemberStatusT.ACTIVE,
            },
            include: {
              Student: {
                select: BasicStudent,
              },
              FacultyMember: {
                select: BasicFaculty,
              },
            },
          },
          ProposedProjectComment: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 5,
            select: {
              id: true,
              content: true,
              createdAt: true,
              CommenterStudent: {
                select: {
                  id: true,
                  fullName: true,
                  profilePicture: true,
                },
              },
              CommenterFacultyMember: {
                select: {
                  id: true,
                  fullName: true,
                  profilePicture: true,
                },
              },
            },
          },
          ProjectAllocation: {
            select: {
              id: true,
              topicTitle: true,
              status: true,
            },
          },
          FieldPool: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          ProposalOutline: {
            select: {
              id: true,
              status: true,
              updatedAt: true,
            },
          },
        },
      }),
      this.prisma.proposedProject.count({
        where: whereClause,
      }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findByHead(
    dto: FindProposedProjectDto,
    user: AuthPayload,
  ): Promise<any> {
    // Check if the user is a faculty member
    if (user.userType !== UserT.FACULTY) {
      throw new ForbiddenException(
        'Chỉ Trưởng bộ môn mới có quyền truy cập trang này',
      );
    }

    // Check if the user is a division head by checking FacultyMembershipDivision
    const userDivision = await this.prisma.facultyMembershipDivision.findFirst({
      where: {
        facultyMemberId: user.id,
        role: DivisionRoleT.HEAD,
      },
      select: {
        divisionId: true,
        Division: {
          select: {
            id: true,
            name: true,
            facultyId: true,
          },
        },
      },
    });

    if (!userDivision) {
      throw new ForbiddenException(
        'Bạn không có quyền Trưởng bộ môn để truy cập',
      );
    }

    const {
      page = 1,
      limit = 10,
      status,
      advisorId,
      studentId,
      facultyId,
      fieldPoolId,
      projectAllocationId,
      keyword,
      orderBy = 'createdAt',
      asc = 'desc',
    } = dto;

    // Build search conditions
    const whereClause: Prisma.ProposedProjectWhereInput = {};
    const andConditions: Prisma.ProposedProjectWhereInput[] = [];

    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    // Filter by advisor - store in AND array to avoid overriding
    if (advisorId) {
      andConditions.push({
        ProposedProjectMember: {
          some: {
            facultyMemberId: advisorId,
            role: MEMBER_ROLES.ADVISOR,
            status: ProposedProjectMemberStatusT.ACTIVE,
          },
        },
      });
    }

    // Filter by student - store in AND array to avoid overriding
    if (studentId) {
      andConditions.push({
        ProposedProjectMember: {
          some: {
            studentId,
            status: ProposedProjectMemberStatusT.ACTIVE,
          },
        },
      });
    }

    // IMPORTANT: Filter by division - limit to only the division the head manages
    // Get advisors in this division
    const divisionAdvisors =
      await this.prisma.facultyMembershipDivision.findMany({
        where: {
          divisionId: userDivision.divisionId,
        },
        select: {
          facultyMemberId: true,
        },
      });

    const divisionAdvisorIds = divisionAdvisors.map(
      (advisor) => advisor.facultyMemberId,
    );

    // Add filter for division advisors
    andConditions.push({
      ProposedProjectMember: {
        some: {
          facultyMemberId: {
            in: divisionAdvisorIds,
          },
          role: MEMBER_ROLES.ADVISOR,
          status: ProposedProjectMemberStatusT.ACTIVE,
        },
      },
    });

    // Add AND conditions to the whereClause if any exist
    if (andConditions.length > 0) {
      whereClause.AND = andConditions;
    }

    // Filter by field pool
    if (fieldPoolId) {
      whereClause.fieldPoolId = fieldPoolId;
    }

    // Filter by allocation
    if (projectAllocationId) {
      whereClause.projectAllocationId = projectAllocationId;
    }

    // Search by keyword
    if (keyword) {
      whereClause.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // Determine sort direction
    const orderDirection: Prisma.SortOrder = asc === 'asc' ? 'asc' : 'desc';

    // Build sort condition
    let orderByClause: any = { [orderBy]: orderDirection };

    // Sort by student or advisor name requires special handling
    if (orderBy === 'studentName' || orderBy === 'advisorName') {
      // Default to createdAt as these require complex joins
      orderByClause = { createdAt: orderDirection };
    }

    // Execute query with optimized includes to reduce redundancy
    const [data, total] = await Promise.all([
      this.prisma.proposedProject.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: orderByClause,
        include: {
          ProposedProjectMember: {
            where: {
              status: ProposedProjectMemberStatusT.ACTIVE,
            },
            include: {
              Student: {
                select: BasicStudent,
              },
              FacultyMember: {
                select: BasicFaculty,
              },
            },
          },
          ProposedProjectComment: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 5,
            select: {
              id: true,
              content: true,
              createdAt: true,
              CommenterStudent: {
                select: {
                  id: true,
                  fullName: true,
                  profilePicture: true,
                },
              },
              CommenterFacultyMember: {
                select: {
                  id: true,
                  fullName: true,
                  profilePicture: true,
                },
              },
            },
          },
          ProjectAllocation: {
            select: {
              id: true,
              topicTitle: true,
              status: true,
            },
          },
          FieldPool: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          ProposalOutline: {
            select: {
              id: true,
              status: true,
              updatedAt: true,
            },
          },
        },
      }),
      this.prisma.proposedProject.count({
        where: whereClause,
      }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      divisionInfo: {
        id: userDivision.divisionId,
        name: userDivision.Division?.name,
      },
    };
  }

  async findOne(id: string, user: AuthPayload): Promise<any> {
    const proposedProject = await this.prisma.proposedProject.findUnique({
      where: { id },
      include: {
        ProposedProjectMember: {
          where: {
            status: ProposedProjectMemberStatusT.ACTIVE,
          },
          include: {
            Student: {
              select: BasicStudent,
            },
            FacultyMember: {
              select: BasicFaculty,
            },
          },
        },
        ProposedProjectComment: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            CommenterStudent: {
              select: BasicStudent,
            },
            CommenterFacultyMember: {
              select: BasicFaculty,
            },
          },
        },
        FieldPool: true,
        ProposalOutline: {
          select: {
            id: true,
            fileId: true,
            expectedResults: true,
            introduction: true,
            methodology: true,
            objectives: true,
            status: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!proposedProject) {
      throw new NotFoundException('Project proposal not found');
    }

    // Check permission to view details
    const isMember = proposedProject.ProposedProjectMember.some(
      (member) => member.Student?.id === user.id,
    );

    const isAdvisor =
      user.userType === UserT.FACULTY &&
      proposedProject.ProposedProjectMember.some(
        (member) =>
          member.FacultyMember?.id === user.id &&
          member.role === MEMBER_ROLES.ADVISOR &&
          member.status === ProposedProjectMemberStatusT.ACTIVE,
      );

    // TODO: Add checks for department head, faculty head roles

    if (!isMember && !isAdvisor && user.userType !== UserT.FACULTY) {
      throw new ForbiddenException(
        'No permission to view project proposal details',
      );
    }

    return proposedProject;
  }

  async updateStatus(
    id: string,
    dto: UpdateStatusDto,
    user: AuthPayload,
  ): Promise<any> {
    const proposedProject = await this.prisma.proposedProject.findUnique({
      where: { id },
      include: {
        ProposedProjectMember: {
          where: { status: ProposedProjectMemberStatusT.ACTIVE },
        },
      },
    });

    if (!proposedProject) {
      throw new NotFoundException('Không tìm thấy đề xuất dự án');
    }

    // const canChangeToStatus = await this.canUserChangeStatus(
    //   proposedProject,
    //   dto.status,
    //   user,
    // );

    // if (!canChangeToStatus) {
    //   throw new ForbiddenException(
    //     'Bạn không có quyền thay đổi sang trạng thái này',
    //   );
    // }

    if (dto.status === ProposedProjectStatusT.APPROVED_BY_HEAD) {
      return this.approveAndCreateProject(id, dto, user);
    }

    const updated = await this.prisma.proposedProject.update({
      where: { id },
      data: { status: dto.status },
    });

    if (dto.comment) {
      await this.prisma.proposedProjectComment.create({
        data: {
          proposedProjectId: id,
          content: dto.comment,
          commenterFacultyId:
            user.userType === UserT.FACULTY ? user.id : undefined,
          commenterStudentId:
            user.userType === UserT.STUDENT ? user.id : undefined,
        },
      });
    }

    return updated;
  }

  // Check if user has permission to change status
  private async canUserChangeStatus(
    project: any,
    newStatus: ProposedProjectStatusT,
    user: AuthPayload,
  ): Promise<boolean> {
    if (user.userType === UserT.STUDENT) {
      // Student can only change to PENDING_ADVISOR
      return (
        newStatus === ProposedProjectStatusT.TOPIC_SUBMISSION_PENDING &&
        this.isProjectMember(project, user.id)
      );
    }

    if (user.userType === UserT.FACULTY) {
      const isAdvisor = project.advisorId === user.id;

      // Check user role (simplified, needs full implementation)
      const userRoles = user.roles || [];
      const isHead = userRoles.includes('DEPARTMENT_HEAD');
      const isDean = userRoles.includes('DEAN');

      // Advisor can change to their status
      if (
        isAdvisor &&
        (newStatus === ProposedProjectStatusT.TOPIC_APPROVED ||
          newStatus === ProposedProjectStatusT.TOPIC_REQUESTED_CHANGES ||
          newStatus === ProposedProjectStatusT.OUTLINE_REJECTED)
      ) {
        return true;
      }

      // Department head can change to their status
      if (
        isHead &&
        (newStatus === ProposedProjectStatusT.PENDING_HEAD ||
          newStatus === ProposedProjectStatusT.REQUESTED_CHANGES_HEAD ||
          newStatus === ProposedProjectStatusT.REJECTED_BY_HEAD)
      ) {
        return true;
      }

      // Dean can approve the final status
      if (isDean && newStatus === ProposedProjectStatusT.APPROVED_BY_HEAD) {
        return true;
      }
    }

    return false;
  }

  // Check if user is a member of the proposal
  private isProjectMember(project: any, userId: string): boolean {
    return project.ProposedProjectMember.some(
      (member) => member.studentId === userId,
    );
  }

  private async approveAndCreateProject(
    id: string,
    dto: UpdateStatusDto,
    user: AuthPayload,
  ): Promise<any> {
    const proposedProject = await this.prisma.proposedProject.findUnique({
      where: { id },
      include: {
        ProposedProjectMember: {
          where: { status: ProposedProjectMemberStatusT.ACTIVE },
          include: {
            Student: {
              select: BasicStudent,
            },
            FacultyMember: {
              select: BasicFaculty,
            },
          },
        },
      },
    });

    if (!proposedProject) {
      throw new NotFoundException('Project proposal not found');
    }

    // 1. Update ProposedProject status
    const updatedProposedProject = await this.prisma.proposedProject.update({
      where: { id },
      data: {
        status: dto.status as ProposedProjectStatusT,
        approvedById: user.id,
        approvedAt: new Date(),
      },
    });

    // 2. Create official project
    const project = await this.prisma.project.create({
      data: {
        title: proposedProject.title,
        description: proposedProject.description,
        field: 'RESEARCH',
        type: ProjectT.GRADUATED,
        approvedById: user.id,
      },
    });

    // 3. Create empty proposal outline
    const proposalOutline = await this.prisma.proposalOutline.create({
      data: {
        introduction: '',
        objectives: '',
        methodology: '',
        expectedResults: '',
        status: ProposalOutlineStatusT.DRAFT,
        projectId: project.id,
      },
    });

    // 4. Link proposal outline to project proposal
    await this.prisma.proposedProject.update({
      where: { id },
      data: {
        proposalOutlineId: proposalOutline.id,
      },
    });

    // 5. Create project members for students
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
      }
    }

    // 6. Create project member for advisor
    const advisorMember = proposedProject.ProposedProjectMember.find(
      (member) =>
        member.role === MEMBER_ROLES.ADVISOR && member.facultyMemberId,
    );

    if (advisorMember?.FacultyMember?.id) {
      await this.prisma.projectMember.create({
        data: {
          projectId: project.id,
          facultyMemberId: advisorMember.FacultyMember.id,
          role: MEMBER_ROLES.ADVISOR,
          status: ProjectMemberStatusT.ACTIVE,
        },
      });
    }

    // Add comment if provided
    if (dto.comment) {
      await this.prisma.proposedProjectComment.create({
        data: {
          proposedProjectId: id,
          content: dto.comment,
          commenterFacultyId: user.id,
        },
      });
    }

    return {
      proposedProject: updatedProposedProject,
      project,
      proposalOutline,
    };
  }

  /**
   * Update proposed project title
   * This method allows students to update the title of their proposal with status validation
   * If the proposal is already approved, title changes are not allowed - only outline submissions
   */
  async updateProposedProjectTitle(
    id: string,
    { title, description }: { title: string; description?: string },
    user: AuthPayload,
  ) {
    const proposedProject = await this.prisma.proposedProject.findUnique({
      where: { id },
      select: {
        status: true,
        ProposedProjectMember: {
          where: {
            status: ProposedProjectMemberStatusT.ACTIVE,
          },
          select: {
            Student: {
              select: BasicStudent,
            },
          },
        },
      },
    });

    if (!proposedProject) {
      throw new NotFoundException('Đề xuất dự án không tồn tại');
    }

    // Check if user is a student of the project
    const isMember = proposedProject.ProposedProjectMember.some(
      (member) => member.Student?.id === user.id,
    );

    if (!isMember) {
      throw new ForbiddenException('Bạn không có quyền cập nhật đề tài này');
    }

    // Check if the proposal is in a valid state for title update
    const allowedStatuses = [
      'TOPIC_SUBMISSION_PENDING',
      'TOPIC_REQUESTED_CHANGES',
    ];

    if (!allowedStatuses.includes(proposedProject.status)) {
      throw new BadRequestException(
        'Không thể cập nhật tên đề tài cho đề xuất đã được duyệt hoặc đang trong quá trình đánh giá',
      );
    }

    // Update the title
    const updatedProposedProject = await this.prisma.proposedProject.update({
      where: { id },
      data: {
        title,
        description,
      },
    });

    return updatedProposedProject;
  }

  // Export projects to Excel
  async exportProjectsToExcel(
    dto: ExportProjectsToExcelDto,
    user: AuthPayload,
  ): Promise<Buffer> {
    try {
      // Extract parameters from DTO
      const { advisorId, facultyId, status, fieldPoolId, exportAll } = dto;

      // Check permissions based on user type
      if (user.userType === UserT.FACULTY) {
        // Check if user is a division head (previously department head)
        const faculty = await this.prisma.facultyMember.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            fullName: true,
            facultyId: true,
            FacultyMembershipDivision: {
              where: {
                role: DivisionRoleT.HEAD,
              },
              select: {
                divisionId: true,
              },
            },
          },
        });

        // Check if faculty is division head
        const isDivisionHead =
          faculty?.FacultyMembershipDivision &&
          faculty.FacultyMembershipDivision.length > 0;

        // Check if faculty is faculty head (dean)
        const isFacultyHead = user.roles?.includes('DEAN') || false;

        // Regular faculty can only export their own students' projects
        if (!isDivisionHead && !isFacultyHead && !exportAll) {
          // If trying to export for a different advisor, reject
          if (advisorId && advisorId !== user.id) {
            throw new ForbiddenException(
              'You can only export projects for yourself as advisor',
            );
          }
          // Force advisorId to be the current user
          dto.advisorId = user.id;
        }

        // Division head can only export projects in their faculty
        if (
          isDivisionHead &&
          !isFacultyHead &&
          facultyId &&
          facultyId !== faculty?.facultyId
        ) {
          throw new ForbiddenException(
            'You can only export projects for your faculty',
          );
        }
      } else if (user.userType === UserT.STUDENT) {
        throw new ForbiddenException('No permission to export projects');
      }

      // Build the query
      const where: Prisma.ProposedProjectWhereInput = {};

      // Filter by advisor
      if (advisorId) {
        where.ProposedProjectMember = {
          some: {
            facultyMemberId: advisorId,
            role: MEMBER_ROLES.ADVISOR,
          },
        };
      }

      // Filter by faculty
      if (facultyId) {
        where.OR = [
          {
            ProposedProjectMember: {
              some: {
                FacultyMember: {
                  facultyId,
                },
              },
            },
          },
          {
            createdByFacultyId: facultyId,
          },
        ];
      }

      // Filter by status
      if (status) {
        where.status = status;
      }

      // Filter by field pool
      if (fieldPoolId) {
        where.fieldPoolId = fieldPoolId;
      }

      // Get the projects with members
      const projects = await this.prisma.proposedProject.findMany({
        where,
        include: {
          FieldPool: true,
          ProposedProjectMember: {
            include: {
              Student: true,
              FacultyMember: true,
            },
          },
          ProposalOutline: true,
          ProposedProjectComment: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Check if there are projects to export
      if (projects.length === 0) {
        throw new NotFoundException(
          'No projects found with the specified criteria',
        );
      }

      // Create a workbook and worksheet
      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet('Projects');

      // Define columns
      worksheet.columns = [
        { header: 'STT', key: 'index', width: 5 },
        { header: 'Tên đề tài', key: 'title', width: 40 },
        { header: 'Sinh viên', key: 'students', width: 30 },
        { header: 'Giảng viên hướng dẫn', key: 'advisor', width: 30 },
        { header: 'Trạng thái', key: 'status', width: 20 },
        { header: 'Đợt đăng ký', key: 'fieldPool', width: 20 },
        { header: 'Ngày tạo', key: 'createdAt', width: 15 },
        { header: 'Đề cương', key: 'outline', width: 5 },
        { header: 'Phản hồi gần nhất', key: 'latestComment', width: 40 },
      ];

      // Add style to header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCCCCCC' },
      };

      // Format status for readable display
      const formatStatus = (status: ProposedProjectStatusT): string => {
        const statusMap = {
          [ProposedProjectStatusT.TOPIC_SUBMISSION_PENDING]:
            'Đang soạn tên đề tài',
          [ProposedProjectStatusT.TOPIC_PENDING_ADVISOR]:
            'Đang chờ GVHD duyệt tên đề tài',
          [ProposedProjectStatusT.TOPIC_REQUESTED_CHANGES]:
            'GVHD yêu cầu chỉnh sửa tên đề tài',
          [ProposedProjectStatusT.TOPIC_APPROVED]: 'GVHD đã duyệt tên đề tài',
          [ProposedProjectStatusT.OUTLINE_PENDING_SUBMISSION]:
            'Đang chờ SV nộp đề cương',
          [ProposedProjectStatusT.OUTLINE_PENDING_ADVISOR]:
            'Đang chờ GVHD duyệt đề cương',
          [ProposedProjectStatusT.OUTLINE_REQUESTED_CHANGES]:
            'GVHD yêu cầu chỉnh sửa đề cương',
          [ProposedProjectStatusT.OUTLINE_REJECTED]: 'GVHD từ chối đề cương',
          [ProposedProjectStatusT.OUTLINE_APPROVED]: 'GVHD đã duyệt đề cương',
          [ProposedProjectStatusT.PENDING_HEAD]: 'Đang chờ Trưởng bộ môn duyệt',
          [ProposedProjectStatusT.REQUESTED_CHANGES_HEAD]:
            'Trưởng bộ môn yêu cầu chỉnh sửa',
          [ProposedProjectStatusT.REJECTED_BY_HEAD]: 'Trưởng bộ môn từ chối',
          [ProposedProjectStatusT.APPROVED_BY_HEAD]: 'Trưởng bộ môn đã duyệt',
        };
        return statusMap[status] || status.toString();
      };

      // Add data rows
      projects.forEach((project, index) => {
        // Get student members
        const students =
          project.ProposedProjectMember?.filter(
            (member) =>
              member.studentId &&
              member.status === ProposedProjectMemberStatusT.ACTIVE,
          )
            ?.map((member) => member.Student?.fullName || 'Unknown')
            .join(', ') || '';

        // Get advisor
        const advisor =
          project.ProposedProjectMember?.filter(
            (member) =>
              member.facultyMemberId &&
              member.role === MEMBER_ROLES.ADVISOR &&
              member.status === ProposedProjectMemberStatusT.ACTIVE,
          )
            ?.map((member) => member.FacultyMember?.fullName || 'Unknown')
            .join(', ') || '';

        // Get latest comment
        const latestComment =
          project.ProposedProjectComment &&
          project.ProposedProjectComment.length > 0
            ? project.ProposedProjectComment[0].content
            : '';

        // Add row to worksheet
        worksheet.addRow({
          index: index + 1,
          title: project.title || '',
          students,
          advisor,
          status: formatStatus(project.status),
          fieldPool: project.FieldPool?.name || 'N/A',
          createdAt: project.createdAt.toLocaleDateString('vi-VN'),
          outline: project.ProposalOutline ? 'Có' : 'Không',
          latestComment,
        });
      });

      // Auto filter
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: 9 },
      };

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();
      return buffer as unknown as Buffer;
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      console.error('Error generating Excel file:', error);
      throw new BadRequestException('Failed to generate Excel file');
    }
  }

  // Bulk update status methods - split into three separate methods for different roles

  // Bulk update status for lecturers (advisors)
  async bulkUpdateStatusByLecturer(
    dto: BulkStatusUpdateDto,
    user: AuthPayload,
  ): Promise<any> {
    const { projectIds, status, comment } = dto;

    // Get all the projects to check permissions and current statuses
    const projects = await this.prisma.proposedProject.findMany({
      where: {
        id: { in: projectIds },
      },
      include: {
        ProposedProjectMember: {
          where: {
            facultyMemberId: user.id,
            role: MEMBER_ROLES.ADVISOR,
            status: ProposedProjectMemberStatusT.ACTIVE,
          },
        },
        ProposalOutline: true,
      },
    });

    if (projects.length === 0) {
      throw new NotFoundException('Không tìm thấy đề tài nào');
    }

    // Check if user is advisor for all projects
    const notAdvisorProjects = projects.filter(
      (project) => project.ProposedProjectMember.length === 0,
    );

    if (notAdvisorProjects.length > 0) {
      throw new ForbiddenException(
        'Bạn không phải là người hướng dẫn của một số đề tài đã chọn',
      );
    }

    // Define valid status transitions for lecturers
    const validTransitions: Record<string, Array<ProposedProjectStatusT>> = {
      // For topic approval
      [ProposedProjectStatusT.TOPIC_PENDING_ADVISOR]: [
        ProposedProjectStatusT.TOPIC_APPROVED,
        ProposedProjectStatusT.TOPIC_REQUESTED_CHANGES,
      ],
      // For outline approval
      [ProposedProjectStatusT.OUTLINE_PENDING_ADVISOR]: [
        ProposedProjectStatusT.OUTLINE_APPROVED,
        ProposedProjectStatusT.OUTLINE_REQUESTED_CHANGES,
        ProposedProjectStatusT.OUTLINE_REJECTED,
      ],
    };

    return this.processBulkStatusUpdate(
      projects,
      status,
      comment,
      user,
      validTransitions,
    );
  }

  // Bulk update status for department heads
  async bulkUpdateStatusByDepartmentHead(
    dto: BulkStatusUpdateDto,
    user: AuthPayload,
  ): Promise<any> {
    const { projectIds, status, comment } = dto;

    // Check if the user is a faculty member
    if (user.userType !== UserT.FACULTY) {
      throw new ForbiddenException(
        'Chỉ Trưởng bộ môn mới có quyền thực hiện thao tác này',
      );
    }

    // Check if the user is a division head by checking FacultyMembershipDivision
    const userDivision = await this.prisma.facultyMembershipDivision.findFirst({
      where: {
        facultyMemberId: user.id,
        role: DivisionRoleT.HEAD,
      },
      select: {
        divisionId: true,
      },
    });

    if (!userDivision) {
      throw new ForbiddenException(
        'Bạn không có quyền Trưởng bộ môn để thực hiện thao tác này',
      );
    }

    // Get all the projects
    const projects = await this.prisma.proposedProject.findMany({
      where: {
        id: { in: projectIds },
      },
      include: {
        ProposedProjectMember: {
          where: {
            role: MEMBER_ROLES.ADVISOR,
            status: ProposedProjectMemberStatusT.ACTIVE,
          },
          include: {
            FacultyMember: {
              include: {
                FacultyMembershipDivision: {
                  where: {
                    divisionId: userDivision.divisionId,
                  },
                },
              },
            },
          },
        },
        ProposalOutline: true,
      },
    });

    if (projects.length === 0) {
      throw new NotFoundException('Không tìm thấy đề tài nào');
    }

    // Check if user has permission for all projects (advisor must be in the same division)
    const unauthorizedProjects = projects.filter(
      (project) =>
        !project.ProposedProjectMember.some(
          (member) =>
            member.FacultyMember?.FacultyMembershipDivision &&
            member.FacultyMember.FacultyMembershipDivision.length > 0,
        ),
    );

    if (unauthorizedProjects.length > 0) {
      throw new ForbiddenException(
        'Bạn không có quyền phê duyệt một số đề tài đã chọn vì giảng viên hướng dẫn không thuộc bộ môn của bạn',
      );
    }

    // Define valid status transitions for department heads
    const validTransitions: Record<string, Array<ProposedProjectStatusT>> = {
      // For head review
      [ProposedProjectStatusT.PENDING_HEAD]: [
        ProposedProjectStatusT.APPROVED_BY_HEAD,
        ProposedProjectStatusT.REQUESTED_CHANGES_HEAD,
        ProposedProjectStatusT.REJECTED_BY_HEAD,
      ],
    };

    return this.processBulkStatusUpdate(
      projects,
      status,
      comment,
      user,
      validTransitions,
    );
  }

  // Bulk update status for deans
  async bulkUpdateStatusByDean(
    dto: BulkStatusUpdateDto,
    user: AuthPayload,
  ): Promise<any> {
    const { projectIds, status, comment } = dto;

    // Check if the user is a faculty member
    if (user.userType !== UserT.FACULTY) {
      throw new ForbiddenException(
        'Chỉ Trưởng khoa mới có quyền thực hiện thao tác này',
      );
    }

    // Check if user is a dean through the FacultyRole table
    const isDean = await this.prisma.facultyRole.findFirst({
      where: {
        facultyMemberId: user.id,
        role: FacultyMemberRoleT.DEAN,
      },
    });

    if (!isDean) {
      throw new ForbiddenException(
        'Bạn không có quyền Trưởng khoa để thực hiện thao tác này',
      );
    }

    const facultyId = user.facultyId;
    if (!facultyId) {
      throw new BadRequestException('Không tìm thấy thông tin khoa của bạn');
    }

    // Get all the projects
    const projects = await this.prisma.proposedProject.findMany({
      where: {
        id: { in: projectIds },
      },
      include: {
        ProposedProjectMember: {
          where: {
            role: MEMBER_ROLES.ADVISOR,
            status: ProposedProjectMemberStatusT.ACTIVE,
          },
          include: {
            FacultyMember: true,
          },
        },
        ProposalOutline: true,
      },
    });

    if (projects.length === 0) {
      throw new NotFoundException('Không tìm thấy đề tài nào');
    }

    // Check if user has permission for all projects (advisor must be in the same faculty)
    const unauthorizedProjects = projects.filter(
      (project) =>
        !project.ProposedProjectMember.some(
          (member) => member.FacultyMember?.facultyId === facultyId,
        ),
    );

    if (unauthorizedProjects.length > 0) {
      throw new ForbiddenException(
        'Bạn không có quyền phê duyệt một số đề tài đã chọn vì giảng viên hướng dẫn không thuộc khoa của bạn',
      );
    }

    // Define valid status transitions for deans
    const validTransitions: Record<string, Array<ProposedProjectStatusT>> = {
      // For head review (deans can also perform head actions)
      [ProposedProjectStatusT.PENDING_HEAD]: [
        ProposedProjectStatusT.APPROVED_BY_HEAD,
        ProposedProjectStatusT.REQUESTED_CHANGES_HEAD,
        ProposedProjectStatusT.REJECTED_BY_HEAD,
      ],
      // Additional transitions specific to deans if needed
    };

    return this.processBulkStatusUpdate(
      projects,
      status,
      comment,
      user,
      validTransitions,
    );
  }

  // Helper method to process bulk status updates
  private async processBulkStatusUpdate(
    projects: any[],
    status: ProposedProjectStatusT,
    comment: string | undefined,
    user: AuthPayload,
    validTransitions: Record<string, Array<ProposedProjectStatusT>>,
  ): Promise<any> {
    // Check valid status transitions
    interface InvalidTransition {
      id: string;
      title: string;
      currentStatus: ProposedProjectStatusT;
    }

    const invalidTransitions: InvalidTransition[] = [];

    for (const project of projects) {
      const currentStatus = project.status as keyof typeof validTransitions;
      if (
        validTransitions[currentStatus] &&
        !validTransitions[currentStatus].includes(status)
      ) {
        invalidTransitions.push({
          id: project.id,
          title: project.title,
          currentStatus: project.status,
        });
      }
    }

    if (invalidTransitions.length > 0) {
      throw new BadRequestException({
        message: 'Trạng thái không hợp lệ cho một số đề tài',
        details: invalidTransitions,
      });
    }

    // Process valid projects
    const results: Array<{
      id: string;
      title: string;
      oldStatus: ProposedProjectStatusT;
      newStatus: ProposedProjectStatusT;
      success: boolean;
    }> = [];

    const projectsToUpdate = projects.filter(
      (p) => !invalidTransitions.some((invalid) => invalid.id === p.id),
    );

    // Update projects
    for (const project of projectsToUpdate) {
      // Update project status
      await this.prisma.proposedProject.update({
        where: { id: project.id },
        data: {
          status,
          ...(status === ProposedProjectStatusT.APPROVED_BY_HEAD
            ? {
                approvedById: user.id,
                approvedAt: new Date(),
              }
            : {}),
        },
      });

      // Add comment if provided
      if (comment) {
        await this.prisma.proposedProjectComment.create({
          data: {
            proposedProjectId: project.id,
            content: comment,
            commenterFacultyId: user.id,
          },
        });
      }

      // Handle outline status updates if needed
      if (
        status === ProposedProjectStatusT.OUTLINE_APPROVED ||
        status === ProposedProjectStatusT.OUTLINE_REQUESTED_CHANGES ||
        status === ProposedProjectStatusT.OUTLINE_REJECTED
      ) {
        const outlineStatus =
          status === ProposedProjectStatusT.OUTLINE_APPROVED
            ? ProposalOutlineStatusT.APPROVED
            : status === ProposedProjectStatusT.OUTLINE_REQUESTED_CHANGES
              ? ProposalOutlineStatusT.PENDING_REVIEW
              : ProposalOutlineStatusT.REJECTED;

        if (project.ProposalOutline) {
          await this.prisma.proposalOutline.update({
            where: { id: project.ProposalOutline.id },
            data: { status: outlineStatus },
          });
        }
      }

      // Create official project if approved by head
      if (
        status === ProposedProjectStatusT.APPROVED_BY_HEAD &&
        user.facultyId
      ) {
        await this.createOfficialProject(project, user.id);
      }

      results.push({
        id: project.id,
        title: project.title,
        oldStatus: project.status,
        newStatus: status,
        success: true,
      });
    }

    return {
      processed: results.length,
      total: projects.length,
      results,
    };
  }
}
