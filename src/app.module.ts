import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { BaseConfigModule, BaseConfigService } from './config';
import { AuthModule } from './auth/auth.module';
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
