import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Authorities, JwtPayloadDto, TokenDto } from './models';
import { BadCredentialsException, BadJwtException } from './exceptions';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private static ACCESS_TOKEN_EXPIRES_IN = 60 * 15; //15min
  private static REFRESH_TOKEN_EXPIRES_IN = 60 * 60 * 24; //24hours
  private static MOCK_USER_ID = '7bda9f39-8864-4ebb-a8ff-795d371baf56';

  constructor(private jwtService: JwtService) {}

  /**
   * Creates a new JWT pair after verifying the supplied username and password.
   *
   * @param username The user's username
   * @param password The user's password
   */
  public async authenticateUsingUserCredentials(
    username: string,
    password: string,
  ): Promise<TokenDto> {
    await AuthService.verifyCredentials(username, password);

    const accessToken = await this.signAccessToken(AuthService.MOCK_USER_ID);
    const refreshToken = await this.signRefreshToken(AuthService.MOCK_USER_ID);

    return { accessToken, refreshToken };
  }

  /**
   * Creates a new JWT pair after verifying the supplied refresh token.
   *
   * @param refreshToken
   */
  public async authenticateUsingRefreshToken(
    refreshToken: string,
  ): Promise<TokenDto> {
    const { userId } = await this.verifyRefreshToken(refreshToken);

    const accessToken = await this.signAccessToken(userId);
    const newRefreshToken = await this.signRefreshToken(userId);

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Signs a new access token from the supplied user's id.
   *
   * @param userId The user's id
   * @private
   */
  private signAccessToken(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      { userId },
      { expiresIn: AuthService.ACCESS_TOKEN_EXPIRES_IN },
    );
  }

  /**
   * Signs a new refresh token from the supplied user's id.
   *
   * @param userId The user's id
   * @private
   */
  private signRefreshToken(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      { userId, authorities: [Authorities.REFRESH_TOKEN] },
      { expiresIn: AuthService.REFRESH_TOKEN_EXPIRES_IN },
    );
  }

  /**
   * Verifies the supplied username and password and throws a
   * BadCredentialsException if they don't match.
   *
   * @param username The user's username
   * @param password The user's password
   * @private
   */
  private static async verifyCredentials(
    username: string,
    password: string,
  ): Promise<void | BadCredentialsException> {
    if (username !== 'test' || password !== 'pass')
      throw new BadCredentialsException();
  }

  /**
   * Verifies the supplied refresh token and throws an unauthorized
   * exception whether the JWT is malformed or expired. If the token
   * contains invalid claims then throws a bad jwt exception.
   *
   * @param refreshToken The refresh token
   * @private
   */
  private verifyRefreshToken(refreshToken: string): Promise<JwtPayloadDto> {
    let payload: JwtPayloadDto;

    try {
      payload = this.jwtService.verify<JwtPayloadDto>(refreshToken);
    } catch (e) {
      throw new UnauthorizedException();
    }

    if (!payload.userId || payload.userId !== AuthService.MOCK_USER_ID) {
      return Promise.reject(new BadJwtException());
    }

    if (
      !payload.authorities ||
      !payload.authorities.includes(Authorities.REFRESH_TOKEN)
    ) {
      return Promise.reject(new BadJwtException());
    }

    return Promise.resolve(payload);
  }
}
