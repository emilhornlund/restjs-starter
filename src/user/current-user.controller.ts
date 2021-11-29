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
import { UserService } from './user.service';
import { ApiUserNotFoundResponse, ApiUserOkResponse } from './decorators';
import { PatchUserPasswordRequest, UserResponse } from './models';
import { UserConverter } from './converters';
import { CurrentUserParam } from '../auth/decorators';
import {
  ApiUnauthorizedResponse,
  ApiValidationFailedResponse,
} from '../common/decorators/api/api-response.decorator';

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
      .then(UserConverter.convertToUserResponse);
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
}
