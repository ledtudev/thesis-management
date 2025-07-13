import { Module } from '@nestjs/common';
import { ExcelModule } from 'src/common/modules/excel/excel.module';
import { PrismaModule } from 'src/common/modules/prisma/prisma.module';
import { DefenseController } from './defense/defense.controller';
import { EvaluationController } from './evaluation/evaluation.controller';

@Module({
  imports: [PrismaModule, ExcelModule],
  controllers: [EvaluationController, DefenseController],
})
export class EvaluationModule {}
