import { Module } from '@nestjs/common';
import { BaseConfigModule, BaseConfigService } from './config';
import { AuthModule } from './auth';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    BaseConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [BaseConfigModule],
      useFactory: async (configService: BaseConfigService) =>
        await configService.typeOrmModuleOptions,
      inject: [BaseConfigService],
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
