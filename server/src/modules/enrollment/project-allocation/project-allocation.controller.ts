import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  Response,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiResponse as SwaggerApiResponse,
} from '@nestjs/swagger';
import { FacultyMemberRoleT } from '@prisma/client';
import { Response as ExpressResponse } from 'express';

import { ReqWithRequester } from 'src/common/interface';
import { ZodValidationPipe } from 'src/common/pipe/zod-validation.pipe';
import { ApiResponse, generateApiResponse } from 'src/common/response';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { PermissionGuard } from 'src/modules/auth/permission.guard';
import { Roles } from 'src/modules/auth/roles.decorator';
import { ProjectAllocationService } from './project-allocation.service';
import {
  BulkUpdateStatusDto,
  CreateProjectAllocationDto,
  FindByLecturerDto,
  FindByStudentDto,
  FindProjectAllocationDto,
  RecommendationExportDto,
  UpdateProjectAllocationDto,
  UpdateProjectAllocationStatusDto,
  bulkUpdateStatusDtoSchema,
  createProjectAllocationDtoSchema,
  findByLecturerDtoSchema,
  findByStudentDtoSchema,
  findProjectAllocationDtoSchema,
  recommendationExportDtoSchema,
  updateProjectAllocationDtoSchema,
  updateProjectAllocationStatusDtoSchema,
} from './schema';

