import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/component/**/*.test.tsx'],
    restoreMocks: true,
    reporters: ['default', 'junit'],
    outputFile: { junit: './test-results/vitest-junit.xml' },
  },
});
