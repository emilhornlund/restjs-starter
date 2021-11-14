import * as request from 'supertest';
import { TestApplication } from './test-application';
import { TestData } from './test-data';

describe('CurrentUserController (e2e)', () => {
  const app: TestApplication = new TestApplication();

  beforeEach(async () => {
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/me (GET)', () => {
    it('should get the currently authenticated user', async () => {
      const {
        user: { id, username, email, createdAt, updatedAt },
        accessToken,
      } = await app.createAuthenticatedUser();

      return request(app.getHttpServer())
        .get('/me')
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            id,
            username,
            email,
            createdAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString(),
          });
        });
    });

    it('should fail to get an unknown currently authenticated user', async () => {
      const accessToken = await app.signJwt(
        {
          userId: TestData.NonExistingUserId,
          authorities: [],
        },
        { expiresIn: 30 },
      );

      return request(app.getHttpServer())
        .get('/me')
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(404)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 404,
            message: `User with id \`${TestData.NonExistingUserId}\` was not found.`,
          });
        });
    });

    it('should fail to get the currently authenticated user without an access token', async () => {
      await app.createAuthenticatedUser();

      return request(app.getHttpServer())
        .get('/me')
        .expect(401)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 401,
            message: 'Unauthorized',
          });
        });
    });

    it('should fail to get the currently authenticated user with an expired access token', async () => {
      const { accessToken } = await app.createAuthenticatedUser(true);

      return request(app.getHttpServer())
        .get('/me')
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(401)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 401,
            message: 'Unauthorized',
          });
        });
    });
  });
});
