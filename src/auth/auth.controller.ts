import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TokenAuthRequest, RefreshAuthRequest, TokenResponse } from './models';
import { ApiTokenCreatedResponse, Public } from './decorators';
import { ApiValidationFailedResponse } from '../common/decorators/api/api-response.decorator';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/token')
  @HttpCode(HttpStatus.CREATED)
  @ApiTokenCreatedResponse()
  @ApiValidationFailedResponse()
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
