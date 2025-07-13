import { Module } from '@nestjs/common';
import { DomainModule } from './domain/domain.module';
import { FieldPoolModule } from './field-pool/field-pool.module';

@Module({
  imports: [FieldPoolModule, DomainModule],
  providers: [FieldPoolModule, DomainModule],
})
export class AcademicModule {}
