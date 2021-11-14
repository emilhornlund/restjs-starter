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
import { UserService } from './user.service';
import {
  CreateUserRequest,
  PagedUserResponse,
  UpdateUserRequest,
  UserResponse,
} from './models';
import {
  ApiUserCreatedResponse,
  ApiUserIdParam,
  ApiUserNotFoundResponse,
  ApiUserOkResponse,
  UserIdParam,
  UserIdParamKey,
} from './decorators';
import { PageableRequest } from '../common';
import { UserConverter } from './converters';
import {
  ApiPageableQueryParam,
  PageableQueryParam,
} from '../common/decorators';

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
  public findAllUsers(
    @PageableQueryParam() pageable: PageableRequest,
  ): Promise<PagedUserResponse> {
    return this.userService
      .getUsers(pageable.page, pageable.size)
      .then(UserConverter.convertToPagedUserResponse);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Creates a new user from the provided information.',
  })
  @ApiUserCreatedResponse()
  public createUser(
    @Body() createUserRequest: CreateUserRequest,
  ): Promise<UserResponse> {
    return this.userService
      .createUser(
        createUserRequest.username,
        createUserRequest.password,
        createUserRequest.email,
      )
      .then(UserConverter.convertToUserResponse);
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
  @ApiUserNotFoundResponse()
  public findUser(@UserIdParam() userId: string): Promise<UserResponse> {
    return this.userService
      .getUser(userId)
      .then(UserConverter.convertToUserResponse);
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
  @ApiUserNotFoundResponse()
  public updateUser(
    @UserIdParam() userId: string,
    @Body() updateUserRequest: UpdateUserRequest,
  ): Promise<UserResponse> {
    return this.userService
      .updateUser(userId, updateUserRequest.username, updateUserRequest.email)
      .then(UserConverter.convertToUserResponse);
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
  @ApiUserNotFoundResponse()
  public deleteUser(@UserIdParam() userId: string) {
    return this.userService.deleteUser(userId);
  }
}
