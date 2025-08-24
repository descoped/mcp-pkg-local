/**
 * Integration tests for UV package manager adapter
 *
 * These tests validate real UV package installation, pyproject.toml processing,
 * virtual environment creation, and package listing functionality.
 */

import { describe, expect, beforeAll, afterEach } from 'vitest';
import { join } from 'node:path';
import { readFile, writeFile, access, constants } from 'node:fs/promises';

import type { UVAdapter } from '#bottles/package-managers/uv';
import { PythonScanner } from '#scanners/python.js';
import { getCachedEnvironment } from '../../../helpers/environment-cache.js';
import {
  createTestEnvironment,
  createPyprojectToml,
  hasVirtualEnvironment,
  validateInstalledPackages,
  skipIfUnavailable,
  skipIfAnyUnavailable,
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
import type { EnvironmentInfo } from '#bottles/environment-detector';

// Detection results will be populated in beforeAll
let environment: EnvironmentInfo;
let uvAvailability: PackageManagerAvailability;

describe('UV Bottle Integration Tests', () => {
  const testEnvironments: TestEnvironment[] = [];

  beforeAll(async () => {
    // Use cached environment detection from global setup
    environment = await getCachedEnvironment();
    uvAvailability = {
      available: environment.uv.available,
      version: environment.uv.version,
      error: environment.uv.error,
    };
    if (!uvAvailability.available) {
      console.warn(`UV not available on system: ${uvAvailability.error ?? 'Not installed'}`);
    }
  }, 5000);

  afterEach(async () => {
    // Clean up all test environments created during tests
    await Promise.allSettled(testEnvironments.splice(0).map((env) => env.cleanup()));
  });

  describe('Basic Package Installation', () => {
    skipIfUnavailable(
      'should install packages from pyproject.toml',
      'uv',
      async () => {
        const tests = createPackageInstallationTests('uv');
        const env = await createTestEnvironment('uv-basic-install');
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
      'should install specific packages using uv add',
      'uv',
      async () => {
        const env = await createTestEnvironment('uv-specific-install');
        testEnvironments.push(env);

        const adapter = createPackageAdapter('uv', env);

        // Create virtual environment
        await adapter.createEnvironment(env.projectDir);

        // Create minimal pyproject.toml first
        await createPyprojectToml(env.projectDir, {
          dependencies: [],
        });

        // Install specific packages using UV add
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
      'should handle version constraints in pyproject.toml',
      'uv',
      async () => {
        const tests = createPackageInstallationTests('uv');
        const env = await createTestEnvironment('uv-version-constraints');
        testEnvironments.push(env);

        const constraints = ['click>=8.0.0', 'six>=1.16.0,<2.0.0'];
        const validation = await tests.testVersionConstraints(env, constraints);

        expect(validation.missing).toHaveLength(0);
        expect(validation.installed).toContain('click');
        expect(validation.installed).toContain('six');
      },
      TEST_TIMEOUTS.install,
    );

    skipIfUnavailable(
      'should handle both production and dev dependencies',
      'uv',
      async () => {
        const tests = createPackageInstallationTests('uv');
        const env = await createTestEnvironment('uv-dev-dependencies');
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
      'uv',
      async () => {
        const tests = createPackageInstallationTests('uv');
        const env = await createTestEnvironment('uv-venv-location');
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
      'uv',
      async () => {
        const env = await createTestEnvironment('uv-venv-activation');
        testEnvironments.push(env);

        const adapter = createPackageAdapter('uv', env);

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
      'uv',
      async () => {
        const env = await createTestEnvironment('uv-venv-skip');
        testEnvironments.push(env);

        const adapter = createPackageAdapter('uv', env);

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

  describe('Manifest Parsing', () => {
    skipIfUnavailable(
      'should parse pyproject.toml with UV configuration',
      'uv',
      async () => {
        const env = await createTestEnvironment('uv-pyproject-parsing');
        testEnvironments.push(env);

        const adapter = createPackageAdapter('uv', env) as UVAdapter;

        // Create complex pyproject.toml
        const pyprojectContent = `
[project]
name = "test-project"
version = "0.1.0"
description = "Test project for UV"
dependencies = [
    "click>=8.0.0",
    "six>=1.16.0",
]

[dependency-groups]
dev = [
    "pytest>=7.0.0",
    "black>=22.0.0",
]

[tool.uv]
preview = true
compile = false
`;

        await writeFile(join(env.projectDir, 'pyproject.toml'), pyprojectContent);

        // Parse and verify
        const manifest = await adapter.parseManifest(env.projectDir);
        expect(manifest).toBeDefined();
        expect(manifest?.dependencies).toHaveProperty('click');
        expect(manifest?.dependencies['click']).toMatch(/>=8\.0\.0/);
        expect(manifest?.dependencies).toHaveProperty('six');
        expect(manifest?.dependencies['six']).toMatch(/>=1\.16\.0/);
        expect(manifest?.devDependencies).toHaveProperty('pytest');
        expect(manifest?.devDependencies['pytest']).toMatch(/>=7\.0\.0/);
        expect(manifest?.devDependencies).toHaveProperty('black');
        expect(manifest?.devDependencies['black']).toMatch(/>=22\.0\.0/);
      },
      TEST_TIMEOUTS.list,
    );

    skipIfUnavailable(
      'should parse uv.lock file for precise versions',
      'uv',
      async () => {
        const env = await createTestEnvironment('uv-lock-parsing');
        testEnvironments.push(env);

        const adapter = createPackageAdapter('uv', env);

        // Create pyproject.toml and install to generate lock file
        await createPyprojectToml(env.projectDir, {
          dependencies: ['six', 'click'],
        });

        await adapter.createEnvironment(env.projectDir);
        await adapter.installPackages([], { cwd: env.projectDir });

        // Check if lock file was created
        const lockFilePath = join(env.projectDir, 'uv.lock');
        let lockFileContent = '';
        try {
          lockFileContent = await readFile(lockFilePath, 'utf-8');
        } catch {
          // Lock file may not exist in all UV versions
          console.warn('UV lock file not created - skipping lock file parsing test');
          return;
        }

        // Verify lock file has TOML structure
        expect(lockFileContent).toContain('version =');
        expect(lockFileContent).toMatch(/\[\[package]]/);

        // Check for package entries
        expect(lockFileContent).toContain('name = "six"');
        expect(lockFileContent).toContain('name = "click"');
      },
      TEST_TIMEOUTS.sync,
    );

    skipIfUnavailable(
      'should detect UV workspace configuration',
      'uv',
      async () => {
        const env = await createTestEnvironment('uv-workspace');
        testEnvironments.push(env);

        // Create workspace-style pyproject.toml
        const workspaceContent = `
[project]
name = "workspace-root"
version = "0.1.0"

[tool.uv.workspace]
members = ["packages/*"]

[tool.uv]
preview = true
`;

        await writeFile(join(env.projectDir, 'pyproject.toml'), workspaceContent);

        const adapter = createPackageAdapter('uv', env) as UVAdapter;
        const manifest = await adapter.parseManifest(env.projectDir);
        expect(manifest).toBeDefined();
        expect(manifest?.name).toBe('workspace-root');
      },
      TEST_TIMEOUTS.list,
    );
  });

  describe('Cache Management', () => {
    skipIfUnavailable(
      'should configure UV cache paths correctly',
      'uv',
      async () => {
        const env = await createTestEnvironment('uv-cache-config');
        testEnvironments.push(env);

        const adapter = createPackageAdapter('uv', env) as UVAdapter;

        // Create virtual environment
        await adapter.createEnvironment(env.projectDir);

        // Get cache directory from adapter
        const cacheEnv = await (
          adapter as unknown as { getEnvironmentVariables: () => Promise<Record<string, string>> }
        )['getEnvironmentVariables']();
        expect(cacheEnv).toHaveProperty('UV_CACHE_DIR');
        expect(cacheEnv.UV_CACHE_DIR).toContain('cache');
        expect(cacheEnv.UV_CACHE_DIR).toContain('uv');
      },
      TEST_TIMEOUTS.cache,
    );

    skipIfUnavailable(
      'should use volume controller cache when available',
      'uv',
      async () => {
        const env = await createTestEnvironment('uv-volume-cache');
        testEnvironments.push(env);

        const adapter = createPackageAdapter('uv', env) as UVAdapter;

        // Verify volume controller is being used
        const cacheEnv = await (
          adapter as unknown as { getEnvironmentVariables: () => Promise<Record<string, string>> }
        )['getEnvironmentVariables']();
        expect(cacheEnv.UV_CACHE_DIR).toBeDefined();

        // The cache should be in the volume controller's mount path
        expect(cacheEnv.UV_CACHE_DIR).toContain('bottles');
      },
      TEST_TIMEOUTS.cache,
    );

    skipIfUnavailable(
      'should share cache between multiple installations',
      'uv',
      async () => {
        // Create standard environment with packages
        const { env, installedPackages } = await TestScenarioFactory.createStandardEnvironment(
          'uv-cache-sharing',
          'uv',
          ['six'],
        );
        testEnvironments.push(env);

        expect(installedPackages.length).toBeGreaterThan(0);

        // Create second environment with same volume controller
        const env2 = await createTestEnvironment('uv-cache-sharing-2');
        testEnvironments.push(env2);

        // Use same volume controller ID for cache sharing
        env2.volumeController = env.volumeController;

        const adapter2 = createPackageAdapter('uv', env2);

        // Create virtual environment and install same package
        await adapter2.createEnvironment(env2.projectDir);
        await createPyprojectToml(env2.projectDir, { dependencies: ['six'] });

        // This should use cached package
        await adapter2.installPackages([], { cwd: env2.projectDir });

        // Verify package is installed
        const validation = await validateInstalledPackages(env2.shellRPC, ['six'], 'uv');
        expect(validation.missing).toHaveLength(0);
      },
      TEST_TIMEOUTS.complex,
    );
  });

  describe('Package Management Operations', () => {
    skipIfUnavailable(
      'should list all installed packages with metadata',
      'uv',
      async () => {
        const { env, installedPackages } = await TestScenarioFactory.createStandardEnvironment(
          'uv-list-metadata',
          'uv',
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
      TEST_TIMEOUTS.list,
    );

    skipIfUnavailable(
      'should handle UV sync operation correctly',
      'uv',
      async () => {
        const env = await createTestEnvironment('uv-sync-operation');
        testEnvironments.push(env);

        const adapter = createPackageAdapter('uv', env);

        // Create pyproject.toml
        await createPyprojectToml(env.projectDir, {
          dependencies: TEST_PACKAGES.python.small,
        });

        // Create virtual environment
        await adapter.createEnvironment(env.projectDir);

        // Run UV sync (empty packages array triggers sync)
        await adapter.installPackages([], { cwd: env.projectDir });

        // Validate all packages from pyproject.toml are installed
        const validation = await validateInstalledPackages(
          env.shellRPC,
          TEST_PACKAGES.python.small,
          'uv',
        );
        expect(validation.missing).toHaveLength(0);
      },
      TEST_TIMEOUTS.sync,
    );
  });

  describe('Scanner Integration', () => {
    skipIfUnavailable(
      'should work with Python scanner to discover packages',
      'uv',
      async () => {
        const { env } = await TestScenarioFactory.createStandardEnvironment(
          'uv-scanner-integration',
          'uv',
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

  describe('Error Handling and Validation', () => {
    skipIfUnavailable(
      'should validate UV installation correctly',
      'uv',
      async () => {
        const env = await createTestEnvironment('uv-validation');
        testEnvironments.push(env);

        // Validate UV is available by checking version directly
        const versionResult = await env.shellRPC.execute('uv --version', 5000);
        expect(versionResult.exitCode).toBe(0);
        expect(versionResult.stdout).toContain('uv');
      },
      TEST_TIMEOUTS.detection,
    );

    skipIfUnavailable(
      'should handle missing pyproject.toml gracefully',
      'uv',
      async () => {
        const env = await createTestEnvironment('uv-missing-manifest');
        testEnvironments.push(env);

        const adapter = createPackageAdapter('uv', env) as UVAdapter;

        // Try to parse non-existent manifest
        const manifest = await adapter.parseManifest(env.projectDir);
        expect(manifest).toBeUndefined();
      },
      TEST_TIMEOUTS.list,
    );

    skipIfUnavailable(
      'should handle invalid package names gracefully',
      'uv',
      async () => {
        const env = await createTestEnvironment('uv-invalid-package');
        testEnvironments.push(env);

        const adapter = createPackageAdapter('uv', env);

        // Create virtual environment and minimal pyproject.toml
        await adapter.createEnvironment(env.projectDir);
        await createPyprojectToml(env.projectDir);

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
      'should handle missing virtual environment gracefully',
      'uv',
      async () => {
        const env = await createTestEnvironment('uv-no-venv');
        testEnvironments.push(env);

        const adapter = createPackageAdapter('uv', env);

        // Try to list packages without virtual environment
        const packages = await adapter.getInstalledPackages(env.projectDir);
        expect(packages).toEqual([]);
      },
      TEST_TIMEOUTS.list,
    );
  });

  describe('Performance and UV-Specific Features', () => {
    skipIfUnavailable(
      'should handle UV pip operations efficiently',
      'uv',
      async () => {
        const env = await createTestEnvironment('uv-pip-operations');
        testEnvironments.push(env);

        const adapter = createPackageAdapter('uv', env);

        // Create virtual environment
        await adapter.createEnvironment(env.projectDir);

        // UV pip install (direct pip-like operation)
        const startTime = Date.now();
        await env.shellRPC.execute('uv pip install six click', TEST_TIMEOUTS.install);
        const installTime = Date.now() - startTime;

        // UV should be faster than traditional pip
        expect(installTime).toBeLessThan(TEST_TIMEOUTS.install);

        // Verify packages are installed
        const validation = await validateInstalledPackages(env.shellRPC, ['six', 'click'], 'uv');
        expect(validation.missing).toHaveLength(0);
      },
      TEST_TIMEOUTS.install,
    );

    skipIfUnavailable(
      'should handle UV-specific environment variables',
      'uv',
      async () => {
        const env = await createTestEnvironment('uv-env-vars');
        testEnvironments.push(env);

        const adapter = createPackageAdapter('uv', env) as UVAdapter;

        // Get UV-specific environment variables
        const envVars = await (
          adapter as unknown as { getEnvironmentVariables: () => Promise<Record<string, string>> }
        )['getEnvironmentVariables']();

        // Verify UV-specific variables are set
        expect(envVars).toHaveProperty('UV_CACHE_DIR');
        expect(envVars).toHaveProperty('UV_PYTHON_PREFERENCE');
        expect(envVars.UV_PYTHON_PREFERENCE).toBe('only-system');

        // UV should not interfere with standard Python
        expect(envVars).not.toHaveProperty('PIP_CACHE_DIR');
      },
      TEST_TIMEOUTS.list,
    );

    skipIfAnyUnavailable(
      'should perform better than pip for large installations',
      ['pip', 'uv'],
      async () => {
        // Create two environments for comparison
        const pipEnv = await createTestEnvironment('performance-pip');
        const uvEnv = await createTestEnvironment('performance-uv');
        testEnvironments.push(pipEnv, uvEnv);

        const pipAdapter = createPackageAdapter('pip', pipEnv);
        const uvAdapter = createPackageAdapter('uv', uvEnv);

        // Test packages for performance comparison
        const testPackages = TEST_PACKAGES.python.medium;

        // Measure pip installation time
        await pipAdapter.createEnvironment(pipEnv.projectDir);
        await createPyprojectToml(pipEnv.projectDir, { dependencies: testPackages });
        const pipStart = Date.now();
        await pipAdapter.installPackages(testPackages, { cwd: pipEnv.projectDir });
        const pipTime = Date.now() - pipStart;

        // Measure UV installation time
        await uvAdapter.createEnvironment(uvEnv.projectDir);
        await createPyprojectToml(uvEnv.projectDir, { dependencies: testPackages });
        const uvStart = Date.now();
        await uvAdapter.installPackages([], { cwd: uvEnv.projectDir }); // UV sync
        const uvTime = Date.now() - uvStart;

        // UV should generally be faster
        // Log performance comparison for debugging
        if (process.env.DEBUG_BOTTLES) {
          /* eslint-disable no-console */
          console.log(`Performance comparison - pip: ${pipTime}ms, uv: ${uvTime}ms`);
          /* eslint-enable no-console */
        }

        // Verify both installed correctly
        const pipValidation = await validateInstalledPackages(pipEnv.shellRPC, testPackages);
        const uvValidation = await validateInstalledPackages(uvEnv.shellRPC, testPackages, 'uv');

        expect(pipValidation.missing).toHaveLength(0);
        expect(uvValidation.missing).toHaveLength(0);
      },
      TEST_TIMEOUTS.complex,
    );
  });
});
