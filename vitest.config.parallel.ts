import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from './vitest.config.js';

// Configuration for tests that can run in parallel (no SQLite access)
export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      // Run tests in parallel for better performance
      // Use forks instead of threads to handle native bindings (node-pty)
      pool: 'forks',
      poolOptions: {
        forks: {
          // Use multiple forks for parallel execution
          singleFork: false,
          minForks: 2,
          maxForks: 4,
        },
      },
    },
  }),
);