@ApiTags('Project Allocation')
@Controller('project-allocations')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ProjectAllocationController {
  constructor(private readonly service: ProjectAllocationService) {}

  @Post()
  // @RequirePermissions(PermissionT.CREATE_PROJECT_ALLOCATION)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[TBM, Dean] Create a new project allocation' })
  @SwaggerApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  async create(
    @Body(new ZodValidationPipe(createProjectAllocationDtoSchema))
    dto: CreateProjectAllocationDto,
    @Request() req: ReqWithRequester,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.create(dto, req.requester.id);
    return generateApiResponse('Phân công đề tài thành công', result);
  }

  @Get()
  // @RequirePermissions(PermissionT.VIEW_PROJECT_ALLOCATION_LIST)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[All Roles] Find project allocations (filtered by role)',
  })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'OK' })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  async find(
    @Query(new ZodValidationPipe(findProjectAllocationDtoSchema))
    query: FindProjectAllocationDto,
    @Request() req: ReqWithRequester,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.find(query, req.requester);
    return generateApiResponse(
      'Lấy danh sách phân công đề tài thành công',
      result.data,
      result.metadata,
    );
  }

  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get enrollment statistics',
    description: 'Get statistics about student enrollments',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
  })
  async getStatistics() {
    const result = await this.service.getStatistics();
    return generateApiResponse('Lấy thống kê thành công', result);
  }

  @Get('student/:studentId')
  // @RequirePermissions(PermissionT.VIEW_PROJECT_ALLOCATION_DETAIL)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      '[TBM, Dean, Lecturer] Get allocations by student ID with pagination and search',
  })
  @ApiParam({ name: 'studentId', description: 'Student ID', type: String })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'OK' })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  async findByStudent(
    @Param('studentId') studentId: string,
    @Query(new ZodValidationPipe(findByStudentDtoSchema))
    query: FindByStudentDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.findByStudent(studentId, query);
    return generateApiResponse(
      'Lấy danh sách phân công đề tài của sinh viên thành công',
      result.data,
      result.metadata,
    );
  }

  @Get('lecturer/:lecturerId')
  // @RequirePermissions(PermissionT.VIEW_PROJECT_ALLOCATION_DETAIL)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      '[TBM, Dean, Lecturer] Get allocations by lecturer ID with pagination and search',
  })
  @ApiParam({ name: 'lecturerId', description: 'Lecturer ID', type: String })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'OK' })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  async findByLecturer(
    @Param('lecturerId') lecturerId: string,
    @Query(new ZodValidationPipe(findByLecturerDtoSchema))
    query: FindByLecturerDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.findByLecturer(lecturerId, query);
    return generateApiResponse(
      'Lấy danh sách phân công đề tài của giảng viên thành công',
      result.data,
      result.metadata,
    );
  }

  @Get('recommendations')
  // @RequirePermissions(PermissionT.VIEW_PROJECT_ALLOCATION_RECOMMENDATION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[TBM, Dean] Get recommended allocations as Excel or JSON',
  })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'OK' })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  async getRecommendations(
    @Query(new ZodValidationPipe(recommendationExportDtoSchema))
    query: RecommendationExportDto,
    @Response() res: ExpressResponse,
  ): Promise<any> {
    const result = await this.service.getRecommendations(query);

    if (query.format === 'json') {
      return res.json(
        generateApiResponse('Lấy đề xuất phân công đề tài thành công', result),
      );
    } else {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${result.fileName}`,
      );
      res.send(result.buffer);
    }
  }

  @Get(':id')
  // @RequirePermissions(PermissionT.VIEW_PROJECT_ALLOCATION_DETAIL)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[All Roles] Get a project allocation by ID',
  })
  @ApiParam({ name: 'id', description: 'Project Allocation ID', type: String })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'OK' })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  async get(@Param('id') id: string): Promise<ApiResponse<any>> {
    const data = await this.service.findById(id);
    return generateApiResponse(
      'Lấy thông tin phân công đề tài thành công',
      data,
    );
  }

  @Patch(':id')
  @Roles(FacultyMemberRoleT.DEAN)
  @ApiOperation({
    summary: 'Update project allocation',
    description: 'Only allows updating the lecturer',
  })
  @SwaggerApiResponse({ status: 200, description: 'Update successful' })
  @SwaggerApiResponse({ status: 404, description: 'Record not found' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProjectAllocationDtoSchema))
    dto: UpdateProjectAllocationDto,
    @Request() req: ReqWithRequester,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.update(id, dto, req.requester.id);
    return generateApiResponse('Cập nhật phân công đề tài thành công', result);
  }

  @Patch(':id/status')
  @Roles('HEAD')
  @ApiOperation({
    summary: 'Update project allocation status',
    description:
      'Deans and Division Heads can approve/reject allocations in their department. If approved by HEAD, a project is automatically created from proposal data.',
  })
  @SwaggerApiResponse({ status: 200, description: 'Status update successful' })
  @SwaggerApiResponse({
    status: 403,
    description: 'Forbidden - not authorized to update this allocation',
  })
  @SwaggerApiResponse({ status: 404, description: 'Record not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProjectAllocationStatusDtoSchema))
    dto: UpdateProjectAllocationStatusDto,
    @Request() req: ReqWithRequester,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.updateStatus(
      id,
      dto.status,
      req.requester.id,
    );
    return generateApiResponse(
      'Cập nhật trạng thái phân công đề tài thành công',
      result,
    );
  }

  @Patch('bulk/status')
  @Roles(FacultyMemberRoleT.DEAN, 'HEAD')
  @ApiOperation({
    summary: 'Bulk update project allocation status',
    description:
      'Deans and Division Heads can approve/reject multiple allocations in their department at once.',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Bulk status update successful',
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Forbidden - not authorized to update some allocations',
  })
  @SwaggerApiResponse({ status: 404, description: 'Some records not found' })
  async bulkUpdateStatus(
    @Body(new ZodValidationPipe(bulkUpdateStatusDtoSchema))
    dto: BulkUpdateStatusDto,
    @Request() req: ReqWithRequester,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.bulkUpdateStatus(dto, req.requester.id);
    return generateApiResponse(
      'Cập nhật hàng loạt trạng thái phân công thành công',
      result,
    );
  }

  @Delete(':id')
  @Roles(FacultyMemberRoleT.DEAN)
  @ApiOperation({
    summary: 'Delete project allocation',
    description: 'Delete a project allocation by ID',
  })
  @SwaggerApiResponse({ status: 200, description: 'Deletion successful' })
  @SwaggerApiResponse({ status: 404, description: 'Record not found' })
  async delete(@Param('id') id: string): Promise<ApiResponse<any>> {
    await this.service.delete(id);
    return generateApiResponse('Xóa phân công đề tài thành công', { id });
  }

  @Post('upload')
  // @RequirePermissions(PermissionT.CREATE_PROJECT_ALLOCATION)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '[TBM, Dean] Import project allocations from Excel',
    description:
      'Nhập phân công đề tài từ file Excel. Sử dụng tham số ?skipExisting=true để bỏ qua sinh viên đã có phân công thay vì báo lỗi. Sử dụng ?skipDepartmentCheck=true để bỏ qua kiểm tra khoa.',
  })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'OK' })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  @ApiBody({
    description: 'Excel file containing project allocations',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('skipExisting') skipExisting: string = 'false',
    @Query('skipDepartmentCheck') skipDepartmentCheck: string = 'false',
    @Request() req: ReqWithRequester,
  ): Promise<ApiResponse<any>> {
    if (!file) {
      throw new BadRequestException('File không được cung cấp');
    }

    const allocations = await this.service.parseExcelAllocations(file.buffer);
    const result = await this.service.bulkCreate(
      allocations,
      req.requester.id,
      skipDepartmentCheck === 'true' ? undefined : req.requester.facultyId,
      skipExisting === 'true',
    );

    return generateApiResponse('Nhập phân công từ file thành công', result);
  }
}
