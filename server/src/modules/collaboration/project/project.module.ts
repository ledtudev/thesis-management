import { Module } from '@nestjs/common';
import { ExcelModule } from 'src/common/modules/excel/excel.module';
import { ExcelService } from 'src/common/modules/excel/excel.service';
import { PrismaModule } from 'src/common/modules/prisma/prisma.module';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({
  imports: [PrismaModule, ExcelModule],
  controllers: [ProjectController],
  providers: [ProjectService, ExcelService],
})
export class ProjectModule {}
