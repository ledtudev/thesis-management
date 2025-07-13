import { Module } from '@nestjs/common';
import { ProjectCommentController } from './project-comment.controller';
import { ProjectCommentService } from './project-comment.service';
import { PrismaModule } from 'src/common/modules/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectCommentController],
  providers: [ProjectCommentService],
  exports: [ProjectCommentService],
})
export class ProjectCommentModule {}
