import { Module } from '@nestjs/common';

import { LecturerSelectionModule } from './lecturer-selection/lecturer-selection.module';
import { ProjectAllocationModule } from './project-allocation/project-allocation.module';
import { StudentSelectionModule } from './student-selection/student-selection.module';

@Module({
  imports: [
    StudentSelectionModule,
    LecturerSelectionModule,
    ProjectAllocationModule,
  ],
  exports: [
    StudentSelectionModule,
    LecturerSelectionModule,
    ProjectAllocationModule,
  ],
})
export class EnrollmentModule {}
