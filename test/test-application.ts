import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { Connection } from 'typeorm';
import { UserDto, UserService } from '../src/user';
import { JwtPayloadDto } from '../src/auth';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { TestData } from './test-data';

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

  async createUser(count = 1): Promise<UserDto> {
    return await this.app
      .get<UserService>(UserService)
      .createUser(
        TestData.Username(count),
        TestData.PrimaryPassword,
        TestData.Email(count),
      );
  }

  async createUsers(from: number, to: number) {
    const userService = this.app.get<UserService>(UserService);
    for (let i = from; i < to + 1; i++) {
      await userService.createUser(
        TestData.Username(i),
        TestData.PrimaryPassword,
        TestData.Email(i),
      );
    }
  }
}
