import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BaseConfigService } from './config';

(async () => {
  const app = await NestFactory.create(AppModule);
  const config = await app.get<BaseConfigService>(BaseConfigService);
  await app.listen(config.http.port);
})();
