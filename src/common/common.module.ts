import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import * as Joi from 'joi';
import { HttpExceptionFilter } from './filter';
import { ValidationPipe } from './pipe';
import { ConfigService, Environments } from './service';

const DefaultEnvironment = Environments.DEVELOPMENT;

const configuration = () => ({
  env: process.env.NODE_ENV,
  http: {
    port: parseInt(process.env.HTTP_PORT, 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    publicKey: process.env.JWT_PUBLIC_KEY,
    privateKey: process.env.JWT_PRIVATE_KEY,
  },
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: process.env.DB_SYNCHRONIZE,
  },
});

@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [configuration],
      envFilePath: [
        '.env',
        `.env.${process.env.NODE_ENV || DefaultEnvironment}`,
      ],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid(...Object.values(Environments))
          .default(DefaultEnvironment),
        HTTP_PORT: Joi.number().default(8080),
        JWT_SECRET: Joi.string(),
        JWT_PUBLIC_KEY: Joi.string(),
        JWT_PRIVATE_KEY: Joi.string(),
        DB_HOST: Joi.string(),
        DB_PORT: Joi.number().default(5432),
        DB_USERNAME: Joi.string(),
        DB_PASSWORD: Joi.string(),
        DB_DATABASE: Joi.string(),
        DB_SYNCHRONIZE: Joi.bool().default(false),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    ConfigService,
  ],
  exports: [ConfigService],
})
export class CommonModule {}
