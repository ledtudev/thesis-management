import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { config, swaggerConfig } from './common/config';
import { HttpExceptionFilter } from './exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global filter for handling exceptions
  app.useGlobalFilters(new HttpExceptionFilter());

  // Increase file upload size limit (50MB)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Set up Swagger
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  // Enable CORS
  app.enableCors();

  // Handle uncaught errors to prevent server crash
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  // Start the application
  await app.listen(config.port);
  console.log(`
  ------------------------------------------------------------
  🎉🎉🎉 Application is running successfully! 🎉🎉🎉
  🚀 You can access it at: http://localhost:${config.port}/api 🚀
  ------------------------------------------------------------
  `);
}

// Call bootstrap and handle errors if any
bootstrap().catch((err) => console.error('Bootstrap failed:', err));
