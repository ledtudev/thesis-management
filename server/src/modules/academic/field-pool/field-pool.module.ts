import { Module } from '@nestjs/common';
import { FieldPoolController } from './field-pool.controller';
import { FieldPoolService } from './field-pool.service';
import { PrismaModule } from 'src/common/modules/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FieldPoolController],
  providers: [FieldPoolService],
})
export class FieldPoolModule {}
