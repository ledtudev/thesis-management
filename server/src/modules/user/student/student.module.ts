import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/modules/prisma/prisma.module';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
@Module({
  imports: [PrismaModule],
  providers: [StudentService],
  controllers: [StudentController],
  exports: [StudentService],
})
export class StudentModule {}
