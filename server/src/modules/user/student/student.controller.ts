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
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ZodValidationPipe } from 'nestjs-zod';
import { ReqWithRequester } from 'src/common/interface';
import { RequirePermissions } from 'src/modules/auth/permission.decorator';

import { PermissionT } from 'src/common/constant';
import { generateApiResponse } from 'src/common/response';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { CreateStudentDto, FindStudentDto, UpdateStudentDto } from './schema';
import { StudentService } from './student.service';

@ApiTags('Students')
@Controller('students')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class StudentController {
  constructor(private readonly service: StudentService) {}
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new student',
    description: 'Creates a new student account',
  })
  @ApiBody({
    type: CreateStudentDto,
    description: 'Student information',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  // @RequirePermissions(PermissionT.MANAGE_STUDENT)
  async create(
    @Body(new ZodValidationPipe(CreateStudentDto))
    dto: CreateStudentDto,
  ) {
    const result = await this.service.create(dto);
    return generateApiResponse('Tạo sinh viên thành công', result);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get student by ID',
    description: 'Retrieves student details by ID',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student not found',
  })
  @RequirePermissions(PermissionT.VIEW_STUDENT)
  async get(@Param('id') id: string) {
    const result = await this.service.get(id);
    return generateApiResponse('Lấy thông tin sinh viên thành công', result);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all students',
    description:
      'Retrieves a paginated list of students with filtering options',
  })
  @ApiQuery({ name: 'studentCode', required: false, type: String })
  @ApiQuery({ name: 'fullName', required: false, type: String })
  @ApiQuery({ name: 'email', required: false, type: String })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ACTIVE', 'INACTIVE', 'GRADUATED', 'DROPPED_OUT', 'ON_LEAVE'],
  })
  @ApiQuery({ name: 'majorCode', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['fullName', 'studentCode', 'email', 'createdAt'],
  })
  @ApiQuery({ name: 'asc', required: false, enum: ['asc', 'desc'] })
  @RequirePermissions(PermissionT.VIEW_STUDENT)
  async find(
    @Query(new ZodValidationPipe(FindStudentDto))
    query: FindStudentDto,
  ) {
    const result = await this.service.find(query);
    return generateApiResponse('Lấy danh sách sinh viên thành công', result);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update student',
    description: 'Updates student information',
  })
  @ApiBody({
    type: UpdateStudentDto,
    description: 'Student information to update',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student not found',
  })
  @RequirePermissions(PermissionT.MANAGE_STUDENT)
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateStudentDto))
    dto: UpdateStudentDto,
    @Request() req: ReqWithRequester,
  ) {
    return await this.service.update(id, dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update current student profile',
    description: 'Updates the profile of the currently logged in student',
  })
  @ApiBody({
    type: UpdateStudentDto,
    description: 'Student information to update',
  })
  async updateProfile(
    @Body(new ZodValidationPipe(UpdateStudentDto))
    dto: UpdateStudentDto,
    @Request() req: ReqWithRequester,
  ) {
    const userId = req.requester.id;
    const result = await this.service.update(userId, dto);
    return generateApiResponse('Cập nhật thông tin sinh viên thành công', result);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete student',
    description: 'Deletes a student account',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student not found',
  })
  @RequirePermissions(PermissionT.MANAGE_STUDENT)
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }
}
