import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import * as fs from 'fs';
import { resolve } from 'path';
import { Algorithm } from 'jsonwebtoken';
import { DatabaseConfig, Environments, HttpConfig, JwtConfig } from './index';

@Injectable()
export class BaseConfigService {
  private static JWT_ALGORITHM_HS256: Algorithm = 'HS256';
  private static JWT_ALGORITHM_RS256: Algorithm = 'RS256';
  private static JWT_ISSUER = 'filebuddy';

  constructor(private configService: ConfigService) {}

  get http(): HttpConfig {
    return this.configService.get<HttpConfig>('http');
  }

  get jwt(): JwtConfig {
    return this.configService.get<JwtConfig>('jwt');
  }

  get jwtModuleOptions(): Promise<JwtModuleOptions> {
    const audience = this.configService.get<string>('env');
    const { secret, publicKey, privateKey } = this.jwt;

    const publicKeyPath = publicKey && resolve(process.cwd(), publicKey);
    const privateKeyPath = publicKey && resolve(process.cwd(), privateKey);

    const publicKeyContent = publicKeyPath && fs.readFileSync(publicKeyPath);
    const privateKeyContent = privateKeyPath && fs.readFileSync(privateKeyPath);

    const algorithm = !!secret
      ? BaseConfigService.JWT_ALGORITHM_HS256
      : BaseConfigService.JWT_ALGORITHM_RS256;

    return Promise.resolve({
      secret,
      publicKey: publicKeyContent,
      privateKey: privateKeyContent,
      signOptions: {
        algorithm,
        audience,
        issuer: BaseConfigService.JWT_ISSUER,
      },
      verifyOptions: {
        algorithm,
        audience,
        issuer: BaseConfigService.JWT_ISSUER,
      },
    });
  }

  private static get testTypeOrmModuleOptions(): Promise<TypeOrmModuleOptions> {
    return Promise.resolve({
      type: 'sqlite',
      database: ':memory:',
      autoLoadEntities: true,
      synchronize: true,
    });
  }

  private get postgresTypeOrmModuleOptions(): Promise<TypeOrmModuleOptions> {
    const { host, port, username, password, database, synchronize } =
      this.configService.get<DatabaseConfig>('database');
    return Promise.resolve({
      type: 'postgres',
      host,
      port,
      username,
      password,
      database,
      synchronize,
      autoLoadEntities: true,
    });
  }

  get typeOrmModuleOptions(): Promise<TypeOrmModuleOptions> {
    return this.configService.get<string>('env') === Environments.TEST
      ? BaseConfigService.testTypeOrmModuleOptions
      : this.postgresTypeOrmModuleOptions;
  }
}
