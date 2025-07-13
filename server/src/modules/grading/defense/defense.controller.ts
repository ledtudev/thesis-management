import {
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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiResponse as SwaggerApiResponse,
} from '@nestjs/swagger';
import { FacultyMemberRoleT } from '@prisma/client';

import { ReqWithRequester } from 'src/common/interface';
import { ZodValidationPipe } from 'src/common/pipe/zod-validation.pipe';
import { ApiResponse, generateApiResponse } from 'src/common/response';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { PermissionGuard } from 'src/modules/auth/permission.guard';
import { Roles } from 'src/modules/auth/roles.decorator';
import { DefenseService } from './defense.service';
import {
  AutoAssignCommitteeMembersDto,
  BulkCreateDefenseCommitteesDto,
  CreateDefenseCommitteeDto,
  CreateDefenseMemberDto,
  FindDefenseCommitteeDto,
  FindFacultyForCommitteeDto,
  FindProjectsReadyForDefenseDto,
  UpdateDefenseCommitteeDto,
  autoAssignCommitteeMembersDtoSchema,
  bulkCreateDefenseCommitteesDtoSchema,
  createDefenseCommitteeDtoSchema,
  createDefenseMemberDtoSchema,
  findDefenseCommitteeDtoSchema,
  findFacultyForCommitteeDtoSchema,
  findProjectsReadyForDefenseDtoSchema,
  updateDefenseCommitteeDtoSchema,
} from './schema';

