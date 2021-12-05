import { Injectable } from '@nestjs/common';
import { Not } from 'typeorm';
import { UserAuthorityEntity, UserAuthorityRepository } from '../repository';
import { PageableDto, PageResultDto } from '../../common/model';
import { UserAuthorityDto } from './model/user-authority.dto';
import { UserAuthorityNotFoundException } from './exception/user-authority-not-found.exception';
import { UserAuthorityNameUniqueConstraintException } from './exception/user-authority-name-unique-constraint.exception';
import { CreateUserAuthorityDto } from './model/create-user-authority.dto';
import { UpdateUserAuthorityDto } from './model/update-user-authority.dto';

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
   * @param pageableDto The page information to fetch
   */
  public async getUserAuthorities(
    pageableDto: PageableDto,
  ): Promise<PageResultDto<UserAuthorityDto>> {
    const [authorities, totalElements] =
      await this.userAuthorityRepository.findAndCount({
        skip: pageableDto.number * pageableDto.size,
        take: pageableDto.size,
      });

    return Promise.resolve({
      content: authorities.map(UserAuthorityService.toUserAuthorityDto),
      page: {
        number: pageableDto.number,
        size: pageableDto.size,
        totalPages: Math.ceil(totalElements / pageableDto.size),
        totalElements,
      },
    });
  }

  /**
   * Create a new user authority.
   *
   * @param createUserAuthorityDto Contains new details about a new user authority
   */
  public async createUserAuthority(
    createUserAuthorityDto: CreateUserAuthorityDto,
  ): Promise<UserAuthorityDto> {
    await this.verifyUserAuthorityNameUnique(createUserAuthorityDto.name);

    const userAuthorityEntity = this.userAuthorityRepository.create({
      name: createUserAuthorityDto.name,
      description: createUserAuthorityDto.description,
    });

    const savedEntity = await this.userAuthorityRepository.save(
      userAuthorityEntity,
    );
    return UserAuthorityService.toUserAuthorityDto(savedEntity);
  }

  /**
   * Update an existing user authority.
   *
   * @param userAuthorityId The user authority's id
   * @param updateUserAuthorityDto Contains new details about an existing user authority
   */
  public async updateUserAuthority(
    userAuthorityId: string,
    updateUserAuthorityDto: UpdateUserAuthorityDto,
  ): Promise<UserAuthorityDto> {
    await this.verifyUserAuthorityNameUnique(
      updateUserAuthorityDto.name,
      userAuthorityId,
    );

    const userAuthorityEntity = await this.getUserAuthorityEntityByIdOrThrow(
      userAuthorityId,
    );
    userAuthorityEntity.name = updateUserAuthorityDto.name;
    userAuthorityEntity.description = updateUserAuthorityDto.description;

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
