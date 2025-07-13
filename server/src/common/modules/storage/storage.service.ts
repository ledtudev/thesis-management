import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileT, Prisma, UserT } from '@prisma/client';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Readable } from 'stream';
import { uuidv7 } from 'uuidv7';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateFileDto } from './schema';

export interface StorageConfig {
  baseUploadDir: string;
  baseUrl: string;
  maxFileSizes: {
    avatar: number;
    document: number;
  };
  allowedMimeTypes: {
    avatar: string[];
    document: string[];
  };
}

export interface FileUploadResult {
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  path: string;
  url: string;
}

export type StorageEntityType =
  | 'AVATAR'
  | 'PROJECT_REPORT'
  | 'PROPOSAL'
  | 'ATTACHMENT';

export interface FileUploadParams {
  file: Express.Multer.File;
  context: StorageContext;
  userId: string;
  userType: UserT;
  description?: string;
  metadata?: Record<string, any>;
}

export type StorageContext =
  | 'AVATAR'
  | 'PROPOSAL'
  | 'REPORT' // Consolidated report context
  | 'ATTACHMENT'; // Generic attachments

@Injectable()
export class StorageService {
  private readonly config: StorageConfig;
  private readonly directories: Record<StorageContext, string>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.config = {
      baseUploadDir: this.configService.get<string>('UPLOAD_DIR', 'uploads'),
      baseUrl: this.configService.get<string>(
        'APP_URL',
        'http://localhost:4000',
      ),
      maxFileSizes: {
        avatar: this.configService.get<number>(
          'MAX_AVATAR_SIZE',
          5 * 1024 * 1024,
        ), // 5MB
        document: this.configService.get<number>(
          'MAX_DOCUMENT_SIZE',
          20 * 1024 * 1024,
        ), // 20MB
      },
      allowedMimeTypes: {
        avatar: this.configService.get<string[]>('ALLOWED_AVATAR_TYPES', [
          'image/jpeg',
          'image/png',
        ]),
        document: this.configService.get<string[]>('ALLOWED_DOCUMENT_TYPES', [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ]),
      },
    };

    // Initialize directories
    this.directories = {
      AVATAR: path.join(this.config.baseUploadDir, 'avatars'),
      PROPOSAL: path.join(this.config.baseUploadDir, 'proposals'),
      REPORT: path.join(this.config.baseUploadDir, 'reports'),
      ATTACHMENT: path.join(this.config.baseUploadDir, 'attachments'),
    };

