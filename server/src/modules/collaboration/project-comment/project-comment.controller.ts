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
import { ProjectCommentService } from './project-comment.service';
import {
  CreateProjectCommentDto,
  FindProjectCommentDto,
  createProjectCommentSchema,
  findProjectCommentSchema,
} from './schema';

@ApiTags('Project Comments')
@Controller('project-comments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ProjectCommentController {
  constructor(private readonly projectCommentService: ProjectCommentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({
    status: 201,
    description: 'Comment has been created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 403, description: 'No permission to comment' })
  async create(
    @Body(new ZodValidationPipe(createProjectCommentSchema))
    dto: CreateProjectCommentDto,
    @Request() request: ReqWithRequester,
  ) {
    const result = await this.projectCommentService.create(dto, request.requester);
    return generateApiResponse(
      'Tạo comment thành công',
      result
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get comment list' })
  @ApiResponse({ status: 200, description: 'Returns a list of comments' })
  async findAll(
    @Query(new ZodValidationPipe(findProjectCommentSchema))
    dto: FindProjectCommentDto,
  ) {
    const result = await this.projectCommentService.find(dto);
    return generateApiResponse(
      'lấy danh sách thành công',
      result.data,
      result.metadata,
    );
  }
}
