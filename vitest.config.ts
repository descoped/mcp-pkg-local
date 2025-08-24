import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { TIMEOUTS } from './tests/config/timeouts.js';

export default defineConfig({
  resolve: {
    alias: {
      '#types/unified-schema.js': resolve('./src/types/unified-schema.ts'),
      '#types/unified-schema': resolve('./src/types/unified-schema.ts'),
      '#types.js': resolve('./src/types.ts'),
      '#types': resolve('./src/types.ts'),
      '#server.js': resolve('./src/server.ts'),
      '#server': resolve('./src/server.ts'),
      '#scanners': resolve('./src/scanners'),
      '#tools': resolve('./src/tools'),
      '#utils': resolve('./src/utils'),
      '#adapters': resolve('./src/adapters'),
      '#parsers': resolve('./src/parsers'),
      '#processors': resolve('./src/processors'),
      '#bottles/shell-rpc': resolve('./src/bottles/shell-rpc'),
      '#bottles/volume-controller': resolve('./src/bottles/volume-controller'),
      '#bottles/package-managers': resolve('./src/bottles/package-managers'),
      '#bottles/paths': resolve('./src/bottles/paths.ts'),
      '#bottles': resolve('./src/bottles'),
    },
  },
  test: {
    // Global setup that runs once before all tests
    globalSetup: './tests/setup.ts',
    // Run tests sequentially to avoid SQLite database locking issues
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Set test timeout from centralized config
    testTimeout: TIMEOUTS.default,
    // Set environment variables for test mode
    env: {
      NODE_ENV: 'test',
      // Configure bottle cache location (defaults to .pkg-local-cache if not set)
      // This demonstrates that cache location is configurable via environment variable
      BOTTLE_CACHE_ROOT: process.env.BOTTLE_CACHE_ROOT ?? 'output/test-cache',
      // Preserve test directories on failure for debugging (except in CI)
      PRESERVE_TEST_DIRS_ON_FAILURE: process.env.CI ? 'false' : 'true',
      // Use system temp directory in CI for better isolation
      USE_SYSTEM_TEMP: process.env.CI ? 'true' : 'false',
      // Configure test base directory for temporary test files
      TEST_BASE_DIR: process.env.TEST_BASE_DIR ?? 'output/test-temp',
    },
  },
});