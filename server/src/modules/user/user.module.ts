import { Module } from '@nestjs/common';
import { FacultyModule } from './faculty/faculty.module';
import { StudentModule } from './student/student.module';

@Module({
  imports: [StudentModule, FacultyModule],
  exports: [StudentModule, FacultyModule],
})
export class UserModule {}
