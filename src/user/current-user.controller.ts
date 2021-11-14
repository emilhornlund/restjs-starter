import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiUserNotFoundResponse, ApiUserOkResponse } from './decorators';
import { UserResponse } from './models';
import { UserConverter } from './converters';
import { CurrentUserParam } from '../auth/decorators';

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
  @ApiUserNotFoundResponse()
  public findCurrentUser(
    @CurrentUserParam('userId') userId: string,
  ): Promise<UserResponse> {
    return this.userService
      .getUser(userId)
      .then(UserConverter.convertToUserResponse);
  }
}
