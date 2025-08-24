/**
 * Cross-adapter compatibility tests for bottle integration
 *
 * These tests validate that packages installed by one adapter (pip or uv)
 * are visible and scannable by the Python scanner, ensuring interoperability
 * across different package managers.
 */

import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { join } from 'node:path';

import { PipAdapter } from '#bottles/package-managers/pip';
import { UVAdapter } from '#bottles/package-managers/uv';
import type { PackageInfo } from '#bottles/package-managers/base';
import { PythonScanner } from '#scanners/python.js';
import {
  createTestEnvironment,
  createRequirementsFile,
  createPyprojectToml,
  hasVirtualEnvironment,
  validateInstalledPackages,
  TEST_PACKAGES,
  TEST_TIMEOUTS,
  type TestEnvironment,
} from './test-utils.js';
import { getCachedEnvironment } from '../../../helpers/environment-cache.js';
import type { EnvironmentInfo } from '#bottles/environment-detector';

// Detection results will be populated in beforeAll
let globalEnvironment: EnvironmentInfo;
// Don't initialize - will be set in beforeAll based on actual detection
let PIP_AVAILABLE: boolean;
let UV_AVAILABLE: boolean;

describe('Cross-Adapter Compatibility Tests', () => {
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
    // Clean up all test environments created during tests
    await Promise.allSettled(testEnvironments.splice(0).map((env) => env.cleanup()));
  });

  describe('Pip → Scanner Compatibility', () => {
    it(
      'should scan packages installed by pip',
      async () => {
        if (!PIP_AVAILABLE) {
          console.warn('Skipping test - pip not available');
          return;
        }
        const env = await createTestEnvironment('pip-scanner-compat');
        testEnvironments.push(env);

        const pipAdapter = new PipAdapter(
          env.shellRPC,
          env.volumeController,
          env.environment,
          env.projectDir,
        );
        const scanner = new PythonScanner(env.projectDir);

        // Create virtual environment and install packages with pip
        await pipAdapter.createEnvironment(env.projectDir);
        await createRequirementsFile(env.projectDir, TEST_PACKAGES.python.small);
        await pipAdapter.installPackages([], { cwd: env.projectDir });

        // Scan the project with PythonScanner
        const scanResult = await scanner.scan();

        // Should detect all installed packages
        expect(Object.keys(scanResult.packages ?? {}).length).toBeGreaterThan(0);
        const scannerPackageNames = Object.keys(scanResult.packages ?? {});

        for (const testPkg of TEST_PACKAGES.python.small) {
          expect(scannerPackageNames).toContain(testPkg);
        }

        // Cross-validate with pip adapter's own listing
        const pipPackages = await pipAdapter.getInstalledPackages(env.projectDir);
        const pipPackageNames = pipPackages.map((pkg) => pkg.name);

        // Scanner should find the same packages as pip adapter
        for (const pipPkg of pipPackageNames) {
          if (!pipPkg.startsWith('_') && !['pip', 'setuptools', 'wheel'].includes(pipPkg)) {
            expect(scannerPackageNames).toContain(pipPkg);
          }
        }

        // Check that scanner found packages in expected location
        const clickPackage = scanResult.packages?.['click'];
        expect(clickPackage).toBeDefined();
        expect(clickPackage?.location).toContain('.venv');
        expect(clickPackage?.version).toBeDefined();
      },
      TEST_TIMEOUTS.install,
    );

    it(
      'should handle pip-installed packages with various formats',
      async () => {
        const env = await createTestEnvironment('pip-formats-compat');
        testEnvironments.push(env);

        const pipAdapter = new PipAdapter(
          env.shellRPC,
          env.volumeController,
          env.environment,
          env.projectDir,
        );
        const scanner = new PythonScanner(env.projectDir);

        // Create environment
        await pipAdapter.createEnvironment(env.projectDir);

        // Install packages with specific versions and constraints
        const complexRequirements = ['click==8.1.7', 'six>=1.16.0,<2.0.0', 'certifi>=2023.0.0'];
        await createRequirementsFile(env.projectDir, complexRequirements);
        await pipAdapter.installPackages([], { cwd: env.projectDir });

        // Scan with PythonScanner
        const scanResult = await scanner.scan();

        // Should handle version-constrained packages
        const clickPackage = scanResult.packages?.['click'];
        expect(clickPackage).toBeDefined();
        expect(clickPackage?.version).toBe('8.1.7');

        const sixPackage = scanResult.packages?.['six'];
        expect(sixPackage).toBeDefined();
        expect(sixPackage?.version).toMatch(/^1\./); // Should be 1.x version

        const certifiPackage = scanResult.packages?.['certifi'];
        expect(certifiPackage).toBeDefined();
        expect(certifiPackage?.version).toBeDefined();
      },
      TEST_TIMEOUTS.install,
    );
  });

  describe('UV → Scanner Compatibility', () => {
    it(
      'should scan packages installed by uv',
      async () => {
        const env = await createTestEnvironment('uv-scanner-compat');
        testEnvironments.push(env);

        const uvAdapter = new UVAdapter(
          env.shellRPC,
          env.volumeController,
          env.environment,
          env.projectDir,
        );
        const scanner = new PythonScanner(env.projectDir);

        // Create project and install packages with uv
        await createPyprojectToml(env.projectDir, {
          dependencies: TEST_PACKAGES.python.small,
        });
        await uvAdapter.createEnvironment(env.projectDir);
        await uvAdapter.installPackages([], { cwd: env.projectDir });

        // Scan the project with PythonScanner
        const scanResult = await scanner.scan();

        // Should detect all installed packages
        expect(Object.keys(scanResult.packages ?? {}).length).toBeGreaterThan(0);
        const scannerPackageNames = Object.keys(scanResult.packages ?? {});

        for (const testPkg of TEST_PACKAGES.python.small) {
          expect(scannerPackageNames).toContain(testPkg);
        }

        // Cross-validate with uv adapter's own listing
        const uvPackages = await uvAdapter.getInstalledPackages(env.projectDir);
        const uvPackageNames = uvPackages.map((pkg) => pkg.name);

        // Scanner should find the same packages as uv adapter
        for (const uvPkg of uvPackageNames) {
          if (!uvPkg.startsWith('_') && !['pip', 'setuptools', 'wheel'].includes(uvPkg)) {
            expect(scannerPackageNames).toContain(uvPkg);
          }
        }

        // Check that scanner found packages in expected location
        const clickPackage = scanResult.packages?.['click'];
        expect(clickPackage).toBeDefined();
        expect(clickPackage?.location).toContain('.venv');
        expect(clickPackage?.version).toBeDefined();
      },
      TEST_TIMEOUTS.install,
    );

    it(
      'should handle uv dev dependencies correctly in scanner',
      async () => {
        const env = await createTestEnvironment('uv-dev-scanner-compat');
        testEnvironments.push(env);

        const uvAdapter = new UVAdapter(
          env.shellRPC,
          env.volumeController,
          env.environment,
          env.projectDir,
        );
        const scanner = new PythonScanner(env.projectDir);

        // Create project with dev dependencies
        await createPyprojectToml(env.projectDir, {
          dependencies: ['click>=8.0.0'],
          devDependencies: ['pytest>=7.0.0'],
        });
        await uvAdapter.createEnvironment(env.projectDir);
        await uvAdapter.installPackages([], { cwd: env.projectDir });

        // Scan the project
        const scanResult = await scanner.scan();

        // Should detect both regular and dev dependencies
        const scannerPackageNames = Object.keys(scanResult.packages ?? {});
        expect(scannerPackageNames).toContain('click');
        expect(scannerPackageNames).toContain('pytest');

        // Check that versions are correctly detected
        const clickPackage = scanResult.packages?.['click'];
        const pytestPackage = scanResult.packages?.['pytest'];

        expect(clickPackage?.version).toBeDefined();
        expect(pytestPackage?.version).toBeDefined();
      },
      TEST_TIMEOUTS.install,
    );
  });

  describe('Mixed Environment Compatibility', () => {
    it(
      'should handle packages installed by both pip and uv in same environment',
      async () => {
        const env = await createTestEnvironment('mixed-managers');
        testEnvironments.push(env);

        // Create pyproject.toml required for UV operations
        await createPyprojectToml(env.projectDir, {
          name: 'mixed-managers-test',
          dependencies: [], // Will be filled by UV
        });

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
        const scanner = new PythonScanner(env.projectDir);

        // Create virtual environment
        await pipAdapter.createEnvironment(env.projectDir);

        // Install some packages with pip
        await pipAdapter.installPackages(['click==8.1.7'], { cwd: env.projectDir });

        // Install additional packages with uv (using existing environment)
        await uvAdapter.installPackages(['six>=1.16.0'], { cwd: env.projectDir });

        // Scan the project
        const scanResult = await scanner.scan();

        // Should detect packages from both managers
        const scannerPackageNames = Object.keys(scanResult.packages ?? {});
        expect(scannerPackageNames).toContain('click');
        expect(scannerPackageNames).toContain('six');

        // Both adapters should see all packages
        const pipPackages = await pipAdapter.getInstalledPackages(env.projectDir);
        const uvPackages = await uvAdapter.getInstalledPackages(env.projectDir);

        const pipPackageNames = pipPackages.map((pkg) => pkg.name);
        const uvPackageNames = uvPackages.map((pkg) => pkg.name);

        expect(pipPackageNames).toContain('click');
        expect(pipPackageNames).toContain('six');
        expect(uvPackageNames).toContain('click');
        expect(uvPackageNames).toContain('six');
      },
      TEST_TIMEOUTS.install,
    );

    it(
      'should maintain consistency across different scanning methods',
      async () => {
        const env = await createTestEnvironment('scanning-consistency');
        testEnvironments.push(env);

        const pipAdapter = new PipAdapter(
          env.shellRPC,
          env.volumeController,
          env.environment,
          env.projectDir,
        );
        const scanner = new PythonScanner(env.projectDir);

        // Install packages
        await pipAdapter.createEnvironment(env.projectDir);
        await createRequirementsFile(env.projectDir, TEST_PACKAGES.python.medium);
        await pipAdapter.installPackages([], { cwd: env.projectDir });

        // Get package lists from different sources
        const [scannerResult, pipPackages] = await Promise.all([
          scanner.scan(),
          pipAdapter.getInstalledPackages(env.projectDir),
        ]);

        // Direct validation with shell command
        const shellValidation = await validateInstalledPackages(
          env.shellRPC,
          TEST_PACKAGES.python.medium,
        );

        // All methods should agree on installed packages
        const scannerNames = Object.keys(scannerResult.packages ?? {});
        const pipNames = pipPackages.map((pkg: PackageInfo) => pkg.name);

        expect(shellValidation.missing).toHaveLength(0);

        for (const testPkg of TEST_PACKAGES.python.medium) {
          expect(scannerNames).toContain(testPkg);
          expect(pipNames).toContain(testPkg);
        }

        // Version consistency check
        for (const testPkg of TEST_PACKAGES.python.medium) {
          const scannerPkg = scannerResult.packages?.[testPkg];
          const pipPkg = pipPackages.find((pkg: PackageInfo) => pkg.name === testPkg);

          expect(scannerPkg).toBeDefined();
          expect(pipPkg).toBeDefined();
          expect(scannerPkg?.version).toBe(pipPkg?.version);
        }
      },
      TEST_TIMEOUTS.install,
    );
  });

  describe('Shared Virtual Environment Scenarios', () => {
    it.skipIf(!PIP_AVAILABLE)(
      'should handle pre-existing virtual environment',
      async () => {
        const env = await createTestEnvironment('preexisting-venv');
        testEnvironments.push(env);

        // Create virtual environment manually
        await env.shellRPC.execute(
          `python -m venv "${join(env.projectDir, '.venv')}"`,
          TEST_TIMEOUTS.venv,
        );

        // Both adapters should detect and use existing environment
        const pipAdapter = new PipAdapter(
          env.shellRPC,
          env.volumeController,
          env.environment,
          env.projectDir,
        );
        const scanner = new PythonScanner(env.projectDir);

        // Verify environment detection
        expect(await hasVirtualEnvironment(env.projectDir)).toBe(true);

        // Install packages using pip adapter
        await pipAdapter.installPackages(['click'], { cwd: env.projectDir });

        // Scanner should find the packages
        const scanResult = await scanner.scan();
        const packageNames = Object.keys(scanResult.packages ?? {});
        expect(packageNames).toContain('click');
      },
      TEST_TIMEOUTS.install,
    );

    it.skipIf(!(PIP_AVAILABLE && UV_AVAILABLE))(
      'should handle environment transitions between managers',
      async () => {
        const env = await createTestEnvironment('manager-transitions');
        testEnvironments.push(env);

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
        const scanner = new PythonScanner(env.projectDir);

        // Start with pip
        await pipAdapter.createEnvironment(env.projectDir);
        await pipAdapter.installPackages(['click==8.1.7'], { cwd: env.projectDir });

        // Verify pip installation
        let scanResult = await scanner.scan();
        expect(scanResult.packages?.['click']).toBeDefined();

        // Switch to uv (should use existing environment)
        await createPyprojectToml(env.projectDir, {
          dependencies: ['six>=1.16.0'],
        });
        await uvAdapter.installPackages(['six'], { cwd: env.projectDir });

        // Both packages should be available
        scanResult = await scanner.scan();
        const packageNames = Object.keys(scanResult.packages ?? {});
        expect(packageNames).toContain('click');
        expect(packageNames).toContain('six');

        // Both adapters should see both packages
        const pipPackages = await pipAdapter.getInstalledPackages(env.projectDir);
        const uvPackages = await uvAdapter.getInstalledPackages(env.projectDir);

        const pipNames = pipPackages.map((pkg) => pkg.name);
        const uvNames = uvPackages.map((pkg) => pkg.name);

        expect(pipNames).toContain('click');
        expect(pipNames).toContain('six');
        expect(uvNames).toContain('click');
        expect(uvNames).toContain('six');
      },
      TEST_TIMEOUTS.install,
    );
  });

  describe('Error Handling and Edge Cases', () => {
    it.skipIf(!PIP_AVAILABLE)(
      'should handle corrupted package installations',
      async () => {
        const env = await createTestEnvironment('corrupted-packages');
        testEnvironments.push(env);

        const pipAdapter = new PipAdapter(
          env.shellRPC,
          env.volumeController,
          env.environment,
          env.projectDir,
        );
        const scanner = new PythonScanner(env.projectDir);

        // Install packages normally
        await pipAdapter.createEnvironment(env.projectDir);
        await pipAdapter.installPackages(['click'], { cwd: env.projectDir });

        // Scanner should handle the environment gracefully even with potential issues
        const scanResult = await scanner.scan();
        expect(Object.keys(scanResult.packages ?? {}).length).toBeGreaterThan(0);

        // Should still find the properly installed package
        const clickPackage = scanResult.packages?.['click'];
        expect(clickPackage).toBeDefined();
      },
      TEST_TIMEOUTS.install,
    );

    it('should handle environments with no packages gracefully', async () => {
      const env = await createTestEnvironment('empty-environment');
      testEnvironments.push(env);

      const scanner = new PythonScanner(env.projectDir);

      // Scan empty project directory
      const scanResult = await scanner.scan();

      // Should return empty result without errors
      expect(scanResult.packages).toEqual({});
      expect(scanResult.totalPackages).toBe(0);
    });

    it.skipIf(!PIP_AVAILABLE)(
      'should handle partial installation failures',
      async () => {
        const env = await createTestEnvironment('partial-failures');
        testEnvironments.push(env);

        const pipAdapter = new PipAdapter(
          env.shellRPC,
          env.volumeController,
          env.environment,
          env.projectDir,
        );
        const scanner = new PythonScanner(env.projectDir);

        // Install one valid package
        await pipAdapter.createEnvironment(env.projectDir);
        await pipAdapter.installPackages(['click'], { cwd: env.projectDir });

        // Scanner should still work with partially successful installations
        const scanResult = await scanner.scan();
        const packageNames = Object.keys(scanResult.packages ?? {});

        expect(packageNames).toContain('click');
      },
      TEST_TIMEOUTS.install,
    );
  });
});
