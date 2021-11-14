import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { CurrentUserController } from './current-user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserRepository])],
  controllers: [UserController, CurrentUserController],
  providers: [UserService],
  exports: [TypeOrmModule],
})
export class UserModule {}
