import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/modules/prisma/prisma.module';
import { LecturerSelectionModule } from '../lecturer-selection/lecturer-selection.module';
import { StudentSelectionModule } from '../student-selection/student-selection.module';
import { ProjectAllocationController } from './project-allocation.controller';
import { ProjectAllocationService } from './project-allocation.service';

@Module({
  imports: [PrismaModule, StudentSelectionModule, LecturerSelectionModule],
  providers: [ProjectAllocationService],
  controllers: [ProjectAllocationController],
  exports: [ProjectAllocationService],
})
export class ProjectAllocationModule {}
