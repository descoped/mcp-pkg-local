/**
 * Pip integration tests - Package Installation
 * Split from pip-bottle.test.ts for parallel execution
 */

import { describe, expect, beforeAll, afterAll, afterEach } from 'vitest';
import {
  createTestEnvironment,
  createRequirementsFile,
  validateInstalledPackages,
  TEST_PACKAGES,
  TEST_TIMEOUTS,
  skipIfUnavailable,
} from '../common/test-utils.js';
import { createPackageAdapter } from '../common/test-factories.js';
import type { TestEnvironment } from '../common/test-utils.js';

describe('Pip Package Installation Tests', () => {
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
    'should install packages from requirements.txt',
    'pip',
    async () => {
      const env = await createTestEnvironment('pip-install-requirements');
      testEnvironments.push(env);

      const adapter = createPackageAdapter('pip', env);

      // Create requirements.txt
      await createRequirementsFile(env.projectDir, TEST_PACKAGES.python.small);

      // Create virtual environment
      await adapter.createEnvironment?.(env.projectDir);

      // Install packages
      await adapter.installPackages([], {
        cwd: env.projectDir,
      });

      // Validate installation
      const validation = await validateInstalledPackages(
        env.shellRPC,
        TEST_PACKAGES.python.small,
        'pip',
      );
      expect(validation.missing).toEqual([]);
    },
    TEST_TIMEOUTS.install,
  );

  skipIfUnavailable(
    'should install specific packages with pip install',
    'pip',
    async () => {
      const env = await createTestEnvironment('pip-install-specific');
      testEnvironments.push(env);

      const adapter = createPackageAdapter('pip', env);

      // Create virtual environment
      await adapter.createEnvironment?.(env.projectDir);

      // Install specific packages
      await adapter.installPackages(TEST_PACKAGES.python.small, {
        cwd: env.projectDir,
      });

      // Validate installation
      const validation = await validateInstalledPackages(
        env.shellRPC,
        TEST_PACKAGES.python.small,
        'pip',
      );
      expect(validation.missing).toEqual([]);
    },
    TEST_TIMEOUTS.install,
  );

  skipIfUnavailable(
    'should handle development dependencies',
    'pip',
    async () => {
      const env = await createTestEnvironment('pip-install-dev');
      testEnvironments.push(env);

      const adapter = createPackageAdapter('pip', env);

      // Create main and dev requirements
      await createRequirementsFile(env.projectDir, TEST_PACKAGES.python.small);
      await createRequirementsFile(
        env.projectDir,
        TEST_PACKAGES.python.dev,
        'requirements-dev.txt',
      );

      // Create virtual environment
      await adapter.createEnvironment?.(env.projectDir);

      // Install all packages including dev
      await adapter.installPackages([], {
        cwd: env.projectDir,
        dev: true,
      });

      // Validate all packages are installed
      const validation = await validateInstalledPackages(
        env.shellRPC,
        [...TEST_PACKAGES.python.small, ...TEST_PACKAGES.python.dev],
        'pip',
      );
      expect(validation.missing).toEqual([]);
    },
    TEST_TIMEOUTS.install,
  );
});
