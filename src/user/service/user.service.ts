import { BadRequestException, Injectable } from '@nestjs/common';
import { Not } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { PageableDto, PageResultDto } from '../../common/model';
import { UserDto } from './model/user-dto.interface';
import { UserRole } from './model/user-role.enum';
import { UserEntity, UserRepository } from '../repository';
import { UserNotFoundException } from './exception/user-not-found.exception';
import { UsernameUniqueConstraintException } from './exception/username-unique-constraint.exception';
import { EmailUniqueConstraintException } from './exception/email-unique-constraint.exception';
import { UserNotFoundByUsernameOrPasswordException } from './exception/user-not-found-by-username-or-password.exception';
import { CreateUserDto } from './model/create-user.dto';
import { UpdateUserDto } from './model/update-user.dto';
import { UpdateUserPasswordDto } from './model/update-user-password.dto';

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
   * @param pageableDto The page information to fetch
   */
  public async getUsers(
    pageableDto: PageableDto,
  ): Promise<PageResultDto<UserDto>> {
    const pageOffset = pageableDto.number * pageableDto.size;
    const [users, totalElements] = await this.userRepository.findAndCount({
      skip: pageOffset,
      take: pageableDto.size,
      order: { username: 'ASC' },
    });

    return {
      content: users.map(UserService.toUserDto),
      page: {
        number: pageableDto.number,
        size: pageableDto.size,
        totalPages: Math.ceil(totalElements / pageableDto.size),
        totalElements,
      },
    };
  }

  /**
   * Create a new user.
   *
   * @param createUserDto Contains new details about a new user
   */
  public async createUser(createUserDto: CreateUserDto): Promise<UserDto> {
    await this.verifyUsernameUnique(createUserDto.username);
    await this.verifyEmailUnique(createUserDto.email);

    const entity = this.userRepository.create({
      username: createUserDto.username,
      password: await bcrypt.hash(createUserDto.password, 10),
      email: createUserDto.email,
      role: createUserDto.role ?? UserRole.REGULAR_USER,
    });

    const savedEntity = await this.userRepository.save(entity);
    return UserService.toUserDto(savedEntity);
  }

  /**
   * Update an existing user.
   *
   * @param userId The user's id
   * @param updateUserDto Contains new details about an existing user
   */
  public async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    await this.verifyUsernameUnique(updateUserDto.username, userId);
    await this.verifyEmailUnique(updateUserDto.email, userId);

    const userEntity = await this.getUserEntityByIdOrThrow(userId);
    userEntity.username = updateUserDto.username;
    userEntity.email = updateUserDto.email;

    const savedEntity = await this.userRepository.save(userEntity);
    return UserService.toUserDto(savedEntity);
  }

  /**
   * Update an existing user's password.
   *
   * Verifies the user's old password before updating the password.
   *
   * @param userId The user's id
   * @param updateUserPasswordDto Contains new password details about an existing user
   */
  public async updateUserPassword(
    userId: string,
    updateUserPasswordDto: UpdateUserPasswordDto,
  ): Promise<void> {
    const userEntity = await this.getUserEntityByIdOrThrow(userId);

    const isMatch = await bcrypt.compare(
      updateUserPasswordDto.oldPassword,
      userEntity.password,
    );
    if (!isMatch) {
      throw new BadRequestException('Incorrect old password');
    }

    userEntity.password = await bcrypt.hash(
      updateUserPasswordDto.newPassword,
      10,
    );

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
