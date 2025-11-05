import { Logger } from '@nestjs/common';
import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

const logger = new Logger('MikroORM');
const logFn = (message: string) => logger.log(message);

export default defineConfig({
  schema: 'go-train-group-pass',
  clientUrl: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '54322'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  dbName: process.env.DB_NAME || 'postgres',
  extensions: [Migrator],
  highlighter: new SqlHighlighter(),
  debug: process.env.NODE_ENV !== 'production',
  logger: logFn,
  migrations: {
    path: './src/database/migrations',
    tableName: 'mikro_orm_migrations',
    transactional: true,
  },
  seeder: {
    path: './src/database/seeders',
  },
  entities: ['./dist/**/*.entity.js'], // Compiled JS files
  entitiesTs: ['./src/**/*.entity.ts'],
  metadataCache: {
    enabled: true,
  },
});
