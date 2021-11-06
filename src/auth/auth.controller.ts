import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TokenAuthRequest, RefreshAuthRequest, TokenResponse } from './models';
import { BadCredentialsException } from './exceptions';
import { ApiTokenCreatedResponse } from './decorators';

@ApiTags('auth')
@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/token')
  @HttpCode(HttpStatus.CREATED)
  @ApiTokenCreatedResponse()
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: BadCredentialsException.name,
    type: BadCredentialsException,
  })
  public createToken(
    @Body() credentialsAuthRequest: TokenAuthRequest,
  ): Promise<TokenResponse> {
    return this.authService.authenticateUsingUserCredentials(
      credentialsAuthRequest.username,
      credentialsAuthRequest.password,
    );
  }

  @Post('/refresh')
  @ApiTokenCreatedResponse()
  public refreshToken(
    @Body() refreshAuthRequest: RefreshAuthRequest,
  ): Promise<TokenResponse> {
    return this.authService.authenticateUsingRefreshToken(
      refreshAuthRequest.refreshToken,
    );
  }
}
