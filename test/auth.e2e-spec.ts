import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Authorities } from '../src/auth';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    jwtService = app.get<JwtService>(JwtService);
  });

  describe('/auth/token (POST)', () => {
    it('should create both a new access and refresh token', (done) => {
      request(app.getHttpServer())
        .post('/auth/token')
        .send({ username: 'test', password: 'pass' })
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toEqual(
            expect.objectContaining({
              accessToken: expect.any(String),
              refreshToken: expect.any(String),
            }),
          );
          done();
        });
    });

    it('should fail to create both new access and refresh token since wrong username and password', () => {
      return request(app.getHttpServer())
        .post('/auth/token')
        .send({ username: 'test2', password: 'pass2' })
        .expect(400)
        .expect({ statusCode: 400, message: 'Bad credentials' });
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('should refresh authentication using an existing token and then issue new', (done) => {
      const refreshToken = jwtService.sign(
        {
          userId: '7bda9f39-8864-4ebb-a8ff-795d371baf56',
          authorities: [Authorities.REFRESH_TOKEN],
        },
        { expiresIn: 30 },
      );

      request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toEqual(
            expect.objectContaining({
              accessToken: expect.any(String),
              refreshToken: expect.any(String),
            }),
          );
          done();
        });
    });

    it('should fail to refresh authentication using an invalid JWT', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'notAValidRefreshToken' })
        .expect(401)
        .expect({ statusCode: 401, message: 'Unauthorized' });
    });

    it('should fail to refresh authentication without correct refresh authority', () => {
      const refreshToken = jwtService.sign(
        {
          userId: '7bda9f39-8864-4ebb-a8ff-795d371baf56',
        },
        { expiresIn: 30 },
      );

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(400)
        .expect({ statusCode: 400, message: 'Bad jwt' });
    });

    it('should fail to refresh authentication without an valid userId', () => {
      const refreshToken = jwtService.sign(
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

    it('should fail to refresh authentication with an expired refresh token', () => {
      const refreshToken = jwtService.sign(
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
