import * as request from 'supertest';
import { TestApplication } from './test-application';
import { UserRole } from '../src/user/service';
import { TestData } from './test-data';

describe('UserRoleController (e2e)', () => {
  const app: TestApplication = new TestApplication();

  beforeEach(async () => {
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const arrayContainingUserRoles = (from: number, count: number): any[] => {
    return Array(count)
      .fill(0)
      .map((_, i) => ({
        id: expect.any(String),
        name: `${TestData.UserRole.NamePrefix}_${from + i}`,
        description: TestData.UserRole.PrimaryDescription,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }));
  };

  describe('/user_roles (GET)', () => {
    it('should get a page of user roles with default page and size', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id, name, description, createdAt, updatedAt } =
        await app.createUserRole('TEST', 'description');

      return request(app.getHttpServer())
        .get('/user_roles')
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            user_roles: [
              {
                id,
                name,
                description,
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

    it('should get the first page of 5 user roles', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );
      await app.createUserRoles(1, 10);

      return request(app.getHttpServer())
        .get('/user_roles?page=0&size=5')
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              user_roles: arrayContainingUserRoles(1, 5),
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

    it('should get the second page of 5 user roles', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );
      await app.createUserRoles(1, 10);

      return request(app.getHttpServer())
        .get('/user_roles?page=1&size=5')
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              user_roles: arrayContainingUserRoles(6, 5),
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

    it('should fail to get a page of user roles when missing required authority', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.REGULAR_USER,
      );

      return request(app.getHttpServer())
        .get('/user_roles')
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

    it('should fail to get an page of user roles without an access token', async () => {
      await app.createAuthenticatedUser(UserRole.SUPER_USER);

      return request(app.getHttpServer())
        .get('/user_roles')
        .expect(401)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 401,
            message: 'Unauthorized',
          });
        });
    });

    it('should fail to get an page of user roles with an expired access token', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
        true,
      );

      return request(app.getHttpServer())
        .get('/user_roles')
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

  describe('/user_roles (POST)', () => {
    it('should create a new user role', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/user_roles')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserRole.PrimaryName,
          description: TestData.UserRole.PrimaryDescription,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id: expect.any(String),
              name: TestData.UserRole.PrimaryName,
              description: TestData.UserRole.PrimaryDescription,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to create a new user role with a non unique name', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );
      await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .post('/user_roles')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserRole.PrimaryName,
          description: TestData.UserRole.PrimaryDescription,
        })
        .expect(409)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 409,
            message: `Role with name \`${TestData.UserRole.PrimaryName}\` must be unique.`,
          });
        });
    });

    it('should create a new user role with a name length equal to 8 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/user_roles')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserRole.ValidNameExactMinLength,
          description: TestData.UserRole.PrimaryDescription,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id: expect.any(String),
              name: TestData.UserRole.ValidNameExactMinLength,
              description: TestData.UserRole.PrimaryDescription,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to create a new user role with a name length shorter than 8 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/user_roles')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserRole.InvalidNameLessThanMinLength,
          description: TestData.UserRole.PrimaryDescription,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Validation failed',
            validationErrors: [
              {
                field: 'name',
                constraints: {
                  minLength:
                    'name must be longer than or equal to 8 characters',
                },
              },
            ],
          });
        });
    });

    it('should create a new user role with a name length equal to 32 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/user_roles')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserRole.ValidNameExactMaxLength,
          description: TestData.UserRole.PrimaryDescription,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id: expect.any(String),
              name: TestData.UserRole.ValidNameExactMaxLength,
              description: TestData.UserRole.PrimaryDescription,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to create a new user role with a name length longer than 32 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/user_roles')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserRole.InvalidNameMoreThanMaxLength,
          description: TestData.UserRole.PrimaryDescription,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Validation failed',
            validationErrors: [
              {
                field: 'name',
                constraints: {
                  maxLength:
                    'name must be shorter than or equal to 32 characters',
                },
              },
            ],
          });
        });
    });

    it('should fail to create a new user role with a name containing lowercase letters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/user_roles')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserRole.InvalidNameIncludingLowercaseLetters,
          description: TestData.UserRole.PrimaryDescription,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Validation failed',
            validationErrors: [
              {
                field: 'name',
                constraints: {
                  matches:
                    'name can only contain uppercase letters and underscores',
                },
              },
            ],
          });
        });
    });

    it('should fail to create a new user role with a name containing numbers', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/user_roles')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserRole.InvalidNameIncludingNumbers,
          description: TestData.UserRole.PrimaryDescription,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Validation failed',
            validationErrors: [
              {
                field: 'name',
                constraints: {
                  matches:
                    'name can only contain uppercase letters and underscores',
                },
              },
            ],
          });
        });
    });

    it('should create a new user role without a description', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/user_roles')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserRole.PrimaryName,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id: expect.any(String),
              name: TestData.UserRole.PrimaryName,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should create a new user role with a description length equal to 2 character', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/user_roles')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserRole.PrimaryName,
          description: TestData.UserRole.ValidDescriptionExactMinLength,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id: expect.any(String),
              name: TestData.UserRole.PrimaryName,
              description: TestData.UserRole.ValidDescriptionExactMinLength,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to create a new user role with a description length shorter than 2 character', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/user_roles')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserRole.PrimaryName,
          description: TestData.UserRole.InvalidDescriptionLessThanMinLength,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Validation failed',
            validationErrors: [
              {
                field: 'description',
                constraints: {
                  minLength:
                    'description must be longer than or equal to 2 characters',
                },
              },
            ],
          });
        });
    });

    it('should create a new user role with a description length equal to 128 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/user_roles')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserRole.PrimaryName,
          description: TestData.UserRole.ValidNameDescriptionExactMaxLength,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id: expect.any(String),
              name: TestData.UserRole.PrimaryName,
              description: TestData.UserRole.ValidNameDescriptionExactMaxLength,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to create a new user role with a description length longer than 128 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/user_roles')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserRole.PrimaryName,
          description: TestData.UserRole.InvalidDescriptionMoreThanMaxLength,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Validation failed',
            validationErrors: [
              {
                field: 'description',
                constraints: {
                  maxLength:
                    'description must be shorter than or equal to 128 characters',
                },
              },
            ],
          });
        });
    });

    it('should fail to create a new user role when missing required authority', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.REGULAR_USER,
      );

      return request(app.getHttpServer())
        .post('/user_roles')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserRole.PrimaryName,
          description: TestData.UserRole.PrimaryDescription,
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

    it('should fail to create a new user role without an access token', async () => {
      await app.createAuthenticatedUser(UserRole.SUPER_USER);

      return request(app.getHttpServer())
        .post('/user_roles')
        .send({
          name: TestData.UserRole.PrimaryName,
          description: TestData.UserRole.PrimaryDescription,
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

    it('should fail to create a new user role with an expired access token', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
        true,
      );

      return request(app.getHttpServer())
        .post('/user_roles')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserRole.PrimaryName,
          description: TestData.UserRole.PrimaryDescription,
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

  describe('/user_roles/:userRoleId (GET)', () => {
    it('should get an existing user role by id', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id, name, description, createdAt, updatedAt } =
        await app.createUserRole(
          TestData.UserRole.PrimaryName,
          TestData.UserRole.PrimaryDescription,
        );

      return request(app.getHttpServer())
        .get('/user_roles/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            id,
            name,
            description,
            createdAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString(),
          });
        });
    });

    it('should fail to get a non existing user role', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .get('/user_roles/' + TestData.UserRole.NonExistingId)
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(404)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 404,
            message: `Role with id \`${TestData.UserRole.NonExistingId}\` was not found.`,
          });
        });
    });

    it('should fail to get an existing user role by id when missing required authority', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.REGULAR_USER,
      );

      const { id } = await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .get('/user_roles/' + id)
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

    it('should fail to get an existing user role by id without an access token', async () => {
      await app.createAuthenticatedUser(UserRole.SUPER_USER);

      const { id } = await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .get('/user_roles/' + id)
        .expect(401)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 401,
            message: 'Unauthorized',
          });
        });
    });

    it('should fail to get an existing user role by id with an expired access token', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
        true,
      );

      const { id } = await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .get('/user_roles/' + id)
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

  describe('/user_roles/:userRoleId (PUT)', () => {
    it('should update an existing user role', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id, createdAt } = await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_roles/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserRole.SecondaryName,
          description: TestData.UserRole.SecondaryDescription,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id,
              name: TestData.UserRole.SecondaryName,
              description: TestData.UserRole.SecondaryDescription,
              createdAt: createdAt.toISOString(),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should update an existing user role without changing name', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id, name, createdAt } = await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_roles/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name,
          description: TestData.UserRole.SecondaryDescription,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id,
              name,
              description: TestData.UserRole.SecondaryDescription,
              createdAt: createdAt.toISOString(),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to update a non existing user role', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_roles/' + TestData.UserRole.NonExistingId)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserRole.SecondaryName,
          description: TestData.UserRole.SecondaryDescription,
        })
        .expect(404)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 404,
            message: `Role with id \`${TestData.UserRole.NonExistingId}\` was not found.`,
          });
        });
    });

    it('should fail to update an existing user role with a non unique name', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id } = await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      const { name } = await app.createUserRole(
        TestData.UserRole.SecondaryName,
        TestData.UserRole.SecondaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_roles/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name,
          description: TestData.UserRole.SecondaryDescription,
        })
        .expect(409)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 409,
            message: `Role with name \`${TestData.UserRole.SecondaryName}\` must be unique.`,
          });
        });
    });

    it('should fail to update an existing user role without a name', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id, description } = await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_roles/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          description,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Validation failed',
            validationErrors: [
              {
                field: 'name',
                constraints: {
                  matches:
                    'name can only contain uppercase letters and underscores',
                  maxLength:
                    'name must be shorter than or equal to 32 characters',
                  minLength:
                    'name must be longer than or equal to 8 characters',
                },
              },
            ],
          });
        });
    });

    it('should update an existing user role with a name length equal to 8 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id, createdAt } = await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_roles/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserRole.ValidNameExactMinLength,
          description: TestData.UserRole.SecondaryDescription,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id,
              name: TestData.UserRole.ValidNameExactMinLength,
              description: TestData.UserRole.SecondaryDescription,
              createdAt: createdAt.toISOString(),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to update an existing user role with a name length shorter than 8 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id } = await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_roles/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserRole.InvalidNameLessThanMinLength,
          description: TestData.UserRole.SecondaryDescription,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Validation failed',
            validationErrors: [
              {
                field: 'name',
                constraints: {
                  minLength:
                    'name must be longer than or equal to 8 characters',
                },
              },
            ],
          });
        });
    });

    it('should update an existing user role with a name length equal to 32 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id, createdAt } = await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_roles/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserRole.ValidNameExactMaxLength,
          description: TestData.UserRole.SecondaryDescription,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id,
              name: TestData.UserRole.ValidNameExactMaxLength,
              description: TestData.UserRole.SecondaryDescription,
              createdAt: createdAt.toISOString(),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to update an existing user role with a name length longer than 32 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id } = await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_roles/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserRole.InvalidNameMoreThanMaxLength,
          description: TestData.UserRole.SecondaryDescription,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Validation failed',
            validationErrors: [
              {
                field: 'name',
                constraints: {
                  maxLength:
                    'name must be shorter than or equal to 32 characters',
                },
              },
            ],
          });
        });
    });

    it('should fail to update an existing user role with a name containing lowercase letters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id } = await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_roles/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserRole.InvalidNameIncludingLowercaseLetters,
          description: TestData.UserRole.SecondaryDescription,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Validation failed',
            validationErrors: [
              {
                field: 'name',
                constraints: {
                  matches:
                    'name can only contain uppercase letters and underscores',
                },
              },
            ],
          });
        });
    });

    it('should fail to update an existing user role with a name containing numbers', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id } = await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_roles/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserRole.InvalidNameIncludingNumbers,
          description: TestData.UserRole.SecondaryDescription,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Validation failed',
            validationErrors: [
              {
                field: 'name',
                constraints: {
                  matches:
                    'name can only contain uppercase letters and underscores',
                },
              },
            ],
          });
        });
    });

    it('should update an existing user role without a description', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id, name, createdAt } = await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_roles/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id,
              name,
              createdAt: createdAt.toISOString(),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should update an existing user role with a description length equal to 2 character', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id, name, createdAt } = await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_roles/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name,
          description: TestData.UserRole.ValidDescriptionExactMinLength,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id,
              name,
              description: TestData.UserRole.ValidDescriptionExactMinLength,
              createdAt: createdAt.toISOString(),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to update an existing user role with a description length shorter than 2 character', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id, name } = await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_roles/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name,
          description: TestData.UserRole.InvalidDescriptionLessThanMinLength,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Validation failed',
            validationErrors: [
              {
                field: 'description',
                constraints: {
                  minLength:
                    'description must be longer than or equal to 2 characters',
                },
              },
            ],
          });
        });
    });

    it('should update an existing user role with a description length equal to 128 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id, name, createdAt } = await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_roles/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name,
          description: TestData.UserRole.ValidNameDescriptionExactMaxLength,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id,
              name,
              description: TestData.UserRole.ValidNameDescriptionExactMaxLength,
              createdAt: createdAt.toISOString(),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to update an existing user role with a description length longer than 128 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id, name } = await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_roles/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name,
          description: TestData.UserRole.InvalidDescriptionMoreThanMaxLength,
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 400,
            message: 'Validation failed',
            validationErrors: [
              {
                field: 'description',
                constraints: {
                  maxLength:
                    'description must be shorter than or equal to 128 characters',
                },
              },
            ],
          });
        });
    });

    it('should fail update an existing user role when missing required authority', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.REGULAR_USER,
      );

      const { id } = await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_roles/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserRole.SecondaryName,
          description: TestData.UserRole.SecondaryDescription,
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

    it('should fail update an existing user role without an access token', async () => {
      await app.createAuthenticatedUser(UserRole.SUPER_USER);

      const { id } = await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_roles/' + id)
        .send({
          name: TestData.UserRole.SecondaryName,
          description: TestData.UserRole.SecondaryDescription,
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

    it('should fail update an existing user role with an expired access token', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
        true,
      );

      const { id } = await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_roles/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserRole.SecondaryName,
          description: TestData.UserRole.SecondaryDescription,
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

  ///

  describe('/user_roles/:userRoleId (DELETE)', () => {
    it('should delete an existing user role', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id } = await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .delete('/user_roles/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(204)
        .expect(({ body }) => {
          expect(body).toBeEmpty();
        });
    });

    it('should fail to delete a non existing user role', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .delete('/user_roles/' + TestData.UserRole.NonExistingId)
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(404)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 404,
            message: `Role with id \`${TestData.UserRole.NonExistingId}\` was not found.`,
          });
        });
    });

    it('should fail to delete an existing user role when missing required authority', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.REGULAR_USER,
      );

      const { id } = await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .delete('/user_roles/' + id)
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

    it('should fail to delete an existing user role without an access token', async () => {
      await app.createAuthenticatedUser(UserRole.SUPER_USER);

      const { id } = await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .delete('/user_roles/' + id)
        .expect(401)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 401,
            message: 'Unauthorized',
          });
        });
    });

    it('should fail to delete an existing user role with an expired access token', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
        true,
      );

      const { id } = await app.createUserRole(
        TestData.UserRole.PrimaryName,
        TestData.UserRole.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .delete('/user_roles/' + id)
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
