import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/modules/prisma/prisma.module';
import { DefenseService } from './defense.service';
import { DefenseController } from './defense.controller';

@Module({
  imports: [PrismaModule],
  providers: [DefenseService],
  controllers: [DefenseController],
  exports: [DefenseService],
})
export class DefenseModule {}
