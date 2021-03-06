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
} from '../../common/decorator';
import {
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiValidationFailedResponse,
} from '../../common/decorator/api/api-response.decorator';
import { HasUserAuthority } from '../../auth/controller/decorator/has-authority.decorator';
import { PageResultDto, PageableRequest } from '../../common/model';
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
  @ApiForbiddenResponse()
  @HasUserAuthority(UserAuthority.AUTHORITY_ADMINISTRATION_READ)
  public findAllUserRoles(
    @PageableQueryParam() pageable: PageableRequest,
  ): Promise<PagedUserRoleResponse> {
    return this.userRoleService
      .getUserRoles({
        number: pageable.page,
        size: pageable.size,
      })
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
  @ApiForbiddenResponse()
  @HasUserAuthority(UserAuthority.AUTHORITY_ADMINISTRATION_WRITE)
  public createUserRole(
    @Body() createUserRequest: CreateUserRoleRequest,
  ): Promise<UserRoleResponse> {
    return this.userRoleService
      .createUserRole({
        name: createUserRequest.name,
        description: createUserRequest.description,
      })
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
  @ApiForbiddenResponse()
  @ApiUserRoleNotFoundResponse()
  @HasUserAuthority(UserAuthority.AUTHORITY_ADMINISTRATION_READ)
  public findUserRole(
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
  @ApiForbiddenResponse()
  @ApiUserRoleNotFoundResponse()
  @HasUserAuthority(UserAuthority.AUTHORITY_ADMINISTRATION_WRITE)
  public updateUserRole(
    @UserRoleIdParam() userRoleId: string,
    @Body() updateUserRequest: UpdateUserRoleRequest,
  ): Promise<UserRoleResponse> {
    return this.userRoleService
      .updateUserRole(userRoleId, {
        name: updateUserRequest.name,
        description: updateUserRequest.description,
      })
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
  @ApiForbiddenResponse()
  @ApiUserRoleNotFoundResponse()
  @HasUserAuthority(UserAuthority.AUTHORITY_ADMINISTRATION_WRITE)
  public deleteUserRole(@UserRoleIdParam() userRoleId: string) {
    return this.userRoleService.deleteUserRole(userRoleId);
  }

  /**
   * Convert an instance of a PageableUserRoleDto to PagedUserRoleResponse.
   *
   * @param pageableUserRoleDto The PageableUserRoleDto instance
   * @private
   */
  private static toUserRolePageResponse(
    pageableUserRoleDto: PageResultDto<UserRoleDto>,
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
