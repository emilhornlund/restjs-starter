import { BadRequestException, Injectable } from '@nestjs/common';
import { Not } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { PagedUserDto, UserDto, UserEntity } from './models';
import { UserRepository } from './user.repository';
import {
  EmailUniqueConstraintException,
  UsernameUniqueConstraintException,
  UserNotFoundException,
} from './exceptions';
import { UserConverter } from './converters';

@Injectable()
export class UserService {
  constructor(private usersRepository: UserRepository) {}

  /**
   * Get a single user by id.
   *
   * @param userId The user's id
   */
  public async getUser(userId: string): Promise<UserDto> {
    const userEntity = await this.getUserEntityByIdOrThrow(userId);
    return UserConverter.convertToUserDto(userEntity);
  }

  /**
   * Get a single page containing a subset of all users in the system.
   *
   * @param pageNumber The number of the page
   * @param pageSize The size of the page
   */
  public async getUsers(
    pageNumber: number,
    pageSize: number,
  ): Promise<PagedUserDto> {
    const pageOffset = pageNumber * pageSize;
    const [users, totalElements] = await this.usersRepository.findAndCount({
      skip: pageOffset,
      take: pageSize,
    });

    return {
      users: users.map(UserConverter.convertToUserDto),
      page: {
        number: pageNumber,
        size: pageSize,
        totalPages: Math.ceil(totalElements / pageSize),
        totalElements,
      },
    };
  }

  /**
   * Create a new user.
   *
   * @param username The user's username
   * @param password The user's password
   * @param email The user's email
   */
  public async createUser(
    username: string,
    password: string,
    email: string,
  ): Promise<UserDto> {
    await this.verifyUsernameUnique(username);
    await this.verifyEmailUnique(email);

    const entity = this.usersRepository.create();
    entity.username = username;
    entity.password = await bcrypt.hash(password, 10);
    entity.email = email;

    const savedEntity = await this.usersRepository.save(entity);
    return UserConverter.convertToUserDto(savedEntity);
  }

  /**
   * Update an existing user.
   *
   * @param userId The user's id
   * @param username The user's username
   * @param email The user's email
   */
  public async updateUser(
    userId: string,
    username: string,
    email: string,
  ): Promise<UserDto> {
    await this.verifyUsernameUnique(username, userId);
    await this.verifyEmailUnique(email, userId);

    const userEntity = await this.getUserEntityByIdOrThrow(userId);
    userEntity.username = username;
    userEntity.email = email;

    const savedEntity = await this.usersRepository.save(userEntity);
    return UserConverter.convertToUserDto(savedEntity);
  }

  /**
   * Update an existing user's password.
   *
   * Verifies the user's old password before updating the password.
   *
   * @param userId The user's id
   * @param oldPassword The user's old password
   * @param newPassword The user's new password
   */
  public async updateUserPassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const userEntity = await this.getUserEntityByIdOrThrow(userId);

    const isMatch = await bcrypt.compare(oldPassword, userEntity.password);
    if (!isMatch) {
      throw new BadRequestException('Incorrect old password');
    }

    userEntity.password = await bcrypt.hash(newPassword, 10);

    await this.usersRepository.save(userEntity);
  }

  /**
   * Delete an existing user by id
   *
   * @param userId The user's id
   */
  public async deleteUser(userId: string): Promise<void> {
    const userEntity = await this.getUserEntityByIdOrThrow(userId);
    await this.usersRepository.remove(userEntity);
  }

  /**
   * Get a user entity by id or else throw exception.
   *
   * @param userId The user's id
   */
  private async getUserEntityByIdOrThrow(userId: string): Promise<UserEntity> {
    const userEntity = await this.usersRepository.findOne(userId);
    if (!userEntity) {
      throw new UserNotFoundException(userId);
    }
    return userEntity;
  }

  /**
   *
   * @param username
   * @param userId
   * @private
   */
  private async verifyUsernameUnique(username: string, userId?: string) {
    const userEntity = await this.usersRepository.findOne({
      where: userId ? { id: Not(userId), username } : { username },
    });
    if (userEntity) {
      throw new UsernameUniqueConstraintException();
    }
  }

  /**
   *
   * @param email
   * @param userId
   * @private
   */
  private async verifyEmailUnique(email: string, userId?: string) {
    const userEntity = await this.usersRepository.findOne({
      where: userId ? { id: Not(userId), email } : { email },
    });
    if (userEntity) {
      throw new EmailUniqueConstraintException();
    }
  }
}
