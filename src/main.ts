import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BaseConfigService } from './config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

(async () => {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const config = await app.get<BaseConfigService>(BaseConfigService);

  applySwaggerConfig(app);

  await app.listen(config.http.port);
})();

const applySwaggerConfig = (app: INestApplication) => {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('File Buddy Service')
    .setDescription('The File Buddy Service API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Me', 'Current user endpoints')
    .addTag('Users', 'Users endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api_docs', app, document);
};
