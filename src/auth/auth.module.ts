import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { BaseConfigModule } from '../config/base-config.module';
import { BaseConfigService } from '../config/service';
import { UserModule } from '../user/user.module';
import { AuthController, JwtGuard, UserAuthorityGuard } from './controller';
import { AuthService } from './service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [BaseConfigModule],
      useFactory: async (configService: BaseConfigService) =>
        await configService.jwtModuleOptions,
      inject: [BaseConfigService],
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: UserAuthorityGuard,
    },
    AuthService,
  ],
})
export class AuthModule {}
