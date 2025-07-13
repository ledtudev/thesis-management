import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StorageModule } from './common/modules/storage/storage.module';
import { DomainModule } from './modules/academic/domain/domain.module';
import { FieldPoolModule } from './modules/academic/field-pool/field-pool.module';
import { AuthModule } from './modules/auth/auth.module';
import { CollaborationModule } from './modules/collaboration/collaboration.module';
import { EnrollmentModule } from './modules/enrollment/entrollment.module';
import { DefenseModule } from './modules/grading/defense/defense.module';
import { EvaluationModule } from './modules/grading/evaluation/evaluation.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    CollaborationModule,
    EnrollmentModule,
    DomainModule,
    StorageModule,
    UserModule,
    FieldPoolModule,
    EvaluationModule,
    DefenseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
