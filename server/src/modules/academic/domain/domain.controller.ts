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
import { ReqWithRequester } from 'src/common/interface';
import { ZodValidationPipe } from 'src/common/pipe/zod-validation.pipe';
import { DomainService } from './domain.service';
import { CreateDomainDto, FindDomainDto, UpdateDomainDto } from './schema';

@ApiTags('Domain')
@Controller('domain')
@ApiBearerAuth('access-token')
export class DomainController {
  constructor(private readonly service: DomainService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new domain' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Computer Science',
        },
        description: {
          type: 'string',
          example: 'Domain for computer science and related fields',
          nullable: true,
        },
      },
      required: ['name'],
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description: 'Domain created successfully',
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async create(
    @Body(new ZodValidationPipe(CreateDomainDto))
    dto: CreateDomainDto,
    @Request() req: ReqWithRequester,
  ) {
    return this.service.create(dto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a domain by ID' })
  @ApiParam({ name: 'id', description: 'Domain ID' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Domain found',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Domain not found',
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ID format',
  })
  async get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find domains with filtering options' })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by domain name',
  })
  @ApiQuery({
    name: 'departmentId',
    required: false,
    description: 'Filter by department ID',
  })
  @ApiQuery({
    name: 'departmentName',
    required: false,
    description: 'Filter by department name',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    type: Number,
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    description: 'Field to order by',
    type: String,
  })
  @ApiQuery({
    name: 'asc',
    required: false,
    description: 'Sort direction (asc/desc)',
    type: String,
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'List of domains',
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid parameter format',
  })
  async find(
    @Query(new ZodValidationPipe(FindDomainDto))
    query: FindDomainDto,
  ) {
    return this.service.list(query);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a domain' })
  @ApiParam({ name: 'id', description: 'Domain ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Updated Computer Science',
        },
        description: {
          type: 'string',
          example: 'Updated description for the domain',
          nullable: true,
        },
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Domain updated successfully',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Domain not found',
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or ID format',
  })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateDomainDto))
    dto: UpdateDomainDto,
    @Request() req: ReqWithRequester,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a domain' })
  @ApiParam({ name: 'id', description: 'Domain ID' })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Domain deleted successfully',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Domain not found',
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ID format',
  })
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
