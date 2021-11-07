import * as request from 'supertest';
import { Authorities } from '../src/auth';
import { TestApplication } from './test-application';

describe('AuthController (e2e)', () => {
  const app: TestApplication = new TestApplication();

  beforeEach(async () => {
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/auth/token (POST)', () => {
    it('should create both a new access and refresh token', async () => {
      return request(app.getHttpServer())
        .post('/auth/token')
        .send({ username: 'test', password: 'pass' })
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

    it('should fail to create both new access and refresh token since wrong username and password', async () => {
      return request(app.getHttpServer())
        .post('/auth/token')
        .send({ username: 'test2', password: 'pass2' })
        .expect(400)
        .expect({ statusCode: 400, message: 'Bad credentials' });
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('should refresh authentication using an existing token and then issue new', async () => {
      const refreshToken = await app.signJwt(
        {
          userId: '7bda9f39-8864-4ebb-a8ff-795d371baf56',
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
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'notAValidRefreshToken' })
        .expect(401)
        .expect({ statusCode: 401, message: 'Unauthorized' });
    });

    it('should fail to refresh authentication without correct refresh authority', async () => {
      const refreshToken = await app.signJwt(
        {
          userId: '7bda9f39-8864-4ebb-a8ff-795d371baf56',
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
      const refreshToken = await app.signJwt(
        {
          userId: 'f3867046-0ff4-4652-9a65-62e4e9ac4fcf',
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
      const refreshToken = await app.signJwt(
        {
          userId: '7bda9f39-8864-4ebb-a8ff-795d371baf56',
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
