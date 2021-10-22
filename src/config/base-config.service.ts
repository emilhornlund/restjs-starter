import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpConfig } from './models';

@Injectable()
export class BaseConfigService {
  constructor(private configService: ConfigService) {}

  get http(): HttpConfig {
    return this.configService.get<HttpConfig>('http');
  }
}
