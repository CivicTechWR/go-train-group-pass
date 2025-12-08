import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/**controller.ts/**'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.spec.ts',
        '**/*.e2e-spec.ts',
        'test/**',
        'vitest.config.ts',
        'mikro-orm.config.ts',
      ],
    },
    include: ['src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
  },
  plugins: [
    // This is required to build the test files with SWC
    swc.vite({
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
      module: { type: 'es6' },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'src': resolve(__dirname, './src'),
      '@go-train-group-pass/shared': resolve(
        __dirname,
        '../packages/shared/src',
      ),
    },
  },
});
