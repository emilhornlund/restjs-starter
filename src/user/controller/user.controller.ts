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
import { UserAuthority, UserDto, UserService } from '../service';
import { PagedUserResponse } from './model/response/paged-user.response';
import { CreateUserRequest } from './model/request/create-user.request';
import { UserResponse } from './model/response/user.response';
import { UpdateUserRequest } from './model/request/update-user.request';
import {
  ApiUserCreatedResponse,
  ApiUserIdParam,
  ApiUserNotFoundResponse,
  ApiUserOkResponse,
} from './decorator/api-user.decorator';
import {
  UserIdParam,
  UserIdParamKey,
} from './decorator/user-id-param.decorator';
import { PageableDto, PageableRequest } from '../../common';
import {
  ApiPageableQueryParam,
  PageableQueryParam,
} from '../../common/decorators';
import { HasUserAuthority } from '../../auth/controller/decorator/has-authority.decorator';
import {
  ApiUnauthorizedResponse,
  ApiValidationFailedResponse,
} from '../../common/decorators/api/api-response.decorator';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a page of all users',
    description:
      'Get a single page containing a subset of all users in the system.',
  })
  @ApiPageableQueryParam()
  @ApiOkResponse({
    description: 'Page of users',
    type: PagedUserResponse,
  })
  @ApiUnauthorizedResponse()
  @HasUserAuthority(UserAuthority.USER_ADMINISTRATION_READ)
  public findAllUsers(
    @PageableQueryParam() pageable: PageableRequest,
  ): Promise<PagedUserResponse> {
    return this.userService
      .getUsers(pageable.page, pageable.size)
      .then(UserController.toPagedUserResponse);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Creates a new user from the provided information.',
  })
  @ApiUserCreatedResponse()
  @ApiValidationFailedResponse()
  @ApiUnauthorizedResponse()
  @HasUserAuthority(UserAuthority.USER_ADMINISTRATION_WRITE)
  public createUser(
    @Body() createUserRequest: CreateUserRequest,
  ): Promise<UserResponse> {
    return this.userService
      .createUser(
        createUserRequest.username,
        createUserRequest.password,
        createUserRequest.email,
      )
      .then(UserController.toUserResponse);
  }

  @Get(`:${UserIdParamKey}`)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a user by id',
    description:
      'Get the information of an existing user by its unique user identifier.',
  })
  @ApiUserIdParam()
  @ApiUserOkResponse()
  @ApiUnauthorizedResponse()
  @ApiUserNotFoundResponse()
  @HasUserAuthority(UserAuthority.USER_ADMINISTRATION_READ)
  public findUser(@UserIdParam() userId: string): Promise<UserResponse> {
    return this.userService.getUser(userId).then(UserController.toUserResponse);
  }

  @Put(`:${UserIdParamKey}`)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a user by id',
    description:
      'Updates the information of an existing user by its unique user identifier.',
  })
  @ApiUserIdParam()
  @ApiUserOkResponse()
  @ApiValidationFailedResponse()
  @ApiUnauthorizedResponse()
  @ApiUserNotFoundResponse()
  @HasUserAuthority(UserAuthority.USER_ADMINISTRATION_WRITE)
  public updateUser(
    @UserIdParam() userId: string,
    @Body() updateUserRequest: UpdateUserRequest,
  ): Promise<UserResponse> {
    return this.userService
      .updateUser(userId, updateUserRequest.username, updateUserRequest.email)
      .then(UserController.toUserResponse);
  }

  @Delete(`:${UserIdParamKey}`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a user by id',
    description:
      'Deletes an existing user and all its information by its unique user identifier completely without the ability to recover it.',
  })
  @ApiUserIdParam()
  @ApiNoContentResponse({ description: 'No Content' })
  @ApiUnauthorizedResponse()
  @ApiUserNotFoundResponse()
  @HasUserAuthority(UserAuthority.USER_ADMINISTRATION_WRITE)
  public deleteUser(@UserIdParam() userId: string) {
    return this.userService.deleteUser(userId);
  }

  /**
   * Convert an instance of a PageableUserDto to PagedUserResponse.
   *
   * @param pagedUserDto The PageableUserDto instance
   */
  static toPagedUserResponse = (
    pagedUserDto: PageableDto<UserDto>,
  ): PagedUserResponse => ({
    users: pagedUserDto.content.map(UserController.toUserResponse),
    page: pagedUserDto.page,
  });

  /**
   * Convert an instance of a UserDto to UserResponse.
   *
   * @param userDto The UserDto instance
   */
  static toUserResponse = (userDto: UserDto): UserResponse => ({
    id: userDto.id,
    username: userDto.username,
    email: userDto.email,
    role: userDto.role,
    createdAt: userDto.createdAt,
    updatedAt: userDto.updatedAt,
  });
}
