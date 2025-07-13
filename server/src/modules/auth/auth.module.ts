import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ZodValidationPipe } from 'nestjs-zod';
import { config } from 'src/common/config';
import { PrismaModule } from 'src/common/modules/prisma/prisma.module';
import { FacultyModule } from '../user/faculty/faculty.module';
import { StudentModule } from '../user/student/student.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { PermissionGuard } from './permission.guard';
import { RefreshTokenStrategy } from './refresh-token.strategy';
@Module({
  imports: [
    FacultyModule,
    StudentModule,
    PassportModule,
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        secret: config.privateKeySecret,
        signOptions: { expiresIn: config.expiresIn },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenStrategy,
    PermissionGuard,
    JwtAuthGuard,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
  exports: [AuthService, JwtModule, PermissionGuard, JwtAuthGuard],
})
export class AuthModule {}
