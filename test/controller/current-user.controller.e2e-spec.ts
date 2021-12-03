import * as request from 'supertest';
import { TestApplication } from '../test-application';
import { TestData } from '../test-data';
import { UserRole } from '../../src/user/service';

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
          userId: TestData.User.NonExistingUserId,
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
            message: `User with id \`${TestData.User.NonExistingUserId}\` was not found.`,
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
          oldPassword: TestData.User.PasswordPrimary,
          newPassword: TestData.User.PasswordSecondary,
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
          oldPassword: TestData.User.PasswordSecondary,
          newPassword: TestData.User.PasswordPrimary,
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
          oldPassword: TestData.User.PasswordPrimary,
          newPassword: TestData.User.PasswordSecondary,
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
          oldPassword: TestData.User.PasswordPrimary,
          newPassword: TestData.User.PasswordSecondary,
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

    it("should update the currently authenticated user's password containing exactly the minimum allowed number of valid characters", async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .patch('/me/password')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          oldPassword: TestData.User.PasswordPrimary,
          newPassword: TestData.User.PasswordEqualMinLength,
        })
        .expect(204)
        .expect(({ body }) => {
          expect(body).toBeEmpty();
        });
    });

    it("should fail to update the currently authenticated user's password containing exactly one character less than the minimum allowed number of valid characters", async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .patch('/me/password')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          oldPassword: TestData.User.PasswordLessThanMinLength,
          newPassword: TestData.User.PasswordLessThanMinLength,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Validation failed',
            validationErrors: [
              {
                field: 'oldPassword',
                constraints: {
                  matches: 'oldPassword can only contain word characters',
                  minLength:
                    'oldPassword must be longer than or equal to 8 characters',
                },
              },
              {
                field: 'newPassword',
                constraints: {
                  matches: 'newPassword can only contain word characters',
                  minLength:
                    'newPassword must be longer than or equal to 8 characters',
                },
              },
            ],
          });
        });
    });

    it("should update the currently authenticated user's password containing exactly the maximum allowed number of valid characters", async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .patch('/me/password')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          oldPassword: TestData.User.PasswordPrimary,
          newPassword: TestData.User.PasswordEqualMaxLength,
        })
        .expect(204)
        .expect(({ body }) => {
          expect(body).toBeEmpty();
        });
    });

    it("should fail to update the currently authenticated user's password containing exactly one character more than the maximum allowed number of valid characters", async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .patch('/me/password')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          oldPassword: TestData.User.PasswordGreaterThanMaxLength,
          newPassword: TestData.User.PasswordGreaterThanMaxLength,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Validation failed',
            validationErrors: [
              {
                field: 'oldPassword',
                constraints: {
                  matches: 'oldPassword can only contain word characters',
                  maxLength:
                    'oldPassword must be shorter than or equal to 128 characters',
                },
              },
              {
                field: 'newPassword',
                constraints: {
                  matches: 'newPassword can only contain word characters',
                  maxLength:
                    'newPassword must be shorter than or equal to 128 characters',
                },
              },
            ],
          });
        });
    });
  });
});
