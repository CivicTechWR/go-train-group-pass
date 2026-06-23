// Custom webpack config for `nest build` (webpack mode).
//
// MikroORM's knex layer and some Nest/Fastify plugins statically reference
// optional peer packages (alternative DB drivers, view engines, etc.) that we
// don't install — we only use PostgreSQL. When webpack bundles the app it tries
// to resolve every such import and fails with "Module not found". These imports
// are guarded at runtime, so it is safe to tell webpack to ignore the ones that
// are not actually installed.
//
// This mirrors the official NestJS recommendation for optional dependencies:
// https://docs.nestjs.com/faq/serverless#mind-optional-dependencies
const optionalImports = [
  // MikroORM / knex optional database drivers (we only use postgresql):
  'better-sqlite3',
  'libsql',
  'mariadb',
  'mariadb/callback',
  'mysql',
  'mysql2',
  'oracledb',
  'pg-native',
  'pg-query-stream',
  'sqlite3',
  'tedious',
  // Optional Fastify view engine referenced by @nestjs/platform-fastify:
  '@fastify/view',
];

module.exports = (options, webpack) => ({
  ...options,
  plugins: [
    ...options.plugins,
    new webpack.IgnorePlugin({
      checkResource(resource) {
        if (!optionalImports.includes(resource)) {
          return false;
        }
        try {
          // Keep the import if the package is actually installed.
          require.resolve(resource, { paths: [process.cwd()] });
        } catch {
          // Not installed -> ignore it so webpack doesn't fail the build.
          return true;
        }
        return false;
      },
    }),
  ],
});
