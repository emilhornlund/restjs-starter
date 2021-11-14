import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Authorities, JwtPayloadDto, TokenDto } from './models';
import { BadCredentialsException, BadJwtException } from './exceptions';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity, UserRepository } from '../user';

@Injectable()
export class AuthService {
  private static ACCESS_TOKEN_EXPIRES_IN = 60 * 15; //15min
  private static REFRESH_TOKEN_EXPIRES_IN = 60 * 60 * 24; //24hours

  constructor(
    private jwtService: JwtService,
    private userRepository: UserRepository,
  ) {}

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
    const { id } = await this.verifyCredentials(username, password);

    const accessToken = await this.signAccessToken(id);
    const refreshToken = await this.signRefreshToken(id);

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
      { userId, authorities: [] },
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
   * Verifies the supplied username or email and password and throws a
   * BadCredentialsException if they don't match.
   *
   * @param usernameOrEmail The user's username or email
   * @param password The user's password
   * @private
   */
  private async verifyCredentials(
    usernameOrEmail: string,
    password: string,
  ): Promise<UserEntity> {
    const userEntity = await this.userRepository.findOne({
      where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });
    if (!userEntity || !(await bcrypt.compare(password, userEntity.password))) {
      throw new BadCredentialsException();
    }
    return userEntity;
  }

  /**
   * Verifies the supplied access token and throws and unauthorized
   * exception whether the JWT is malformed or expired.
   *
   * @param accessToken The access token
   */
  public async verifyAccessToken(accessToken: string): Promise<JwtPayloadDto> {
    let payload: JwtPayloadDto;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayloadDto>(accessToken);
    } catch (e) {
      throw new UnauthorizedException();
    }

    return payload;
  }

  /**
   * Verifies the supplied refresh token and throws an unauthorized
   * exception whether the JWT is malformed or expired. If the token
   * contains invalid claims then throws a bad jwt exception.
   *
   * @param refreshToken The refresh token
   * @private
   */
  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<JwtPayloadDto> {
    let payload: JwtPayloadDto;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayloadDto>(refreshToken);
    } catch (e) {
      throw new UnauthorizedException();
    }

    const { userId, authorities } = payload;

    if (
      !userId ||
      !authorities ||
      !authorities.includes(Authorities.REFRESH_TOKEN)
    ) {
      throw new BadJwtException();
    }

    try {
      await this.userRepository.findOneOrFail(userId);
    } catch (e) {
      throw new BadJwtException();
    }

    return payload;
  }
}
