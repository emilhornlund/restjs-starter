import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({
  path: resolve(process.cwd(), '.env.development'),
});

export = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['src/user/repository/model/*.entity.ts'],
  migrations: ['assets/migration/*.ts'],
  cli: {
    migrationsDir: 'assets/migration',
  },
};
