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

  async signJwt(payload: JwtPayloadDto, options: JwtSignOptions) {
    return this.app.get<JwtService>(JwtService).sign(payload, options);
  }

  decodeJwt(token: string): JwtPayloadDto {
    return this.app.get<JwtService>(JwtService).decode(token) as JwtPayloadDto;
  }

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

  async createUser(count = 1, role: UserRole): Promise<UserDto> {
    return await this.app
      .get<UserService>(UserService)
      .createUser(
        TestData.User.UsernamePrefix + count,
        TestData.User.PasswordPrimary,
        TestData.User.UsernamePrefix + count + TestData.User.EmailSuffix,
        role,
      );
  }

  async createUsers(from: number, to: number, role: UserRole) {
    const userService = this.app.get<UserService>(UserService);
    for (let i = from; i < to + 1; i++) {
      await userService.createUser(
        TestData.User.UsernamePrefix + i,
        TestData.User.PasswordPrimary,
        TestData.User.UsernamePrefix + i + TestData.User.EmailSuffix,
        role,
      );
    }
  }

  async createUserRole(
    name: string,
    description: string,
  ): Promise<UserRoleDto> {
    return this.app
      .get<UserRoleService>(UserRoleService)
      .createUserRole(name, description);
  }

  async createUserRoles(from: number, count: number) {
    const userRoleService = await this.app.get<UserRoleService>(
      UserRoleService,
    );
    for (let i = from; i < from + count; i++) {
      await userRoleService.createUserRole(
        `${TestData.UserRole.NamePrefix}_${i}`,
        TestData.UserRole.PrimaryDescription,
      );
    }
  }

  async createUserAuthority(
    name: string,
    description: string,
  ): Promise<UserAuthorityDto> {
    return this.app
      .get<UserAuthorityService>(UserAuthorityService)
      .createUserAuthority(name, description);
  }

  async createUserAuthorities(from: number, count: number) {
    const userAuthorityService = await this.app.get<UserAuthorityService>(
      UserAuthorityService,
    );
    for (let i = from; i < from + count; i++) {
      await userAuthorityService.createUserAuthority(
        `${TestData.UserAuthority.NamePrefix}_${i}:read`,
        TestData.UserAuthority.PrimaryDescription,
      );
    }
  }
}
