/**
 * Integration tests for Pip package manager adapter
 *
 * These tests validate real pip package installation, requirements.txt processing,
 * virtual environment creation, and package listing functionality.
 */

import { describe, expect, beforeAll, afterEach } from 'vitest';

import type { PipAdapter } from '#bottles/package-managers/pip';
import { PythonScanner } from '#scanners/python.js';
import { join } from 'node:path';
import { access, constants } from 'node:fs/promises';
import {
  createTestEnvironment,
  createRequirementsFile,
  hasVirtualEnvironment,
  validateInstalledPackages,
  retryWithBackoff,
  skipIfUnavailable,
  TEST_PACKAGES,
  TEST_TIMEOUTS,
  type TestEnvironment,
  type PackageManagerAvailability,
} from '../common/test-utils.js';
import {
  createPackageAdapter,
  createPackageInstallationTests,
  TestScenarioFactory,
} from '../common/test-factories.js';
import { getCachedEnvironment } from '../../../helpers/environment-cache.js';
import type { EnvironmentInfo } from '#bottles/environment-detector';

// Detection results will be populated in beforeAll
let environment: EnvironmentInfo;
let pipAvailability: PackageManagerAvailability;

describe('Pip Bottle Integration Tests', () => {
  const testEnvironments: TestEnvironment[] = [];

  beforeAll(async () => {
    // Use cached environment detection from global setup
    environment = await getCachedEnvironment();
    pipAvailability = {
      available: environment.pip.available,
      version: environment.pip.version,
      error: environment.pip.error,
    };
    if (!pipAvailability.available) {
      console.warn(`Pip not available on system: ${pipAvailability.error ?? 'Not installed'}`);
    }
  }, 5000); // Allow more time for environment detection

  afterEach(async () => {
    // Clean up all test environments created during tests
    await Promise.allSettled(testEnvironments.splice(0).map((env) => env.cleanup()));
  });

  describe('Basic Package Installation', () => {
    skipIfUnavailable(
      'should install small packages from requirements.txt',
      'pip',
      async () => {
        const tests = createPackageInstallationTests('pip');
        const env = await createTestEnvironment('pip-basic-install');
        testEnvironments.push(env);

        const installedPackages = await tests.testBasicInstall(env, TEST_PACKAGES.python.small);
        const installedNames = installedPackages.map((pkg) => pkg.name);

        for (const expectedPkg of TEST_PACKAGES.python.small) {
          expect(installedNames).toContain(expectedPkg);
        }
      },
      TEST_TIMEOUTS.install,
    );

    skipIfUnavailable(
      'should install specific packages without requirements file',
      'pip',
      async () => {
        const env = await createTestEnvironment('pip-specific-install');
        testEnvironments.push(env);

        const adapter = createPackageAdapter('pip', env);

        // Create virtual environment
        await adapter.createEnvironment(env.projectDir);

        // Install specific packages
        const packagesToInstall = ['click==8.1.7', 'six>=1.16.0'];
        await adapter.installPackages(packagesToInstall, { cwd: env.projectDir });

        // Validate installation
        const installedPackages = await adapter.getInstalledPackages(env.projectDir);
        const installedNames = installedPackages.map((pkg) => pkg.name);

        expect(installedNames).toContain('click');
        expect(installedNames).toContain('six');

        // Check specific version constraint for click
        const clickPackage = installedPackages.find((pkg) => pkg.name === 'click');
        expect(clickPackage).toBeDefined();
        expect(clickPackage?.version).toBe('8.1.7');
      },
      TEST_TIMEOUTS.install,
    );

    skipIfUnavailable(
      'should handle complex requirements.txt with includes',
      'pip',
      async () => {
        const env = await createTestEnvironment('pip-complex-requirements');
        testEnvironments.push(env);

        const adapter = createPackageAdapter('pip', env);

        // Create virtual environment
        await adapter.createEnvironment(env.projectDir);

        // Create base requirements
        await createRequirementsFile(env.projectDir, ['click>=8.0.0'], 'base-requirements.txt');

        // Create main requirements with includes
        const mainRequirements = ['-r base-requirements.txt', 'six>=1.16.0', 'certifi>=2023.0.0'];
        await createRequirementsFile(env.projectDir, mainRequirements, 'requirements.txt');

        // Install packages
        await adapter.installPackages([], { cwd: env.projectDir });

        // Validate all packages are installed
        const validation = await validateInstalledPackages(env.shellRPC, [
          'click',
          'six',
          'certifi',
        ]);

        expect(validation.missing).toHaveLength(0);
      },
      TEST_TIMEOUTS.install,
    );

    skipIfUnavailable(
      'should handle both production and dev dependencies',
      'pip',
      async () => {
        const tests = createPackageInstallationTests('pip');
        const env = await createTestEnvironment('pip-dev-dependencies');
        testEnvironments.push(env);

        const validation = await tests.testDevDependencies(
          env,
          TEST_PACKAGES.python.small,
          TEST_PACKAGES.python.dev,
        );

        expect(validation.missing).toHaveLength(0);
        expect(validation.installed).toContain('six');
        expect(validation.installed).toContain('click');
        expect(validation.installed).toContain('pytest');
        expect(validation.installed).toContain('black');
      },
      TEST_TIMEOUTS.install,
    );
  });

  describe('Virtual Environment Management', () => {
    skipIfUnavailable(
      'should create virtual environment in correct location',
      'pip',
      async () => {
        const tests = createPackageInstallationTests('pip');
        const env = await createTestEnvironment('pip-venv-location');
        testEnvironments.push(env);

        const venvExists = await tests.testVirtualEnvironment(env);
        expect(venvExists).toBe(true);

        // Verify structure
        const venvPath = join(env.projectDir, '.venv');
        await expect(access(join(venvPath, 'bin'), constants.F_OK)).resolves.toBeUndefined();
        await expect(access(join(venvPath, 'lib'), constants.F_OK)).resolves.toBeUndefined();
      },
      TEST_TIMEOUTS.venv,
    );

    skipIfUnavailable(
      'should activate virtual environment correctly',
      'pip',
      async () => {
        const env = await createTestEnvironment('pip-venv-activation');
        testEnvironments.push(env);

        const adapter = createPackageAdapter('pip', env);

        // Create virtual environment
        await adapter.createEnvironment(env.projectDir);

        // Get activation environment
        const activationEnv = await adapter.activateEnvironment(env.projectDir);

        // Verify activation environment variables
        expect(activationEnv).toHaveProperty('VIRTUAL_ENV');
        expect(activationEnv.VIRTUAL_ENV).toContain('.venv');
        expect(activationEnv).toHaveProperty('PATH');
        expect(activationEnv.PATH).toContain('.venv');
      },
      TEST_TIMEOUTS.venv,
    );

    skipIfUnavailable(
      'should skip virtual environment creation if it already exists',
      'pip',
      async () => {
        const env = await createTestEnvironment('pip-venv-skip');
        testEnvironments.push(env);

        const adapter = createPackageAdapter('pip', env);

        // Create virtual environment first time
        await adapter.createEnvironment(env.projectDir);
        expect(await hasVirtualEnvironment(env.projectDir)).toBe(true);

        // Try to create again - should skip
        await adapter.createEnvironment(env.projectDir);
        expect(await hasVirtualEnvironment(env.projectDir)).toBe(true);
      },
      TEST_TIMEOUTS.venv,
    );
  });

  describe('Cache Management', () => {
    skipIfUnavailable(
      'should configure pip cache paths correctly',
      'pip',
      async () => {
        const env = await createTestEnvironment('pip-cache-config');
        testEnvironments.push(env);

        const adapter = createPackageAdapter('pip', env) as PipAdapter;

        // Create virtual environment
        await adapter.createEnvironment(env.projectDir);

        // Get cache directory from adapter - use Reflect to access protected method
        const getEnv = Reflect.get(adapter, 'getEnvironmentVariables') as (
          this: PipAdapter,
        ) => Promise<Record<string, string>>;
        const cacheEnv = await getEnv.call(adapter);

        expect(cacheEnv).toHaveProperty('PIP_CACHE_DIR');
        expect(cacheEnv.PIP_CACHE_DIR).toContain('cache');
        expect(cacheEnv.PIP_CACHE_DIR).toContain('pip');
      },
      TEST_TIMEOUTS.cache, // Will be auto-multiplied by 3x for pip
    );

    skipIfUnavailable(
      'should use volume controller cache when available',
      'pip',
      async () => {
        const env = await createTestEnvironment('pip-volume-cache');
        testEnvironments.push(env);

        const adapter = createPackageAdapter('pip', env) as PipAdapter;

        // Verify volume controller is being used
        const cacheEnv = await (
          adapter as unknown as { getEnvironmentVariables: () => Promise<Record<string, string>> }
        )['getEnvironmentVariables']();
        expect(cacheEnv.PIP_CACHE_DIR).toBeDefined();

        // The cache should be in the volume controller's mount path
        expect(cacheEnv.PIP_CACHE_DIR).toContain('bottles');
      },
      TEST_TIMEOUTS.cache, // Will be auto-multiplied by 3x for pip
    );

    skipIfUnavailable(
      'should share cache between multiple installations',
      'pip',
      async () => {
        // Create standard environment with packages
        const { env, installedPackages } = await TestScenarioFactory.createStandardEnvironment(
          'pip-cache-sharing',
          'pip',
          ['six'],
        );
        testEnvironments.push(env);

        expect(installedPackages.length).toBeGreaterThan(0);

        // Create second environment with same volume controller
        const env2 = await createTestEnvironment('pip-cache-sharing-2');
        testEnvironments.push(env2);

        // Use same volume controller ID for cache sharing
        env2.volumeController = env.volumeController;

        const adapter2 = createPackageAdapter('pip', env2);

        // Create virtual environment and install same package
        await adapter2.createEnvironment(env2.projectDir);
        await createRequirementsFile(env2.projectDir, ['six']);

        // This should use cached package
        await adapter2.installPackages([], { cwd: env2.projectDir });

        // Verify package is installed
        const validation = await validateInstalledPackages(env2.shellRPC, ['six']);
        expect(validation.missing).toHaveLength(0);
      },
      TEST_TIMEOUTS.complex,
    );
  });

  describe('Package Listing and Metadata', () => {
    skipIfUnavailable(
      'should list all installed packages with metadata',
      'pip',
      async () => {
        const { env, installedPackages } = await TestScenarioFactory.createStandardEnvironment(
          'pip-list-metadata',
          'pip',
        );
        testEnvironments.push(env);

        // Verify metadata structure
        for (const pkg of installedPackages) {
          expect(pkg).toHaveProperty('name');
          expect(pkg).toHaveProperty('version');
          expect(pkg).toHaveProperty('location');
          expect(pkg.name).toBeTruthy();
          expect(pkg.version).toBeTruthy();
          expect(pkg.location).toContain('site-packages');
        }

        // Verify we got the expected packages
        const packageNames = installedPackages.map((p) => p.name);
        for (const expectedPkg of TEST_PACKAGES.python.small) {
          expect(packageNames).toContain(expectedPkg);
        }
      },
      TEST_TIMEOUTS.list, // Will be auto-multiplied by 3x for pip
    );

    skipIfUnavailable(
      'should handle package listing with mixed dependencies',
      'pip',
      async () => {
        const { env, prodPackages, devPackages } =
          await TestScenarioFactory.createMixedDependencyEnvironment('pip-mixed-listing', 'pip');
        testEnvironments.push(env);

        const adapter = createPackageAdapter('pip', env);
        const installedPackages = await adapter.getInstalledPackages(env.projectDir);
        const packageNames = installedPackages.map((p) => p.name);

        // Check all packages are present
        for (const pkg of [...prodPackages, ...devPackages]) {
          expect(packageNames).toContain(pkg);
        }
      },
      TEST_TIMEOUTS.list, // Will be auto-multiplied by 3x for pip
    );
  });

  describe('Scanner Integration', () => {
    skipIfUnavailable(
      'should work with Python scanner to discover packages',
      'pip',
      async () => {
        const { env } = await TestScenarioFactory.createStandardEnvironment(
          'pip-scanner-integration',
          'pip',
        );
        testEnvironments.push(env);

        // Use Python scanner to discover packages
        const scanner = new PythonScanner(env.projectDir);
        const scanResult = await scanner.scan();

        // Verify scanner found packages
        expect(scanResult.packages).toBeDefined();
        const foundPackages = Object.keys(scanResult.packages ?? {});

        // Should find our test packages
        for (const pkg of TEST_PACKAGES.python.small) {
          expect(foundPackages).toContain(pkg);
        }

        // Verify package metadata from scanner
        for (const pkgName of TEST_PACKAGES.python.small) {
          const pkgInfo = scanResult.packages?.[pkgName];
          expect(pkgInfo).toBeDefined();
          expect(pkgInfo?.version).toBeTruthy();
          expect(pkgInfo?.location).toContain('site-packages');
        }
      },
      TEST_TIMEOUTS.complex,
    );
  });

  describe('Error Handling', () => {
    skipIfUnavailable(
      'should handle missing virtual environment gracefully',
      'pip',
      async () => {
        const env = await createTestEnvironment('pip-error-no-venv');
        testEnvironments.push(env);

        const adapter = createPackageAdapter('pip', env);

        // Try to list packages without virtual environment
        const packages = await adapter.getInstalledPackages(env.projectDir);
        expect(packages).toEqual([]);
      },
      TEST_TIMEOUTS.list,
    );

    skipIfUnavailable(
      'should handle invalid package names gracefully',
      'pip',
      async () => {
        const env = await createTestEnvironment('pip-error-invalid-package');
        testEnvironments.push(env);

        const adapter = createPackageAdapter('pip', env);

        // Create virtual environment
        await adapter.createEnvironment(env.projectDir);

        // Try to install non-existent package
        await expect(
          adapter.installPackages(['this-package-definitely-does-not-exist-12345'], {
            cwd: env.projectDir,
          }),
        ).rejects.toThrow();
      },
      TEST_TIMEOUTS.install,
    );

    skipIfUnavailable(
      'should handle package listing failures when no environment exists',
      'pip',
      async () => {
        const env = await createTestEnvironment('pip-error-list-no-env');
        testEnvironments.push(env);

        const adapter = createPackageAdapter('pip', env);

        // Try to get installed packages without creating environment
        const packages = await adapter.getInstalledPackages(env.projectDir);
        expect(packages).toEqual([]);
      },
      TEST_TIMEOUTS.list,
    );
  });

  describe('Performance and Reliability', () => {
    skipIfUnavailable(
      'should handle concurrent package installations',
      'pip',
      async () => {
        const env = await createTestEnvironment('pip-concurrent');
        testEnvironments.push(env);

        const adapter = createPackageAdapter('pip', env);

        // Create virtual environment
        await adapter.createEnvironment(env.projectDir);

        // Install packages concurrently
        await Promise.all([
          adapter.installPackages(['six'], { cwd: env.projectDir }),
          adapter.installPackages(['click'], { cwd: env.projectDir }),
        ]);

        // Verify both packages are installed
        const validation = await validateInstalledPackages(env.shellRPC, ['six', 'click']);
        expect(validation.missing).toHaveLength(0);
      },
      TEST_TIMEOUTS.complex,
    );

    skipIfUnavailable(
      'should retry failed operations',
      'pip',
      async () => {
        const env = await createTestEnvironment('pip-retry');
        testEnvironments.push(env);

        const adapter = createPackageAdapter('pip', env);

        // Create virtual environment with retry logic
        await retryWithBackoff(async () => {
          await adapter.createEnvironment(env.projectDir);
        });

        expect(await hasVirtualEnvironment(env.projectDir)).toBe(true);
      },
      TEST_TIMEOUTS.complex,
    );
  });
});
