import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { BaseConfigModule, BaseConfigService } from '../config';
import { UserModule } from '../user';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard, UserAuthorityGuard } from './guards';

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
