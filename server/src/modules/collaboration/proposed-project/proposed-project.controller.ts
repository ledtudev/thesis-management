import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ZodValidationPipe } from 'nestjs-zod';
import { ReqWithRequester } from 'src/common/interface';
import { generateApiResponse } from 'src/common/response';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { ProposedProjectService } from './proposed-project.service';
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
  UpdateProposedProjectTitleDto,
  UpdateStatusDto,
  advisorReviewSchema,
  bulkStatusUpdateSchema,
  createProposedProjectTriggerSchema,
  departmentHeadReviewSchema,
  exportProjectsToExcelSchema,
  findProposedProjectSchema,
  headApprovalSchema,
  lockProposalOutlineSchema,
  manageProposedMemberSchema,
  reviewProposalOutlineSchema,
  submitProposalOutlineSchema,
  updateProposedProjectSchema,
  updateProposedProjectTitleSchema,
  updateStatusSchema,
} from './schema';

@ApiTags('Proposed Projects')
@Controller('proposed-projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ProposedProjectController {
  constructor(
    private readonly proposedProjectService: ProposedProjectService,
  ) {}

  // Initialize proposal from ProjectAllocation
  @Post('trigger')
  @ApiOperation({
    summary: 'Initialize project proposal from allocation record',
  })
  @ApiResponse({
    status: 201,
    description: 'Project proposal successfully created',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 404, description: 'Allocation record not found' })
  @ApiResponse({
    status: 403,
    description: 'No permission to create project proposal',
  })
  async createFromAllocation(
    @Body(new ZodValidationPipe(createProposedProjectTriggerSchema))
    dto: CreateProposedProjectTriggerDto,
    @Request() request: ReqWithRequester,
  ) {
    return generateApiResponse(
      'Project proposal initialized successfully',
      await this.proposedProjectService.createFromAllocation(
        dto,
        request.requester,
      ),
    );
  }

  //  Student updates project title
  @Put(':id')
  @ApiOperation({ summary: 'Update project proposal information' })
  @ApiResponse({
    status: 200,
    description: 'Project proposal updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 404, description: 'Project proposal not found' })
  @ApiResponse({
    status: 403,
    description: 'No permission to update project proposal',
  })
  async updateProposedProject(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProposedProjectSchema))
    dto: UpdateProposedProjectDto,
    @Request() request: ReqWithRequester,
  ) {
    return generateApiResponse(
      'Project proposal updated successfully',
      await this.proposedProjectService.updateProposedProject(
        id,
        dto,
        request.requester,
      ),
    );
  }

  //  Advisor reviews project title
  @Put(':id/advisor-review')
  @ApiOperation({ summary: 'Advisor reviews project title' })
  @ApiResponse({
    status: 200,
    description: 'Project proposal reviewed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 404, description: 'Project proposal not found' })
  @ApiResponse({
    status: 403,
    description: 'No permission to review project proposal',
  })
  async advisorReview(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(advisorReviewSchema))
    dto: AdvisorReviewDto,
    @Request() request: ReqWithRequester,
  ) {
    return generateApiResponse(
      'Project proposal reviewed successfully',
      await this.proposedProjectService.advisorReview(
        id,
        dto,
        request.requester,
      ),
    );
  }

  //  Department head reviews project
  @Put(':id/head-review')
  @ApiOperation({ summary: 'Department head reviews project proposal' })
  @ApiResponse({
    status: 200,
    description: 'Project proposal reviewed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 404, description: 'Project proposal not found' })
  @ApiResponse({
    status: 403,
    description: 'No permission to review project proposal',
  })
  async departmentHeadReview(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(departmentHeadReviewSchema))
    dto: DepartmentHeadReviewDto,
    @Request() request: ReqWithRequester,
  ) {
    return generateApiResponse(
      'Project proposal reviewed successfully',
      await this.proposedProjectService.departmentHeadReview(
        id,
        dto,
        request.requester,
      ),
    );
  }

  // Faculty head approves and creates official project
  @Put(':id/final-approval')
  @ApiOperation({
    summary: 'Faculty head gives final approval and creates official project',
  })
  @ApiResponse({
    status: 200,
    description:
      'Project proposal approved and official project created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 404, description: 'Project proposal not found' })
  @ApiResponse({
    status: 403,
    description: 'No permission for final approval of project proposal',
  })
  async headApproval(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(headApprovalSchema))
    dto: HeadApprovalDto,
    @Request() request: ReqWithRequester,
  ) {
    return generateApiResponse(
      'Final approval complete and official project created successfully',
      await this.proposedProjectService.approveByHeadForFinalProject(
        id,
        dto,
        request.requester,
      ),
    );
  }

  // Member management in project proposal
  @Put(':id/members')
  @ApiOperation({ summary: 'Manage members in project proposal' })
  @ApiResponse({
    status: 200,
    description: 'Members updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 404, description: 'Project proposal not found' })
  @ApiResponse({
    status: 403,
    description: 'No permission to manage project proposal members',
  })
  async manageMembers(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(manageProposedMemberSchema))
    dto: ManageProposedMemberDto,
    @Request() request: ReqWithRequester,
  ) {
    return generateApiResponse(
      'Members updated successfully',
      await this.proposedProjectService.manageMembers(
        id,
        dto,
        request.requester,
      ),
    );
  }

  //  Student submits detailed proposal outline
  @Post('outline')
  @ApiOperation({ summary: 'Student submits detailed proposal outline' })
  @ApiResponse({
    status: 201,
    description: 'Proposal outline submitted successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 404, description: 'Project proposal not found' })
  @ApiResponse({
    status: 403,
    description: 'No permission to submit proposal outline',
  })
  async submitProposalOutline(
    @Body(new ZodValidationPipe(submitProposalOutlineSchema))
    dto: SubmitProposalOutlineDto,
    @Request() request: ReqWithRequester,
  ) {
    // Student should upload file first through storage API and get fileId
    // Then call this API to submit the outline with fileId
    return generateApiResponse(
      'Proposal outline submitted successfully',
      await this.proposedProjectService.submitProposalOutline(
        dto,
        request.requester,
      ),
    );
  }

  //  Advisor/Department Head reviews proposal outline
  @Put('outline/:id/review')
  @ApiOperation({ summary: 'Advisor/Department Head reviews proposal outline' })
  @ApiResponse({
    status: 200,
    description: 'Proposal outline reviewed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 404, description: 'Proposal outline not found' })
  @ApiResponse({
    status: 403,
    description: 'No permission to review proposal outline',
  })
  async reviewProposalOutline(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(reviewProposalOutlineSchema))
    dto: ReviewProposalOutlineDto,
    @Request() request: ReqWithRequester,
  ) {
    return generateApiResponse(
      'Proposal outline reviewed successfully',
      await this.proposedProjectService.reviewProposalOutline(
        id,
        dto,
        request.requester,
      ),
    );
  }

  //  Faculty Head locks proposal outline
  @Put('outline/:id/lock')
  @ApiOperation({ summary: 'Faculty Head locks proposal outline' })
  @ApiResponse({
    status: 200,
    description: 'Proposal outline locked successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 404, description: 'Proposal outline not found' })
  @ApiResponse({
    status: 403,
    description: 'No permission to lock proposal outline',
  })
  async lockProposalOutline(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(lockProposalOutlineSchema))
    dto: LockProposalOutlineDto,
    @Request() request: ReqWithRequester,
  ) {
    return generateApiResponse(
      'Proposal outline locked successfully',
      await this.proposedProjectService.lockProposalOutline(
        id,
        dto,
        request.requester,
      ),
    );
  }

  // Search for project proposals
  @Get()
  @ApiOperation({ summary: 'Search for project proposals' })
  @ApiResponse({ status: 200, description: 'List of project proposals' })
  async find(
    @Query(new ZodValidationPipe(findProposedProjectSchema))
    dto: FindProposedProjectDto,
    @Request() request: ReqWithRequester,
  ) {
    const result = await this.proposedProjectService.find(
      dto,
      request.requester,
    );
    return generateApiResponse(
      'Project proposals retrieved successfully',
      result,
    );
  }

  @Get('dean')
  @ApiOperation({ summary: 'Search for project proposals' })
  @ApiResponse({ status: 200, description: 'List of project proposals' })
  async findByDean(
    @Query(new ZodValidationPipe(findProposedProjectSchema))
    dto: FindProposedProjectDto,
    @Request() request: ReqWithRequester,
  ) {
    const result = await this.proposedProjectService.findByDean(
      dto,
      request.requester,
    );
    return generateApiResponse(
      'Project proposals retrieved successfully',
      result,
    );
  }
  @Get('head')
  @ApiOperation({ summary: 'Search for project proposals' })
  @ApiResponse({ status: 200, description: 'List of project proposals' })
  async findByHead(
    @Query(new ZodValidationPipe(findProposedProjectSchema))
    dto: FindProposedProjectDto,
    @Request() request: ReqWithRequester,
  ) {
    const result = await this.proposedProjectService.findByHead(
      dto,
      request.requester,
    );
    return generateApiResponse(
      'Project proposals retrieved successfully',
      result,
    );
  }
  // Get details of a project proposal
  @Get(':id')
  @ApiOperation({ summary: 'Get details of a project proposal' })
  @ApiResponse({ status: 200, description: 'Project proposal details' })
  @ApiResponse({ status: 404, description: 'Project proposal not found' })
  @ApiResponse({
    status: 403,
    description: 'No permission to view project proposal details',
  })
  async findOne(@Param('id') id: string, @Request() request: ReqWithRequester) {
    return generateApiResponse(
      'Project proposal details retrieved successfully',
      await this.proposedProjectService.findOne(id, request.requester),
    );
  }

  // General API to update project proposal status
  @Put(':id/status')
  @ApiOperation({ summary: 'Update project proposal status' })
  @ApiResponse({
    status: 200,
    description: 'Status updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 404, description: 'Project proposal not found' })
  @ApiResponse({
    status: 403,
    description: 'No permission to change status',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateStatusSchema)) dto: UpdateStatusDto,
    @Request() request: ReqWithRequester,
  ) {
    return generateApiResponse(
      'Status updated successfully',
      await this.proposedProjectService.updateStatus(
        id,
        dto,
        request.requester,
      ),
    );
  }

  @Put(':id/title')
  @ApiOperation({
    summary: 'Update proposed project title',
    description:
      'Update the title of a proposed project with appropriate status validation',
  })
  @ApiParam({
    name: 'id',
    description: 'Proposed project ID',
    required: true,
  })
  @ApiBody({ type: UpdateProposedProjectTitleDto })
  @ApiResponse({
    status: 200,
    description: 'Proposed project title updated successfully',
  })
  async updateProposedProjectTitle(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProposedProjectTitleSchema))
    updateProposedProjectTitleDto: UpdateProposedProjectTitleDto,
    @Request() request: ReqWithRequester,
  ) {
    const result = await this.proposedProjectService.updateProposedProjectTitle(
      id,
      updateProposedProjectTitleDto,
      request.requester,
    );
    return generateApiResponse(
      'Proposed project title updated successfully',
      result,
    );
  }

  // Export projects to Excel
  @Get('export-excel')
  @ApiOperation({ summary: 'Export projects to Excel file' })
  @ApiResponse({
    status: 200,
    description: 'Excel file successfully generated',
  })
  @ApiResponse({ status: 403, description: 'No permission to export projects' })
  async exportProjectsToExcel(
    @Query(new ZodValidationPipe(exportProjectsToExcelSchema))
    dto: ExportProjectsToExcelDto,
    @Request() request: ReqWithRequester,
    @Res() res: Response,
  ) {
    const buffer = await this.proposedProjectService.exportProjectsToExcel(
      dto,
      request.requester,
    );

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=proposed-projects.xlsx',
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  // New endpoint for bulk status update by lecturer
  @Post('bulk-status-update/lecturer')
  @ApiOperation({
    summary: 'Update status of multiple project proposals as a lecturer',
    description:
      'Lecturers can approve, reject, or request changes for multiple proposals they are advising',
  })
  @ApiResponse({
    status: 200,
    description: 'Status updated successfully for multiple projects',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({
    status: 403,
    description: 'No permission to change status',
  })
  async bulkUpdateStatusByLecturer(
    @Body(new ZodValidationPipe(bulkStatusUpdateSchema))
    dto: BulkStatusUpdateDto,
    @Request() request: ReqWithRequester,
  ) {
    const result = await this.proposedProjectService.bulkUpdateStatusByLecturer(
      dto,
      request.requester,
    );
    return generateApiResponse('Cập nhật trạng thái thành công', result);
  }

  // New endpoint for bulk status update by department head
  @Post('bulk-status-update/department-head')
  @ApiOperation({
    summary: 'Update status of multiple project proposals as a department head',
    description:
      'Department heads can approve, reject, or request changes for multiple proposals from their department',
  })
  @ApiResponse({
    status: 200,
    description: 'Status updated successfully for multiple projects',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({
    status: 403,
    description: 'No permission to change status',
  })
  async bulkUpdateStatusByDepartmentHead(
    @Body(new ZodValidationPipe(bulkStatusUpdateSchema))
    dto: BulkStatusUpdateDto,
    @Request() request: ReqWithRequester,
  ) {
    const result =
      await this.proposedProjectService.bulkUpdateStatusByDepartmentHead(
        dto,
        request.requester,
      );
    return generateApiResponse('Cập nhật trạng thái thành công', result);
  }

  // New endpoint for bulk status update by dean
  @Post('bulk-status-update/dean')
  @ApiOperation({
    summary: 'Update status of multiple project proposals as a dean',
    description:
      'Deans can approve, reject, or request changes for multiple proposals from their faculty',
  })
  @ApiResponse({
    status: 200,
    description: 'Status updated successfully for multiple projects',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({
    status: 403,
    description: 'No permission to change status',
  })
  async bulkUpdateStatusByDean(
    @Body(new ZodValidationPipe(bulkStatusUpdateSchema))
    dto: BulkStatusUpdateDto,
    @Request() request: ReqWithRequester,
  ) {
    const result = await this.proposedProjectService.bulkUpdateStatusByDean(
      dto,
      request.requester,
    );
    return generateApiResponse('Cập nhật trạng thái thành công', result);
  }
}
