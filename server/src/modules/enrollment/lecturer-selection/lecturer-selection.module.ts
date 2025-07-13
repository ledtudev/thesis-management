import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/modules/prisma/prisma.module';
import { LecturerSelectionController } from './lecturer-selection.controller';
import { LecturerSelectionService } from './lecturer-selection.service';

@Module({
  imports: [PrismaModule],
  providers: [LecturerSelectionService],
  controllers: [LecturerSelectionController],
  exports: [LecturerSelectionService],
})
export class LecturerSelectionModule {}
