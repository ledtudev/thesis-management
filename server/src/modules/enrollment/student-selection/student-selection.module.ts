import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/modules/prisma/prisma.module';
import { StudentSelectionController } from './student-selection.controller';
import { StudentSelectionService } from './student-selection.service';

@Module({
  imports: [PrismaModule],
  controllers: [StudentSelectionController],
  providers: [StudentSelectionService],
  exports: [StudentSelectionService],
})
export class StudentSelectionModule {}
