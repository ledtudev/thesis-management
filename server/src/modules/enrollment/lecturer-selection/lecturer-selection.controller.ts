import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FacultyMemberRoleT } from '@prisma/client';
import { Request as ExpressRequest } from 'express';
import { ReqWithRequester } from 'src/common/interface';
import { ZodValidationPipe } from 'src/common/pipe/zod-validation.pipe';
import { generateApiResponse } from 'src/common/response';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { Roles } from 'src/modules/auth/roles.decorator';
import { LecturerSelectionService } from './lecturer-selection.service';
import {
  CreateLecturerSelectionDto,
  FindLecturerSelectionsDto,
  UpdateLecturerSelectionDto,
  UpdateLecturerSelectionStatusDto,
  createLecturerSelectionDtoSchema,
  findLecturerSelectionsDtoSchema,
  updateLecturerSelectionDtoSchema,
  updateLecturerSelectionStatusDtoSchema,
} from './schema';

@ApiTags('Lecturer Selections')
@Controller('lecturer-selections')
export class LecturerSelectionController {
  constructor(
    private readonly lecturerSelectionService: LecturerSelectionService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(FacultyMemberRoleT.LECTURER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new lecturer selection',
    description: 'Create a new lecturer selection for the current lecturer',
  })
  async create(
    @Body(new ZodValidationPipe(createLecturerSelectionDtoSchema))
    createLecturerSelectionDto: CreateLecturerSelectionDto,
    @Req() req: ReqWithRequester,
  ) {
    const result = await this.lecturerSelectionService.create(
      createLecturerSelectionDto,
      req.requester.id,
    );
    return generateApiResponse('Tạo đăng ký thành công', result);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Find all lecturer selections',
    description: 'Find all lecturer selections with filtering options',
  })
  async findAll(
    @Query(new ZodValidationPipe(findLecturerSelectionsDtoSchema))
    query: FindLecturerSelectionsDto,
  ) {
    const result = await this.lecturerSelectionService.findAll(query);
    return generateApiResponse(
      'Lấy danh sách đăng ký thành công',
      result.data,
      result.metadata,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Find one lecturer selection',
    description: 'Find one lecturer selection by ID',
  })
  async findOne(@Param('id') id: string) {
    const result = await this.lecturerSelectionService.findOne(id);
    return generateApiResponse('Lấy đăng ký thành công', result);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(FacultyMemberRoleT.LECTURER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a lecturer selection',
    description:
      'Update a lecturer selection by ID (lecturer can only update their own selections)',
  })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateLecturerSelectionDtoSchema))
    updateLecturerSelectionDto: UpdateLecturerSelectionDto,
    @Req() req: ExpressRequest,
  ) {
    const result = await this.lecturerSelectionService.update(
      id,
      updateLecturerSelectionDto,
      req.requester.id,
    );
    return generateApiResponse('Cập nhật đăng ký thành công', result);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @Roles(FacultyMemberRoleT.DEAN, FacultyMemberRoleT.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update selection status by dean',
    description: 'Update the status of a lecturer selection (dean/admin only)',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateLecturerSelectionStatusDtoSchema))
    dto: UpdateLecturerSelectionStatusDto,
    @Req() req: ExpressRequest,
  ) {
    const result = await this.lecturerSelectionService.updateStatusByDean(
      id,
      dto.status,
      req.requester.id,
    );
    return generateApiResponse(
      'Cập nhật trạng thái đăng ký thành công',
      result,
    );
  }

  @Delete(':id/owner')
  @UseGuards(JwtAuthGuard)
  @Roles(FacultyMemberRoleT.LECTURER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Soft delete by owner',
    description: 'Soft delete a lecturer selection by the owner (lecturer)',
  })
  async deleteByOwner(@Param('id') id: string, @Req() req: ExpressRequest) {
    const userId = req.requester.id;
    const result = await this.lecturerSelectionService.deleteByOwner(
      id,
      userId,
    );
    return generateApiResponse('Xóa mềm đăng ký thành công', result);
  }

  @Delete(':id/dean')
  @UseGuards(JwtAuthGuard)
  @Roles(FacultyMemberRoleT.DEAN, FacultyMemberRoleT.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Soft delete by dean/admin',
    description: 'Soft delete a lecturer selection by dean or admin',
  })
  async deleteByDean(@Param('id') id: string, @Req() req: ExpressRequest) {
    const userId = req.requester.id;
    const result = await this.lecturerSelectionService.deleteByDean(id, userId);
    return generateApiResponse('Xóa mềm đăng ký thành công', result);
  }
}
