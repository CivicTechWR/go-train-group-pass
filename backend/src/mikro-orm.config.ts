import { Migrator } from '@mikro-orm/migrations';
import { SeedManager } from '@mikro-orm/seeder';
import { defineConfig } from '@mikro-orm/postgresql';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { Logger } from '@nestjs/common';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const logger = new Logger('MikroORM');
const logFn = (message: string) => {
  logger.log(message);
};

import * as entities from './entities';
import { ItinerarySubscriber } from './subscribers/itinerary.subscriber';

export default defineConfig({
  schema: 'go-train-group-pass',
  clientUrl: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '54322'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  dbName: process.env.DB_NAME || 'postgres',
  extensions: [Migrator, SeedManager],
  subscribers: [ItinerarySubscriber],
  highlighter: new SqlHighlighter(),
  debug: false,
  logger: logFn,
  migrations: {
    path: './src/database/migrations',
    tableName: 'mikro_orm_migrations',
    transactional: true,
  },
  seeder: {
    path: './src/database/seeders',
  },
  entities: Object.values(entities),
  metadataCache: {
    enabled: false,
  },
  schemaGenerator: {
    ignoreSchema: [
      'auth',
      'storage',
      'realtime',
      '_realtime',
      'net',
      'supabase_functions',
      'vault',
      'information_schema',
      'pg_catalog',
    ],
  },
});
