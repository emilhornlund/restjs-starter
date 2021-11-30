import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrentUserController } from './controller/current-user.controller';
import { UserAuthorityController, UserRoleController } from './controller';
import {
  UserAuthorityRepository,
  UserRepository,
  UserRoleRepository,
} from './repository';
import { UserAuthorityService, UserRoleService, UserService } from './service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserRepository,
      UserRoleRepository,
      UserAuthorityRepository,
    ]),
  ],
  controllers: [
    UserController,
    CurrentUserController,
    UserRoleController,
    UserAuthorityController,
  ],
  providers: [UserService, UserRoleService, UserAuthorityService],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