@ApiTags('Defense Committee')
@Controller('defense-committees')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class DefenseController {
  constructor(private readonly service: DefenseService) {}

  @Post()
  @Roles(FacultyMemberRoleT.DEAN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Dean] Create a new defense committee' })
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
    @Body(new ZodValidationPipe(createDefenseCommitteeDtoSchema))
    dto: CreateDefenseCommitteeDto,
    @Request() req: ReqWithRequester,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.create(dto, req.requester.id);
    return generateApiResponse('Tạo hội đồng thành công', result);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '[Dean] Create multiple defense committees from waiting projects',
  })
  @SwaggerApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  async bulkCreate(
    @Body(new ZodValidationPipe(bulkCreateDefenseCommitteesDtoSchema))
    dto: BulkCreateDefenseCommitteesDto,
    @Request() req: ReqWithRequester,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.bulkCreate(dto, req.requester.id);
    return generateApiResponse('Tạo nhiều hội đồng thành công', result);
  }

  @Post(':id/members')
  @Roles(FacultyMemberRoleT.DEAN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Dean] Add a member to defense committee' })
  @ApiParam({ name: 'id', description: 'Defense Committee ID', type: String })
  @SwaggerApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  async addMember(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(createDefenseMemberDtoSchema))
    dto: CreateDefenseMemberDto,
    @Request() req: ReqWithRequester,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.addMember(id, dto, req.requester.id);
    return generateApiResponse('Thêm thành viên hội đồng thành công', result);
  }

  @Post(':id/auto-assign-members')
  @Roles(FacultyMemberRoleT.DEAN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Dean] Auto-assign members to defense committee' })
  @ApiParam({ name: 'id', description: 'Defense Committee ID', type: String })
  @SwaggerApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  async autoAssignMembers(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(autoAssignCommitteeMembersDtoSchema))
    dto: AutoAssignCommitteeMembersDto,
    @Request() req: ReqWithRequester,
  ): Promise<ApiResponse<any>> {
    // Override committeeId from URL param
    dto.committeeId = id;
    const result = await this.service.autoAssignCommitteeMembers(
      dto,
      req.requester.id,
    );
    return generateApiResponse(
      'Tự động phân công thành viên thành công',
      result,
    );
  }

  @Delete(':id/members/:memberId')
  @Roles(FacultyMemberRoleT.DEAN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Dean] Remove a member from defense committee' })
  @ApiParam({ name: 'id', description: 'Defense Committee ID', type: String })
  @ApiParam({
    name: 'memberId',
    description: 'Defense Member ID',
    type: String,
  })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'OK' })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  async removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Request() req: ReqWithRequester,
  ): Promise<ApiResponse<any>> {
    await this.service.removeMember(id, memberId, req.requester.id);
    return generateApiResponse('Xóa thành viên hội đồng thành công', null);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[All Roles] Find defense committees (filtered by role)',
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
    @Query(new ZodValidationPipe(findDefenseCommitteeDtoSchema))
    query: FindDefenseCommitteeDto,
    @Request() req: ReqWithRequester,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.find(query, req.requester);
    return generateApiResponse(
      'Lấy danh sách hội đồng thành công',
      result.data,
      result.metadata,
    );
  }

  @Get('projects-ready-for-defense')
  @Roles(FacultyMemberRoleT.DEAN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[Dean] Get projects ready for defense with advanced filtering',
  })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'OK' })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  async getProjectsReadyForDefense(
    @Query(new ZodValidationPipe(findProjectsReadyForDefenseDtoSchema))
    query: FindProjectsReadyForDefenseDto,
    @Request() req: ReqWithRequester,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.findProjectsReadyForDefense(
      query,
      req.requester,
    );
    return generateApiResponse(
      'Lấy danh sách dự án sẵn sàng bảo vệ thành công',
      result.data,
      result.metadata,
    );
  }

  @Get('available-faculty')
  @Roles(FacultyMemberRoleT.DEAN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[Dean] Find faculty members available for committee assignment',
  })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'OK' })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  async getAvailableFaculty(
    @Query(new ZodValidationPipe(findFacultyForCommitteeDtoSchema))
    query: FindFacultyForCommitteeDto,
    @Request() req: ReqWithRequester,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.findFacultyForCommittee(
      query,
      req.requester,
    );
    return generateApiResponse(
      'Lấy danh sách giảng viên khả dụng thành công',
      result.data,
      result.metadata,
    );
  }

  @Get('waiting-projects')
  @Roles(FacultyMemberRoleT.DEAN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      '[Dean] Get projects waiting for evaluation (WAITING_FOR_EVALUATION)',
  })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'OK' })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  async getWaitingProjects(
    @Request() req: ReqWithRequester,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.getWaitingProjects(req.requester);
    return generateApiResponse(
      'Lấy danh sách dự án đang chờ đánh giá thành công',
      result,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[All Roles] Get defense committee by ID' })
  @ApiParam({ name: 'id', description: 'Defense Committee ID', type: String })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'OK' })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found',
  })
  async get(@Param('id') id: string): Promise<ApiResponse<any>> {
    const result = await this.service.findById(id);
    return generateApiResponse('Lấy thông tin hội đồng thành công', result);
  }

  @Patch(':id')
  @Roles(FacultyMemberRoleT.DEAN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Dean] Update defense committee' })
  @ApiParam({ name: 'id', description: 'Defense Committee ID', type: String })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'OK' })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateDefenseCommitteeDtoSchema))
    dto: UpdateDefenseCommitteeDto,
    @Request() req: ReqWithRequester,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.update(id, dto, req.requester.id);
    return generateApiResponse('Cập nhật hội đồng thành công', result);
  }

  @Delete(':id')
  @Roles(FacultyMemberRoleT.DEAN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Dean] Delete a defense committee' })
  @ApiParam({ name: 'id', description: 'Defense Committee ID', type: String })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'OK' })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  async delete(
    @Param('id') id: string,
    @Request() req: ReqWithRequester,
  ): Promise<ApiResponse<any>> {
    await this.service.delete(id, req.requester.id);
    return generateApiResponse('Xóa hội đồng thành công', null);
  }

  @Get('debug/current-user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Debug] Get current user information' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'OK' })
  async getCurrentUserInfo(
    @Request() req: ReqWithRequester,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.getCurrentUserInfo(req.requester.id);
    return generateApiResponse('Thông tin người dùng hiện tại', result);
  }
}
