import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiResponse as SwaggerApiResponse,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { ReqWithRequester } from 'src/common/interface';

import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { FieldPoolService } from './field-pool.service';
import {
  createFieldPoolDto,
  createFieldPoolSchema,
  ExtendDeadlineDto,
  extendDeadlineSchema,
  FindFieldPoolDto,
  findFieldPoolDtoSchema,
  UpdateFieldPoolDto,
} from './schema';

@ApiTags('FieldPool')
@Controller('field-pool')
@ApiBearerAuth('access-token')
export class FieldPoolController {
  private readonly logger = new Logger(FieldPoolController.name);

  constructor(private readonly service: FieldPoolService) {}

  // 🟢 FieldPool APIs
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new field pool' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Field 1',
        },
        description: { type: 'string', nullable: true },
        registrationDeadline: {
          type: 'string',
          example: '2025-12-31',
          nullable: true,
        },
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description: 'Field pool successfully created',
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  create(
    @Body(new ZodValidationPipe(createFieldPoolSchema))
    dto: createFieldPoolDto,
    @Request() req: ReqWithRequester,
  ) {
    return this.service.create(dto);
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a field pool by ID' })
  @ApiParam({ name: 'id', description: 'ID của field pool' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Field pool found',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Field pool not found',
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ID format',
  })
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Find field pools with dynamic filtering',
    description:
      'Supports flexible filtering with standard filters and dynamic filter objects',
  })
  @ApiQuery({ name: 'name', required: false, description: 'Tên lĩnh vực' })
  @ApiQuery({ name: 'domain', required: false, description: 'Tên domain' })
  @ApiQuery({ name: 'department', required: false, description: 'Tên khoa' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Id khoa' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['OPEN', 'CLOSED', 'HIDDEN'],
    description: 'Trạng thái của field pool',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Tìm kiếm trên tên và mô tả',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Giới hạn số lượng',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['createdAt', 'updatedAt', 'name'],
    description: 'Sắp xếp theo trường',
  })
  @ApiQuery({
    name: 'asc',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Chiều sắp xếp',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Ngày bắt đầu lọc (yyyy-mm-dd)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Ngày kết thúc lọc (yyyy-mm-dd)',
  })
  @ApiQuery({
    name: 'filters',
    required: false,
    type: String,
    description:
      'Dynamic filters in JSON format. Example: {"status":"OPEN"} or {"custom":{"field":"name","operator":"contains","value":"science"}}',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'List of field pools',
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid parameter format',
  })
  async find(
    @Query(new ZodValidationPipe(findFieldPoolDtoSchema))
    query: FindFieldPoolDto,
  ) {
    try {
      return await this.service.find(query);
    } catch (error) {
      this.logger.error(
        `Error finding field pools: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException({
        message: 'Lỗi khi tìm kiếm field pool. Vui lòng thử lại sau.',
        error: error.message,
      });
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a field pool' })
  @ApiParam({ name: 'id', description: 'ID của field pool' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Updated Field Name',
        },
        description: {
          type: 'string',
          nullable: true,
        },
        registrationDeadline: {
          type: 'string',
          example: '2025-12-31',
          nullable: true,
        },
        status: {
          type: 'string',
          enum: ['OPEN', 'CLOSED', 'HIDDEN'],
          example: 'OPEN',
        },
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Field pool updated successfully',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Field pool not found',
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or ID format',
  })
  update(@Param('id') id: string, @Body() dto: UpdateFieldPoolDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/extend-deadline')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Extend registration deadline for a field pool',
    description:
      'Extends the registration deadline and automatically opens the field pool if the new deadline is in the future',
  })
  @ApiParam({ name: 'id', description: 'ID của field pool' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newDeadline: {
          type: 'string',
          format: 'date-time',
          example: '2025-12-31T23:59:59.000Z',
          description: 'New registration deadline (must be in the future)',
        },
        reason: {
          type: 'string',
          example: 'Extended due to student requests',
          description: 'Optional reason for the extension',
        },
      },
      required: ['newDeadline'],
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Registration deadline extended successfully',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Field pool not found',
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data - new deadline must be in the future',
  })
  extendDeadline(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(extendDeadlineSchema)) dto: ExtendDeadlineDto,
  ) {
    return this.service.extendDeadline(id, dto.newDeadline, dto.reason);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a field pool' })
  @ApiParam({ name: 'id', description: 'ID của field pool' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Field pool deleted successfully',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Field pool not found',
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ID format',
  })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  // Field Pool - Department operations
  @Post(':fieldPoolId/departments/:departmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add a department to a field pool' })
  @ApiParam({ name: 'fieldPoolId', description: 'ID của field pool' })
  @ApiParam({ name: 'departmentId', description: 'ID của bộ môn' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Department added to field pool successfully',
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ID format',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Field pool or department not found',
  })
  addDepartmentToFieldPool(
    @Param('fieldPoolId') fieldPoolId: string,
    @Param('departmentId') departmentId: string,
  ) {
    return this.service.addDepartment(fieldPoolId, departmentId);
  }

  @Delete(':fieldPoolId/departments/:departmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a department from a field pool' })
  @ApiParam({ name: 'fieldPoolId', description: 'ID của field pool' })
  @ApiParam({ name: 'departmentId', description: 'ID của bộ môn' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Department removed from field pool successfully',
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ID format',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Relationship between field pool and department not found',
  })
  removeDepartmentFromFieldPool(
    @Param('fieldPoolId') fieldPoolId: string,
    @Param('departmentId') departmentId: string,
  ) {
    return this.service.removeDepartment(fieldPoolId, departmentId);
  }

  @Get(':fieldPoolId/departments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all departments of a field pool' })
  @ApiParam({ name: 'fieldPoolId', description: 'ID của field pool' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'List of departments in the field pool',
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ID format',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Field pool not found',
  })
  getFieldPoolDepartments(@Param('fieldPoolId') fieldPoolId: string) {
    try {
      return this.service.getDepartments(fieldPoolId);
    } catch (error) {
      this.logger.error(
        `Error getting departments of field pool: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException({
        message:
          'Lỗi khi lấy danh sách bộ môn của field pool. Vui lòng thử lại sau.',
        error: error.message,
      });
    }
  }

  // Field Pool - Faculty operations (keeping existing for backward compatibility)
  @Post(':fieldPoolId/faculties/:facultyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add a faculty to a field pool' })
  @ApiParam({ name: 'fieldPoolId', description: 'ID của field pool' })
  @ApiParam({ name: 'facultyId', description: 'ID của khoa' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Faculty added to field pool successfully',
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ID format',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Field pool or faculty not found',
  })
  addDepartment(
    @Param('fieldPoolId') fieldPoolId: string,
    @Param('facultyId') departmentId: string,
  ) {
    return this.service.addDept(fieldPoolId, departmentId);
  }

  @Delete(':fieldPoolId/faculties/:facultyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a faculty from a field pool' })
  @ApiParam({ name: 'fieldPoolId', description: 'ID của field pool' })
  @ApiParam({ name: 'facultyId', description: 'ID của khoa' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Faculty removed from field pool successfully',
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ID format',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Relationship between field pool and faculty not found',
  })
  removeDepartment(
    @Param('fieldPoolId') fieldPoolId: string,
    @Param('facultyId') departmentId: string,
  ) {
    return this.service.removeDept(fieldPoolId, departmentId);
  }

  @Get(':fieldPoolId/faculties')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all faculties of a field pool' })
  @ApiParam({ name: 'fieldPoolId', description: 'ID của field pool' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'List of faculties in the field pool',
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ID format',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Field pool not found',
  })
  getDepartments(@Param('fieldPoolId') fieldPoolId: string) {
    try {
      return this.service.getDepts(fieldPoolId);
    } catch (error) {
      this.logger.error(
        `Error getting departments of field pool: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException({
        message:
          'Lỗi khi lấy danh sách khoa của field pool. Vui lòng thử lại sau.',
        error: error.message,
      });
    }
  }

  // Field Pool - Domain operations
  @Post(':fieldPoolId/domains/:domainId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add a domain to a field pool' })
  @ApiParam({ name: 'fieldPoolId', description: 'ID của field pool' })
  @ApiParam({ name: 'domainId', description: 'ID của domain' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Domain added to field pool successfully',
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ID format',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Field pool or domain not found',
  })
  addDomain(
    @Param('fieldPoolId') fieldPoolId: string,
    @Param('domainId') domainId: string,
  ) {
    try {
      return this.service.addDomain(fieldPoolId, domainId);
    } catch (error) {
      this.logger.error(
        `Error adding domain to field pool: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException({
        message: 'Lỗi khi thêm domain vào field pool. Vui lòng thử lại sau.',
        error: error.message,
      });
    }
  }

  @Delete(':fieldPoolId/domains/:domainId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a domain from a field pool' })
  @ApiParam({ name: 'fieldPoolId', description: 'ID của field pool' })
  @ApiParam({ name: 'domainId', description: 'ID của domain' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Domain removed from field pool successfully',
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ID format',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Relationship between field pool and domain not found',
  })
  removeDomain(
    @Param('fieldPoolId') fieldPoolId: string,
    @Param('domainId') domainId: string,
  ) {
    try {
      return this.service.removeDomain(fieldPoolId, domainId);
    } catch (error) {
      this.logger.error(
        `Error removing domain from field pool: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException({
        message: 'Lỗi khi xóa domain khỏi field pool. Vui lòng thử lại sau.',
        error: error.message,
      });
    }
  }

  @Get(':fieldPoolId/domains')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all domains of a field pool' })
  @ApiParam({ name: 'fieldPoolId', description: 'ID của field pool' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'List of domains in the field pool',
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ID format',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Field pool not found',
  })
  getDomains(@Param('fieldPoolId') fieldPoolId: string) {
    try {
      return this.service.getDomains(fieldPoolId);
    } catch (error) {
      this.logger.error(
        `Error getting domains of field pool: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException({
        message:
          'Lỗi khi lấy danh sách domain của field pool. Vui lòng thử lại sau.',
        error: error.message,
      });
    }
  }

  @Get(':fieldPoolId/lecturers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all lecturers in a field pool' })
  @ApiParam({ name: 'fieldPoolId', description: 'ID của field pool' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Lecturers found successfully',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Field pool not found',
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ID format',
  })
  getLecturers(@Param('fieldPoolId') fieldPoolId: string) {
    return this.service.getLecturers(fieldPoolId);
  }
}
