import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { ReqWithRequester } from 'src/common/interface';
import { generateApiResponse } from 'src/common/response';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { ProposedProjectCommentService } from './proposed-project-comment.service';
import {
  CreateProposedProjectCommentDto,
  FindProposedProjectCommentDto,
  createProposedProjectCommentSchema,
  findProposedProjectCommentSchema,
} from './schema';

@ApiTags('Proposed Project Comments')
@Controller('proposed-project-comments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ProposedProjectCommentController {
  constructor(
    private readonly proposedProjectCommentService: ProposedProjectCommentService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new comment on a proposed project' })
  @ApiResponse({
    status: 201,
    description: 'Comment has been created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 404, description: 'Proposed project not found' })
  @ApiResponse({ status: 403, description: 'No permission to comment' })
  async create(
    @Body(new ZodValidationPipe(createProposedProjectCommentSchema))
    dto: CreateProposedProjectCommentDto,
    @Request() request: ReqWithRequester,
  ) {
    const result = await this.proposedProjectCommentService.create(
      dto,
      request.requester,
    );
    return generateApiResponse('Tạo comment thành công', result);
  }

  @Get()
  @ApiOperation({ summary: 'Get comment list for a proposed project' })
  @ApiResponse({ status: 200, description: 'Returns a list of comments' })
  async findAll(
    @Query(new ZodValidationPipe(findProposedProjectCommentSchema))
    dto: FindProposedProjectCommentDto,
  ) {
    const result = await this.proposedProjectCommentService.find(dto);
    return generateApiResponse(
      'lấy danh sách thành công',
      result.data,
      result.metadata,
    );
  }
}
