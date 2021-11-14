import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TokenAuthRequest, RefreshAuthRequest, TokenResponse } from './models';
import { BadCredentialsException } from './exceptions';
import { ApiTokenCreatedResponse, Public } from './decorators';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/token')
  @HttpCode(HttpStatus.CREATED)
  @ApiTokenCreatedResponse()
  @ApiBadRequestResponse({
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

  @Public()
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
