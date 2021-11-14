import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayloadDto, TokenDto } from './models';
import { BadCredentialsException, BadJwtException } from './exceptions';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  UserAuthority,
  UserEntity,
  UserNotFoundException,
  UserRepository,
  UserRole,
  UserRoleAuthority,
} from '../user';

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
    const { id, role } = await this.verifyCredentials(username, password);

    const accessToken = await this.signAccessToken(id, role);
    const refreshToken = await this.signRefreshToken(id, role);

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

    const { role } = await this.getUserByIdOrThrow(userId);

    const accessToken = await this.signAccessToken(userId, role);
    const newRefreshToken = await this.signRefreshToken(userId, role);

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Signs a new access token from the supplied user's id.
   *
   * @param userId The user's id
   * @param role The user's role
   * @private
   */
  private signAccessToken(userId: string, role: UserRole): Promise<string> {
    return this.jwtService.signAsync(
      { userId, role, authorities: UserRoleAuthority[role] },
      { expiresIn: AuthService.ACCESS_TOKEN_EXPIRES_IN },
    );
  }

  /**
   * Signs a new refresh token from the supplied user's id.
   *
   * @param userId The user's id
   * @param role The user's role
   * @private
   */
  private signRefreshToken(userId: string, role: UserRole): Promise<string> {
    return this.jwtService.signAsync(
      { userId, role, authorities: [UserAuthority.REFRESH_TOKEN] },
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
      !authorities.includes(UserAuthority.REFRESH_TOKEN)
    ) {
      throw new BadJwtException();
    }

    await this.getUserByIdOrThrow(userId);

    return payload;
  }

  private async getUserByIdOrThrow(userId: string): Promise<UserEntity> {
    let userEntity: UserEntity;

    try {
      userEntity = await this.userRepository.findOneOrFail(userId);
    } catch (e) {
      throw new UserNotFoundException(userId);
    }

    return userEntity;
  }
}
