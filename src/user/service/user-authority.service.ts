import { Injectable } from '@nestjs/common';
import { Not } from 'typeorm';
import { UserAuthorityEntity, UserAuthorityRepository } from '../repository';
import { PageableDto } from '../../common';
import { UserAuthorityDto } from './model/user-authority.dto';
import { UserAuthorityNotFoundException } from './exception/user-authority-not-found.exception';
import { UserAuthorityNameUniqueConstraintException } from './exception/user-authority-name-unique-constraint.exception';

@Injectable()
export class UserAuthorityService {
  constructor(private userAuthorityRepository: UserAuthorityRepository) {}

  /**
   * Get a single user authority by id.
   *
   * @param userAuthorityId The user authority's id
   */
  public async getUserAuthority(
    userAuthorityId: string,
  ): Promise<UserAuthorityDto> {
    const userAuthorityEntity = await this.getUserAuthorityEntityByIdOrThrow(
      userAuthorityId,
    );
    return UserAuthorityService.toUserAuthorityDto(userAuthorityEntity);
  }

  /**
   * Get a single page containing a subset of all user authorities in the system.
   *
   * @param pageNumber The number of the page
   * @param pageSize The size of the page
   */
  public async getUserAuthorities(
    pageNumber: number,
    pageSize: number,
  ): Promise<PageableDto<UserAuthorityDto>> {
    const [authorities, totalElements] =
      await this.userAuthorityRepository.findAndCount({
        skip: pageNumber * pageSize,
        take: pageSize,
      });

    return Promise.resolve({
      content: authorities.map(UserAuthorityService.toUserAuthorityDto),
      page: {
        number: pageNumber,
        size: pageSize,
        totalPages: Math.ceil(totalElements / pageSize),
        totalElements,
      },
    });
  }

  /**
   * Create a new user authority.
   *
   * @param name The user authority's name
   * @param description The user authority's description
   */
  public async createUserAuthority(
    name: string,
    description: string,
  ): Promise<UserAuthorityDto> {
    await this.verifyUserAuthorityNameUnique(name);

    const userAuthorityEntity = this.userAuthorityRepository.create();
    userAuthorityEntity.name = name;
    userAuthorityEntity.description = description;

    const savedEntity = await this.userAuthorityRepository.save(
      userAuthorityEntity,
    );
    return UserAuthorityService.toUserAuthorityDto(savedEntity);
  }

  /**
   * Update an existing user authority.
   *
   * @param userAuthorityId The user authority's id
   * @param description The user authority's description
   */
  public async updateUserAuthority(
    userAuthorityId: string,
    description: string,
  ): Promise<UserAuthorityDto> {
    const userAuthorityEntity = await this.getUserAuthorityEntityByIdOrThrow(
      userAuthorityId,
    );
    userAuthorityEntity.description = description;

    const savedEntity = await this.userAuthorityRepository.save(
      userAuthorityEntity,
    );
    return UserAuthorityService.toUserAuthorityDto(savedEntity);
  }

  /**
   * Get a user authority entity by id or else throw exception.
   *
   * @param userAuthorityId The user authority's id
   */
  private async getUserAuthorityEntityByIdOrThrow(
    userAuthorityId: string,
  ): Promise<UserAuthorityEntity> {
    const userAuthorityEntity = await this.userAuthorityRepository.findOne(
      userAuthorityId,
    );
    if (!userAuthorityEntity) {
      throw new UserAuthorityNotFoundException(userAuthorityId);
    }
    return userAuthorityEntity;
  }

  /**
   * Verifies that the user authority's name is unique to all except current user authority.
   *
   * @param name The user authority's name
   * @param userAuthorityId The user authority's id
   * @private
   */
  private async verifyUserAuthorityNameUnique(
    name: string,
    userAuthorityId?: string,
  ) {
    const userAuthorityEntity = await this.userAuthorityRepository.findOne({
      where: userAuthorityId ? { id: Not(userAuthorityId), name } : { name },
    });
    if (userAuthorityEntity) {
      throw new UserAuthorityNameUniqueConstraintException(name);
    }
  }

  /**
   * Delete an existing user authority by id.
   *
   * @param userAuthorityId The user authority's id
   */
  public async deleteUserAuthority(userAuthorityId: string): Promise<void> {
    const userAuthorityEntity = await this.getUserAuthorityEntityByIdOrThrow(
      userAuthorityId,
    );
    await this.userAuthorityRepository.remove(userAuthorityEntity);
  }

  /**
   * Convert an instance of a UserAuthorityEntity to UserAuthorityDto.
   *
   * @param userAuthorityEntity The UserAuthorityEntity instance
   * @private
   */
  private static toUserAuthorityDto(
    userAuthorityEntity: UserAuthorityEntity,
  ): UserAuthorityDto {
    return {
      id: userAuthorityEntity.id,
      name: userAuthorityEntity.name,
      description: userAuthorityEntity.description,
      createdAt: userAuthorityEntity.createdAt,
      updatedAt: userAuthorityEntity.updatedAt,
    };
  }
}
