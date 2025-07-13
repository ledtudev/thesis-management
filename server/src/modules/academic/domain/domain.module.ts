import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/modules/prisma/prisma.module';
import { DomainController } from './domain.controller';
import { DomainService } from './domain.service';

@Module({
  imports: [PrismaModule],
  providers: [DomainService],
  controllers: [DomainController],
})
export class DomainModule {}
