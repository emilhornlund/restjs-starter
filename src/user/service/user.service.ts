import { BadRequestException, Injectable } from '@nestjs/common';
import { Not } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { PageableDto } from '../../common/model';
import { UserDto } from './model/user-dto.interface';
import { UserRole } from './model/user-role.enum';
import { UserEntity, UserRepository } from '../repository';
import { UserNotFoundException } from './exception/user-not-found.exception';
import { UsernameUniqueConstraintException } from './exception/username-unique-constraint.exception';
import { EmailUniqueConstraintException } from './exception/email-unique-constraint.exception';
import { UserNotFoundByUsernameOrPasswordException } from './exception/user-not-found-by-username-or-password.exception';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Get a single user by id.
   *
   * @param userId The user's id
   */
  public async getUser(userId: string): Promise<UserDto> {
    const userEntity = await this.getUserEntityByIdOrThrow(userId);
    return UserService.toUserDto(userEntity);
  }

  /**
   * Get a single user by username or email.
   *
   * @param usernameOrEmail The user's username or email
   */
  public async getUserByUsernameOrEmail(
    usernameOrEmail: string,
  ): Promise<UserDto> {
    const userEntity = await this.getUserEntityByUsernameOrPasswordOrThrow(
      usernameOrEmail,
    );
    return UserService.toUserDto(userEntity);
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
  ): Promise<PageableDto<UserDto>> {
    const pageOffset = pageNumber * pageSize;
    const [users, totalElements] = await this.userRepository.findAndCount({
      skip: pageOffset,
      take: pageSize,
    });

    return {
      content: users.map(UserService.toUserDto),
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
   * @param role The user's role
   */
  public async createUser(
    username: string,
    password: string,
    email: string,
    role: UserRole = UserRole.REGULAR_USER,
  ): Promise<UserDto> {
    await this.verifyUsernameUnique(username);
    await this.verifyEmailUnique(email);

    const entity = this.userRepository.create();
    entity.username = username;
    entity.password = await bcrypt.hash(password, 10);
    entity.email = email;
    entity.role = role;

    const savedEntity = await this.userRepository.save(entity);
    return UserService.toUserDto(savedEntity);
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

    const savedEntity = await this.userRepository.save(userEntity);
    return UserService.toUserDto(savedEntity);
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

    await this.userRepository.save(userEntity);
  }

  /**
   * Delete an existing user by id
   *
   * @param userId The user's id
   */
  public async deleteUser(userId: string): Promise<void> {
    const userEntity = await this.getUserEntityByIdOrThrow(userId);
    await this.userRepository.remove(userEntity);
  }

  /**
   * Get a user's hashed password.
   *
   * @param usernameOrEmail The user's username or email
   */
  public async getPasswordHash(usernameOrEmail: string): Promise<string> {
    const userEntity = await this.getUserEntityByUsernameOrPasswordOrThrow(
      usernameOrEmail,
    );
    return userEntity.password;
  }

  /**
   * Get a user entity by id or else throw exception.
   *
   * @param userId The user's id
   */
  private async getUserEntityByIdOrThrow(userId: string): Promise<UserEntity> {
    const userEntity = await this.userRepository.findOne(userId);
    if (!userEntity) {
      throw new UserNotFoundException(userId);
    }
    return userEntity;
  }

  /**
   * Get a user entity by username or email or else throw UserNotFoundByUsernameOrPasswordException.
   *
   * @param usernameOrEmail The user's username or email
   * @private
   */
  private async getUserEntityByUsernameOrPasswordOrThrow(
    usernameOrEmail: string,
  ): Promise<UserEntity> {
    const userEntity = await this.userRepository.findOne({
      where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });
    if (!userEntity) {
      throw new UserNotFoundByUsernameOrPasswordException(usernameOrEmail);
    }
    return userEntity;
  }

  /**
   * Verifies that the user's username is unique to all except current user.
   *
   * @param username The user's username
   * @param userId The user's id
   * @private
   */
  private async verifyUsernameUnique(username: string, userId?: string) {
    const userEntity = await this.userRepository.findOne({
      where: userId ? { id: Not(userId), username } : { username },
    });
    if (userEntity) {
      throw new UsernameUniqueConstraintException();
    }
  }

  /**
   * Verifies that the user's email is unique to all except current user.
   *
   * @param email The user's email
   * @param userId The user's id
   * @private
   */
  private async verifyEmailUnique(email: string, userId?: string) {
    const userEntity = await this.userRepository.findOne({
      where: userId ? { id: Not(userId), email } : { email },
    });
    if (userEntity) {
      throw new EmailUniqueConstraintException();
    }
  }

  /**
   * Convert an instance of a UserEntity to UserDto.
   *
   * @param userEntity The UserEntity instance
   */
  static toUserDto = (userEntity: UserEntity): UserDto => ({
    id: userEntity.id,
    username: userEntity.username,
    email: userEntity.email,
    role: userEntity.role,
    createdAt: userEntity.createdAt,
    updatedAt: userEntity.updatedAt,
  });
}
