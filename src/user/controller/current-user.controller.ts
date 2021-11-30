import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { UserDto, UserService } from '../service';
import {
  ApiUserNotFoundResponse,
  ApiUserOkResponse,
} from './decorator/api-user.decorator';
import { UserResponse } from './model/response/user.response';
import { PatchUserPasswordRequest } from './model/request/patch-user-password.request';
import { CurrentUserParam } from '../../auth/controller';
import {
  ApiUnauthorizedResponse,
  ApiValidationFailedResponse,
} from '../../common/decorators/api/api-response.decorator';

@ApiBearerAuth()
@ApiTags('Me')
@Controller('/me')
export class CurrentUserController {
  constructor(private userService: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get the current authenticated user',
    description:
      'Get the information of the current authenticated user by its access token.',
  })
  @ApiUserOkResponse()
  @ApiUnauthorizedResponse()
  @ApiUserNotFoundResponse()
  public findCurrentUser(
    @CurrentUserParam('userId') userId: string,
  ): Promise<UserResponse> {
    return this.userService
      .getUser(userId)
      .then(CurrentUserController.toUserResponse);
  }

  @Patch('/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Update the current authenticated user's password",
    description: "Update the current authenticated user's password",
  })
  @ApiNoContentResponse({ description: 'No Content' })
  @ApiValidationFailedResponse()
  @ApiUnauthorizedResponse()
  @ApiUserNotFoundResponse()
  public updateCurrentUserPassword(
    @CurrentUserParam('userId') userId: string,
    @Body() patchUserPasswordRequest: PatchUserPasswordRequest,
  ) {
    return this.userService.updateUserPassword(
      userId,
      patchUserPasswordRequest.oldPassword,
      patchUserPasswordRequest.newPassword,
    );
  }

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
