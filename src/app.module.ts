import { Module } from '@nestjs/common';
import { BaseConfigModule, BaseConfigService } from './config';
import { AuthModule } from './auth';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    CommonModule,
    BaseConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [BaseConfigModule],
      useFactory: async (configService: BaseConfigService) =>
        await configService.typeOrmModuleOptions,
      inject: [BaseConfigService],
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
  exports: [CommonModule],
})
export class AppModule {}