    this.initializeDirectories();
  }

  private async initializeDirectories(): Promise<void> {
    try {
      await Promise.all(
        Object.values(this.directories).map((dir) =>
          fs.mkdir(dir, { recursive: true }),
        ),
      );
      console.log('Upload directories initialized/verified.');
    } catch (error) {
      console.error('Failed to initialize directories:', error);
      // Depending on strategy, maybe throw, maybe just log
      throw new InternalServerErrorException(
        `Failed to initialize directories: ${error.message}`,
      );
    }
  }

  private generateUniqueFilename(originalName: string): string {
    const uniqueId = uuidv7();
    const extension = path.extname(originalName);
    const baseName = path
      .basename(originalName, extension)
      .substring(0, 50) // Limit basename length
      .replace(/[^a-zA-Z0-9-_]/g, '_'); // Sanitize
    return `${uniqueId}-${baseName}${extension}`;
  }

  private calculateChecksum(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  private mapMimeToFileT(mimeType: string): FileT {
    if (!mimeType) return FileT.OTHER;

    const type = mimeType.split('/')[0];
    const subtype = mimeType.split('/')[1];

    if (type === 'image') return FileT.IMAGE;
    if (type === 'video') return FileT.VIDEO;
    if (mimeType === 'application/pdf') return FileT.PDF;
    if (
      mimeType === 'application/msword' ||
      mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
      return FileT.WORD;
    if (
      mimeType === 'application/vnd.ms-powerpoint' ||
      mimeType ===
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    )
      return FileT.PRESENTATION;
    if (
      mimeType === 'application/vnd.ms-excel' ||
      mimeType ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
      return FileT.SPREADSHEET;
    if (
      mimeType.startsWith('text/') ||
      mimeType === 'application/json' ||
      mimeType === 'application/xml'
    )
      return FileT.CODE; // Broad category for code/text
    if (
      mimeType === 'application/zip' ||
      mimeType === 'application/x-rar-compressed' ||
      mimeType === 'application/gzip'
    )
      return FileT.CODE; // Often used for code/datasets
    if (mimeType === 'text/csv' || mimeType === 'application/vnd.ms-excel')
      return FileT.DATASET;

    // Add more specific mappings if needed

    return FileT.OTHER;
  }

  private validateFileSize(size: number, context: StorageContext): void {
    // Example: Different limits per context (customize as needed)
    let maxSize = this.config.maxFileSizes.document; // Default 20MB
    if (context === 'AVATAR') {
      maxSize = this.config.maxFileSizes.avatar; // 5MB for avatars
    }
    if (size > maxSize) {
      throw new BadRequestException(
        `File size exceeds limit of ${maxSize / (1024 * 1024)}MB for ${context}`,
      );
    }
  }

  async uploadFile(
    params: FileUploadParams,
  ): Promise<Prisma.FileGetPayload<{}>> {
    const { file, context, userId, userType, description, metadata } = params;

    if (!file || !file.buffer) {
      throw new BadRequestException('No file data received.');
    }

    this.validateFileSize(file.size, context);
    // Add mime type validation if needed, based on context

    const uploadDir = this.directories[context];
    if (!uploadDir) {
      throw new InternalServerErrorException(
        `Invalid storage context: ${context}`,
      );
    }

    const uniqueFileName = this.generateUniqueFilename(file.originalname);
    const relativeFilePath = path.join(context.toLowerCase(), uniqueFileName); // Store relative path
    const fullPhysicalPath = path.join(
      this.config.baseUploadDir,
      relativeFilePath,
    );

    try {
      await fs.mkdir(path.dirname(fullPhysicalPath), { recursive: true });
      await fs.writeFile(fullPhysicalPath, file.buffer);
      console.log(`File written successfully to: ${fullPhysicalPath}`);
    } catch (error) {
      console.error('Error writing file to disk:', error);
      throw new InternalServerErrorException('Failed to save file.');
    }

    const checksum = this.calculateChecksum(file.buffer);
    const fileType = this.mapMimeToFileT(file.mimetype);
    const isPublic = context === 'AVATAR'; // Example: only avatars are public by default
    console.log('bug', userId + userType);
    try {
      const dataToCreate: Prisma.FileCreateInput = {
        id: uuidv7(),
        fileName: uniqueFileName,
        originalName: file.originalname,
        filePath: relativeFilePath,
        fileType: fileType,
        mimeType: file.mimetype,
        fileSize: file.size,
        checksum: checksum,
        isPublic: isPublic,
        isArchived: false,
        metadata: metadata ? { ...metadata, description } : { description },
        ...(userType === UserT.STUDENT
          ? { UploadedByStudent: { connect: { id: userId } } }
          : {}),
        ...(userType === UserT.FACULTY
          ? { UploadedByFaculty: { connect: { id: userId } } }
          : {}),
      };
      const createdFile = await this.prisma.file.create({ data: dataToCreate });
      return createdFile;
    } catch (dbError) {
      console.error('Error saving file metadata to database:', dbError);
      try {
        await fs.unlink(fullPhysicalPath);
        console.log(`Cleaned up orphaned file: ${fullPhysicalPath}`);
      } catch (cleanupError) {
        console.error(
          `Failed to cleanup orphaned file ${fullPhysicalPath}:`,
          cleanupError,
        );
      }
      if (
        dbError instanceof Prisma.PrismaClientKnownRequestError &&
        dbError.code === 'P2003'
      ) {
        throw new BadRequestException(
          `Uploader ID (${userId}) not found for type ${userType}.`,
        );
      }
      throw new InternalServerErrorException('Failed to save file metadata.');
    }
  }

  async getFileInfo(fileId: string): Promise<Prisma.FileGetPayload<{}> | null> {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId, isArchived: false }, // Only get non-archived files
    });
    return file;
  }

  async getFileStream(
    fileId: string,
  ): Promise<{ stream: Readable; file: Prisma.FileGetPayload<{}> }> {
    console.log(`Getting file stream for fileId: ${fileId}`);

    const file = await this.getFileInfo(fileId);
    console.log(`File info retrieved:`, {
      found: !!file,
      id: file?.id,
      fileName: file?.fileName,
      filePath: file?.filePath,
      isArchived: file?.isArchived,
    });

    if (!file) {
      console.error(`File not found in database: ${fileId}`);
      throw new NotFoundException(
        `File with ID ${fileId} not found in database.`,
      );
    }

    if (file.isArchived) {
      console.error(`File is archived: ${fileId}`);
      throw new NotFoundException(
        `File with ID ${fileId} is archived and cannot be accessed.`,
      );
    }

    if (!file.filePath) {
      console.error(`File path is missing for file: ${fileId}`, {
        fileName: file.fileName,
        fileUrl: file.fileUrl,
      });
      throw new NotFoundException(
        `File path is missing for file ${fileId}. File may have been uploaded with an older system.`,
      );
    }

    const fullPhysicalPath = path.join(
      this.config.baseUploadDir,
      file.filePath,
    );

    console.log(`Checking physical file at: ${fullPhysicalPath}`);

    try {
      await fs.access(fullPhysicalPath);

      // Use createReadStream instead of reading entire file into buffer
      const stream = require('fs').createReadStream(fullPhysicalPath);

      // Update last accessed time (fire and forget)
      this.prisma.file
        .update({ where: { id: fileId }, data: { lastAccessed: new Date() } })
        .catch((err) => console.error('Failed to update lastAccessed:', err));

      console.log(`File stream created successfully for: ${fileId}`);
      return { stream, file };
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.error(
          `Physical file not found at path ${fullPhysicalPath} for file ${fileId}:`,
          error,
        );
        throw new NotFoundException(
          `Physical file not found on storage for file ${fileId}. Path: ${file.filePath}`,
        );
      } else {
        console.error(`Error accessing file at ${fullPhysicalPath}:`, error);
        throw new InternalServerErrorException(
          `Error accessing file storage for file ${fileId}: ${error.message}`,
        );
      }
    }
  }

  async softDeleteFile(
    fileId: string,
    userId: string,
    userType: UserT,
  ): Promise<Prisma.FileGetPayload<{}>> {
    const file = await this.prisma.file.findUnique({ where: { id: fileId } });

    if (!file) {
      throw new NotFoundException('File not found.');
    }

    // Permission check: Only original uploader can archive
    const isOwner =
      file.uploadedByStudentId === userId ||
      file.uploadedByFacultyId === userId;
    if (!isOwner) {
      throw new ForbiddenException(
        'You do not have permission to archive this file.',
      );
    }

    if (file.isArchived) {
      return file; // Already archived
    }

    try {
      const updatedFile = await this.prisma.file.update({
        where: { id: fileId },
        data: { isArchived: true },
      });
      console.log(`Archived file: ${fileId}`);

      // Note: Physical file is NOT deleted here.
      // Consider a separate cron job or process to delete archived physical files after a retention period.

      return updatedFile;
    } catch (error) {
      console.error(`Error archiving file ${fileId}:`, error);
      throw new InternalServerErrorException('Could not archive file.');
    }
  }

  async updateFileMetadata(
    fileId: string,
    updateData: UpdateFileDto,
    userId: string, // User ID performing the update
  ): Promise<Prisma.FileGetPayload<{}>> {
    const file = await this.prisma.file.findUnique({ where: { id: fileId } });

    if (!file || file.isArchived) {
      throw new NotFoundException('File not found or is archived.');
    }

    // Permission check: Only original uploader can update
    const isOwner =
      file.uploadedByStudentId === userId ||
      file.uploadedByFacultyId === userId;
    if (!isOwner) {
      throw new ForbiddenException(
        'You do not have permission to update this file metadata.',
      );
    }

    const dataToUpdate: Prisma.FileUpdateInput = {};
    if (updateData.isPublic !== undefined) {
      dataToUpdate.isPublic = updateData.isPublic;
    }
    if (updateData.description !== undefined) {
      const currentMetadata = (file.metadata || {}) as Record<string, any>;
      dataToUpdate.metadata = {
        ...currentMetadata,
        description: updateData.description,
      };
    }
    if (updateData.isArchived !== undefined) {
      dataToUpdate.isArchived = updateData.isArchived;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      throw new BadRequestException('No update data provided.');
    }

    try {
      const updatedFile = await this.prisma.file.update({
        where: { id: fileId },
        data: dataToUpdate,
      });
      console.log(`Updated metadata for file: ${fileId}`);
      return updatedFile;
    } catch (error) {
      console.error(`Error updating metadata for file ${fileId}:`, error);
      throw new InternalServerErrorException('Could not update file metadata.');
    }
  }

  /**
   * Get a file from the server
   * @param filename Filename to retrieve
   * @param entityType Type of entity
   * @returns Stream and file information
   */
  async getFile(
    filename: string,
    entityType: StorageEntityType,
  ): Promise<{
    stream: NodeJS.ReadableStream;
    filename: string;
    path: string;
  }> {
    const filePath = path.join(this.directories[entityType], filename);

    try {
      await fs.access(filePath);
      return {
        stream: require('fs').createReadStream(filePath),
        filename,
        path: filePath,
      };
    } catch {
      throw new NotFoundException('File not found');
    }
  }

  /**
   * Delete a file from the server
   * @param filename Filename to delete
   * @param entityType Type of entity
   * @param userId ID of the user performing the operation
   * @param userType Type of the user performing the operation
   */
  async deleteFile(
    filename: string,
    entityType: StorageEntityType,
    userId: string,
    userType: UserT,
  ): Promise<void> {
    const filePath = path.join(this.directories[entityType], filename);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new NotFoundException('File not found');
      }
      throw new BadRequestException(`Delete failed: ${error.message}`);
    }
  }
}
