import * as request from 'supertest';
import { TestApplication } from './test-application';
import { TestData } from './test-data';
import { UserRole } from '../src/user/service';

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
        user: { id, username, email, role, createdAt, updatedAt },
        accessToken,
      } = await app.createAuthenticatedUser(UserRole.SUPER_USER);

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
            role,
            createdAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString(),
          });
        });
    });

    it('should fail to get an unknown currently authenticated user', async () => {
      const accessToken = await app.signJwt(
        {
          userId: TestData.NonExistingUserId,
          role: UserRole.REGULAR_USER,
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
      await app.createAuthenticatedUser(UserRole.SUPER_USER);

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
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
        true,
      );

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

  describe('/me/password (PATCH)', () => {
    it("should update the currently authenticated user's password", async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .patch('/me/password')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          oldPassword: TestData.PrimaryPassword,
          newPassword: TestData.SecondaryPassword,
        })
        .expect(204)
        .expect(({ body }) => {
          expect(body).toBeEmpty();
        });
    });

    it("should fail update the currently authenticated user's password with an incorrect old password", async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .patch('/me/password')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          oldPassword: TestData.SecondaryPassword,
          newPassword: TestData.PrimaryPassword,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Incorrect old password',
          });
        });
    });

    it("should fail to update the currently authenticated user's password without an access token", async () => {
      await app.createAuthenticatedUser(UserRole.SUPER_USER);

      return request(app.getHttpServer())
        .patch('/me/password')
        .send({
          oldPassword: TestData.PrimaryPassword,
          newPassword: TestData.SecondaryPassword,
        })
        .expect(401)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 401,
            message: 'Unauthorized',
          });
        });
    });

    it("should fail to update the currently authenticated user's password with an expired access token", async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
        true,
      );

      return request(app.getHttpServer())
        .patch('/me/password')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          oldPassword: TestData.PrimaryPassword,
          newPassword: TestData.SecondaryPassword,
        })
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
