import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'typeorm';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import {
  UserAuthorityDto,
  UserAuthorityService,
  UserDto,
  UserRole,
  UserRoleAuthority,
  UserRoleDto,
  UserRoleService,
  UserService,
} from '../src/user/service';
import { JwtPayloadDto } from '../src/auth/service';
import { TestData } from './test-data';

export interface AuthenticatedUserDto {
  accessToken: string;
  user: UserDto;
}

export class TestApplication {
  private app: INestApplication;

  // -------------------------------------------------------------------------
  // Test Application
  // -------------------------------------------------------------------------

  async init() {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleFixture.createNestApplication();
    await this.app.init();
  }

  async close() {
    await this.app.get<Connection>(Connection).close();
  }

  getHttpServer() {
    return this.app.getHttpServer();
  }

  // -------------------------------------------------------------------------
  // Jwt
  // -------------------------------------------------------------------------

  async signJwt(payload: JwtPayloadDto, options: JwtSignOptions) {
    return this.app.get<JwtService>(JwtService).sign(payload, options);
  }

  decodeJwt(token: string): JwtPayloadDto {
    return this.app.get<JwtService>(JwtService).decode(token) as JwtPayloadDto;
  }

  // -------------------------------------------------------------------------
  // Authorization
  // -------------------------------------------------------------------------

  async createAuthenticatedUser(
    role: UserRole,
    expired = false,
  ): Promise<AuthenticatedUserDto> {
    const user = await this.createUser(1, role);
    const accessToken = await this.signJwt(
      {
        userId: user.id,
        role,
        authorities: UserRoleAuthority[role],
      },
      { expiresIn: expired ? -30 : 30 },
    );
    return { user, accessToken };
  }

  // -------------------------------------------------------------------------
  // Users
  // -------------------------------------------------------------------------

  async createUser(count = 1, role?: UserRole): Promise<UserDto> {
    return await this.app.get<UserService>(UserService).createUser({
      username: TestData.User.UsernamePrefix + count,
      password: TestData.User.PasswordPrimary,
      email: TestData.User.UsernamePrefix + count + TestData.User.EmailSuffix,
      role,
    });
  }

  async batchCreateUsers(count: number): Promise<UserDto[]> {
    const userService = this.app.get<UserService>(UserService);
    return Promise.all(
      Array(count)
        .fill(0)
        .map((_, i) =>
          userService.createUser({
            username: TestData.User.BatchUsernamePrefix + i,
            password: TestData.User.PasswordPrimary,
            email:
              TestData.User.BatchUsernamePrefix + i + TestData.User.EmailSuffix,
          }),
        ),
    );
  }

  // -------------------------------------------------------------------------
  // User Roles
  // -------------------------------------------------------------------------

  async createUserRole(
    name: string,
    description: string,
  ): Promise<UserRoleDto> {
    return this.app
      .get<UserRoleService>(UserRoleService)
      .createUserRole({ name, description });
  }

  async batchCreateUserRoles(count: number): Promise<UserRoleDto[]> {
    const userRoleService = this.app.get<UserRoleService>(UserRoleService);
    return Promise.all(
      Array(count)
        .fill(0)
        .map((_, i) =>
          userRoleService.createUserRole({
            name: `${TestData.UserRole.BatchNamePrefix}_${i}`,
            description: TestData.UserRole.PrimaryDescription,
          }),
        ),
    );
  }

  // -------------------------------------------------------------------------
  // User Authorities
  // -------------------------------------------------------------------------

  async createUserAuthority(
    name: string,
    description: string,
  ): Promise<UserAuthorityDto> {
    return this.app
      .get<UserAuthorityService>(UserAuthorityService)
      .createUserAuthority({ name, description });
  }

  async batchCreateUserAuthorities(count: number): Promise<UserRoleDto[]> {
    const userAuthorityService =
      this.app.get<UserAuthorityService>(UserAuthorityService);
    return Promise.all(
      Array(count)
        .fill(0)
        .map((_, i) =>
          userAuthorityService.createUserAuthority({
            name: `${TestData.UserAuthority.BatchNamePrefix}_${i}:read`,
            description: TestData.UserAuthority.PrimaryDescription,
          }),
        ),
    );
  }
}
