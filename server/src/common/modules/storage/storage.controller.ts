import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Prisma, UserT } from '@prisma/client';
import { Response } from 'express';
import { config } from 'src/common/config';
import { ReqWithRequester } from 'src/common/interface';
import { generateApiResponse } from 'src/common/response';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { FileResponseDto, UpdateFileDto, UploadFileDto } from './schema';
import { StorageContext, StorageService } from './storage.service';

@ApiTags('Storage')
@Controller('storage')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('upload/:context')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Upload a file based on context (Avatar, Proposal, Report, Attachment)',
  })
  @ApiParam({
    name: 'context',
    enum: ['AVATAR', 'PROPOSAL', 'REPORT', 'ATTACHMENT'],
    description:
      'The context determines storage path and potential validation rules.',
    required: true,
  })
  @ApiBody({
    description:
      'Multipart form data containing the file and optional description.',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The file to upload.',
        },
        description: {
          type: 'string',
          description: 'Optional description for the file.',
          nullable: true,
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'File uploaded successfully and metadata record created.',
    type: FileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Bad Request: Invalid context, missing file, file too large, invalid uploader ID, or invalid data.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized: Missing or invalid access token.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal Server Error: Failed to save file or metadata.',
  })
  async uploadFile(
    @Param('context') contextParam: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadFileDto,
    @Request() req: ReqWithRequester,
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException(
        'No file part detected in the multipart request.',
      );
    }

    const context = contextParam.toUpperCase() as StorageContext;
    if (!['AVATAR', 'PROPOSAL', 'REPORT', 'ATTACHMENT'].includes(context)) {
      throw new BadRequestException(
        `Invalid upload context provided: ${contextParam}`,
      );
    }
    const createdFile = await this.storageService.uploadFile({
      file,
      context,
      userId: req.requester.id,
      userType: req.requester.userType as UserT,
      description: body.description,
    });

    return generateApiResponse(
      'thành công',
      await this.mapFileToFileResponseDto(createdFile),
    );
  }

  @Get('download/:fileId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Download a file' })
  // @ApiParam({
  //   name: 'fileId',
  //   type: 'string',
  //   format: 'uuid',
  //   description: 'The UUID of the file to download.',
  //   required: true,
  // })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File stream successfully retrieved.',
    content: { 'application/octet-stream': {} },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found: File not found, archived, or path missing.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden: Access denied.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal Server Error while processing download.',
  })
  async downloadFile(
    @Param('fileId', ParseUUIDPipe) fileId: string,
    @Res() res: Response,
  ) {
    try {
      const { stream, file } = await this.storageService.getFileStream(fileId);

      res.setHeader(
        'Content-Type',
        file.mimeType || 'application/octet-stream',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(file.originalName)}"`,
      );
      if (file.fileSize) {
        res.setHeader('Content-Length', file.fileSize.toString());
      }

      // Pipe the stream to response instead of returning it
      stream.pipe(res);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error(`Download error for file ${fileId}:`, error);
      throw new InternalServerErrorException('Error processing file download.');
    }
  }

  @Get('view/:fileId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'View a file inline (for PDF preview)' })
  @ApiParam({
    name: 'fileId',
    type: 'string',
    format: 'uuid',
    description: 'The UUID of the file to view.',
    required: true,
  })
  @ApiQuery({
    name: 'token',
    type: 'string',
    description: 'JWT token for authentication',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File stream successfully retrieved for inline viewing.',
    content: { 'application/octet-stream': {} },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found: File not found, archived, or path missing.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden: Access denied.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal Server Error while processing file view.',
  })
  async viewFile(
    @Param('fileId', ParseUUIDPipe) fileId: string,
    @Query('token') token: string,
    @Res() res: Response,
    @Request() req: ReqWithRequester,
  ) {
    try {
      // If token is provided in query, validate it
      if (token) {
        try {
          const payload = await this.jwtService.verifyAsync(token, {
            secret: config.privateKeySecret,
          });

          if (!payload?.id || !payload?.userType) {
            throw new UnauthorizedException('Invalid token payload');
          }

          // Set the requester for authorization
          req.requester = {
            id: payload.id,
            userType: payload.userType,
            roles: payload.userType === 'STUDENT' ? ['STUDENT'] : ['FACULTY'],
            permissions: [],
            facultyId: undefined,
          };
        } catch (error) {
          throw new UnauthorizedException('Invalid or expired token');
        }
      }
      // If no token in query, the request should already be authenticated via header

      const { stream, file } = await this.storageService.getFileStream(fileId);

      res.setHeader(
        'Content-Type',
        file.mimeType || 'application/octet-stream',
      );
      // Use inline disposition for viewing instead of attachment
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${encodeURIComponent(file.originalName)}"`,
      );
      if (file.fileSize) {
        res.setHeader('Content-Length', file.fileSize.toString());
      }

      // Pipe the stream to response instead of returning it
      stream.pipe(res);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      console.error(`View error for file ${fileId}:`, error);
      throw new InternalServerErrorException('Error processing file view.');
    }
  }

  @Get('info/:fileId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get file metadata' })
  @ApiParam({
    name: 'fileId',
    type: 'string',
    format: 'uuid',
    description: 'The UUID of the file.',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File metadata retrieved successfully.',
    type: FileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found: File not found or archived.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden: Access denied.',
  })
  async getFileInfo(
    @Param('fileId', ParseUUIDPipe) fileId: string,
  ): Promise<any> {
    const file = await this.storageService.getFileInfo(fileId);
    if (!file) {
      throw new NotFoundException(
        `File with ID ${fileId} not found or has been archived.`,
      );
    }
    return generateApiResponse(
      'thành công',
      this.mapFileToFileResponseDto(file),
    );
  }

  @Delete(':fileId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive (soft delete) a file' })
  @ApiParam({
    name: 'fileId',
    type: 'string',
    format: 'uuid',
    description: 'The UUID of the file to archive.',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File archived successfully.',
    type: FileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found: File not found.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'Forbidden: User does not have permission to archive this file.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal Server Error while archiving.',
  })
  async softDeleteFile(
    @Param('fileId', ParseUUIDPipe) fileId: string,
    @Request() req: ReqWithRequester,
  ): Promise<any> {
    const archivedFile = await this.storageService.softDeleteFile(
      fileId,
      req.requester.id,
      req.requester.userType as UserT,
    );
    return generateApiResponse(
      'thành công',
      this.mapFileToFileResponseDto(archivedFile),
    );
  }

  @Patch(':fileId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update file metadata (e.g., description, isPublic)',
  })
  @ApiParam({
    name: 'fileId',
    type: 'string',
    format: 'uuid',
    description: 'The UUID of the file to update.',
    required: true,
  })
  @ApiBody({ type: UpdateFileDto, description: 'Fields to update.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File metadata updated successfully.',
    type: FileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request: No valid update data provided.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found: File not found or archived.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'Forbidden: User does not have permission to update this file.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal Server Error while updating metadata.',
  })
  async updateFileMetadata(
    @Param('fileId', ParseUUIDPipe) fileId: string,
    @Body() updateData: UpdateFileDto,
    @Request() req: ReqWithRequester,
  ): Promise<any> {
    const updatedFile = await this.storageService.updateFileMetadata(
      fileId,
      updateData,
      req.requester.id,
    );
    return generateApiResponse(
      'thành công',
      this.mapFileToFileResponseDto(updatedFile),
    );
  }

  @Get('debug/:fileId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Debug file information' })
  @ApiParam({
    name: 'fileId',
    type: 'string',
    format: 'uuid',
    description: 'The UUID of the file to debug.',
    required: true,
  })
  async debugFile(
    @Param('fileId', ParseUUIDPipe) fileId: string,
  ): Promise<any> {
    try {
      const file = await this.storageService.getFileInfo(fileId);

      if (!file) {
        return generateApiResponse('File not found in database', {
          fileId,
          found: false,
          reason: 'File record does not exist in database',
        });
      }

      const debugInfo = {
        fileId: file.id,
        fileName: file.fileName,
        originalName: file.originalName,
        filePath: file.filePath,
        fileUrl: file.fileUrl,
        isArchived: file.isArchived,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        uploadedAt: file.uploadedAt,
        uploadedByStudentId: file.uploadedByStudentId,
        uploadedByFacultyId: file.uploadedByFacultyId,
      };

      // Check if physical file exists
      let physicalFileExists = false;
      let physicalFilePath = null;

      if (file.filePath) {
        const path = require('path');
        const fs = require('fs').promises;
        physicalFilePath = path.join(
          this.storageService['config'].baseUploadDir,
          file.filePath,
        );

        try {
          await fs.access(physicalFilePath);
          physicalFileExists = true;
        } catch (error) {
          physicalFileExists = false;
        }
      }

      return generateApiResponse('Debug info retrieved', {
        ...debugInfo,
        physicalFileExists,
        physicalFilePath,
        issues: [
          ...(file.isArchived ? ['File is archived'] : []),
          ...(!file.filePath ? ['File path is missing'] : []),
          ...(!physicalFileExists && file.filePath
            ? ['Physical file does not exist']
            : []),
        ],
      });
    } catch (error) {
      console.error(`Debug error for file ${fileId}:`, error);
      return generateApiResponse('Debug failed', {
        fileId,
        error: error.message,
      });
    }
  }

  private mapFileToFileResponseDto(
    file: Prisma.FileGetPayload<{}>,
  ): FileResponseDto {
    return {
      id: file.id,
      fileName: file.fileName,
      originalName: file.originalName,
      filePath: file.filePath ?? null,
      fileType: file.fileType,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
      checksum: file.checksum ?? null,
      uploadedByStudentId: file.uploadedByStudentId,
      uploadedByFacultyId: file.uploadedByFacultyId,
      uploadedAt: file.uploadedAt,
      lastAccessed: file.lastAccessed,
      isPublic: file.isPublic,
      isArchived: file.isArchived,
      metadata: file.metadata as Record<string, any> | null,
    };
  }
}
