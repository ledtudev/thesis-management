import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserT } from '@prisma/client';
import { AuthPayload } from 'src/common/interface';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { BasicFaculty, BasicStudent } from 'src/common/schema/prisma.schema';
import {
  CreateProposedProjectCommentDto,
  FindProposedProjectCommentDto,
} from './schema';

@Injectable()
export class ProposedProjectCommentService {
  constructor(private prisma: PrismaService) {}

  async create(
    dto: CreateProposedProjectCommentDto,
    user: AuthPayload,
  ): Promise<any> {
    const proposedProject = await this.prisma.proposedProject.findUnique({
      where: { id: dto.proposedProjectId },
    });

    if (!proposedProject) {
      throw new NotFoundException('Không tìm thấy đề tài này');
    }

    const comment = await this.prisma.proposedProjectComment.create({
      data: {
        proposedProjectId: dto.proposedProjectId,
        content: dto.content,
        commenterStudentId:
          user.userType === UserT.STUDENT ? user.id : undefined,
        commenterFacultyId:
          user.userType !== UserT.STUDENT ? user.id : undefined,
      },
    });

    return comment;
  }

  async find(dto: FindProposedProjectCommentDto): Promise<any> {
    const {
      page = 1,
      limit = 10,
      proposedProjectId,
      orderBy = 'createdAt',
      asc = 'desc',
    } = dto;

    const orderDirection: Prisma.SortOrder = asc === 'asc' ? 'asc' : 'desc';
    const orderByOptions: Prisma.ProposedProjectCommentOrderByWithRelationInput =
      {
        [orderBy]: orderDirection,
      };

    const data = await this.prisma.proposedProjectComment.findMany({
      where: { proposedProjectId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: orderByOptions,
      include: {
        CommenterStudent: {
          select: BasicStudent,
        },
        CommenterFacultyMember: {
          select: BasicFaculty,
        },
        ProposedProject: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const total = await this.prisma.proposedProjectComment.count({
      where: { proposedProjectId },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      metadata: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}
