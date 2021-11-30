import * as request from 'supertest';
import { TestApplication } from './test-application';
import { TestData } from './test-data';
import {
  UserAuthority,
  UserRole,
  UserRoleAuthority,
} from '../src/user/service';
import { JwtPayloadDto } from '../src/auth/service';

describe('AuthController (e2e)', () => {
  const app: TestApplication = new TestApplication();

  beforeEach(async () => {
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const expectJwt = (token: string, payload: JwtPayloadDto) => {
    const { userId, role, authorities } = payload;
    expect(app.decodeJwt(token)).toStrictEqual(
      expect.objectContaining({
        userId,
        role,
        authorities,
        aud: 'test',
        exp: expect.any(Number),
        iat: expect.any(Number),
        iss: 'filebuddy',
      }),
    );
  };

  const expectTokenResponse = (body, userId, role) => {
    expect.assertions(3);
    expect(body).toStrictEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      }),
    );

    const { accessToken, refreshToken } = body;

    expectJwt(accessToken, {
      userId,
      role,
      authorities: UserRoleAuthority[role],
    });
    expectJwt(refreshToken, {
      userId,
      role,
      authorities: [UserAuthority.REFRESH_TOKEN],
    });
  };

  describe('/auth/token (POST)', () => {
    it('should issue both a new access and refresh token from a username and password when role is regular user', async () => {
      const { id, username, role } = await app.createUser(
        1,
        UserRole.REGULAR_USER,
      );

      return request(app.getHttpServer())
        .post('/auth/token')
        .send({ username, password: TestData.PrimaryPassword })
        .expect(201)
        .expect(({ body }) => {
          expectTokenResponse(body, id, role);
        });
    });

    it('should issue both a new access and refresh token from a username and password when role is super user', async () => {
      const { id, username, role } = await app.createUser(
        1,
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/auth/token')
        .send({ username, password: TestData.PrimaryPassword })
        .expect(201)
        .expect(({ body }) => {
          expectTokenResponse(body, id, role);
        });
    });

    it('should issue both a new access and refresh token from an email and password when role is regular user', async () => {
      const { id, email, role } = await app.createUser(
        1,
        UserRole.REGULAR_USER,
      );

      return request(app.getHttpServer())
        .post('/auth/token')
        .send({ username: email, password: TestData.PrimaryPassword })
        .expect(201)
        .expect(({ body }) => {
          expectTokenResponse(body, id, role);
        });
    });

    it('should issue both a new access and refresh token from an email and password when role is super user', async () => {
      const { id, email, role } = await app.createUser(1, UserRole.SUPER_USER);

      return request(app.getHttpServer())
        .post('/auth/token')
        .send({ username: email, password: TestData.PrimaryPassword })
        .expect(201)
        .expect(({ body }) => {
          expectTokenResponse(body, id, role);
        });
    });

    it('should fail to issue both new access and refresh token since wrong username', async () => {
      await app.createUser(1, UserRole.REGULAR_USER);

      return request(app.getHttpServer())
        .post('/auth/token')
        .send({
          username: TestData.SecondaryUsername,
          password: TestData.PrimaryPassword,
        })
        .expect(400)
        .expect({ statusCode: 400, message: 'Bad credentials' });
    });

    it('should fail to issue both new access and refresh token since wrong email', async () => {
      await app.createUser(1, UserRole.REGULAR_USER);

      return request(app.getHttpServer())
        .post('/auth/token')
        .send({
          username: TestData.SecondaryEmail,
          password: TestData.PrimaryPassword,
        })
        .expect(400)
        .expect({ statusCode: 400, message: 'Bad credentials' });
    });

    it('should fail to issue both new access and refresh token since wrong username or password', async () => {
      await app.createUser(1, UserRole.REGULAR_USER);

      return request(app.getHttpServer())
        .post('/auth/token')
        .send({
          username: TestData.PrimaryUsername,
          password: TestData.SecondaryPassword,
        })
        .expect(400)
        .expect({ statusCode: 400, message: 'Bad credentials' });
    });

    it('should fail to issue both new access and refresh token since wrong email or password', async () => {
      await app.createUser(1, UserRole.REGULAR_USER);

      return request(app.getHttpServer())
        .post('/auth/token')
        .send({
          username: TestData.PrimaryEmail,
          password: TestData.SecondaryPassword,
        })
        .expect(400)
        .expect({ statusCode: 400, message: 'Bad credentials' });
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('should refresh authentication using an existing token and then issue new when role is regular user', async () => {
      const { id, role } = await app.createUser(1, UserRole.REGULAR_USER);
      const refreshToken = await app.signJwt(
        {
          userId: id,
          role,
          authorities: [UserAuthority.REFRESH_TOKEN],
        },
        { expiresIn: 30 },
      );

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(201)
        .expect(({ body }) => {
          expectTokenResponse(body, id, role);
        });
    });

    it('should refresh authentication using an existing token and then issue new when role is super user', async () => {
      const { id, role } = await app.createUser(1, UserRole.SUPER_USER);
      const refreshToken = await app.signJwt(
        {
          userId: id,
          role,
          authorities: [UserAuthority.REFRESH_TOKEN],
        },
        { expiresIn: 30 },
      );

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(201)
        .expect(({ body }) => {
          expectTokenResponse(body, id, role);
        });
    });

    it('should fail to refresh authentication using an invalid JWT', async () => {
      await app.createUser(1, UserRole.REGULAR_USER);

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'notAValidRefreshToken' })
        .expect(401)
        .expect({ statusCode: 401, message: 'Unauthorized' });
    });

    it('should fail to refresh authentication without correct refresh authority', async () => {
      const { id, role } = await app.createUser(1, UserRole.REGULAR_USER);
      const refreshToken = await app.signJwt(
        {
          userId: id,
          role,
          authorities: [],
        },
        { expiresIn: 30 },
      );

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(400)
        .expect({ statusCode: 400, message: 'Bad jwt' });
    });

    it('should fail to refresh authentication without an valid userId', async () => {
      await app.createUser(1, UserRole.REGULAR_USER);
      const refreshToken = await app.signJwt(
        {
          userId: TestData.NonExistingUserId,
          role: UserRole.REGULAR_USER,
          authorities: [UserAuthority.REFRESH_TOKEN],
        },
        { expiresIn: 30 },
      );

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'Bad jwt',
        });
    });

    it('should fail to refresh authentication with an expired refresh token', async () => {
      const { id, role } = await app.createUser(1, UserRole.REGULAR_USER);
      const refreshToken = await app.signJwt(
        {
          userId: id,
          role,
          authorities: [UserAuthority.REFRESH_TOKEN],
        },
        { expiresIn: -30 },
      );

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(401)
        .expect({ statusCode: 401, message: 'Unauthorized' });
    });
  });
});
