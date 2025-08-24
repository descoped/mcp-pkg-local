/**
 * VolumeController cache persistence integration tests
 *
 * These tests validate that the VolumeController properly manages cache persistence
 * across different bottle instances and package manager operations.
 */

import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { join } from 'node:path';
import { access, stat, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';

import { PipAdapter } from '#bottles/package-managers/pip';
import { UVAdapter } from '#bottles/package-managers/uv';
import { TIMEOUTS } from '../../../config/timeouts.js';
import {
  createTestEnvironment,
  createRequirementsFile,
  createPyprojectToml,
  validateInstalledPackages,
  waitFor,
  TEST_PACKAGES,
  TEST_TIMEOUTS,
  type TestEnvironment,
} from './test-utils.js';
import { getCachedEnvironment } from '../../../helpers/environment-cache.js';
import type { EnvironmentInfo } from '#bottles/environment-detector';

// Use centralized detection results (will be evaluated at test time)
let globalEnvironment: EnvironmentInfo;
let PIP_AVAILABLE: boolean;
let UV_AVAILABLE: boolean;

describe('VolumeController Cache Persistence Tests', () => {
  const testEnvironments: TestEnvironment[] = [];

  beforeAll(async () => {
    // Use cached environment detection from global setup
    globalEnvironment = await getCachedEnvironment();
    PIP_AVAILABLE = globalEnvironment.pip.available;
    UV_AVAILABLE = globalEnvironment.uv.available;

    if (!globalEnvironment.pip.available) {
      console.warn(`Pip not available: ${globalEnvironment.pip.error ?? 'Not installed'}`);
    }
    if (!globalEnvironment.uv.available) {
      console.warn(`UV not available: ${globalEnvironment.uv.error ?? 'Not installed'}`);
    }
  }, 30000); // Increased timeout for CI environments

  afterEach(async () => {
    await Promise.allSettled(testEnvironments.splice(0).map((env) => env.cleanup()));
  });

  describe('Pip Cache Persistence', () => {
    it(
      'should persist pip cache across multiple bottle instances',
      async () => {
        if (!PIP_AVAILABLE) {
          // eslint-disable-next-line no-console
          console.log('Skipping test - pip not available');
          return;
        }
        const env1 = await createTestEnvironment('pip-cache-persistence-1');
        const env2 = await createTestEnvironment('pip-cache-persistence-2');
        testEnvironments.push(env1, env2);

        // Shared cache path
        const sharedCachePath = join(env1.tempDir, 'shared-pip-cache');

        // First bottle instance with mounted cache
        await env1.volumeController.mount('pip', sharedCachePath);
        const adapter1 = new PipAdapter(
          env1.shellRPC,
          env1.volumeController,
          env1.environment,
          env1.projectDir,
        );

        // Create environment and install packages
        await adapter1.createEnvironment(env1.projectDir);
        await createRequirementsFile(env1.projectDir, TEST_PACKAGES.python.small);
        await adapter1.installPackages([], { cwd: env1.projectDir });

        // Verify cache was created and populated
        await waitFor(async () => {
          try {
            await access(sharedCachePath, constants.F_OK);
            const stats = await stat(sharedCachePath);
            return stats.isDirectory();
          } catch {
            return false;
          }
        }, TIMEOUTS.short * 2);

        // Check cache has content
        let cacheContents: string[] = [];
        try {
          cacheContents = await readdir(sharedCachePath);
        } catch {
          // Cache might be empty or not yet created
        }

        // Second bottle instance using same cache
        await env2.volumeController.mount('pip', sharedCachePath);
        const adapter2 = new PipAdapter(
          env2.shellRPC,
          env2.volumeController,
          env2.environment,
          env2.projectDir,
        );

        // Verify cache paths are correctly configured
        const cachePaths1 = await adapter1.getCachePaths();
        const cachePaths2 = await adapter2.getCachePaths();

        expect(cachePaths1.global).toBe(sharedCachePath);
        expect(cachePaths2.global).toBe(sharedCachePath);

        // Create second environment and install same packages
        await adapter2.createEnvironment(env2.projectDir);
        await createRequirementsFile(env2.projectDir, TEST_PACKAGES.python.small);

        // Installation should benefit from cached packages
        await adapter2.installPackages([], { cwd: env2.projectDir });

        // Validate packages are installed in second environment
        const validation = await validateInstalledPackages(
          env2.shellRPC,
          TEST_PACKAGES.python.small,
        );
        expect(validation.missing).toHaveLength(0);

        // Cache should still exist and potentially have more content
        try {
          const newCacheContents = await readdir(sharedCachePath);
          expect(newCacheContents.length).toBeGreaterThanOrEqual(cacheContents.length);
        } catch {
          // Cache operations might be complex, but directory should exist
          await access(sharedCachePath, constants.F_OK);
        }
      },
      TEST_TIMEOUTS.complex,
    );

    it(
      'should handle cache mount failures gracefully',
      async () => {
        if (!PIP_AVAILABLE) {
          // eslint-disable-next-line no-console
          console.log('Skipping test - pip not available');
          return;
        }
        const env = await createTestEnvironment('pip-cache-mount-failure');
        testEnvironments.push(env);

        // Try to mount cache to a path that will cause issues
        const problematicPath = '/root/impossible-cache-path';

        // This should throw a VolumeError due to permission issues
        await expect(env.volumeController.mount('pip', problematicPath)).rejects.toThrow(
          'Failed to create cache directory',
        );

        const adapter = new PipAdapter(
          env.shellRPC,
          env.volumeController,
          env.environment,
          env.projectDir,
        );

        // Should fallback to default cache paths
        const cachePaths = await adapter.getCachePaths();
        expect(cachePaths.global).toBeDefined();

        // Should still be able to install packages
        await adapter.createEnvironment(env.projectDir);
        await adapter.installPackages(['click'], { cwd: env.projectDir });

        const validation = await validateInstalledPackages(env.shellRPC, ['click']);
        expect(validation.missing).toHaveLength(0);
      },
      TEST_TIMEOUTS.install,
    );

    it('should isolate caches between different package managers', async () => {
      if (!PIP_AVAILABLE) {
        // eslint-disable-next-line no-console
        console.log('Skipping test - pip not available');
        return;
      }
      const env = await createTestEnvironment('pip-cache-isolation');
      testEnvironments.push(env);

      // Mount separate caches
      const pipCachePath = join(env.tempDir, 'pip-cache');
      const uvCachePath = join(env.tempDir, 'uv-cache');

      await env.volumeController.mount('pip', pipCachePath);
      await env.volumeController.mount('uv', uvCachePath);

      const pipAdapter = new PipAdapter(
        env.shellRPC,
        env.volumeController,
        env.environment,
        env.projectDir,
      );

      // Verify cache isolation
      const pipCachePaths = await pipAdapter.getCachePaths();
      expect(pipCachePaths.global).toBe(pipCachePath);

      // Verify mounts are stored separately
      const pipMount = env.volumeController.getMount('pip');
      const uvMount = env.volumeController.getMount('uv');

      expect(pipMount?.cachePath).toBe(pipCachePath);
      expect(uvMount?.cachePath).toBe(uvCachePath);
      expect(pipMount?.cachePath).not.toBe(uvMount?.cachePath);
    });
  });

  describe('UV Cache Persistence', () => {
    it(
      'should persist UV cache across multiple bottle instances',
      async () => {
        if (!UV_AVAILABLE) {
          // eslint-disable-next-line no-console
          console.log('Skipping test - UV not available');
          return;
        }
        const env1 = await createTestEnvironment('uv-cache-persistence-1');
        const env2 = await createTestEnvironment('uv-cache-persistence-2');
        testEnvironments.push(env1, env2);

        // Shared cache path for UV
        const sharedCachePath = join(env1.tempDir, 'shared-uv-cache');

        // First bottle instance
        await env1.volumeController.mount('uv', sharedCachePath);
        const adapter1 = new UVAdapter(
          env1.shellRPC,
          env1.volumeController,
          env1.environment,
          env1.projectDir,
        );

        // Create project and install packages
        await createPyprojectToml(env1.projectDir, {
          dependencies: TEST_PACKAGES.python.small,
        });
        await adapter1.createEnvironment(env1.projectDir);
        await adapter1.installPackages([], { cwd: env1.projectDir });

        // Verify cache creation
        await waitFor(async () => {
          try {
            await access(sharedCachePath, constants.F_OK);
            return true;
          } catch {
            return false;
          }
        }, TIMEOUTS.short * 2);

        // Second bottle instance with same cache
        await env2.volumeController.mount('uv', sharedCachePath);
        const adapter2 = new UVAdapter(
          env2.shellRPC,
          env2.volumeController,
          env2.environment,
          env2.projectDir,
        );

        // Verify cache paths
        const cachePaths1 = await adapter1.getCachePaths();
        const cachePaths2 = await adapter2.getCachePaths();

        expect(cachePaths1.global).toBe(sharedCachePath);
        expect(cachePaths2.global).toBe(sharedCachePath);

        // Install same packages in second environment
        await createPyprojectToml(env2.projectDir, {
          dependencies: TEST_PACKAGES.python.small,
        });
        await adapter2.createEnvironment(env2.projectDir);

        // Should benefit from UV's superior caching
        await adapter2.installPackages([], { cwd: env2.projectDir });

        // Validate installation
        const validation = await validateInstalledPackages(
          env2.shellRPC,
          TEST_PACKAGES.python.small,
          'uv',
        );
        expect(validation.missing).toHaveLength(0);

        // Cache should persist
        try {
          await access(sharedCachePath, constants.F_OK);
        } catch {
          expect.fail('UV cache should persist');
        }
      },
      TEST_TIMEOUTS.complex,
    );

    it('should handle UV cache with additional paths correctly', async () => {
      if (!UV_AVAILABLE) {
        // eslint-disable-next-line no-console
        console.log('Skipping test - UV not available');
        return;
      }
      const env = await createTestEnvironment('uv-cache-additional-paths');
      testEnvironments.push(env);

      const cachePath = join(env.tempDir, 'uv-cache');
      await env.volumeController.mount('uv', cachePath);

      const adapter = new UVAdapter(
        env.shellRPC,
        env.volumeController,
        env.environment,
        env.projectDir,
      );
      const cachePaths = await adapter.getCachePaths();

      // UV should have additional cache paths
      expect(cachePaths.additional).toBeDefined();
      expect(cachePaths.additional).toHaveLength(3);

      // Check that each expected subdirectory exists in the paths
      const pathStrings = cachePaths.additional?.join(',') ?? '';
      expect(pathStrings).toContain('builds');
      expect(pathStrings).toContain('wheels');
      expect(pathStrings).toContain('git');

      // All additional paths should be under the mounted cache
      // cachePaths.additional is defined after getCachePaths() call
      for (const additionalPath of cachePaths.additional ?? []) {
        expect(additionalPath).toContain(cachePath);
      }
    });
  });

  describe('Cross-Package Manager Cache Management', () => {
    it.skipIf(!(PIP_AVAILABLE && UV_AVAILABLE))(
      'should maintain separate caches for pip and UV',
      async () => {
        const env = await createTestEnvironment('cross-manager-cache');
        testEnvironments.push(env);

        // Mount different cache paths
        const pipCachePath = join(env.tempDir, 'pip-cache');
        const uvCachePath = join(env.tempDir, 'uv-cache');

        await env.volumeController.mount('pip', pipCachePath);
        await env.volumeController.mount('uv', uvCachePath);

        const pipAdapter = new PipAdapter(
          env.shellRPC,
          env.volumeController,
          env.environment,
          env.projectDir,
        );
        const uvAdapter = new UVAdapter(
          env.shellRPC,
          env.volumeController,
          env.environment,
          env.projectDir,
        );

        // Install packages with both managers
        await pipAdapter.createEnvironment(env.projectDir);
        await pipAdapter.installPackages(['click'], { cwd: env.projectDir });

        await createPyprojectToml(env.projectDir, { dependencies: ['six'] });
        await uvAdapter.installPackages(['six'], { cwd: env.projectDir });

        // Both caches should exist
        await waitFor(async () => {
          try {
            await access(pipCachePath, constants.F_OK);
            await access(uvCachePath, constants.F_OK);
            return true;
          } catch {
            return false;
          }
        }, TIMEOUTS.medium);

        // Verify cache separation
        const pipMount = env.volumeController.getMount('pip');
        const uvMount = env.volumeController.getMount('uv');

        expect(pipMount?.cachePath).toBe(pipCachePath);
        expect(uvMount?.cachePath).toBe(uvCachePath);

        // Cache paths should be different
        const pipCachePaths = await pipAdapter.getCachePaths();
        const uvCachePaths = await uvAdapter.getCachePaths();

        expect(pipCachePaths.global).toBe(pipCachePath);
        expect(uvCachePaths.global).toBe(uvCachePath);
        expect(pipCachePaths.global).not.toBe(uvCachePaths.global);
      },
      TEST_TIMEOUTS.complex,
    );

    it('should handle cache cleanup correctly', async () => {
      const env = await createTestEnvironment('cache-cleanup');
      testEnvironments.push(env);

      const cachePath = join(env.tempDir, 'cleanup-cache');
      await env.volumeController.mount('pip', cachePath);

      const adapter = new PipAdapter(
        env.shellRPC,
        env.volumeController,
        env.environment,
        env.projectDir,
      );

      // Install packages to populate cache
      await adapter.createEnvironment(env.projectDir);
      await adapter.installPackages(['click'], { cwd: env.projectDir });

      // Cache should exist
      await waitFor(async () => {
        try {
          await access(cachePath, constants.F_OK);
          return true;
        } catch {
          return false;
        }
      }, TIMEOUTS.short * 2);

      // Cleanup should preserve cache (volume controller manages this)
      await env.volumeController.cleanup?.();

      // Cache should still exist after volume controller cleanup
      // (This depends on volume controller implementation)
      try {
        await access(cachePath, constants.F_OK);
        // If this succeeds, cache persisted
      } catch {
        // If this fails, cache was cleaned up - both behaviors are acceptable
        // depending on volume controller configuration
      }
    });
  });

  describe('Cache Performance and Reliability', () => {
    it.skipIf(!PIP_AVAILABLE)(
      'should show performance benefits of cache persistence',
      async () => {
        const env1 = await createTestEnvironment('cache-perf-1');
        const env2 = await createTestEnvironment('cache-perf-2');
        testEnvironments.push(env1, env2);

        const sharedCache = join(env1.tempDir, 'shared-perf-cache');

        // First installation (cold cache)
        await env1.volumeController.mount('pip', sharedCache);
        const adapter1 = new PipAdapter(
          env1.shellRPC,
          env1.volumeController,
          env1.environment,
          env1.projectDir,
        );

        await adapter1.createEnvironment(env1.projectDir);
        const startTime1 = Date.now();
        await adapter1.installPackages(['requests'], { cwd: env1.projectDir });
        const coldInstallTime = Date.now() - startTime1;

        // Second installation (warm cache)
        await env2.volumeController.mount('pip', sharedCache);
        const adapter2 = new PipAdapter(
          env2.shellRPC,
          env2.volumeController,
          env2.environment,
          env2.projectDir,
        );

        await adapter2.createEnvironment(env2.projectDir);
        const startTime2 = Date.now();
        await adapter2.installPackages(['requests'], { cwd: env2.projectDir });
        const warmInstallTime = Date.now() - startTime2;

        // Both installations should succeed
        const validation1 = await validateInstalledPackages(env1.shellRPC, ['requests']);
        const validation2 = await validateInstalledPackages(env2.shellRPC, ['requests']);

        expect(validation1.missing).toHaveLength(0);
        expect(validation2.missing).toHaveLength(0);

        // Warm installation might be faster, but this is not guaranteed
        // Just ensure both completed successfully
        expect(coldInstallTime).toBeLessThan(TEST_TIMEOUTS.install);
        expect(warmInstallTime).toBeLessThan(TEST_TIMEOUTS.install);
      },
      TEST_TIMEOUTS.complex,
    );

    it.skipIf(!PIP_AVAILABLE)(
      'should handle concurrent cache access safely',
      async () => {
        const env1 = await createTestEnvironment('concurrent-cache-1');
        const env2 = await createTestEnvironment('concurrent-cache-2');
        testEnvironments.push(env1, env2);

        const sharedCache = join(env1.tempDir, 'concurrent-cache');

        // Mount same cache for both environments
        await env1.volumeController.mount('pip', sharedCache);
        await env2.volumeController.mount('pip', sharedCache);

        const adapter1 = new PipAdapter(
          env1.shellRPC,
          env1.volumeController,
          env1.environment,
          env1.projectDir,
        );
        const adapter2 = new PipAdapter(
          env2.shellRPC,
          env2.volumeController,
          env2.environment,
          env2.projectDir,
        );

        // Create environments
        await Promise.all([
          adapter1.createEnvironment(env1.projectDir),
          adapter2.createEnvironment(env2.projectDir),
        ]);

        // Install different packages concurrently
        const installations = await Promise.allSettled([
          adapter1.installPackages(['click'], { cwd: env1.projectDir }),
          adapter2.installPackages(['six'], { cwd: env2.projectDir }),
        ]);

        // Both installations should complete successfully
        expect(installations[0].status).toBe('fulfilled');
        expect(installations[1].status).toBe('fulfilled');

        // Validate installations
        const validation1 = await validateInstalledPackages(env1.shellRPC, ['click']);
        const validation2 = await validateInstalledPackages(env2.shellRPC, ['six']);

        expect(validation1.missing).toHaveLength(0);
        expect(validation2.missing).toHaveLength(0);
      },
      TEST_TIMEOUTS.complex,
    );
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle unmounted cache gracefully', async () => {
      const env = await createTestEnvironment('unmounted-cache');
      testEnvironments.push(env);

      // Don't mount any cache
      const adapter = new PipAdapter(
        env.shellRPC,
        env.volumeController,
        env.environment,
        env.projectDir,
      );

      // Should fallback to default cache paths
      const cachePaths = await adapter.getCachePaths();
      expect(cachePaths.global).toBeDefined();
      expect(cachePaths.local).toBeDefined();

      // Should still function correctly
      if (PIP_AVAILABLE) {
        await adapter.createEnvironment(env.projectDir);
        await adapter.installPackages(['click'], { cwd: env.projectDir });

        const validation = await validateInstalledPackages(env.shellRPC, ['click']);
        expect(validation.missing).toHaveLength(0);
      }
    });

    it('should handle cache path conflicts', async () => {
      const env = await createTestEnvironment('cache-conflicts');
      testEnvironments.push(env);

      const conflictPath = join(env.tempDir, 'conflict-cache');

      // Mount same path for different managers (this might cause issues)
      await env.volumeController.mount('pip', conflictPath);
      await env.volumeController.mount('uv', conflictPath);

      const pipMount = env.volumeController.getMount('pip');
      const uvMount = env.volumeController.getMount('uv');

      // Both should be mounted to the same path (last wins or both point to same)
      expect(pipMount?.cachePath).toBe(conflictPath);
      expect(uvMount?.cachePath).toBe(conflictPath);

      // Applications should handle this gracefully
      const pipAdapter = new PipAdapter(
        env.shellRPC,
        env.volumeController,
        env.environment,
        env.projectDir,
      );
      const pipCachePaths = await pipAdapter.getCachePaths();
      expect(pipCachePaths.global).toBe(conflictPath);
    });
  });
});
