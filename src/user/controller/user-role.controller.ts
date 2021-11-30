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
import { UserAuthority, UserRoleDto, UserRoleService } from '../service';
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
import { UserRoleResponse } from './model/response/user-role.response';
import { PagedUserRoleResponse } from './model/response/paged-user-role.response';
import {
  ApiUserRoleCreatedResponse,
  ApiUserRoleIdParam,
  ApiUserRoleNotFoundResponse,
  ApiUserRoleOkResponse,
} from './decorator/api-user-role.decorator';
import {
  UserRoleIdParam,
  UserRoleIdParamKey,
} from './decorator/user-role-id-param.decorator';
import { UpdateUserRoleRequest } from './model/request/update-user-role.request';
import { CreateUserRoleRequest } from './model/request/create-user-role.request';

@ApiBearerAuth()
@ApiTags('User Roles')
@Controller('/user_roles')
export class UserRoleController {
  constructor(private userRoleService: UserRoleService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a page of all user roles.',
    description:
      'Get a single page containing a subset of all user roles. in the system.',
  })
  @ApiPageableQueryParam()
  @ApiOkResponse({
    description: 'Page of user roles.',
    type: PagedUserRoleResponse,
  })
  @ApiUnauthorizedResponse()
  @HasUserAuthority(UserAuthority.AUTHORITY_ADMINISTRATION_READ)
  public findAllUserAuthorities(
    @PageableQueryParam() pageable: PageableRequest,
  ): Promise<PagedUserRoleResponse> {
    return this.userRoleService
      .getUserRoles(pageable.page, pageable.size)
      .then(UserRoleController.toUserRolePageResponse);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new user role',
    description: 'Creates a new user role from the provided information.',
  })
  @ApiUserRoleCreatedResponse()
  @ApiValidationFailedResponse()
  @ApiUnauthorizedResponse()
  @HasUserAuthority(UserAuthority.AUTHORITY_ADMINISTRATION_WRITE)
  public createUser(
    @Body() createUserRequest: CreateUserRoleRequest,
  ): Promise<UserRoleResponse> {
    return this.userRoleService
      .createUserRole(createUserRequest.name, createUserRequest.description)
      .then(UserRoleController.toUserRoleResponse);
  }

  @Get(`:${UserRoleIdParamKey}`)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a user role by id',
    description:
      'Get the information of an existing user role by its unique user role identifier.',
  })
  @ApiUserRoleIdParam()
  @ApiUserRoleOkResponse()
  @ApiUnauthorizedResponse()
  @ApiUserRoleNotFoundResponse()
  @HasUserAuthority(UserAuthority.AUTHORITY_ADMINISTRATION_READ)
  public findUser(
    @UserRoleIdParam() userRoleId: string,
  ): Promise<UserRoleResponse> {
    return this.userRoleService
      .getUserRole(userRoleId)
      .then(UserRoleController.toUserRoleResponse);
  }

  @Put(`:${UserRoleIdParamKey}`)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a user role by id',
    description:
      'Updates the information of an existing user role by its unique user role identifier.',
  })
  @ApiUserRoleIdParam()
  @ApiUserRoleOkResponse()
  @ApiValidationFailedResponse()
  @ApiUnauthorizedResponse()
  @ApiUserRoleNotFoundResponse()
  @HasUserAuthority(UserAuthority.AUTHORITY_ADMINISTRATION_WRITE)
  public updateUser(
    @UserRoleIdParam() userRoleId: string,
    @Body() updateUserRequest: UpdateUserRoleRequest,
  ): Promise<UserRoleResponse> {
    return this.userRoleService
      .updateUserRole(
        userRoleId,
        updateUserRequest.name,
        updateUserRequest.description,
      )
      .then(UserRoleController.toUserRoleResponse);
  }

  @Delete(`:${UserRoleIdParamKey}`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a user role by id',
    description:
      'Deletes an existing user role and all its information by its unique user role identifier completely without the ability to recover it.',
  })
  @ApiUserRoleIdParam()
  @ApiNoContentResponse({ description: 'No Content' })
  @ApiUnauthorizedResponse()
  @ApiUserRoleNotFoundResponse()
  @HasUserAuthority(UserAuthority.AUTHORITY_ADMINISTRATION_WRITE)
  public deleteUser(@UserRoleIdParam() userRoleId: string) {
    return this.userRoleService.deleteUserRole(userRoleId);
  }

  /**
   * Convert an instance of a PageableUserRoleDto to PagedUserRoleResponse.
   *
   * @param pageableUserRoleDto The PageableUserRoleDto instance
   * @private
   */
  private static toUserRolePageResponse(
    pageableUserRoleDto: PageableDto<UserRoleDto>,
  ): PagedUserRoleResponse {
    return {
      user_roles: pageableUserRoleDto.content.map(
        UserRoleController.toUserRoleResponse,
      ),
      page: pageableUserRoleDto.page,
    };
  }

  /**
   * Convert an instance of a UserRoleEntity to UserRoleResponse.
   *
   * @param userRoleDto The UserRoleDto instance
   * @private
   */
  private static toUserRoleResponse(
    userRoleDto: UserRoleDto,
  ): UserRoleResponse {
    return {
      id: userRoleDto.id,
      name: userRoleDto.name,
      description: userRoleDto.description,
      createdAt: userRoleDto.createdAt,
      updatedAt: userRoleDto.updatedAt,
    };
  }
}
