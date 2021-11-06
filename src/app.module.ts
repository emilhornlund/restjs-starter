import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
