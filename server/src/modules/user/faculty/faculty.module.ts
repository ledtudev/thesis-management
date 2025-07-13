import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/common/modules/prisma/prisma.module';
import { FacultyController } from './faculty.controller';
import { FacultyService } from './faculty.service';

@Module({
  imports: [PrismaModule],
  providers: [FacultyService],
  controllers: [FacultyController],
  exports: [FacultyService],
})
export class FacultyModule {}
