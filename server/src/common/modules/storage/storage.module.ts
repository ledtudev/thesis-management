import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'src/common/config';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { StorageController } from './storage.controller';
import { StorageConfig, StorageService } from './storage.service';

@Global()
@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: config.privateKeySecret,
      signOptions: { expiresIn: config.expiresIn },
    }),
  ],
  controllers: [StorageController],
  providers: [
    {
      provide: StorageService,
      useFactory: (prisma: PrismaService) => {
        const storageConfig: Partial<StorageConfig> = {
          baseUploadDir: process.env.UPLOAD_DIR || 'uploads',
          baseUrl: process.env.BASE_URL || 'http://localhost:4000',
        };

        const configService = new ConfigService(
          storageConfig as Record<string, unknown>,
        );
        return new StorageService(prisma, configService);
      },
      inject: [PrismaService],
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
