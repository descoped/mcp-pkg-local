/**
 * Pip integration tests - Virtual Environment Management
 * Split from pip-bottle.test.ts for parallel execution
 */

import { describe, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { join } from 'node:path';
import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import {
  createTestEnvironment,
  hasVirtualEnvironment,
  TEST_TIMEOUTS,
  skipIfUnavailable,
} from '../common/test-utils.js';
import { createPackageAdapter } from '../common/test-factories.js';
import type { TestEnvironment } from '../common/test-utils.js';

describe('Pip Virtual Environment Management', () => {
  const testEnvironments: TestEnvironment[] = [];

  beforeAll(async () => {
    // Environment detection happens once in global setup
  });

  afterEach(async () => {
    // Cleanup any environments created during failed tests
    for (const env of testEnvironments) {
      try {
        await env.cleanup();
      } catch (error) {
        console.warn('Failed to cleanup test environment:', error);
      }
    }
    testEnvironments.length = 0;
  });

  afterAll(async () => {
    // Final cleanup
    for (const env of testEnvironments) {
      try {
        await env.cleanup();
      } catch (error) {
        console.warn('Failed to cleanup test environment:', error);
      }
    }
  });

  skipIfUnavailable(
    'should create virtual environment in correct location',
    'pip',
    async () => {
      const env = await createTestEnvironment('pip-venv-create');
      testEnvironments.push(env);

      const adapter = createPackageAdapter('pip', env);

      // Create virtual environment
      await adapter.createEnvironment?.(env.projectDir);

      // Check that .venv exists
      const venvPath = join(env.projectDir, '.venv');
      await expect(access(venvPath, constants.F_OK)).resolves.toBeUndefined();

      // Check for Python executable
      const pythonPath = join(venvPath, 'bin', 'python');
      await expect(access(pythonPath, constants.F_OK)).resolves.toBeUndefined();
    },
    TEST_TIMEOUTS.venv,
  );

  skipIfUnavailable(
    'should activate virtual environment correctly',
    'pip',
    async () => {
      const env = await createTestEnvironment('pip-venv-activate');
      testEnvironments.push(env);

      const adapter = createPackageAdapter('pip', env);

      // Create virtual environment
      await adapter.createEnvironment?.(env.projectDir);

      // Activate and get environment variables
      const envVars = await adapter.activateEnvironment?.(env.projectDir);

      expect(envVars).toBeDefined();
      expect(envVars?.VIRTUAL_ENV).toContain('.venv');
      expect(envVars?.PATH).toContain('.venv');
    },
    TEST_TIMEOUTS.venv,
  );

  skipIfUnavailable(
    'should reuse existing virtual environment',
    'pip',
    async () => {
      const env = await createTestEnvironment('pip-venv-reuse');
      testEnvironments.push(env);

      const adapter = createPackageAdapter('pip', env);

      // Create virtual environment
      await adapter.createEnvironment?.(env.projectDir);

      // Verify it exists
      const hasVenv1 = await hasVirtualEnvironment(env.projectDir);
      expect(hasVenv1).toBe(true);

      // Try to create again - should not throw
      await expect(adapter.createEnvironment?.(env.projectDir)).resolves.toBeUndefined();

      // Should still exist
      const hasVenv2 = await hasVirtualEnvironment(env.projectDir);
      expect(hasVenv2).toBe(true);
    },
    TEST_TIMEOUTS.venv,
  );
});
