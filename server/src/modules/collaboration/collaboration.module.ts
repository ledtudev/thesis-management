import { Module } from '@nestjs/common';
import { ProjectCommentModule } from './project-comment/project-comment.module';
import { ProjectModule } from './project/project.module';

import { ProposedProjectCommentModule } from './proposed-project-comment/proposed-project-comment.module';
import { ProposedProjectModule } from './proposed-project/proposed-project.module';

@Module({
  imports: [
    ProposedProjectModule,
    ProjectCommentModule,
    ProposedProjectCommentModule,
    ProjectModule,
  ],
  exports: [
    ProposedProjectModule,
    ProjectCommentModule,
    ProposedProjectCommentModule,
    ProjectModule,
  ],
})
export class CollaborationModule {}
