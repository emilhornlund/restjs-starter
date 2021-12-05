import * as request from 'supertest';
import { TestApplication } from '../test-application';
import { TestData } from '../test-data';
import { UserDto, UserRole } from '../../src/user/service';

describe('UserController (e2e)', () => {
  const app: TestApplication = new TestApplication();

  beforeEach(async () => {
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const containingUsers = (...users: UserDto[]): any[] =>
    users.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.createdAt.toISOString(),
    }));

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
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );
      const users = await app.batchCreateUsers(9);

      return request(app.getHttpServer())
        .get('/users?page=0&size=5')
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            users: containingUsers(
              users[0],
              users[1],
              users[2],
              users[3],
              users[4],
            ),
            page: {
              number: 0,
              size: 5,
              totalPages: 2,
              totalElements: 10,
            },
          });
        });
    });

    it('should fail to get the first page of 5 users with invalid page number', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );
      await app.batchCreateUsers(9);

      return request(app.getHttpServer())
        .get('/users?page=NaN&size=5')
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Validation failed',
            validationErrors: [
              {
                field: 'page',
                constraints: { isNumber: 'page is not a valid number' },
              },
            ],
          });
        });
    });

    it('should fail to get the first page of an invalid page size of users', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );
      await app.batchCreateUsers(9);

      return request(app.getHttpServer())
        .get('/users?page=0&size=NaN')
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Validation failed',
            validationErrors: [
              {
                field: 'size',
                constraints: { isNumber: 'size is not a valid number' },
              },
            ],
          });
        });
    });

    it('should get the second page of 5 users', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );
      const users = await app.batchCreateUsers(10);

      return request(app.getHttpServer())
        .get('/users?page=1&size=5')
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            users: containingUsers(
              users[5],
              users[6],
              users[7],
              users[8],
              users[9],
            ),
            page: {
              number: 1,
              size: 5,
              totalPages: 3,
              totalElements: 11,
            },
          });
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
          username: TestData.User.UsernameSecondary,
          password: TestData.User.PasswordSecondary,
          email: TestData.User.EmailSecondary,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id: expect.any(String),
              username: TestData.User.UsernameSecondary,
              email: TestData.User.EmailSecondary,
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
          username: TestData.User.UsernamePrimary,
          password: TestData.User.PasswordSecondary,
          email: TestData.User.EmailSecondary,
        })
        .expect(409)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 409,
            message: 'Username must be unique.',
          });
        });
    });

    it('should create a new user with a username containing exactly the minimum allowed number of valid characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/users')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.User.UsernameEqualMinLength,
          password: TestData.User.PasswordSecondary,
          email: TestData.User.EmailSecondary,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id: expect.any(String),
              username: TestData.User.UsernameEqualMinLength,
              email: TestData.User.EmailSecondary,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to create a new user with a username containing exactly one character less than the minimum allowed number of valid characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/users')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.User.UsernameLessThanMinLength,
          password: TestData.User.PasswordSecondary,
          email: TestData.User.EmailSecondary,
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
                  matches: 'username can only contain alphanumeric characters',
                  minLength:
                    'username must be longer than or equal to 4 characters',
                },
              },
            ],
          });
        });
    });

    it('should create a new user with a username containing exactly the maximum allowed number of valid characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/users')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.User.UsernameEqualMaxLength,
          password: TestData.User.PasswordSecondary,
          email: TestData.User.EmailSecondary,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id: expect.any(String),
              username: TestData.User.UsernameEqualMaxLength,
              email: TestData.User.EmailSecondary,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to create a new user with a username containing exactly one character more than the maximum allowed number of valid characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/users')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.User.UsernameGreaterThanMaxLength,
          password: TestData.User.PasswordSecondary,
          email: TestData.User.EmailSecondary,
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
                  matches: 'username can only contain alphanumeric characters',
                  maxLength:
                    'username must be shorter than or equal to 20 characters',
                },
              },
            ],
          });
        });
    });

    it('should fail to create a new user with a username containing invalid special characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/users')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.User.UsernameInvalidCharacters,
          password: TestData.User.PasswordSecondary,
          email: TestData.User.EmailSecondary,
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
                  matches: 'username can only contain alphanumeric characters',
                },
              },
            ],
          });
        });
    });

    it('should fail to create a new user with a non unique email', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/users')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.User.UsernameSecondary,
          password: TestData.User.PasswordSecondary,
          email: TestData.User.EmailPrimary,
        })
        .expect(409)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 409,
            message: 'Email must be unique.',
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
          username: TestData.User.UsernameSecondary,
          password: TestData.User.PasswordSecondary,
          email: TestData.User.EmailInvalid,
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

    it('should create a new user with a password containing exactly the minimum allowed number of valid characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/users')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.User.UsernameSecondary,
          password: TestData.User.PasswordEqualMinLength,
          email: TestData.User.EmailSecondary,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id: expect.any(String),
              username: TestData.User.UsernameSecondary,
              email: TestData.User.EmailSecondary,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to create a new user with a password containing exactly one character less than the minimum allowed number of valid characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/users')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.User.UsernameSecondary,
          password: TestData.User.PasswordLessThanMinLength,
          email: TestData.User.EmailSecondary,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Validation failed',
            validationErrors: [
              {
                field: 'password',
                constraints: {
                  matches: 'password can only contain word characters',
                  minLength:
                    'password must be longer than or equal to 8 characters',
                },
              },
            ],
          });
        });
    });

    it('should create a new user with a password containing exactly the maximum allowed number of valid characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/users')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.User.UsernameSecondary,
          password: TestData.User.PasswordEqualMaxLength,
          email: TestData.User.EmailSecondary,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id: expect.any(String),
              username: TestData.User.UsernameSecondary,
              email: TestData.User.EmailSecondary,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to create a new user with a password containing exactly one character more than the maximum allowed number of valid characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/users')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.User.UsernameSecondary,
          password: TestData.User.PasswordGreaterThanMaxLength,
          email: TestData.User.EmailSecondary,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Validation failed',
            validationErrors: [
              {
                field: 'password',
                constraints: {
                  matches: 'password can only contain word characters',
                  maxLength:
                    'password must be shorter than or equal to 128 characters',
                },
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
          username: TestData.User.UsernameSecondary,
          password: TestData.User.PasswordSecondary,
          email: TestData.User.EmailSecondary,
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
          username: TestData.User.UsernameSecondary,
          password: TestData.User.PasswordSecondary,
          email: TestData.User.EmailSecondary,
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
          username: TestData.User.UsernameSecondary,
          password: TestData.User.PasswordSecondary,
          email: TestData.User.EmailSecondary,
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
        .get('/users/' + TestData.User.NonExistingUserId)
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
          username: TestData.User.UsernameSecondary,
          email: TestData.User.EmailSecondary,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id,
              username: TestData.User.UsernameSecondary,
              email: TestData.User.EmailSecondary,
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
          email: TestData.User.EmailSecondary,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id,
              username,
              email: TestData.User.EmailSecondary,
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
        .put('/users/' + TestData.User.NonExistingUserId)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.User.UsernameSecondary,
          email: TestData.User.EmailSecondary,
        })
        .expect(404)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 404,
            message: `User with id \`${TestData.User.NonExistingUserId}\` was not found.`,
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
          email: TestData.User.EmailSecondary,
        })
        .expect(409)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 409,
            message: 'Username must be unique.',
          });
        });
    });

    it('should update an existing user with a username containing exactly the minimum allowed number of valid characters', async () => {
      const {
        user: { id, createdAt },
        accessToken,
      } = await app.createAuthenticatedUser(UserRole.SUPER_USER);

      return request(app.getHttpServer())
        .put('/users/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.User.UsernameEqualMinLength,
          email: TestData.User.EmailSecondary,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id,
              username: TestData.User.UsernameEqualMinLength,
              email: TestData.User.EmailSecondary,
              createdAt: createdAt.toISOString(),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to update an existing user with a username containing exactly one character less than the minimum allowed number of valid characters', async () => {
      const {
        user: { id },
        accessToken,
      } = await app.createAuthenticatedUser(UserRole.SUPER_USER);

      return request(app.getHttpServer())
        .put('/users/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.User.UsernameLessThanMinLength,
          email: TestData.User.EmailSecondary,
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
                  matches: 'username can only contain alphanumeric characters',
                  minLength:
                    'username must be longer than or equal to 4 characters',
                },
              },
            ],
          });
        });
    });

    it('should update an existing user with a username containing exactly the maximum allowed number of valid characters', async () => {
      const {
        user: { id, createdAt },
        accessToken,
      } = await app.createAuthenticatedUser(UserRole.SUPER_USER);

      return request(app.getHttpServer())
        .put('/users/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.User.UsernameEqualMaxLength,
          email: TestData.User.EmailSecondary,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id,
              username: TestData.User.UsernameEqualMaxLength,
              email: TestData.User.EmailSecondary,
              createdAt: createdAt.toISOString(),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to update an existing user with a username containing exactly one character more than the maximum allowed number of valid characters', async () => {
      const {
        user: { id },
        accessToken,
      } = await app.createAuthenticatedUser(UserRole.SUPER_USER);

      return request(app.getHttpServer())
        .put('/users/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.User.UsernameGreaterThanMaxLength,
          email: TestData.User.EmailSecondary,
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
                  matches: 'username can only contain alphanumeric characters',
                  maxLength:
                    'username must be shorter than or equal to 20 characters',
                },
              },
            ],
          });
        });
    });

    it('should fail to update an existing user with a username containing invalid characters', async () => {
      const {
        user: { id },
        accessToken,
      } = await app.createAuthenticatedUser(UserRole.SUPER_USER);

      return request(app.getHttpServer())
        .put('/users/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.User.UsernameInvalidCharacters,
          email: TestData.User.EmailSecondary,
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
                  matches: 'username can only contain alphanumeric characters',
                },
              },
            ],
          });
        });
    });

    it('should fail to update an existing user with a non unique email', async () => {
      const {
        user: { id },
        accessToken,
      } = await app.createAuthenticatedUser(UserRole.SUPER_USER);

      await app.createUser(2, UserRole.REGULAR_USER);

      return request(app.getHttpServer())
        .put('/users/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          username: TestData.User.UsernamePrimary,
          email: TestData.User.EmailSecondary,
        })
        .expect(409)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 409,
            message: 'Email must be unique.',
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
          username: TestData.User.UsernameSecondary,
          email: TestData.User.EmailInvalid,
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
          username: TestData.User.UsernameSecondary,
          email: TestData.User.EmailSecondary,
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
          username: TestData.User.UsernameSecondary,
          email: TestData.User.EmailSecondary,
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
          username: TestData.User.UsernameSecondary,
          email: TestData.User.EmailSecondary,
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
        .delete('/users/' + TestData.User.NonExistingUserId)
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
