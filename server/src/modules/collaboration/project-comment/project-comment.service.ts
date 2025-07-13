import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserT } from '@prisma/client';
import { AuthPayload } from 'src/common/interface';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { BasicFaculty, BasicStudent } from 'src/common/schema/prisma.schema';
import { CreateProjectCommentDto, FindProjectCommentDto } from './schema';

@Injectable()
export class ProjectCommentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectCommentDto, user: AuthPayload): Promise<any> {
    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      include: {
        Member: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user has permission to comment
    // For simplicity, let's allow members of the project and faculty to comment
    let canComment = false;

    if (user.userType === UserT.STUDENT) {
      canComment = project.Member.some(
        (member) => member.studentId === user.id,
      );
    } else if (user.userType === UserT.FACULTY) {
      // Faculty can be a direct member or have a special role (e.g., advisor, reviewer)
      canComment = project.Member.some(
        (member) => member.facultyMemberId === user.id,
      );

      // Allow Division Heads, Deans, etc. to comment as well
      // This is a placeholder - implement actual role checking
      const hasSpecialRole = true; // Replace with actual role check

      if (hasSpecialRole) {
        canComment = true;
      }
    }

    if (!canComment) {
      throw new ForbiddenException(
        'You do not have permission to comment on this project',
      );
    }

    // Create the comment
    const comment = await this.prisma.projectComment.create({
      data: {
        projectId: dto.projectId,
        content: dto.content,
        commenterStudentId:
          user.userType === UserT.STUDENT ? user.id : undefined,
        commenterFacultyMemberId:
          user.userType === UserT.FACULTY ? user.id : undefined,
      },
    });

    return comment;
  }

  async find(dto: FindProjectCommentDto): Promise<any> {
    const {
      page = 1,
      limit = 10,
      projectId,
      orderBy = 'createdAt',
      asc = 'desc',
    } = dto;

    // Determine sort order
    const orderDirection: Prisma.SortOrder = asc === 'asc' ? 'asc' : 'desc';
    const orderByOptions: Prisma.ProjectCommentOrderByWithRelationInput = {
      [orderBy]: orderDirection,
    };

    // Execute queries to get data and count
    const data = await this.prisma.projectComment.findMany({
      where: { projectId },
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
        Project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const total = await this.prisma.projectComment.count({
      where: { projectId },
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
