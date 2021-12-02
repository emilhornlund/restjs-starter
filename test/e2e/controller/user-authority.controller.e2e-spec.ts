import * as request from 'supertest';
import { TestApplication } from '../../test-application';
import { UserRole } from '../../../src/user/service';
import { TestData } from '../../test-data';

describe('UserAuthorityController (e2e)', () => {
  const app: TestApplication = new TestApplication();

  beforeEach(async () => {
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const arrayContainingUserAuthorities = (
    from: number,
    count: number,
  ): any[] => {
    return Array(count)
      .fill(0)
      .map((_, i) => ({
        id: expect.any(String),
        name: `${TestData.UserAuthority.NamePrefix}_${from + i}:read`,
        description: TestData.UserAuthority.PrimaryDescription,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }));
  };

  describe('/user_authorities (GET)', () => {
    it('should get a page of user authorities with default page and size', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id, name, description, createdAt, updatedAt } =
        await app.createUserAuthority('TEST', 'description');

      return request(app.getHttpServer())
        .get('/user_authorities')
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            user_authorities: [
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

    it('should get the first page of 5 user authorities', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );
      await app.createUserAuthorities(1, 10);

      return request(app.getHttpServer())
        .get('/user_authorities?page=0&size=5')
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              user_authorities: arrayContainingUserAuthorities(1, 5),
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

    it('should get the second page of 5 user authorities', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );
      await app.createUserAuthorities(1, 10);

      return request(app.getHttpServer())
        .get('/user_authorities?page=1&size=5')
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              user_authorities: arrayContainingUserAuthorities(6, 5),
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

    it('should fail to get a page of user authorities when missing required authority', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.REGULAR_USER,
      );

      return request(app.getHttpServer())
        .get('/user_authorities')
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

    it('should fail to get an page of user authorities without an access token', async () => {
      await app.createAuthenticatedUser(UserRole.SUPER_USER);

      return request(app.getHttpServer())
        .get('/user_authorities')
        .expect(401)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 401,
            message: 'Unauthorized',
          });
        });
    });

    it('should fail to get an page of user authorities with an expired access token', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
        true,
      );

      return request(app.getHttpServer())
        .get('/user_authorities')
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

  describe('/user_authorities (POST)', () => {
    it('should create a new user authority', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/user_authorities')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserAuthority.PrimaryName,
          description: TestData.UserAuthority.PrimaryDescription,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id: expect.any(String),
              name: TestData.UserAuthority.PrimaryName,
              description: TestData.UserAuthority.PrimaryDescription,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to create a new user authority with a non unique name', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );
      await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .post('/user_authorities')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserAuthority.PrimaryName,
          description: TestData.UserAuthority.PrimaryDescription,
        })
        .expect(409)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 409,
            message: `Authority with name \`${TestData.UserAuthority.PrimaryName}\` must be unique.`,
          });
        });
    });

    it('should create a new user authority with a name length equal to 8 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/user_authorities')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserAuthority.ValidNameExactMinLength,
          description: TestData.UserAuthority.PrimaryDescription,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id: expect.any(String),
              name: TestData.UserAuthority.ValidNameExactMinLength,
              description: TestData.UserAuthority.PrimaryDescription,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to create a new user authority with a name length shorter than 8 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/user_authorities')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserAuthority.InvalidNameLessThanMinLength,
          description: TestData.UserAuthority.PrimaryDescription,
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
                    'name can only contain uppercase letters and underscores followed by either :read or :write',
                  minLength:
                    'name must be longer than or equal to 8 characters',
                },
              },
            ],
          });
        });
    });

    it('should create a new user authority with a name length equal to 32 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/user_authorities')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserAuthority.ValidNameExactMaxLength,
          description: TestData.UserAuthority.PrimaryDescription,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id: expect.any(String),
              name: TestData.UserAuthority.ValidNameExactMaxLength,
              description: TestData.UserAuthority.PrimaryDescription,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to create a new user authority with a name length longer than 32 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/user_authorities')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserAuthority.InvalidNameMoreThanMaxLength,
          description: TestData.UserAuthority.PrimaryDescription,
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

    it('should fail to create a new user authority with a name containing lowercase letters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/user_authorities')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserAuthority.InvalidNameIncludingLowercaseLetters,
          description: TestData.UserAuthority.PrimaryDescription,
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
                    'name can only contain uppercase letters and underscores followed by either :read or :write',
                },
              },
            ],
          });
        });
    });

    it('should fail to create a new user authority with a name containing numbers', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/user_authorities')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserAuthority.InvalidNameIncludingNumbers,
          description: TestData.UserAuthority.PrimaryDescription,
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
                    'name can only contain uppercase letters and underscores followed by either :read or :write',
                },
              },
            ],
          });
        });
    });

    it('should create a new user authority without a description', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/user_authorities')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserAuthority.PrimaryName,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id: expect.any(String),
              name: TestData.UserAuthority.PrimaryName,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should create a new user authority with a description length equal to 2 character', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/user_authorities')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserAuthority.PrimaryName,
          description: TestData.UserAuthority.ValidDescriptionExactMinLength,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id: expect.any(String),
              name: TestData.UserAuthority.PrimaryName,
              description:
                TestData.UserAuthority.ValidDescriptionExactMinLength,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to create a new user authority with a description length shorter than 2 character', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/user_authorities')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserAuthority.PrimaryName,
          description:
            TestData.UserAuthority.InvalidDescriptionLessThanMinLength,
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
                  matches: 'description can only contain word characters',
                  minLength:
                    'description must be longer than or equal to 2 characters',
                },
              },
            ],
          });
        });
    });

    it('should create a new user authority with a description length equal to 128 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/user_authorities')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserAuthority.PrimaryName,
          description:
            TestData.UserAuthority.ValidNameDescriptionExactMaxLength,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id: expect.any(String),
              name: TestData.UserAuthority.PrimaryName,
              description:
                TestData.UserAuthority.ValidNameDescriptionExactMaxLength,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to create a new user authority with a description length longer than 128 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .post('/user_authorities')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserAuthority.PrimaryName,
          description:
            TestData.UserAuthority.InvalidDescriptionMoreThanMaxLength,
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

    it('should fail to create a new user authority when missing required authority', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.REGULAR_USER,
      );

      return request(app.getHttpServer())
        .post('/user_authorities')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserAuthority.PrimaryName,
          description: TestData.UserAuthority.PrimaryDescription,
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

    it('should fail to create a new user authority without an access token', async () => {
      await app.createAuthenticatedUser(UserRole.SUPER_USER);

      return request(app.getHttpServer())
        .post('/user_authorities')
        .send({
          name: TestData.UserAuthority.PrimaryName,
          description: TestData.UserAuthority.PrimaryDescription,
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

    it('should fail to create a new user authority with an expired access token', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
        true,
      );

      return request(app.getHttpServer())
        .post('/user_authorities')
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserAuthority.PrimaryName,
          description: TestData.UserAuthority.PrimaryDescription,
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

  describe('/user_authorities/:userAuthorityId (GET)', () => {
    it('should get an existing user authority by id', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id, name, description, createdAt, updatedAt } =
        await app.createUserAuthority(
          TestData.UserAuthority.PrimaryName,
          TestData.UserAuthority.PrimaryDescription,
        );

      return request(app.getHttpServer())
        .get('/user_authorities/' + id)
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

    it('should fail to get a non existing user authority', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .get('/user_authorities/' + TestData.UserAuthority.NonExistingId)
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(404)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 404,
            message: `Authority with id \`${TestData.UserAuthority.NonExistingId}\` was not found.`,
          });
        });
    });

    it('should fail to get an existing user authority by id when missing required authority', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.REGULAR_USER,
      );

      const { id } = await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .get('/user_authorities/' + id)
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

    it('should fail to get an existing user authority by id without an access token', async () => {
      await app.createAuthenticatedUser(UserRole.SUPER_USER);

      const { id } = await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .get('/user_authorities/' + id)
        .expect(401)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 401,
            message: 'Unauthorized',
          });
        });
    });

    it('should fail to get an existing user authority by id with an expired access token', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
        true,
      );

      const { id } = await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .get('/user_authorities/' + id)
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

  describe('/user_authorities/:userAuthorityId (PUT)', () => {
    it('should update an existing user authority', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id, createdAt } = await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_authorities/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserAuthority.SecondaryName,
          description: TestData.UserAuthority.SecondaryDescription,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id,
              name: TestData.UserAuthority.SecondaryName,
              description: TestData.UserAuthority.SecondaryDescription,
              createdAt: createdAt.toISOString(),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should update an existing user authority without changing name', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id, name, createdAt } = await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_authorities/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name,
          description: TestData.UserAuthority.SecondaryDescription,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id,
              name,
              description: TestData.UserAuthority.SecondaryDescription,
              createdAt: createdAt.toISOString(),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to update a non existing user authority', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_authorities/' + TestData.UserAuthority.NonExistingId)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserAuthority.SecondaryName,
          description: TestData.UserAuthority.SecondaryDescription,
        })
        .expect(404)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 404,
            message: `Authority with id \`${TestData.UserAuthority.NonExistingId}\` was not found.`,
          });
        });
    });

    it('should fail to update an existing user authority with a non unique name', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id } = await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      const { name } = await app.createUserAuthority(
        TestData.UserAuthority.SecondaryName,
        TestData.UserAuthority.SecondaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_authorities/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name,
          description: TestData.UserAuthority.SecondaryDescription,
        })
        .expect(409)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 409,
            message: `Authority with name \`${TestData.UserAuthority.SecondaryName}\` must be unique.`,
          });
        });
    });

    it('should fail to update an existing user authority without a name', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id, description } = await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_authorities/' + id)
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
                    'name can only contain uppercase letters and underscores followed by either :read or :write',
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

    it('should update an existing user authority with a name length equal to 8 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id, createdAt } = await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_authorities/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserAuthority.ValidNameExactMinLength,
          description: TestData.UserAuthority.SecondaryDescription,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id,
              name: TestData.UserAuthority.ValidNameExactMinLength,
              description: TestData.UserAuthority.SecondaryDescription,
              createdAt: createdAt.toISOString(),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to update an existing user authority with a name length shorter than 8 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id } = await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_authorities/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserAuthority.InvalidNameLessThanMinLength,
          description: TestData.UserAuthority.SecondaryDescription,
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
                    'name can only contain uppercase letters and underscores followed by either :read or :write',
                  minLength:
                    'name must be longer than or equal to 8 characters',
                },
              },
            ],
          });
        });
    });

    it('should update an existing user authority with a name length equal to 32 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id, createdAt } = await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_authorities/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserAuthority.ValidNameExactMaxLength,
          description: TestData.UserAuthority.SecondaryDescription,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id,
              name: TestData.UserAuthority.ValidNameExactMaxLength,
              description: TestData.UserAuthority.SecondaryDescription,
              createdAt: createdAt.toISOString(),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to update an existing user authority with a name length longer than 32 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id } = await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_authorities/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserAuthority.InvalidNameMoreThanMaxLength,
          description: TestData.UserAuthority.SecondaryDescription,
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

    it('should fail to update an existing user authority with a name containing lowercase letters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id } = await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_authorities/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserAuthority.InvalidNameIncludingLowercaseLetters,
          description: TestData.UserAuthority.SecondaryDescription,
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
                    'name can only contain uppercase letters and underscores followed by either :read or :write',
                },
              },
            ],
          });
        });
    });

    it('should fail to update an existing user authority with a name containing numbers', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id } = await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_authorities/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserAuthority.InvalidNameIncludingNumbers,
          description: TestData.UserAuthority.SecondaryDescription,
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
                    'name can only contain uppercase letters and underscores followed by either :read or :write',
                },
              },
            ],
          });
        });
    });

    it('should update an existing user authority without a description', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id, name, createdAt } = await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_authorities/' + id)
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

    it('should update an existing user authority with a description length equal to 2 character', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id, name, createdAt } = await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_authorities/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name,
          description: TestData.UserAuthority.ValidDescriptionExactMinLength,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id,
              name,
              description:
                TestData.UserAuthority.ValidDescriptionExactMinLength,
              createdAt: createdAt.toISOString(),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to update an existing user authority with a description length shorter than 2 character', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id, name } = await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_authorities/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name,
          description:
            TestData.UserAuthority.InvalidDescriptionLessThanMinLength,
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
                  matches: 'description can only contain word characters',
                  minLength:
                    'description must be longer than or equal to 2 characters',
                },
              },
            ],
          });
        });
    });

    it('should update an existing user authority with a description length equal to 128 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id, name, createdAt } = await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_authorities/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name,
          description:
            TestData.UserAuthority.ValidNameDescriptionExactMaxLength,
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual(
            expect.objectContaining({
              id,
              name,
              description:
                TestData.UserAuthority.ValidNameDescriptionExactMaxLength,
              createdAt: createdAt.toISOString(),
              updatedAt: expect.any(String),
            }),
          );
        });
    });

    it('should fail to update an existing user authority with a description length longer than 128 characters', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id, name } = await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_authorities/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name,
          description:
            TestData.UserAuthority.InvalidDescriptionMoreThanMaxLength,
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

    it('should fail update an existing user authority when missing required authority', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.REGULAR_USER,
      );

      const { id } = await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_authorities/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserAuthority.SecondaryName,
          description: TestData.UserAuthority.SecondaryDescription,
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

    it('should fail update an existing user authority without an access token', async () => {
      await app.createAuthenticatedUser(UserRole.SUPER_USER);

      const { id } = await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_authorities/' + id)
        .send({
          name: TestData.UserAuthority.SecondaryName,
          description: TestData.UserAuthority.SecondaryDescription,
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

    it('should fail update an existing user authority with an expired access token', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
        true,
      );

      const { id } = await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .put('/user_authorities/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .send({
          name: TestData.UserAuthority.SecondaryName,
          description: TestData.UserAuthority.SecondaryDescription,
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

  describe('/user_authorities/:userAuthorityId (DELETE)', () => {
    it('should delete an existing user authority', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      const { id } = await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .delete('/user_authorities/' + id)
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(204)
        .expect(({ body }) => {
          expect(body).toBeEmpty();
        });
    });

    it('should fail to delete a non existing user authority', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
      );

      return request(app.getHttpServer())
        .delete('/user_authorities/' + TestData.UserAuthority.NonExistingId)
        .set({ Authorization: 'Bearer ' + accessToken })
        .expect(404)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 404,
            message: `Authority with id \`${TestData.UserAuthority.NonExistingId}\` was not found.`,
          });
        });
    });

    it('should fail to delete an existing user authority when missing required authority', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.REGULAR_USER,
      );

      const { id } = await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .delete('/user_authorities/' + id)
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

    it('should fail to delete an existing user authority without an access token', async () => {
      await app.createAuthenticatedUser(UserRole.SUPER_USER);

      const { id } = await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .delete('/user_authorities/' + id)
        .expect(401)
        .expect(({ body }) => {
          expect(body).toBeObject();
          expect(body).toStrictEqual({
            statusCode: 401,
            message: 'Unauthorized',
          });
        });
    });

    it('should fail to delete an existing user authority with an expired access token', async () => {
      const { accessToken } = await app.createAuthenticatedUser(
        UserRole.SUPER_USER,
        true,
      );

      const { id } = await app.createUserAuthority(
        TestData.UserAuthority.PrimaryName,
        TestData.UserAuthority.PrimaryDescription,
      );

      return request(app.getHttpServer())
        .delete('/user_authorities/' + id)
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
