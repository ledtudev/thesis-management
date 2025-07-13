import { Module } from '@nestjs/common';
import { ExcelModule } from 'src/common/modules/excel/excel.module';
import { ExcelService } from 'src/common/modules/excel/excel.service';
import { PrismaModule } from 'src/common/modules/prisma/prisma.module';
import { EvaluationController } from './evaluation.controller';
import { EvaluationService } from './evaluation.service';

@Module({
  imports: [PrismaModule, ExcelModule],
  controllers: [EvaluationController],
  providers: [EvaluationService, ExcelService],
  exports: [EvaluationService],
})
export class EvaluationModule {}
