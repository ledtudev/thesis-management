import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DefenseCommitteeRoleT,
  EvaluatorRole,
  Prisma,
  ProjectEvaluationStatusT,
  ProjectStatusT,
} from '@prisma/client';
import { AuthPayload } from 'src/common/interface';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { uuidv7 } from 'uuidv7';
import {
  CreateEvaluationDto,
  CreateEvaluationScoreDto,
  FinalizeEvaluationDto,
  FindEvaluationDto,
  UpdateEvaluationDto,
  UpdateEvaluationScoreDto,
} from './schema';

@Injectable()
export class EvaluationService {
  constructor(private readonly prisma: PrismaService) {}

  // ========================= UTILITY METHODS =========================

  private async checkEvaluationAccess(evaluationId: string, user: AuthPayload) {
    const evaluation = await this.prisma.projectEvaluation.findUnique({
      where: { id: evaluationId },
      include: {
        Project: {
          include: {
            Member: true,
            DefenseCommittee: {
              include: {
                Members: {
                  include: {
                    FacultyMember: {
                      select: {
                        id: true,
                        fullName: true,
                        email: true,
                        profilePicture: true,
                      },
                    },
                  },
                },
              },
            },
            FinalReport: {
              select: {
                MainReportFile: true,
                Attachments: true,
                ProjectReportComments: true,
                submittedAt: true,
              },
            },
            Domain: {
              select: {
                Domain: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            Division: {
              select: {
                id: true,
                name: true,
              },
            },
            Comment: {
              select: {
                id: true,
                content: true,
                createdAt: true,
                CommenterFacultyMember: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profilePicture: true,
                  },
                },
                CommenterStudent: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profilePicture: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!evaluation) {
      throw new NotFoundException(
        `Project evaluation with ID ${evaluationId} not found`,
      );
    }

    // Kiểm tra người dùng có quyền truy cập đánh giá này không
    const isProjectMember = evaluation.Project.Member.some(
      (member) => member.facultyMemberId === user.id,
    );

    const isCommitteeMember = evaluation.Project.DefenseCommittee?.Members.some(
      (member) => member.facultyMemberId === user.id,
    );

    if (!isProjectMember && !isCommitteeMember) {
      throw new ForbiddenException(
        'You do not have permission to access this evaluation',
      );
    }

    return evaluation;
  }

  private async checkScoreAccess(
    scoreId: string,
    user: AuthPayload,
  ): Promise<any> {
    const score = await this.prisma.projectEvaluationScore.findUnique({
      where: { id: scoreId },
      include: {
        ProjectEvaluation: {
          include: {
            Project: {
              include: {
                Member: true,
                DefenseCommittee: {
                  include: {
                    Members: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!score) {
      throw new NotFoundException(
        `Evaluation score with ID ${scoreId} not found`,
      );
    }

    // Check if evaluation is already finalized
    if (score.ProjectEvaluation.status === ProjectEvaluationStatusT.EVALUATED) {
      throw new ForbiddenException('Không thể sửa điểm đánh giá đã được chốt');
    }

    // Chỉ người tạo điểm có thể sửa
    if (score.evaluatorId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to modify this score',
      );
    }

    return score;
  }

  private buildWhereClause(
    query: FindEvaluationDto,
    user: AuthPayload,
  ): Prisma.ProjectEvaluationWhereInput {
    const whereClause: Prisma.ProjectEvaluationWhereInput = {};

    // Áp dụng các bộ lọc cơ bản
    if (query.keyword) {
      whereClause.Project = {
        title: { contains: query.keyword, mode: 'insensitive' },
      } as Prisma.ProjectWhereInput;
    }

    if (query.status) {
      whereClause.status = query.status;
    }

    if (query.projectId) {
      whereClause.projectId = query.projectId;
    }

    // Default to the requesting user if no specific defense member ID is provided
    const defenseMemberId = query.defenseMemberId || user.id;

    // Filter by defense role if specified
    const userConditions: Prisma.ProjectEvaluationWhereInput[] = [
      {
        // Là thành viên dự án (GVHD)
        Project: {
          Member: {
            some: {
              facultyMemberId: defenseMemberId,
              role: 'SUPERVISOR', // GVHD role
            },
          },
        },
      },
    ];

    // Apply defense role filter if specified
    if (query.defenseRole) {
      userConditions.push({
        // Filter by specific role in defense committee
        Project: {
          DefenseCommittee: {
            Members: {
              some: {
                facultyMemberId: defenseMemberId,
                role: query.defenseRole,
              },
            },
          },
        },
      });
    } else {
      // No specific role filter
      userConditions.push({
        // Any role in defense committee
        Project: {
          DefenseCommittee: {
            Members: {
              some: {
                facultyMemberId: defenseMemberId,
              },
            },
          },
        },
      });
    }

    // User must have at least one of the roles to access evaluations
    whereClause.OR = userConditions;

    return whereClause;
  }

  // ========================= PROJECT EVALUATION =========================

  async findMany(query: FindEvaluationDto, user: AuthPayload) {
    const {
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      asc = 'desc',
      ...filters
    } = query;
    const skip = (page - 1) * limit;

    const whereClause = this.buildWhereClause(filters, user);

    const [evaluations, total] = await Promise.all([
      this.prisma.projectEvaluation.findMany({
        where: whereClause,
        include: {
          Project: {
            include: {
              Member: {
                include: {
                  FacultyMember: {
                    select: {
                      id: true,
                      fullName: true,
                      email: true,
                      profilePicture: true,
                    },
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
                          email: true,
                          profilePicture: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          EvaluationScores: {
            include: {
              Evaluator: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  profilePicture: true,
                },
              },
            },
          },
        },
        orderBy: {
          [orderBy]: asc,
        },
        skip,
        take: limit,
      }),
      this.prisma.projectEvaluation.count({
        where: whereClause,
      }),
    ]);

    // For each evaluation, determine the user's role and whether they've scored it
    const enhancedEvaluations = evaluations.map((evaluation) => {
      // Check if user has already submitted a score
      const userScore = evaluation.EvaluationScores.find(
        (score) => score.evaluatorId === user.id,
      );

      // Determine user's role in this evaluation
      const isSupervisor = evaluation.Project.Member.some(
        (member) =>
          member.facultyMemberId === user.id && member.role === 'SUPERVISOR',
      );

      const defenseRole = evaluation.Project.DefenseCommittee?.Members.find(
        (member) => member.facultyMemberId === user.id,
      )?.role;

      return {
        ...evaluation,
        userRole: isSupervisor ? 'SUPERVISOR' : defenseRole,
        hasScored: userScore !== undefined,
        userScore: userScore?.score,
      };
    });

    return {
      data: enhancedEvaluations,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, user: AuthPayload) {
    const evaluation = await this.checkEvaluationAccess(id, user);

    // Get all scores for this evaluation
    const scores = await this.prisma.projectEvaluationScore.findMany({
      where: {
        evaluationId: id,
      },
      include: {
        Evaluator: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePicture: true,
          },
        },
      },
    });
    // Get user's role in the project and defense committee
    const isSupervisor = evaluation.Project.Member.some(
      (member) =>
        member.facultyMemberId === user.id && member.role === 'SUPERVISOR',
    );

    const userDefenseRole = evaluation.Project.DefenseCommittee?.Members.find(
      (member) => member.facultyMemberId === user.id,
    )?.role;

    // Check if user has scored already
    const userScore = scores.find((score) => score.evaluatorId === user.id);
    const hasScored = userScore !== undefined;

    // Return evaluation with scores and user context
    return {
      ...evaluation,
      scores,
      userContext: {
        isSupervisor,
        defenseRole: userDefenseRole,
        hasScored,
        canEdit: evaluation.status !== ProjectEvaluationStatusT.EVALUATED,
        canFinalize:
          userDefenseRole === DefenseCommitteeRoleT.SECRETARY &&
          evaluation.status !== ProjectEvaluationStatusT.EVALUATED,
      },
    };
  }

  async findByProjectId(projectId: string, user: AuthPayload) {
    // Kiểm tra xem người dùng có quyền truy cập dự án này không
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        Member: true,
        DefenseCommittee: {
          include: {
            Members: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const isProjectMember = project.Member.some(
      (member) => member.facultyMemberId === user.id,
    );

    const isCommitteeMember = project.DefenseCommittee?.Members.some(
      (member) => member.facultyMemberId === user.id,
    );

    if (!isProjectMember && !isCommitteeMember) {
      throw new ForbiddenException(
        'You do not have permission to access this project',
      );
    }

    // Lấy thông tin đánh giá
    const evaluation = await this.prisma.projectEvaluation.findUnique({
      where: { projectId },
      include: {
        Project: {
          include: {
            Member: {
              include: {
                FacultyMember: {
                  select: {
                    id: true,
                    fullName: true,
                  },
                },
                Student: {
                  select: {
                    id: true,
                    fullName: true,
                  },
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
                      },
                    },
                  },
                },
              },
            },
          },
        },
        EvaluationScores: {
          include: {
            Evaluator: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    return evaluation;
  }

  async create(data: CreateEvaluationDto, user: AuthPayload) {
    const { projectId, status, advisorWeight, committeeWeight } = data;

    // Kiểm tra xem dự án có tồn tại không
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        Member: true,
        DefenseCommittee: {
          include: {
            Members: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Kiểm tra xem đánh giá đã tồn tại chưa
    const existingEvaluation = await this.prisma.projectEvaluation.findUnique({
      where: { projectId },
    });

    if (existingEvaluation) {
      throw new BadRequestException(
        `Evaluation for project ${projectId} already exists`,
      );
    }

    // Kiểm tra người dùng có quyền tạo đánh giá cho dự án này không
    const isProjectAdvisor = project.Member.some(
      (member) =>
        member.facultyMemberId === user.id && member.role === 'ADVISOR',
    );

    const isCommitteeChairman = project.DefenseCommittee?.Members.some(
      (member) =>
        member.facultyMemberId === user.id &&
        member.role === DefenseCommitteeRoleT.CHAIRMAN,
    );

    if (!isProjectAdvisor && !isCommitteeChairman) {
      throw new ForbiddenException(
        'Only project advisor or committee chairman can create evaluation',
      );
    }

    // Tạo đánh giá mới
    const evaluation = await this.prisma.projectEvaluation.create({
      data: {
        projectId,
        status: status || ProjectEvaluationStatusT.PENDING,
        advisorWeight,
        committeeWeight,
      },
    });

    // Cập nhật trạng thái dự án sang "WAITING_FOR_EVALUATION" nếu đang ở trạng thái khác
    if (project.status !== ProjectStatusT.WAITING_FOR_EVALUATION) {
      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatusT.WAITING_FOR_EVALUATION },
      });
    }

    return evaluation;
  }

  async update(id: string, data: UpdateEvaluationDto, user: AuthPayload) {
    const evaluation = await this.checkEvaluationAccess(id, user);

    // Kiểm tra quyền cập nhật
    const isProjectAdvisor = evaluation.Project.Member.some(
      (member) =>
        member.facultyMemberId === user.id && member.role === 'ADVISOR',
    );

    const isCommitteeChairman =
      evaluation.Project.DefenseCommittee?.Members.some(
        (member) =>
          member.facultyMemberId === user.id &&
          member.role === DefenseCommitteeRoleT.CHAIRMAN,
      );

    if (!isProjectAdvisor && !isCommitteeChairman) {
      throw new ForbiddenException(
        'Only project advisor or committee chairman can update evaluation',
      );
    }

    // Cập nhật đánh giá
    return this.prisma.projectEvaluation.update({
      where: { id },
      data,
      include: {
        Project: {
          include: {
            Member: {
              include: {
                FacultyMember: {
                  select: {
                    id: true,
                    fullName: true,
                  },
                },
                Student: {
                  select: {
                    id: true,
                    fullName: true,
                  },
                },
              },
            },
          },
        },
        EvaluationScores: {
          include: {
            Evaluator: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });
  }

  async finalize(
    id: string,
    finalizeData: FinalizeEvaluationDto,
    user: AuthPayload,
  ) {
    const evaluation = await this.checkEvaluationAccess(id, user);

    // Verify the user is a SECRETARY in the defense committee
    const isSecretary = evaluation.Project.DefenseCommittee?.Members.some(
      (member) =>
        member.facultyMemberId === user.id &&
        member.role === DefenseCommitteeRoleT.SECRETARY,
    );

    if (!isSecretary) {
      throw new ForbiddenException(
        'Only the secretary can finalize the evaluation',
      );
    }

    // Verify that both advisor and committee scores exist
    const scores = await this.prisma.projectEvaluationScore.findMany({
      where: {
        evaluationId: id,
      },
    });

    const hasAdvisorScore = scores.some(
      (score) => score.role === EvaluatorRole.ADVISOR,
    );
    const hasCommitteeScore = scores.some(
      (score) => score.role === EvaluatorRole.COMMITTEE,
    );

    if (!hasAdvisorScore || !hasCommitteeScore) {
      throw new BadRequestException(
        'Both advisor and committee scores must exist before finalizing',
      );
    }

    // Get weights from data
    const advisorWeight = finalizeData.advisorWeight;
    const committeeWeight = finalizeData.committeeWeight;

    // Validate weights sum to 1
    if (Math.abs(advisorWeight + committeeWeight - 1) > 0.01) {
      throw new BadRequestException(
        'Advisor weight and committee weight must sum to 1',
      );
    }

    // Calculate average scores for each role
    const advisorScores = scores.filter(
      (score) => score.role === EvaluatorRole.ADVISOR,
    );
    const committeeScores = scores.filter(
      (score) => score.role === EvaluatorRole.COMMITTEE,
    );

    const avgAdvisorScore =
      advisorScores.reduce((sum, score) => sum + score.score, 0) /
      advisorScores.length;
    const avgCommitteeScore =
      committeeScores.reduce((sum, score) => sum + score.score, 0) /
      committeeScores.length;

    // Calculate final weighted score
    const finalScore =
      avgAdvisorScore * advisorWeight + avgCommitteeScore * committeeWeight;

    // Update the project evaluation with final score and status
    const updatedEvaluation = await this.prisma.projectEvaluation.update({
      where: {
        id,
      },
      data: {
        finalScore,
        status: ProjectEvaluationStatusT.EVALUATED,
        advisorWeight,
        committeeWeight,
      },
      include: {
        Project: true,
        EvaluationScores: {
          include: {
            Evaluator: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Also update the project status to COMPLETED
    await this.prisma.project.update({
      where: {
        id: evaluation.projectId,
      },
      data: {
        status: ProjectStatusT.COMPLETED,
      },
    });

    return {
      ...updatedEvaluation,
      advisorAverage: avgAdvisorScore,
      committeeAverage: avgCommitteeScore,
    };
  }

  // ========================= PROJECT EVALUATION SCORE =========================

  async findScoresByEvaluationId(evaluationId: string, user: AuthPayload) {
    await this.checkEvaluationAccess(evaluationId, user);

    return this.prisma.projectEvaluationScore.findMany({
      where: { evaluationId },
      include: {
        Evaluator: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: [{ role: 'asc' }, { Evaluator: { fullName: 'asc' } }],
    });
  }

  async createScore(data: CreateEvaluationScoreDto, user: AuthPayload) {
    const { evaluationId, role, score, comment } = data;

    // Check if the evaluation exists and user has access
    const evaluation = await this.checkEvaluationAccess(evaluationId, user);

    // Verify evaluation is not already finalized
    if (evaluation.status === ProjectEvaluationStatusT.EVALUATED) {
      throw new ForbiddenException(
        'Cannot add scores to an already finalized evaluation',
      );
    }

    // Determine if user is allowed to create a score with this role
    let allowedToScore = false;

    if (role === EvaluatorRole.ADVISOR) {
      // Only project supervisors can give advisor scores
      allowedToScore = evaluation.Project.Member.some(
        (member) =>
          member.facultyMemberId === user.id && member.role === 'SUPERVISOR',
      );
    } else if (role === EvaluatorRole.COMMITTEE) {
      // Only committee members can give committee scores
      allowedToScore =
        evaluation.Project.DefenseCommittee?.Members.some(
          (member) => member.facultyMemberId === user.id,
        ) ?? false;
    }

    if (!allowedToScore) {
      throw new ForbiddenException(
        `You do not have permission to create a score with role ${role}`,
      );
    }

    // Check if user already has a score for this evaluation
    const existingScore = await this.prisma.projectEvaluationScore.findFirst({
      where: {
        evaluationId,
        evaluatorId: user.id,
      },
    });

    if (existingScore) {
      throw new BadRequestException(
        'You have already scored this evaluation. Please update your existing score instead.',
      );
    }

    // Create the score
    const newScore = await this.prisma.projectEvaluationScore.create({
      data: {
        id: uuidv7(),
        evaluationId,
        evaluatorId: user.id,
        role,
        score,
        comment,
      },
      include: {
        Evaluator: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePicture: true,
          },
        },
        ProjectEvaluation: {
          include: {
            Project: true,
          },
        },
      },
    });

    return newScore;
  }

  async updateScore(
    id: string,
    data: UpdateEvaluationScoreDto,
    user: AuthPayload,
  ) {
    // Check if the score exists and user has access
    const scoreRecord = await this.checkScoreAccess(id, user);

    // Update the score
    const updatedScore = await this.prisma.projectEvaluationScore.update({
      where: {
        id,
      },
      data: {
        score: data.score,
        comment: data.comment,
      },
      include: {
        Evaluator: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePicture: true,
          },
        },
        ProjectEvaluation: {
          include: {
            Project: true,
          },
        },
      },
    });

    return updatedScore;
  }

  async deleteScore(id: string, user: AuthPayload) {
    await this.checkScoreAccess(id, user);

    // Xóa điểm đánh giá
    return this.prisma.projectEvaluationScore.delete({
      where: { id },
    });
  }

  // ========================= API CHO TỪNG VAI TRÒ =========================

  async createAdvisorScore(
    scoreData: CreateEvaluationScoreDto,
    user: AuthPayload,
  ) {
    const { evaluationId, projectId, score, comment } = scoreData as any;

    // Nếu có projectId nhưng không có evaluationId, tìm evaluationId
    let finalEvaluationId = evaluationId;
    if (!finalEvaluationId && projectId) {
      const evaluation = await this.prisma.projectEvaluation.findUnique({
        where: { projectId },
      });

      if (!evaluation) {
        throw new NotFoundException(
          `Evaluation for project ${projectId} not found`,
        );
      }

      finalEvaluationId = evaluation.id;
    }

    if (!finalEvaluationId) {
      throw new BadRequestException(
        'Either evaluationId or projectId must be provided',
      );
    }

    // Kiểm tra người dùng có phải là GVHD không
    const project = await this.prisma.project.findFirst({
      where: {
        ProjectEvaluation: { id: finalEvaluationId },
      },
      include: {
        Member: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isAdvisor = project.Member.some(
      (member) =>
        member.facultyMemberId === user.id && member.role === 'ADVISOR',
    );

    if (!isAdvisor) {
      throw new ForbiddenException(
        'Only project advisor can create advisor score',
      );
    }

    // Tạo điểm đánh giá với role ADVISOR
    return this.createScore(
      {
        evaluationId: finalEvaluationId,
        role: EvaluatorRole.ADVISOR,
        score,
        comment,
      },
      user,
    );
  }

  async createCommitteeScore(
    scoreData: CreateEvaluationScoreDto,
    user: AuthPayload,
  ) {
    const { evaluationId, projectId, score, comment } = scoreData as any;

    // Nếu có projectId nhưng không có evaluationId, tìm evaluationId
    let finalEvaluationId = evaluationId;
    if (!finalEvaluationId && projectId) {
      const evaluation = await this.prisma.projectEvaluation.findUnique({
        where: { projectId },
      });

      if (!evaluation) {
        throw new NotFoundException(
          `Evaluation for project ${projectId} not found`,
        );
      }

      finalEvaluationId = evaluation.id;
    }

    if (!finalEvaluationId) {
      throw new BadRequestException(
        'Either evaluationId or projectId must be provided',
      );
    }

    // Kiểm tra người dùng có phải là thành viên hội đồng không
    const project = await this.prisma.project.findFirst({
      where: {
        ProjectEvaluation: { id: finalEvaluationId },
      },
      include: {
        DefenseCommittee: {
          include: {
            Members: true,
          },
        },
      },
    });

    if (!project || !project.DefenseCommittee) {
      throw new NotFoundException('Project or defense committee not found');
    }

    const isCommitteeMember = project.DefenseCommittee.Members.some(
      (member) => member.facultyMemberId === user.id,
    );

    if (!isCommitteeMember) {
      throw new ForbiddenException(
        'Only committee members can create committee score',
      );
    }

    // Tạo điểm đánh giá với role COMMITTEE
    return this.createScore(
      {
        evaluationId: finalEvaluationId,
        role: EvaluatorRole.COMMITTEE,
        score,
        comment,
      },
      user,
    );
  }

  async getProjectsToEvaluate(user: AuthPayload) {
    // Lấy các dự án mà người dùng là GVHD
    const advisorProjects = await this.prisma.project.findMany({
      where: {
        Member: {
          some: {
            facultyMemberId: user.id,
            role: 'ADVISOR',
          },
        },
        status: ProjectStatusT.WAITING_FOR_EVALUATION,
      },
      include: {
        Member: {
          include: {
            Student: {
              select: {
                id: true,
                fullName: true,
                studentCode: true,
              },
            },
            FacultyMember: {
              select: {
                id: true,
                fullName: true,
                facultyCode: true,
              },
            },
          },
        },
        ProjectEvaluation: {
          include: {
            EvaluationScores: {
              where: {
                evaluatorId: user.id,
              },
            },
          },
        },
      },
    });

    // Lấy các dự án mà người dùng là thành viên hội đồng
    const committeeProjects = await this.prisma.project.findMany({
      where: {
        DefenseCommittee: {
          Members: {
            some: {
              facultyMemberId: user.id,
            },
          },
        },
        status: ProjectStatusT.WAITING_FOR_EVALUATION,
      },
      include: {
        Member: {
          include: {
            Student: {
              select: {
                id: true,
                fullName: true,
                studentCode: true,
              },
            },
            FacultyMember: {
              select: {
                id: true,
                fullName: true,
                facultyCode: true,
              },
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
                  },
                },
              },
            },
          },
        },
        ProjectEvaluation: {
          include: {
            EvaluationScores: {
              where: {
                evaluatorId: user.id,
              },
            },
          },
        },
      },
    });

    return {
      advisorProjects: advisorProjects.map((project) => ({
        ...project,
        hasEvaluated:
          project.ProjectEvaluation?.EvaluationScores.some(
            (score) => score.role === EvaluatorRole.ADVISOR,
          ) || false,
      })),
      committeeProjects: committeeProjects.map((project) => ({
        ...project,
        hasEvaluated:
          project.ProjectEvaluation?.EvaluationScores.some(
            (score) => score.role === EvaluatorRole.COMMITTEE,
          ) || false,
        isChairman:
          project.DefenseCommittee?.Members.some(
            (member) =>
              member.facultyMemberId === user.id &&
              member.role === DefenseCommitteeRoleT.CHAIRMAN,
          ) || false,
      })),
    };
  }

  async findByDefenseCommitteeId(
    defenseCommitteeId: string,
    user: AuthPayload,
  ) {
    // Kiểm tra hội đồng tồn tại
    const committee = await this.prisma.defenseCommittee.findUnique({
      where: { id: defenseCommitteeId },
      include: {
        Members: true,
        Project: true,
      },
    });

    if (!committee) {
      throw new NotFoundException(
        `Defense committee with ID ${defenseCommitteeId} not found`,
      );
    }

    // Kiểm tra người dùng có quyền truy cập không
    const isCommitteeMember = committee.Members.some(
      (member) => member.facultyMemberId === user.id,
    );

    if (!isCommitteeMember) {
      throw new ForbiddenException(
        'You do not have permission to access this defense committee',
      );
    }

    // Lấy đánh giá của dự án trong hội đồng
    return this.findByProjectId(committee.projectId, user);
  }
}
