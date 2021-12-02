import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { CommonModule } from '../common/common.module';
import { ConfigService } from '../common/service';
import { UserModule } from '../user/user.module';
import { AuthController, JwtGuard, UserAuthorityGuard } from './controller';
import { AuthService } from './service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [CommonModule],
      useFactory: async (configService: ConfigService) =>
        await configService.jwtModuleOptions,
      inject: [ConfigService],
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
