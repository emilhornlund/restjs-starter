import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { CurrentUserController } from './current-user.controller';
import { UserAuthorityController, UserRoleController } from './controller';
import { UserAuthorityRepository, UserRoleRepository } from './repository';
import { UserAuthorityService, UserRoleService } from './service';

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
  exports: [TypeOrmModule],
})
export class UserModule {}
