import {
  ConfigModule,
  ConfigService as NestConfigService,
} from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '../../src/common/service';
import * as fs from 'fs';

jest.mock('fs');

describe('ConfigService', () => {
  let nestConfigService: NestConfigService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [NestConfigService],
    }).compile();

    nestConfigService = module.get<NestConfigService>(NestConfigService);
    configService = new ConfigService(nestConfigService);
  });

  it('should define the config service', () => {
    expect(configService).toBeDefined();
  });

  describe('http config', () => {
    it('should return undefined http config', () => {
      jest.spyOn(nestConfigService, 'get').mockReturnValueOnce(undefined);
      expect(configService.http).toBeUndefined();
    });

    it('should return http config', async () => {
      jest.spyOn(nestConfigService, 'get').mockReturnValueOnce({ port: 8080 });
      expect(configService.http).toStrictEqual({ port: 8080 });
    });
  });

  describe('jwt config', () => {
    it('should return jwt config using secret', async () => {
      jest.spyOn(nestConfigService, 'get').mockImplementation((key: string) => {
        if (key === 'jwt') {
          return {
            secret: 'secret',
            publicKey: null,
            privateKey: null,
          };
        } else if (key === 'env') {
          return 'test';
        }
      });
      expect(await configService.jwtModuleOptions).toStrictEqual({
        secret: 'secret',
        privateKey: null,
        publicKey: null,
        signOptions: {
          algorithm: 'HS256',
          audience: 'test',
          issuer: 'restjs-starter',
        },
        verifyOptions: {
          algorithm: 'HS256',
          audience: 'test',
          issuer: 'restjs-starter',
        },
      });
    });

    it('should return jwt config using public and private keys', async () => {
      jest.spyOn(nestConfigService, 'get').mockImplementation((key: string) => {
        if (key === 'jwt') {
          return {
            secret: null,
            publicKey: 'private.key',
            privateKey: 'public.key',
          };
        } else if (key === 'env') {
          return 'test';
        }
      });
      jest.spyOn(fs, 'readFileSync').mockReturnValue('content');
      expect(await configService.jwtModuleOptions).toStrictEqual({
        secret: null,
        privateKey: 'content',
        publicKey: 'content',
        signOptions: {
          algorithm: 'RS256',
          audience: 'test',
          issuer: 'restjs-starter',
        },
        verifyOptions: {
          algorithm: 'RS256',
          audience: 'test',
          issuer: 'restjs-starter',
        },
      });
    });
  });

  describe('database config', () => {
    it('should return test database config', async () => {
      jest.spyOn(nestConfigService, 'get').mockImplementation((key) => {
        if (key === 'env') {
          return 'test';
        }
      });
      expect(await configService.typeOrmModuleOptions).toStrictEqual({
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        autoLoadEntities: true,
      });
    });

    it('should return development database config', async () => {
      jest.spyOn(nestConfigService, 'get').mockImplementation((key) => {
        if (key === 'database') {
          return {
            host: 'localhost',
            port: 8080,
            username: 'user',
            password: 'pass',
            database: 'testdb',
            synchronize: false,
          };
        } else if (key === 'env') {
          return 'development';
        }
      });
      expect(await configService.typeOrmModuleOptions).toStrictEqual({
        type: 'postgres',
        host: 'localhost',
        port: 8080,
        username: 'user',
        password: 'pass',
        database: 'testdb',
        synchronize: false,
        autoLoadEntities: true,
      });
    });
  });
});
