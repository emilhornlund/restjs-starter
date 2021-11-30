import { Injectable } from '@nestjs/common';
import { Not } from 'typeorm';
import { UserRoleEntity, UserRoleRepository } from '../repository';
import { PageableDto } from '../../common';
import { UserRoleDto } from './model/user-role.dto';
import { UserRoleNotFoundException } from './exception/user-role-not-found.exception';
import { UserRoleNameUniqueConstraintException } from './exception/user-role-name-unique-constraint.exception';

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
   * @param pageNumber The number of the page
   * @param pageSize The size of the page
   */
  public async getUserRoles(
    pageNumber: number,
    pageSize: number,
  ): Promise<PageableDto<UserRoleDto>> {
    const [roles, totalElements] = await this.userRoleRepository.findAndCount({
      skip: pageNumber * pageSize,
      take: pageSize,
    });

    return Promise.resolve({
      content: roles.map(UserRoleService.toUserRoleDto),
      page: {
        number: pageNumber,
        size: pageSize,
        totalPages: Math.ceil(totalElements / pageSize),
        totalElements,
      },
    });
  }

  /**
   * Create a new user role.
   *
   * @param name The user role's name
   * @param description The user role's description
   */
  public async createUserRole(
    name: string,
    description: string,
  ): Promise<UserRoleDto> {
    await this.verifyUserRoleNameUnique(name);

    const userRoleEntity = this.userRoleRepository.create();
    userRoleEntity.name = name;
    userRoleEntity.description = description;

    const savedEntity = await this.userRoleRepository.save(userRoleEntity);
    return UserRoleService.toUserRoleDto(savedEntity);
  }

  /**
   * Update an existing user role.
   *
   * @param userRoleId The user role's id
   * @param name The user role's name
   * @param description The user role's description
   */
  public async updateUserRole(
    userRoleId: string,
    name: string,
    description: string,
  ): Promise<UserRoleDto> {
    await this.verifyUserRoleNameUnique(name, userRoleId);

    const userRoleEntity = await this.getUserRoleEntityByIdOrThrow(userRoleId);
    userRoleEntity.name = name;
    userRoleEntity.description = description;

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
