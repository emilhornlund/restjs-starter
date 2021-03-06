import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './common/service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

(async () => {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const config = await app.get<ConfigService>(ConfigService);

  applySwaggerConfig(app);

  await app.listen(config.http.port);
})();

const applySwaggerConfig = (app: INestApplication) => {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('RESTJS Starter')
    .setDescription('The RESTJS Starter API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Me', 'Current user endpoints')
    .addTag('Users', 'Users endpoints')
    .addTag('User Roles', 'User roles endpoints')
    .addTag('User Authorities', 'User authorities endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api_docs', app, document);
};
