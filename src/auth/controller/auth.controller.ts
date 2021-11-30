import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../service';
import { TokenAuthRequest } from './model/request/token-auth.request';
import { TokenResponse } from './model/response/token.response';
import { RefreshAuthRequest } from './model/request/refresh-auth.request';
import { ApiValidationFailedResponse } from '../../common/decorators/api/api-response.decorator';
import { Public } from './decorator/is-public.decorator';
import { ApiTokenCreatedResponse } from './decorator/api-token-created-response.decorator';

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
