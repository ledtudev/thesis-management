import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/modules/prisma/prisma.module';
import { ProposedProjectController } from './proposed-project.controller';
import { ProposedProjectService } from './proposed-project.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProposedProjectController],
  providers: [ProposedProjectService],
  exports: [ProposedProjectService],
})
export class ProposedProjectModule {}
