import {
  PagedUserDto,
  PagedUserResponse,
  UserDto,
  UserEntity,
  UserResponse,
} from '../models';

export class UserConverter {
  static convertToUserDto = (userEntity: UserEntity): UserDto => ({
    id: userEntity.id,
    username: userEntity.username,
    email: userEntity.email,
    createdAt: userEntity.createdAt,
    updatedAt: userEntity.updatedAt,
  });

  static convertToUserResponse = (userDto: UserDto): UserResponse => ({
    id: userDto.id,
    username: userDto.username,
    email: userDto.email,
    createdAt: userDto.createdAt,
    updatedAt: userDto.updatedAt,
  });

  static convertToPagedUserResponse = (
    pagedUserDto: PagedUserDto,
  ): PagedUserResponse => ({
    users: pagedUserDto.users.map(UserConverter.convertToUserResponse),
    page: pagedUserDto.page,
  });
}
