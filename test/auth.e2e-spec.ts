import * as request from 'supertest';
import { Authorities } from '../src/auth';
import { TestApplication } from './test-application';
import { TestData } from './test-data';

describe('AuthController (e2e)', () => {
  const app: TestApplication = new TestApplication();

  beforeEach(async () => {
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/auth/token (POST)', () => {
    it('should issue both a new access and refresh token from a username and password', async () => {
      const { username } = await app.createUser();

      return request(app.getHttpServer())
        .post('/auth/token')
        .send({ username, password: TestData.PrimaryPassword })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toStrictEqual(
            expect.objectContaining({
              accessToken: expect.any(String),
              refreshToken: expect.any(String),
            }),
          );
        });
    });

    it('should issue both a new access and refresh token from an email and password', async () => {
      const { email } = await app.createUser();

      return request(app.getHttpServer())
        .post('/auth/token')
        .send({ username: email, password: TestData.PrimaryPassword })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toStrictEqual(
            expect.objectContaining({
              accessToken: expect.any(String),
              refreshToken: expect.any(String),
            }),
          );
        });
    });

    it('should fail to issue both new access and refresh token since wrong username', async () => {
      await app.createUser();

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
      await app.createUser();

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
      await app.createUser();

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
      await app.createUser();

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
    it('should refresh authentication using an existing token and then issue new', async () => {
      const { id } = await app.createUser();
      const refreshToken = await app.signJwt(
        {
          userId: id,
          authorities: [Authorities.REFRESH_TOKEN],
        },
        { expiresIn: 30 },
      );

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toStrictEqual(
            expect.objectContaining({
              accessToken: expect.any(String),
              refreshToken: expect.any(String),
            }),
          );
        });
    });

    it('should fail to refresh authentication using an invalid JWT', async () => {
      await app.createUser();

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'notAValidRefreshToken' })
        .expect(401)
        .expect({ statusCode: 401, message: 'Unauthorized' });
    });

    it('should fail to refresh authentication without correct refresh authority', async () => {
      const { id } = await app.createUser();
      const refreshToken = await app.signJwt(
        {
          userId: id,
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
      await app.createUser();
      const refreshToken = await app.signJwt(
        {
          userId: TestData.NonExistingUserId,
          authorities: [Authorities.REFRESH_TOKEN],
        },
        { expiresIn: 30 },
      );

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(400)
        .expect({ statusCode: 400, message: 'Bad jwt' });
    });

    it('should fail to refresh authentication with an expired refresh token', async () => {
      const { id } = await app.createUser();
      const refreshToken = await app.signJwt(
        {
          userId: id,
          authorities: [Authorities.REFRESH_TOKEN],
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
