import * as request from 'supertest';
import { TestApplication } from '../../test-application';
import { TestData } from '../../test-data';
import { UserRole } from '../../../src/user/service';

describe('UserController (e2e)', () => {
  const app: TestApplication = new TestApplication();

  beforeEach(async () => {
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const arrayContainingUsers = (from: number, count: number): any[] => {
    return Array(count)
      .fill(0)
      .map((_, i) => ({
        id: expect.any(String),
        username: TestData.Username(from + i),
        email: TestData.Email(from + i),
        role: UserRole.REGULAR_USER,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }));
  };

  describe('/users (GET)', () => {
    it('should get an page of users with default page and size', async () => {
      const {
        user: { id, username, email, role, createdAt, updatedAt },
        accessToken,
      } = await app.createAuthenticatedUser(UserRole.SUPER_USER);

      return request(app.getHttpServer())
        .get('/users')
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            users: [
              {
                id,
                username,
                email,
                role,
                createdAt: createdAt.toISOString(),
                updatedAt: updatedAt.toISOString(),
              },
            ],
            page: {
              number: 0,
              size: 20,
              totalPages: 1,
              totalElements: 1,
            },
          });
        });
    });

    it('should get the first page of 5 users', async () => {
      const {
        user: { id, username, email, role, createdAt, updatedAt },
        accessToken,
      } = await app.createAuthenticatedUser(UserRole.SUPER_USER);
      await app.createUsers(2, 10, UserRole.REGULAR_USER);

      return request(app.getHttpServer())
        .get('/users?page=0&size=5')
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              users: [
                {
                  id,
                  username,
                  email,
                  role,
                  createdAt: createdAt.toISOString(),
                  updatedAt: updatedAt.toISOString(),
                },
                ...arrayContainingUsers(2, 4),
              ],
              page: {
                number: 0,
                size: 5,
                totalPages: 2,
                totalElements: 10,
              },
            }),
          );
        });
    });

    it('should get the second page of 5 users', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );
      await app.createUsers(2, 10, UserRole.REGULAR_USER);

      return request(app.getHttpServer())
        .get('/users?page=1&size=5')
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              users: arrayContainingUsers(6, 5),
              page: {
                number: 1,
                size: 5,
                totalPages: 2,
                totalElements: 10,
              },
            }),
          );
        });
    });

    it('should fail to get a page of users when missing required authority', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.REGULAR_USER,
      );

      return request(app.getHttpServer())
        .get('/users')
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(403)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 403,
            message: 'Forbidden resource',
          });
        });
    });

    it('should fail to get an page of users without an access token', async () => {
      await app.createAuthenticatedUser(UserRole.SUPER_USER);

      return request(app.getHttpServer())
        .get('/users')
        .expect(401)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 401,
            message: 'Unauthorized',
          });
        });
    });

    it('should fail to get an page of users with an expired access token', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
        true,
      );

      return request(app.getHttpServer())
        .get('/users')
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

  describe('/users (POST)', () => {
    it('should create a new user', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/users')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.SecondaryUsername,
          password: TestData.SecondaryPassword,
          email: TestData.SecondaryEmail,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id: expect.any(String),
              username: TestData.SecondaryUsername,
              email: TestData.SecondaryEmail,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to create a new user with a non unique username', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/users')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.PrimaryUsername,
          password: TestData.PrimaryPassword,
          email: TestData.PrimaryEmail,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Validation failed',
            validationErrors: [
              {
                field: 'username',
                constraints: { isUsernameUnique: 'username already exists' },
              },
            ],
          });
        });
    });

    it('should create a new user with a username equal to 2 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/users')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.ShortUsername,
          password: TestData.SecondaryPassword,
          email: TestData.SecondaryEmail,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id: expect.any(String),
              username: TestData.ShortUsername,
              email: TestData.SecondaryEmail,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to create a new user with a username shorter than 2 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/users')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.InvalidTooShortUsername,
          password: TestData.PrimaryPassword,
          email: TestData.PrimaryEmail,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Validation failed',
            validationErrors: [
              {
                field: 'username',
                constraints: {
                  minLength:
                    'username must be longer than or equal to 2 characters',
                },
              },
            ],
          });
        });
    });

    it('should create a new user with a username equal to 20 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/users')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.LongUsername,
          password: TestData.SecondaryPassword,
          email: TestData.SecondaryEmail,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id: expect.any(String),
              username: TestData.LongUsername,
              email: TestData.SecondaryEmail,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to create a new user with a username longer than 20 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/users')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.InvalidTooLongUsername,
          password: TestData.PrimaryPassword,
          email: TestData.PrimaryEmail,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Validation failed',
            validationErrors: [
              {
                field: 'username',
                constraints: {
                  maxLength:
                    'username must be shorter than or equal to 20 characters',
                },
              },
            ],
          });
        });
    });

    it('should fail to create a new user with an invalid email address', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/users')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.PrimaryUsername,
          password: TestData.PrimaryPassword,
          email: TestData.InvalidEmail,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Validation failed',
            validationErrors: [
              {
                field: 'email',
                constraints: { isEmail: 'email must be an email' },
              },
            ],
          });
        });
    });

    it('should fail to create a new user when missing required authority', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.REGULAR_USER,
      );

      return request(app.getHttpServer())
        .post('/users')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.SecondaryUsername,
          password: TestData.SecondaryPassword,
          email: TestData.SecondaryEmail,
        })
        .expect(403)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 403,
            message: 'Forbidden resource',
          });
        });
    });

    it('should fail to create a new user without an access token', async () => {
      await app.createAuthenticatedUser(UserRole.SUPER_USER);

      return request(app.getHttpServer())
        .post('/users')
        .send({
          username: TestData.SecondaryUsername,
          password: TestData.SecondaryPassword,
          email: TestData.SecondaryEmail,
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

    it('should fail to create a new user with an expired access token', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
        true,
      );

      return request(app.getHttpServer())
        .post('/users')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.SecondaryUsername,
          password: TestData.SecondaryPassword,
          email: TestData.SecondaryEmail,
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

  describe('/users/:userId (GET)', () => {
    it('should get an existing user by id', async () => {
      const {
        user: { id, username, email, role, createdAt, updatedAt },
        accessToken,
      } = await app.createAuthenticatedUser(UserRole.SUPER_USER);

      return request(app.getHttpServer())
        .get('/users/' + id)
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

    it('should fail to get a non existing user', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .get('/users/' + TestData.NonExistingUserId)
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

    it('should fail to get an existing user by id when missing required authority', async () => {
      const {
        user: { id },
        accessToken,
      } = await app.createAuthenticatedUser(UserRole.REGULAR_USER);

      return request(app.getHttpServer())
        .get('/users/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(403)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 403,
            message: 'Forbidden resource',
          });
        });
    });

    it('should fail to get an existing user by id without an access token', async () => {
      const {
        user: { id },
      } = await app.createAuthenticatedUser(UserRole.SUPER_USER);

      return request(app.getHttpServer())
        .get('/users/' + id)
        .expect(401)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 401,
            message: 'Unauthorized',
          });
        });
    });

    it('should fail to get an existing user by id with an expired access token', async () => {
      const {
        user: { id },
        accessToken,
      } = await app.createAuthenticatedUser(UserRole.SUPER_USER, true);

      return request(app.getHttpServer())
        .get('/users/' + id)
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

  describe('/users/:userId (PUT)', () => {
    it('should update an existing user', async () => {
      const {
        user: { id, createdAt },
        accessToken,
      } = await app.createAuthenticatedUser(UserRole.SUPER_USER);

      return request(app.getHttpServer())
        .put('/users/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.SecondaryUsername,
          email: TestData.SecondaryEmail,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id,
              username: TestData.SecondaryUsername,
              email: TestData.SecondaryEmail,
              createdAt: createdAt.toISOString(),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should update an existing user without changing username', async () => {
      const {
        user: { id, username, createdAt },
        accessToken,
      } = await app.createAuthenticatedUser(UserRole.SUPER_USER);

      return request(app.getHttpServer())
        .put('/users/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username,
          email: TestData.SecondaryEmail,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id,
              username,
              email: TestData.SecondaryEmail,
              createdAt: createdAt.toISOString(),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to update a non existing user', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .put('/users/' + TestData.NonExistingUserId)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.SecondaryUsername,
          email: TestData.SecondaryEmail,
        })
        .expect(404)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 404,
            message: `User with id \`${TestData.NonExistingUserId}\` was not found.`,
          });
        });
    });

    it('should fail to update an existing user with a non unique username', async () => {
      const {
        user: { username },
        accessToken,
      } = await app.createAuthenticatedUser(UserRole.SUPER_USER);

      const { id } = await app.createUser(2, UserRole.REGULAR_USER);

      return request(app.getHttpServer())
        .put('/users/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username,
          email: TestData.SecondaryEmail,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Validation failed',
            validationErrors: [
              {
                field: 'username',
                constraints: { isUsernameUnique: 'username already exists' },
              },
            ],
          });
        });
    });

    it('should fail to update an existing user with an invalid email address', async () => {
      const {
        user: { id },
        accessToken,
      } = await app.createAuthenticatedUser(UserRole.SUPER_USER);

      return request(app.getHttpServer())
        .put('/users/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.SecondaryUsername,
          email: TestData.InvalidEmail,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Validation failed',
            validationErrors: [
              {
                field: 'email',
                constraints: { isEmail: 'email must be an email' },
              },
            ],
          });
        });
    });

    it('should fail update an existing user when missing required authority', async () => {
      const {
        user: { id },
        accessToken,
      } = await app.createAuthenticatedUser(UserRole.REGULAR_USER);

      return request(app.getHttpServer())
        .put('/users/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.SecondaryUsername,
          email: TestData.SecondaryEmail,
        })
        .expect(403)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 403,
            message: 'Forbidden resource',
          });
        });
    });

    it('should fail update an existing user without an access token', async () => {
      const {
        user: { id },
      } = await app.createAuthenticatedUser(UserRole.SUPER_USER);

      return request(app.getHttpServer())
        .put('/users/' + id)
        .send({
          username: TestData.SecondaryUsername,
          email: TestData.SecondaryEmail,
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

    it('should fail update an existing user with an expired access token', async () => {
      const {
        user: { id },
        accessToken,
      } = await app.createAuthenticatedUser(UserRole.SUPER_USER, true);

      return request(app.getHttpServer())
        .put('/users/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.SecondaryUsername,
          email: TestData.SecondaryEmail,
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

  describe('/users/:userId (DELETE)', () => {
    it('should delete an existing user', async () => {
      const {
        user: { id },
        accessToken,
      } = await app.createAuthenticatedUser(UserRole.SUPER_USER);

      return request(app.getHttpServer())
        .delete('/users/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(204)
        .expect(({ body }) => {
          expect(body).toBeEmpty();
        });
    });

    it('should fail to delete a non existing user', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .delete('/users/' + TestData.NonExistingUserId)
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

    it('should fail to delete an existing user when missing required authority', async () => {
      const {
        user: { id },
        accessToken,
      } = await app.createAuthenticatedUser(UserRole.REGULAR_USER);

      return request(app.getHttpServer())
        .delete('/users/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(403)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 403,
            message: 'Forbidden resource',
          });
        });
    });

    it('should fail to delete an existing user without an access token', async () => {
      const {
        user: { id },
      } = await app.createAuthenticatedUser(UserRole.SUPER_USER);

      return request(app.getHttpServer())
        .delete('/users/' + id)
        .expect(401)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 401,
            message: 'Unauthorized',
          });
        });
    });

    it('should fail to delete an existing user with an expired access token', async () => {
      const {
        user: { id },
        accessToken,
      } = await app.createAuthenticatedUser(UserRole.SUPER_USER, true);

      return request(app.getHttpServer())
        .delete('/users/' + id)
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