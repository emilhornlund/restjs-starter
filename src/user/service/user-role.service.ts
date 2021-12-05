import { Injectable } from '@nestjs/common';
import { Not } from 'typeorm';
import { UserRoleEntity, UserRoleRepository } from '../repository';
import { PageableDto, PageResultDto } from '../../common/model';
import { UserRoleDto } from './model/user-role.dto';
import { UserRoleNotFoundException } from './exception/user-role-not-found.exception';
import { UserRoleNameUniqueConstraintException } from './exception/user-role-name-unique-constraint.exception';
import { CreateUserRoleDto } from './model/create-user-role.dto';
import { UpdateUserRoleDto } from './model/update-user-role.dto';

@Injectable()
export class UserRoleService {
  constructor(private userRoleRepository: UserRoleRepository) {}

  /**
   * Get a single user role by id.
   *
   * @param userRoleId The user role's id
   */
  public async getUserRole(userRoleId: string): Promise<UserRoleDto> {
    const userRoleEntity = await this.getUserRoleEntityByIdOrThrow(userRoleId);
    return UserRoleService.toUserRoleDto(userRoleEntity);
  }

  /**
   * Get a single page containing a subset of all user roles in the system.
   *
   * @param pageableDto The page information to fetch
   */
  public async getUserRoles(
    pageableDto: PageableDto,
  ): Promise<PageResultDto<UserRoleDto>> {
    const [roles, totalElements] = await this.userRoleRepository.findAndCount({
      skip: pageableDto.number * pageableDto.size,
      take: pageableDto.size,
    });

    return Promise.resolve({
      content: roles.map(UserRoleService.toUserRoleDto),
      page: {
        number: pageableDto.number,
        size: pageableDto.size,
        totalPages: Math.ceil(totalElements / pageableDto.size),
        totalElements,
      },
    });
  }

  /**
   * Create a new user role.
   *
   * @param createUserRoleDto Contains new details about a new user role
   */
  public async createUserRole(
    createUserRoleDto: CreateUserRoleDto,
  ): Promise<UserRoleDto> {
    await this.verifyUserRoleNameUnique(createUserRoleDto.name);

    const userRoleEntity = this.userRoleRepository.create({
      name: createUserRoleDto.name,
      description: createUserRoleDto.description,
    });

    const savedEntity = await this.userRoleRepository.save(userRoleEntity);
    return UserRoleService.toUserRoleDto(savedEntity);
  }

  /**
   * Update an existing user role.
   *
   * @param userRoleId The user role's id
   * @param updateUserRoleDto Contains new details about an existing user role
   */
  public async updateUserRole(
    userRoleId: string,
    updateUserRoleDto: UpdateUserRoleDto,
  ): Promise<UserRoleDto> {
    await this.verifyUserRoleNameUnique(updateUserRoleDto.name, userRoleId);

    const userRoleEntity = await this.getUserRoleEntityByIdOrThrow(userRoleId);
    userRoleEntity.name = updateUserRoleDto.name;
    userRoleEntity.description = updateUserRoleDto.description;

    const savedEntity = await this.userRoleRepository.save(userRoleEntity);
    return UserRoleService.toUserRoleDto(savedEntity);
  }

  /**
   * Get a user role entity by id or else throw exception.
   *
   * @param userRoleId The user role's id
   */
  private async getUserRoleEntityByIdOrThrow(
    userRoleId: string,
  ): Promise<UserRoleEntity> {
    const userRoleEntity = await this.userRoleRepository.findOne(userRoleId);
    if (!userRoleEntity) {
      throw new UserRoleNotFoundException(userRoleId);
    }
    return userRoleEntity;
  }

  /**
   * Verifies that the user role's name is unique to all except current user role.
   *
   * @param name The user role's name
   * @param userRoleId The user role's id
   * @private
   */
  private async verifyUserRoleNameUnique(name: string, userRoleId?: string) {
    const userRoleEntity = await this.userRoleRepository.findOne({
      where: userRoleId ? { id: Not(userRoleId), name } : { name },
    });
    if (userRoleEntity) {
      throw new UserRoleNameUniqueConstraintException(name);
    }
  }

  /**
   * Delete an existing role by id.
   *
   * @param userRoleId The user role's id
   */
  public async deleteUserRole(userRoleId: string): Promise<void> {
    const userRoleEntity = await this.getUserRoleEntityByIdOrThrow(userRoleId);
    await this.userRoleRepository.remove(userRoleEntity);
  }

  /**
   * Convert an instance of a UserRoleEntity to RoleDto.
   *
   * @param userRoleEntity The user role entity instance
   * @private
   */
  private static toUserRoleDto(userRoleEntity: UserRoleEntity): UserRoleDto {
    return {
      id: userRoleEntity.id,
      name: userRoleEntity.name,
      description: userRoleEntity.description,
      createdAt: userRoleEntity.createdAt,
      updatedAt: userRoleEntity.updatedAt,
    };
  }
}
