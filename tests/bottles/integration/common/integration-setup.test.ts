/**
 * Integration test setup and utilities validation
 *
 * This test file validates that our integration test utilities work correctly
 * before running the full integration tests.
 */

import { describe, it, expect, afterEach } from 'vitest';
import {
  createTestEnvironment,
  createRequirementsFile,
  createPyprojectToml,
  hasVirtualEnvironment,
  TEST_PACKAGES,
  TEST_TIMEOUTS,
  type TestEnvironment,
} from './test-utils.js';
import { getPackageManagerInfo } from '#bottles/environment-detector';

describe('Integration Test Setup', () => {
  const testEnvironments: TestEnvironment[] = [];

  afterEach(async () => {
    await Promise.allSettled(testEnvironments.splice(0).map((env) => env.cleanup()));
  });

  describe('Test Utilities', () => {
    it('should create and cleanup test environments', async () => {
      const env = await createTestEnvironment('basic-setup-test');
      testEnvironments.push(env);

      expect(env.tempDir).toBeDefined();
      expect(env.projectDir).toBeDefined();
      expect(env.shellRPC).toBeDefined();
      expect(env.volumeController).toBeDefined();
      expect(env.cleanup).toBeDefined();

      // Verify directories exist (at least the basic structure)
      expect(typeof env.tempDir).toBe('string');
      expect(typeof env.projectDir).toBe('string');
    });

    it(
      'should check package manager availability',
      async () => {
        const pipAvailability = await getPackageManagerInfo('pip');
        const uvAvailability = await getPackageManagerInfo('uv');

        expect(pipAvailability).toHaveProperty('available');
        expect(typeof pipAvailability.available).toBe('boolean');

        expect(uvAvailability).toHaveProperty('available');
        expect(typeof uvAvailability.available).toBe('boolean');

        if (pipAvailability.available) {
          expect(pipAvailability.version).toBeDefined();
          expect(typeof pipAvailability.version).toBe('string');
        } else {
          expect(pipAvailability.error).toBeDefined();
        }

        if (uvAvailability.available) {
          expect(uvAvailability.version).toBeDefined();
          expect(typeof uvAvailability.version).toBe('string');
        } else {
          expect(uvAvailability.error).toBeDefined();
        }
      },
      TEST_TIMEOUTS.availability,
    );

    it('should create requirements.txt files', async () => {
      const env = await createTestEnvironment('requirements-test');
      testEnvironments.push(env);

      const testPackages = ['click>=8.0.0', 'six>=1.16.0'];
      const filePath = await createRequirementsFile(env.projectDir, testPackages);

      expect(filePath).toContain('requirements.txt');
      expect(filePath).toContain(env.projectDir);
    });

    it('should create pyproject.toml files', async () => {
      const env = await createTestEnvironment('pyproject-test');
      testEnvironments.push(env);

      const filePath = await createPyprojectToml(env.projectDir, {
        name: 'test-project',
        dependencies: ['click>=8.0.0'],
        devDependencies: ['pytest>=7.0.0'],
      });

      expect(filePath).toContain('pyproject.toml');
      expect(filePath).toContain(env.projectDir);
    });

    it('should handle virtual environment detection', async () => {
      const env = await createTestEnvironment('venv-detection-test');
      testEnvironments.push(env);

      // Initially no venv
      const hasVenvBefore = await hasVirtualEnvironment(env.projectDir);
      expect(hasVenvBefore).toBe(false);
    });

    it('should provide test package constants', () => {
      expect(TEST_PACKAGES).toBeDefined();
      expect(TEST_PACKAGES.python).toBeDefined();
      expect(TEST_PACKAGES.python.small).toBeDefined();
      expect(Array.isArray(TEST_PACKAGES.python.small)).toBe(true);
      expect(TEST_PACKAGES.python.small.length).toBeGreaterThan(0);

      expect(TEST_PACKAGES.python.medium).toBeDefined();
      expect(Array.isArray(TEST_PACKAGES.python.medium)).toBe(true);

      expect(TEST_PACKAGES.python.dev).toBeDefined();
      expect(Array.isArray(TEST_PACKAGES.python.dev)).toBe(true);
    });

    it('should provide timeout constants', () => {
      expect(TEST_TIMEOUTS).toBeDefined();
      expect(typeof TEST_TIMEOUTS.availability).toBe('number');
      expect(typeof TEST_TIMEOUTS.venv).toBe('number');
      expect(typeof TEST_TIMEOUTS.install).toBe('number');
      expect(typeof TEST_TIMEOUTS.complex).toBe('number');

      // Reasonable timeout values
      expect(TEST_TIMEOUTS.availability).toBeGreaterThan(0);
      expect(TEST_TIMEOUTS.availability).toBeLessThan(30000);
      expect(TEST_TIMEOUTS.install).toBeGreaterThan(TEST_TIMEOUTS.availability);
    });
  });

  describe('Package Manager Detection', () => {
    it(
      'should report pip availability status',
      async () => {
        const result = await getPackageManagerInfo('pip');

        console.warn(`Pip availability: ${result.available}`);
        if (result.available) {
          console.warn(`Pip version: ${result.version}`);
        } else {
          console.warn(`Pip error: ${result.error}`);
        }

        expect(typeof result.available).toBe('boolean');
      },
      TEST_TIMEOUTS.availability,
    );

    it(
      'should report uv availability status',
      async () => {
        const result = await getPackageManagerInfo('uv');

        console.warn(`UV availability: ${result.available}`);
        if (result.available) {
          console.warn(`UV version: ${result.version}`);
        } else {
          console.warn(`UV error: ${result.error}`);
        }

        expect(typeof result.available).toBe('boolean');
      },
      TEST_TIMEOUTS.availability,
    );
  });

  describe('Shell RPC and Volume Controller', () => {
    it('should create functioning shell RPC', async () => {
      const env = await createTestEnvironment('shell-rpc-test');
      testEnvironments.push(env);

      // Test basic command execution
      const result = await env.shellRPC.execute('echo "test"', 5000);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('test');
    });

    it('should create functioning volume controller', async () => {
      const env = await createTestEnvironment('volume-controller-test');
      testEnvironments.push(env);

      // Test basic volume controller operations
      const testCachePath = '/tmp/test-cache';
      await env.volumeController.mount('npm', testCachePath);

      const mount = env.volumeController.getMount('npm');
      expect(mount).toBeDefined();
      expect(mount?.cachePath).toBe(testCachePath);
    });
  });
});
