import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { BaseConfigService } from './base-config.service';
import configuration from './configuration';
import { Environments } from './models';

const DefaultEnvironment = Environments.DEVELOPMENT;

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      envFilePath: `.env.${process.env.NODE_ENV || DefaultEnvironment}`,
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
  providers: [BaseConfigService],
  exports: [BaseConfigService],
})
export class BaseConfigModule {}
