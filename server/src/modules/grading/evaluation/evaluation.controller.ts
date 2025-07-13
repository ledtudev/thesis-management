import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReqWithRequester } from 'src/common/interface';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/roles.guard';
import { EvaluationService } from './evaluation.service';
import {
  CreateEvaluationScoreDto,
  FinalizeEvaluationDto,
  FindEvaluationDto,
  UpdateEvaluationScoreDto,
} from './schema';
import { generateApiResponse } from 'src/common/response';

@ApiTags('Evaluation')
@Controller('evaluation')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách đánh giá dự án theo các tiêu chí',
    description:
      'API dùng cho thành viên hội đồng, GVHD, thư ký xem các dự án cần chấm',
  })
  @ApiResponse({ status: 200, description: 'Danh sách đánh giá dự án' })
  @ApiQuery({
    name: 'defenseRole',
    required: false,
    description:
      'Lọc theo vai trò trong hội đồng (CHAIRMAN, SECRETARY, REVIEWER, MEMBER)',
  })
  @ApiQuery({
    name: 'defenseMemberId',
    required: false,
    description:
      'ID của thành viên hội đồng/giảng viên để lọc các dự án cần đánh giá',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Lọc theo trạng thái đánh giá',
  })
  @ApiQuery({
    name: 'keyword',
    required: false,
    description: 'Tìm kiếm theo tên dự án',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Số trang',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Số mục trên mỗi trang',
  })
  async findMany(
    @Query() query: FindEvaluationDto,
    @Req() req: ReqWithRequester,
  ) {
    // If no defenseMemberId is provided, use the requester's ID
    if (!query.defenseMemberId) {
      query.defenseMemberId = req.requester.id;
    }
    const result = await this.evaluationService.findMany(query, req.requester);
    return generateApiResponse(
      'Lấy danh sách đánh giá dự án thành công',
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết đánh giá dự án theo ID',
    description: 'Trả về thông tin chi tiết của đánh giá và các điểm đã chấm',
  })
  @ApiResponse({ status: 200, description: 'Chi tiết đánh giá dự án' })
  @ApiParam({ name: 'id', type: String, description: 'ID đánh giá' })
  async findById(@Param('id') id: string, @Req() req: ReqWithRequester) {
    return this.evaluationService.findById(id, req.requester);
  }

  @Post('scores')
  @ApiOperation({
    summary: 'Chấm điểm đánh giá dự án',
    description:
      'API dùng cho giáo viên hướng dẫn và thành viên hội đồng chấm điểm',
  })
  @ApiResponse({ status: 201, description: 'Điểm đánh giá đã được tạo' })
  async createScore(
    @Body() data: CreateEvaluationScoreDto,
    @Req() req: ReqWithRequester,
  ) {
    const result = await this.evaluationService.createScore(
      data,
      req.requester,
    );
    return generateApiResponse(
      'Chấm điểm đánh giá dự án thành công',
      result,
    );
  }

  @Put('scores/:id')
  @ApiOperation({
    summary: 'Cập nhật điểm đánh giá dự án',
    description:
      'API dùng cho giáo viên và thành viên hội đồng cập nhật điểm đã chấm. Không thể sửa sau khi thư ký đã duyệt.',
  })
  @ApiResponse({ status: 200, description: 'Điểm đánh giá đã được cập nhật' })
  @ApiParam({ name: 'id', type: String, description: 'ID điểm' })
  async updateScore(
    @Param('id') id: string,
    @Body() data: UpdateEvaluationScoreDto,
    @Req() req: ReqWithRequester,
  ) {
    const result = await this.evaluationService.updateScore(
      id,
      data,
      req.requester,
    );
    return generateApiResponse(
      'Cập nhật điểm đánh giá dự án thành công',
      result,
    );
  }
  @Put(':id/finalize')
  @ApiOperation({
    summary: 'Chốt điểm cuối cùng cho dự án',
    description:
      'API dùng cho thư ký để duyệt/chốt điểm, sau đó không thể sửa điểm nữa',
  })
  @ApiResponse({ status: 200, description: 'Đánh giá dự án đã được chốt điểm' })
  @ApiParam({ name: 'id', type: String, description: 'ID đánh giá' })
  async finalize(
    @Param('id') id: string,
    @Body() data: FinalizeEvaluationDto,
    @Req() req: ReqWithRequester,
  ) {
    const result = await this.evaluationService.finalize(
      id,
      data,
      req.requester,
    );
    return generateApiResponse(
      'Chốt điểm cuối cùng cho dự án thành công',
      result,
    );
  }
}