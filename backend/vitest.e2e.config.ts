import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import { resolve } from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['test/**/*.e2e-spec.ts'],
        exclude: ['node_modules', 'dist'],
        testTimeout: 10000,
    },
    plugins: [swc.vite()],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            'src': resolve(__dirname, './src'),
            '@go-train-group-pass/shared': resolve(__dirname, '../packages/shared/src'),
        },
    },
});
