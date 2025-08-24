/**
 * Test factory patterns for Bottles integration tests
 *
 * This module provides reusable factory functions to reduce code duplication
 * and ensure consistent test environment setup across all integration tests.
 */

import type {
  TestEnvironment,
  PackageAdapter,
  PackageManagerType,
  ValidationResult,
} from './types.js';
import {
  createTestEnvironment,
  createRequirementsFile,
  createPyprojectToml,
  validateInstalledPackages,
  TEST_PACKAGES,
  TEST_TIMEOUTS,
} from './test-utils.js';
import { PipAdapter } from '#bottles/package-managers/pip';
import { UVAdapter } from '#bottles/package-managers/uv';
import type { PackageInfo } from '#bottles/package-managers/base';

/**
 * Factory for creating package adapter instances
 */
export function createPackageAdapter(
  type: PackageManagerType,
  env: TestEnvironment,
): PackageAdapter {
  switch (type) {
    case 'pip':
      return new PipAdapter(env.shellRPC, env.volumeController, env.environment, env.projectDir);
    case 'uv':
      return new UVAdapter(env.shellRPC, env.volumeController, env.environment, env.projectDir);
    default:
      throw new Error(`Unsupported package manager type: ${type as string}`);
  }
}

/**
 * Factory for creating package installation test scenarios
 */
export function createPackageInstallationTests(adapterType: PackageManagerType): {
  testBasicInstall: (env: TestEnvironment, packages: string[]) => Promise<PackageInfo[]>;
  testDevDependencies: (
    env: TestEnvironment,
    deps: string[],
    devDeps: string[],
  ) => Promise<ValidationResult>;
  testVersionConstraints: (
    env: TestEnvironment,
    constraints: string[],
  ) => Promise<ValidationResult>;
  testVirtualEnvironment: (env: TestEnvironment) => Promise<boolean>;
} {
  return {
    /**
     * Test basic package installation
     */
    async testBasicInstall(env: TestEnvironment, packages: string[]): Promise<PackageInfo[]> {
      const adapter = createPackageAdapter(adapterType, env);

      // Create virtual environment
      await adapter.createEnvironment(env.projectDir);

      // Create manifest based on adapter type
      if (adapterType === 'pip') {
        await createRequirementsFile(env.projectDir, packages);
        await adapter.installPackages([], { cwd: env.projectDir });
      } else {
        await createPyprojectToml(env.projectDir, {
          dependencies: packages,
        });
        await adapter.installPackages([], { cwd: env.projectDir });
      }

      // Validate installation
      const validation = await validateInstalledPackages(env.shellRPC, packages, adapterType);

      if (validation.missing.length > 0) {
        throw new Error(`Failed to install packages: ${validation.missing.join(', ')}`);
      }

      return adapter.getInstalledPackages(env.projectDir);
    },

    /**
     * Test development dependencies installation
     */
    async testDevDependencies(
      env: TestEnvironment,
      deps: string[],
      devDeps: string[],
    ): Promise<ValidationResult> {
      const adapter = createPackageAdapter(adapterType, env);

      // Create virtual environment
      await adapter.createEnvironment(env.projectDir);

      // Install based on adapter type
      if (adapterType === 'pip') {
        // Create separate requirements files
        await createRequirementsFile(env.projectDir, deps, 'requirements.txt');
        await createRequirementsFile(env.projectDir, devDeps, 'requirements-dev.txt');
        await adapter.installPackages([], { cwd: env.projectDir });
      } else {
        // Use pyproject.toml with dev dependencies
        await createPyprojectToml(env.projectDir, {
          dependencies: deps,
          devDependencies: devDeps,
        });
        await adapter.installPackages([], { cwd: env.projectDir });
      }

      // Validate all packages installed
      const allPackages = [...deps, ...devDeps];
      return validateInstalledPackages(env.shellRPC, allPackages, adapterType);
    },

    /**
     * Test version constraint handling
     */
    async testVersionConstraints(
      env: TestEnvironment,
      constraints: string[],
    ): Promise<ValidationResult> {
      const adapter = createPackageAdapter(adapterType, env);

      // Create virtual environment
      await adapter.createEnvironment(env.projectDir);

      // Install with version constraints
      if (adapterType === 'pip') {
        await createRequirementsFile(env.projectDir, constraints);
        await adapter.installPackages([], { cwd: env.projectDir });
      } else {
        await createPyprojectToml(env.projectDir, {
          dependencies: constraints,
        });
        await adapter.installPackages([], { cwd: env.projectDir });
      }

      // Extract package names from constraints for validation
      const packageNames = constraints
        .map((c) => {
          const regex = /^([a-zA-Z0-9-_]+)/;
          const match = regex.exec(c);
          return match ? match[1] : c;
        })
        .filter((name): name is string => name !== undefined);

      return validateInstalledPackages(env.shellRPC, packageNames, adapterType);
    },

    /**
     * Test virtual environment creation
     */
    async testVirtualEnvironment(env: TestEnvironment): Promise<boolean> {
      const adapter = createPackageAdapter(adapterType, env);

      // Create virtual environment
      await adapter.createEnvironment(env.projectDir);

      // Check if venv exists
      const result = await env.shellRPC.execute(
        'test -d .venv && echo "exists" || echo "missing"',
        TEST_TIMEOUTS.venv,
      );

      return result.stdout.trim() === 'exists';
    },
  };
}

/**
 * Factory for creating common test scenarios
 */
export class TestScenarioFactory {
  /**
   * Create a standard test environment with package manager
   */
  static async createStandardEnvironment(
    testName: string,
    packageManager: PackageManagerType,
    packages: string[] = TEST_PACKAGES.python.small,
  ): Promise<{
    env: TestEnvironment;
    adapter: PackageAdapter;
    installedPackages: PackageInfo[];
  }> {
    const env = await createTestEnvironment(testName);
    const adapter = createPackageAdapter(packageManager, env);

    // Setup environment
    await adapter.createEnvironment(env.projectDir);

    // Install packages
    if (packageManager === 'pip') {
      await createRequirementsFile(env.projectDir, packages);
    } else {
      await createPyprojectToml(env.projectDir, { dependencies: packages });
    }

    await adapter.installPackages([], { cwd: env.projectDir });
    const installedPackages = await adapter.getInstalledPackages(env.projectDir);

    return { env, adapter, installedPackages };
  }

  /**
   * Create a test environment with mixed dependencies
   */
  static async createMixedDependencyEnvironment(
    testName: string,
    packageManager: PackageManagerType,
  ): Promise<{
    env: TestEnvironment;
    adapter: PackageAdapter;
    prodPackages: string[];
    devPackages: string[];
  }> {
    const env = await createTestEnvironment(testName);
    const adapter = createPackageAdapter(packageManager, env);

    const prodPackages = TEST_PACKAGES.python.small;
    const devPackages = TEST_PACKAGES.python.dev;

    await adapter.createEnvironment(env.projectDir);

    if (packageManager === 'pip') {
      await createRequirementsFile(env.projectDir, prodPackages);
      await createRequirementsFile(env.projectDir, devPackages, 'requirements-dev.txt');
    } else {
      await createPyprojectToml(env.projectDir, {
        dependencies: prodPackages,
        devDependencies: devPackages,
      });
    }

    await adapter.installPackages([], { cwd: env.projectDir });

    return { env, adapter, prodPackages, devPackages };
  }
}
