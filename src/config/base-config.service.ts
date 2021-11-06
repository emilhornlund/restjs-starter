import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import * as fs from 'fs';
import { resolve } from 'path';
import { Algorithm } from 'jsonwebtoken';
import { HttpConfig, JwtConfig } from './models';

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
}
