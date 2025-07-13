import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/modules/prisma/prisma.module';
import { ProposedProjectCommentController } from './proposed-project-comment.controller';
import { ProposedProjectCommentService } from './proposed-project-comment.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProposedProjectCommentController],
  providers: [ProposedProjectCommentService],
  exports: [ProposedProjectCommentService],
})
export class ProposedProjectCommentModule {}
