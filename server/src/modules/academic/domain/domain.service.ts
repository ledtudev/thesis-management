import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { uuidv7 } from 'uuidv7';
import { CreateDomainDto, FindDomainDto, UpdateDomainDto } from './schema';

@Injectable()
export class DomainService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDomainDto) {
    const id = uuidv7();
    const domain = await this.prisma.domain.create({
      data: {
        id,
        ...dto,
      },
    });

    return domain;
  }

  async get(id: string) {
    const domain = await this.prisma.domain.findUnique({ where: { id } });
    if (!domain) {
      throw new NotFoundException(`Không tìm thấy domain với ID: ${id}`);
    }

    return domain;
  }

  async list(dto: FindDomainDto) {
    const whereClause: Prisma.DomainWhereInput = {
      ...(dto.name && {
        name: { contains: dto.name, mode: Prisma.QueryMode.insensitive },
      }),
      ...(dto.departmentId && {
        FieldPoolDepartment: { some: { Department: { id: dto.departmentId } } },
      }),
      ...(dto.departmentName && {
        FieldPoolDepartment: {
          some: {
            Department: {
              name: {
                contains: dto.departmentName,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
        },
      }),
    };
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;
    const orderByField = dto.orderBy || 'name';
    const orderDirection = dto.asc === 'asc' ? 'asc' : 'desc';
    const orderBy: Prisma.DomainOrderByWithRelationInput[] = [
      { [orderByField]: orderDirection },
    ];

    const [data, total] = await Promise.all([
      this.prisma.domain.findMany({
        where: whereClause,
        select: { id: true, name: true, description: true },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.domain.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const pagination = { page, limit, total, totalPages };

    return {
      data,
      pagination,
    };
  }

  async update(id: string, dto: UpdateDomainDto) {
    const existingDomain = await this.prisma.domain.findUnique({
      where: { id },
    });
    if (!existingDomain) {
      throw new NotFoundException(`Không tìm thấy domain với ID: ${id}`);
    }

    const updatedDomain = await this.prisma.domain.update({
      where: { id },
      data: { ...dto },
    });

    return updatedDomain;
  }

  async delete(id: string) {
    const existingDomain = await this.prisma.domain.findUnique({
      where: { id },
    });
    if (!existingDomain) {
      throw new NotFoundException(`Không tìm thấy domain với ID: ${id}`);
    }

    await this.prisma.domain.delete({ where: { id } });

    return null;
  }
}
