import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
} from '@nestjs/common';
import { UserAuthorityDto, UserAuthorityService } from '../service';
import {
  ApiPageableQueryParam,
  PageableQueryParam,
} from '../../common/decorators';
import {
  ApiUnauthorizedResponse,
  ApiValidationFailedResponse,
} from '../../common/decorators/api/api-response.decorator';
import { HasUserAuthority } from '../../auth/decorators/has-authority.decorator';
import { PageableDto, PageableRequest } from '../../common';
import { UserAuthorityResponse } from './model/response/user-authority.response';
import { PagedUserAuthorityResponse } from './model/response/paged-user-authority.response';
import { UserAuthority } from '../models';
import {
  ApiUserAuthorityCreatedResponse,
  ApiUserAuthorityIdParam,
  ApiUserAuthorityNotFoundResponse,
  ApiUserAuthorityOkResponse,
} from './decorator/api-user-authority.decorator';
import {
  UserAuthorityIdParam,
  UserAuthorityIdParamKey,
} from './decorator/user-authority-id-param.decorator';
import { UpdateUserAuthorityRequest } from './model/request/update-user-authority.request';
import { CreateUserAuthorityRequest } from './model/request/create-user-authority.request';

@ApiBearerAuth()
@ApiTags('User Authorities')
@Controller('/user_authorities')
export class UserAuthorityController {
  constructor(private userAuthorityService: UserAuthorityService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a page of all user authorities',
    description:
      'Get a single page containing a subset of all user authorities in the system.',
  })
  @ApiPageableQueryParam()
  @ApiOkResponse({
    description: 'Page of user authorities',
    type: PagedUserAuthorityResponse,
  })
  @ApiUnauthorizedResponse()
  @HasUserAuthority(UserAuthority.AUTHORITY_ADMINISTRATION_READ)
  public findAllUserAuthorities(
    @PageableQueryParam() pageable: PageableRequest,
  ): Promise<PagedUserAuthorityResponse> {
    return this.userAuthorityService
      .getUserAuthorities(pageable.page, pageable.size)
      .then(UserAuthorityController.toUserAuthorityPageResponse);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new user authority',
    description: 'Creates a new user authority from the provided information.',
  })
  @ApiUserAuthorityCreatedResponse()
  @ApiValidationFailedResponse()
  @ApiUnauthorizedResponse()
  @HasUserAuthority(UserAuthority.AUTHORITY_ADMINISTRATION_WRITE)
  public createUser(
    @Body() createUserRequest: CreateUserAuthorityRequest,
  ): Promise<UserAuthorityResponse> {
    return this.userAuthorityService
      .createUserAuthority(
        createUserRequest.name,
        createUserRequest.description,
      )
      .then(UserAuthorityController.toUserAuthorityResponse);
  }

  @Get(`:${UserAuthorityIdParamKey}`)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a user authority by id',
    description:
      'Get the information of an existing user authority by its unique user authority identifier.',
  })
  @ApiUserAuthorityIdParam()
  @ApiUserAuthorityOkResponse()
  @ApiUnauthorizedResponse()
  @ApiUserAuthorityNotFoundResponse()
  @HasUserAuthority(UserAuthority.AUTHORITY_ADMINISTRATION_READ)
  public findUser(
    @UserAuthorityIdParam() userAuthorityId: string,
  ): Promise<UserAuthorityResponse> {
    return this.userAuthorityService
      .getUserAuthority(userAuthorityId)
      .then(UserAuthorityController.toUserAuthorityResponse);
  }

  @Put(`:${UserAuthorityIdParamKey}`)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a user authority by id',
    description:
      'Updates the information of an existing user authority by its unique user authority identifier.',
  })
  @ApiUserAuthorityIdParam()
  @ApiUserAuthorityOkResponse()
  @ApiValidationFailedResponse()
  @ApiUnauthorizedResponse()
  @ApiUserAuthorityNotFoundResponse()
  @HasUserAuthority(UserAuthority.AUTHORITY_ADMINISTRATION_WRITE)
  public updateUser(
    @UserAuthorityIdParam() userAuthorityId: string,
    @Body() updateUserRequest: UpdateUserAuthorityRequest,
  ): Promise<UserAuthorityResponse> {
    return this.userAuthorityService
      .updateUserAuthority(userAuthorityId, updateUserRequest.description)
      .then(UserAuthorityController.toUserAuthorityResponse);
  }

  @Delete(`:${UserAuthorityIdParamKey}`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a user authority by id',
    description:
      'Deletes an existing user authority and all its information by its unique user authority identifier completely without the ability to recover it.',
  })
  @ApiUserAuthorityIdParam()
  @ApiNoContentResponse({ description: 'No Content' })
  @ApiUnauthorizedResponse()
  @ApiUserAuthorityNotFoundResponse()
  @HasUserAuthority(UserAuthority.AUTHORITY_ADMINISTRATION_WRITE)
  public deleteUser(@UserAuthorityIdParam() userAuthorityId: string) {
    return this.userAuthorityService.deleteUserAuthority(userAuthorityId);
  }

  /**
   * Convert an instance of a PageableUserAuthorityDto to PagedUserAuthorityResponse.
   *
   * @param pageableUserAuthorityDto The PageableUserAuthorityDto instance
   * @private
   */
  private static toUserAuthorityPageResponse(
    pageableUserAuthorityDto: PageableDto<UserAuthorityDto>,
  ): PagedUserAuthorityResponse {
    return {
      user_authorities: pageableUserAuthorityDto.content.map(
        UserAuthorityController.toUserAuthorityResponse,
      ),
      page: pageableUserAuthorityDto.page,
    };
  }

  /**
   * Convert an instance of a UserAuthorityEntity to UserAuthorityResponse.
   *
   * @param userAuthorityDto The UserAuthorityDto instance
   * @private
   */
  private static toUserAuthorityResponse(
    userAuthorityDto: UserAuthorityDto,
  ): UserAuthorityResponse {
    return {
      id: userAuthorityDto.id,
      name: userAuthorityDto.name,
      description: userAuthorityDto.description,
      createdAt: userAuthorityDto.createdAt,
      updatedAt: userAuthorityDto.updatedAt,
    };
  }
}
