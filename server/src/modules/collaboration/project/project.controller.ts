import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FacultyMemberRoleT, UserT } from '@prisma/client';
import { Response } from 'express';
import { ZodValidationPipe } from 'nestjs-zod';
import { ReqWithRequester } from 'src/common/interface';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { Roles } from 'src/modules/auth/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles.guard';
import { ProjectService } from './project.service';
import {
  AddProjectMemberDto,
  AddProjectMemberDtoSchema,
  CreateProjectCommentDto,
  CreateProjectCommentDtoSchema,
  ProjectQueryDto,
  ProjectQueryDtoSchema,
  SubmitProjectReportDto,
  SubmitProjectReportDtoSchema,
  UpdateProjectMemberDto,
  UpdateProjectMemberDtoSchema,
  UpdateProjectStatusDto,
  UpdateProjectStatusDtoSchema,
} from './schema';

@ApiTags('Projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách dự án',
    description:
      'Lấy danh sách dự án với các bộ lọc và phân trang. Sinh viên chỉ xem được dự án của mình, giảng viên xem được dự án mình hướng dẫn và trong khoa, trưởng khoa xem được tất cả dự án trong khoa.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Số trang (bắt đầu từ 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng bản ghi trên mỗi trang',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Từ khóa tìm kiếm',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: [
      'PENDING',
      'IN_PROGRESS',
      'WAITING_FOR_EVALUATION',
      'COMPLETED',
      'CANCELLED',
    ],
    description: 'Trạng thái dự án',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['GRADUATED', 'INTERNSHIP', 'RESEARCH'],
    description: 'Loại dự án',
  })
  @ApiQuery({
    name: 'studentId',
    required: false,
    type: String,
    description: 'ID của sinh viên',
  })
  @ApiQuery({
    name: 'lecturerId',
    required: false,
    type: String,
    description: 'ID của giảng viên',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách dự án được trả về thành công',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { type: 'object' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @Roles(
    FacultyMemberRoleT.ADMIN,
    FacultyMemberRoleT.DEAN,
    FacultyMemberRoleT.LECTURER,
    UserT.STUDENT,
  )
  async findMany(
    @Query(new ZodValidationPipe(ProjectQueryDtoSchema)) query: ProjectQueryDto,
    @Request() req: ReqWithRequester,
  ) {
    return this.projectService.findMany(query, req.requester);
  }

  @Get('export')
  @ApiOperation({
    summary: 'Xuất danh sách dự án ra Excel',
    description:
      'Xuất danh sách dự án ra file Excel với các bộ lọc tương tự như API lấy danh sách.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Số trang (bắt đầu từ 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng bản ghi trên mỗi trang',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Từ khóa tìm kiếm',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: [
      'PENDING',
      'IN_PROGRESS',
      'WAITING_FOR_EVALUATION',
      'COMPLETED',
      'CANCELLED',
    ],
    description: 'Trạng thái dự án',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['GRADUATED', 'INTERNSHIP', 'RESEARCH'],
    description: 'Loại dự án',
  })
  @ApiResponse({
    status: 200,
    description: 'File Excel được tạo và trả về thành công',
    headers: {
      'Content-Type': {
        description:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      'Content-Disposition': {
        description: 'attachment; filename=projects.xlsx',
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xuất dữ liệu' })
  @Roles(
    FacultyMemberRoleT.ADMIN,
    FacultyMemberRoleT.DEAN,
    FacultyMemberRoleT.LECTURER,
  )
  async exportProjects(
    @Query(new ZodValidationPipe(ProjectQueryDtoSchema)) query: ProjectQueryDto,
    @Request() req: ReqWithRequester,
    @Res() res: Response,
  ) {
    const fileBuffer = await this.projectService.exportProjectsToExcel(
      query,
      req.requester,
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=projects.xlsx');
    res.send(fileBuffer);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết dự án',
    description:
      'Lấy thông tin chi tiết của một dự án bao gồm thành viên, bình luận, báo cáo.',
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin dự án được trả về thành công',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string' },
        type: { type: 'string' },
        createdAt: { type: 'string' },
        Member: { type: 'array' },
        Comment: { type: 'array' },
        FinalReport: { type: 'array' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dự án' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem dự án này' })
  @Roles(
    FacultyMemberRoleT.ADMIN,
    FacultyMemberRoleT.DEAN,
    FacultyMemberRoleT.LECTURER,
    UserT.STUDENT,
  )
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: ReqWithRequester,
  ) {
    return this.projectService.findById(id, req.requester);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Cập nhật trạng thái dự án',
    description:
      'Cập nhật trạng thái của dự án. Chỉ giảng viên và trưởng khoa mới có quyền thực hiện.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: [
            'PENDING',
            'IN_PROGRESS',
            'WAITING_FOR_EVALUATION',
            'COMPLETED',
            'CANCELLED',
          ],
          description: 'Trạng thái mới của dự án',
        },
        comment: {
          type: 'string',
          description: 'Ghi chú về việc thay đổi trạng thái',
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Trạng thái dự án được cập nhật thành công',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dự án' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền cập nhật trạng thái dự án',
  })
  @Roles(
    FacultyMemberRoleT.ADMIN,
    FacultyMemberRoleT.DEAN,
    FacultyMemberRoleT.LECTURER,
  )
  async updateProjectStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateProjectStatusDtoSchema))
    statusData: UpdateProjectStatusDto,
    @Request() req: ReqWithRequester,
  ) {
    return this.projectService.updateProjectStatus(
      id,
      statusData,
      req.requester,
    );
  }

  // ---------------- Project Members ----------------
  @Post(':projectId/members')
  @ApiOperation({
    summary: 'Thêm thành viên vào dự án',
    description: 'Thêm sinh viên hoặc giảng viên vào dự án với vai trò cụ thể.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        studentId: {
          type: 'string',
          description:
            'ID của sinh viên (chỉ định một trong studentId hoặc facultyMemberId)',
        },
        facultyMemberId: {
          type: 'string',
          description:
            'ID của giảng viên (chỉ định một trong studentId hoặc facultyMemberId)',
        },
        role: {
          type: 'string',
          enum: ['STUDENT', 'ADVISOR', 'MEMBER', 'LEADER'],
          description: 'Vai trò của thành viên trong dự án',
        },
      },
      required: ['role'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Thành viên được thêm vào dự án thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy dự án hoặc người dùng',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền thêm thành viên' })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc thành viên đã tồn tại',
  })
  @Roles(
    FacultyMemberRoleT.ADMIN,
    FacultyMemberRoleT.DEAN,
    FacultyMemberRoleT.LECTURER,
  )
  async addMember(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body(new ZodValidationPipe(AddProjectMemberDtoSchema))
    memberData: AddProjectMemberDto,
    @Request() req: ReqWithRequester,
  ) {
    return this.projectService.addMember(projectId, memberData, req.requester);
  }

  @Delete(':projectId/members/:memberId')
  @ApiOperation({
    summary: 'Xóa thành viên khỏi dự án',
    description: 'Xóa một thành viên khỏi dự án.',
  })
  @ApiResponse({
    status: 200,
    description: 'Thành viên được xóa khỏi dự án thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy dự án hoặc thành viên',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa thành viên' })
  @Roles(
    FacultyMemberRoleT.ADMIN,
    FacultyMemberRoleT.DEAN,
    FacultyMemberRoleT.LECTURER,
  )
  async removeMember(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Request() req: ReqWithRequester,
  ) {
    return this.projectService.removeMember(projectId, memberId, req.requester);
  }

  @Patch(':projectId/members/:memberId')
  @ApiOperation({
    summary: 'Cập nhật thông tin thành viên dự án',
    description: 'Cập nhật vai trò hoặc trạng thái của thành viên trong dự án.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          enum: ['STUDENT', 'ADVISOR', 'MEMBER', 'LEADER'],
          description: 'Vai trò mới của thành viên',
        },
        status: {
          type: 'string',
          enum: ['ACTIVE', 'INACTIVE', 'REMOVED'],
          description: 'Trạng thái của thành viên',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin thành viên được cập nhật thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy dự án hoặc thành viên',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền cập nhật thành viên',
  })
  @Roles(
    FacultyMemberRoleT.ADMIN,
    FacultyMemberRoleT.DEAN,
    FacultyMemberRoleT.LECTURER,
  )
  async updateMember(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body(new ZodValidationPipe(UpdateProjectMemberDtoSchema))
    memberData: UpdateProjectMemberDto,
    @Request() req: ReqWithRequester,
  ) {
    return this.projectService.updateMember(
      projectId,
      memberId,
      memberData,
      req.requester,
    );
  }

  // ---------------- Project Reports ----------------
  @Post(':projectId/reports')
  @ApiOperation({
    summary: 'Nộp báo cáo dự án',
    description: 'Sinh viên nộp báo cáo cho dự án của mình.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        mainReportFileId: {
          type: 'string',
          description: 'ID của file báo cáo chính',
        },
        attachmentFileIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Danh sách ID của các file đính kèm',
        },
        description: {
          type: 'string',
          description: 'Mô tả tổng quan về báo cáo',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Báo cáo được nộp thành công',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dự án' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền nộp báo cáo cho dự án này',
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu báo cáo không hợp lệ' })
  @Roles(UserT.STUDENT)
  async submitReport(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body(new ZodValidationPipe(SubmitProjectReportDtoSchema))
    reportData: SubmitProjectReportDto,
    @Request() req: ReqWithRequester,
  ) {
    return this.projectService.submitReport(
      projectId,
      reportData,
      req.requester,
    );
  }

  @Get(':projectId/reports')
  @ApiOperation({
    summary: 'Lấy danh sách báo cáo của dự án',
    description: 'Lấy tất cả báo cáo đã nộp cho dự án.',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách báo cáo được trả về thành công',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          submittedAt: { type: 'string' },
          version: { type: 'number' },
          description: { type: 'string' },
          MainReportFile: { type: 'object' },
          Attachments: { type: 'array' },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dự án' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền xem báo cáo của dự án này',
  })
  @Roles(
    FacultyMemberRoleT.ADMIN,
    FacultyMemberRoleT.DEAN,
    FacultyMemberRoleT.LECTURER,
    UserT.STUDENT,
  )
  async getProjectReports(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Request() req: ReqWithRequester,
  ) {
    return this.projectService.getProjectReports(projectId, req.requester);
  }

  @Get('reports/:reportId')
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết báo cáo',
    description: 'Lấy thông tin chi tiết của một báo cáo cụ thể.',
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin báo cáo được trả về thành công',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy báo cáo' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem báo cáo này' })
  @Roles(
    FacultyMemberRoleT.ADMIN,
    FacultyMemberRoleT.DEAN,
    FacultyMemberRoleT.LECTURER,
    UserT.STUDENT,
  )
  async getProjectReportById(
    @Param('reportId', ParseUUIDPipe) reportId: string,
    @Request() req: ReqWithRequester,
  ) {
    return this.projectService.getProjectReportById(reportId, req.requester);
  }

  // ---------------- Project Comments ----------------
  @Post(':projectId/comments')
  @ApiOperation({
    summary: 'Thêm bình luận vào dự án',
    description:
      'Thêm bình luận mới vào dự án. Tất cả thành viên dự án đều có thể bình luận.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'Nội dung bình luận',
          minLength: 1,
        },
      },
      required: ['content'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Bình luận được thêm thành công',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dự án' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền bình luận trong dự án này',
  })
  @ApiResponse({ status: 400, description: 'Nội dung bình luận không hợp lệ' })
  @Roles(
    FacultyMemberRoleT.ADMIN,
    FacultyMemberRoleT.DEAN,
    FacultyMemberRoleT.LECTURER,
    UserT.STUDENT,
  )
  async addComment(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body(new ZodValidationPipe(CreateProjectCommentDtoSchema))
    commentData: CreateProjectCommentDto,
    @Request() req: ReqWithRequester,
  ) {
    return this.projectService.addComment(
      projectId,
      commentData,
      req.requester,
    );
  }

  @Get(':projectId/comments')
  @ApiOperation({
    summary: 'Lấy danh sách bình luận của dự án',
    description: 'Lấy tất cả bình luận trong dự án theo thứ tự thời gian.',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách bình luận được trả về thành công',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          content: { type: 'string' },
          createdAt: { type: 'string' },
          CommenterStudent: { type: 'object' },
          CommenterFacultyMember: { type: 'object' },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dự án' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền xem bình luận của dự án này',
  })
  @Roles(
    FacultyMemberRoleT.ADMIN,
    FacultyMemberRoleT.DEAN,
    FacultyMemberRoleT.LECTURER,
    UserT.STUDENT,
  )
  async getComments(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Request() req: ReqWithRequester,
  ) {
    return this.projectService.getComments(projectId, req.requester);
  }
}
