import { Logger } from '@nestjs/common';
import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

const logger = new Logger('MikroORM');

export default defineConfig({
    dbName: 'go-train-group-pass',
    extensions: [Migrator],
    port: 3308,
    highlighter: new SqlHighlighter(),
    debug: true,
    logger: logger.log.bind(logger),
    seeder: {
        path: './src/database/seeders',
    },
    entities: ['./dist/**/*.entity.js'], // Compiled JS files
    entitiesTs: ['./src/**/*.entity.ts'],
    metadataCache: {
        enabled: true,
    }
});