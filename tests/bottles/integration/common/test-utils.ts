/**
 * Shared utilities for bottle integration tests
 *
 * This module provides utilities for creating temporary test environments,
 * checking package manager availability, and cleaning up after tests.
 */

import { join, resolve } from 'node:path';
import { mkdir, rm, writeFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { setTimeout } from 'node:timers';
import type { ShellRPC } from '#bottles/shell-rpc';
import { ShellRPCPool } from '#bottles/shell-rpc/pool';
import { VolumeController } from '#bottles/volume-controller';
import { EnvironmentManager } from '#bottles/environment-manager';
import type { EnvironmentInfo } from '#bottles/environment-detector';

/**
 * Test environment configuration
 */
export interface TestEnvironment {
  /** Temporary directory for this test environment */
  tempDir: string;
  /** Project directory within tempDir */
  projectDir: string;
  /** Shell RPC instance */
  shellRPC: ShellRPC;
  /** Volume controller instance */
  volumeController: VolumeController;
  /** Environment information for package managers */
  environment: EnvironmentInfo;
  /** Cleanup function to remove all resources */
  cleanup: () => Promise<void>;
}

/**
 * Package manager availability check result
 */
export interface PackageManagerAvailability {
  /** Whether the package manager is available */
  available: boolean;
  /** Version string if available */
  version?: string;
  /** Error message if not available */
  error?: string;
}

/**
 * Test package specifications for quick installation
 */
export const TEST_PACKAGES = {
  /** Small, fast-installing Python packages */
  python: {
    small: ['six', 'click'],
    medium: ['requests', 'certifi'],
    dev: ['pytest', 'black'],
  },
};

/**
 * Create a temporary test environment
 */
export async function createTestEnvironment(testName: string): Promise<TestEnvironment> {
  const tempId = randomBytes(8).toString('hex');
  // Use output/test-temp folder to avoid cluttering root directory
  const outputDir = resolve(process.cwd(), 'output', 'test-temp');
  const tempDir = join(outputDir, `${testName}-${tempId}`);
  const projectDir = join(tempDir, 'project');

  try {
    // Create directories with proper error handling
    await mkdir(tempDir, { recursive: true });
    await mkdir(projectDir, { recursive: true });

    // Verify directories were created
    await access(tempDir, constants.F_OK);
    await access(projectDir, constants.F_OK);
  } catch (error) {
    throw new Error(
      `Failed to create test directories: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  // Add debug logging for test environment creation
  if (process.env.CI || process.env.DEBUG_BOTTLES) {
    /* eslint-disable no-console */
    console.log(`[DEBUG] createTestEnvironment: Creating test environment "${testName}"`);
    console.log(`[DEBUG] createTestEnvironment: Temp directory: ${tempDir}`);
    console.log(`[DEBUG] createTestEnvironment: Project directory: ${projectDir}`);
    /* eslint-enable no-console */
  }

  // Get environment from centralized manager
  const envManager = EnvironmentManager.getInstance();
  const environment = await envManager.getEnvironment();

  // Use pooled shell instead of creating new one
  const shellPool = ShellRPCPool.getInstance();
  const shellKey = `test-${testName}-${tempId}`;
  const shellRPC = await shellPool.acquire(shellKey, { cwd: projectDir });

  const volumeController = new VolumeController(`test-${testName}-${tempId}`, {
    skipAutoDetection: true, // Explicitly skip auto-detection in tests
  });

  if (process.env.CI || process.env.DEBUG_BOTTLES) {
    /* eslint-disable no-console */
    console.log(`[DEBUG] createTestEnvironment: Shell RPC initialized in: ${projectDir}`);
    console.log(
      `[DEBUG] createTestEnvironment: Volume controller created for: test-${testName}-${tempId}`,
    );
    /* eslint-enable no-console */
  }

  const cleanup = async (): Promise<void> => {
    // Release shell back to pool instead of cleanup
    shellPool.release(shellKey);

    try {
      await volumeController.cleanup?.();
    } catch (error) {
      console.warn(
        `[TestUtils] Failed to cleanup volumeController: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    try {
      await rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.warn(
        `[TestUtils] Failed to remove temp directory ${tempDir}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  return {
    tempDir,
    projectDir,
    shellRPC,
    volumeController,
    environment,
    cleanup,
  };
}

/**
 * Create a minimal Python requirements.txt file
 */
export async function createRequirementsFile(
  projectDir: string,
  packages: string[],
  filename = 'requirements.txt',
): Promise<string> {
  const filePath = join(projectDir, filename);
  const content = packages.join('\n') + '\n';
  await writeFile(filePath, content);
  return filePath;
}

/**
 * Create a minimal pyproject.toml file for UV
 */
export async function createPyprojectToml(
  projectDir: string,
  options: {
    name?: string;
    version?: string;
    dependencies?: string[];
    devDependencies?: string[];
  } = {},
): Promise<string> {
  const {
    name = 'test-project',
    version = '0.1.0',
    dependencies = [],
    devDependencies = [],
  } = options;

  const filePath = join(projectDir, 'pyproject.toml');

  let content = `[project]
name = "${name}"
version = "${version}"
description = "Test project for integration tests"
`;

  if (dependencies.length > 0) {
    content += `dependencies = [
`;
    for (const dep of dependencies) {
      content += `    "${dep}",
`;
    }
    content += `]
`;
  }

  if (devDependencies.length > 0) {
    content += `
[dependency-groups]
dev = [
`;
    for (const dep of devDependencies) {
      content += `    "${dep}",
`;
    }
    content += `]
`;
  }

  await writeFile(filePath, content);
  return filePath;
}

/**
 * Check if a virtual environment exists
 */
export async function hasVirtualEnvironment(projectDir: string): Promise<boolean> {
  const venvPaths = ['.venv', 'venv', 'env'];

  for (const venvPath of venvPaths) {
    try {
      await access(join(projectDir, venvPath), constants.F_OK);
      return true;
    } catch {
      // Check next path
    }
  }

  return false;
}

/**
 * Wait for a condition to be true with timeout
 */
export async function waitFor(
  condition: () => Promise<boolean>,
  timeoutMs = process.env.CI ? 120000 : 30000, // 2 minutes in CI, 30s locally
  intervalMs = process.env.CI ? 2000 : 1000, // Longer intervals in CI to avoid race conditions
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    try {
      if (await condition()) {
        return true;
      }
    } catch (error) {
      // Log errors in CI for debugging
      if (process.env.CI) {
        console.warn(
          `[TestUtils] waitFor condition error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return false;
}

/**
 * Retry an operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts = process.env.CI ? 5 : 3, // More retries in CI
  initialDelayMs = process.env.CI ? 2000 : 1000, // Longer delays in CI
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        if (process.env.CI) {
          console.error(`[TestUtils] Final retry attempt ${attempt} failed:`, lastError.message);
        }
        throw lastError;
      }

      const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
      if (process.env.CI) {
        console.warn(
          `[TestUtils] Retry attempt ${attempt} failed, waiting ${delayMs}ms:`,
          lastError.message,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // This should never happen since lastError is always assigned in the loop
  throw lastError ?? new Error('Retry operation failed');
}

/**
 * Validate that packages were actually installed
 */
export async function validateInstalledPackages(
  shellRPC: ShellRPC,
  expectedPackages: string[],
  packageManager: 'pip' | 'uv' = 'pip',
): Promise<{
  installed: string[];
  missing: string[];
}> {
  // First check if we have a virtual environment
  const pwdResult = await shellRPC.execute('pwd', 5000);
  const projectDir = pwdResult.stdout.trim();

  // Check for venv pip - if it exists, use it
  let pipPath: string = packageManager;
  const venvPipCheck = await shellRPC.execute(
    `test -f "${projectDir}/.venv/bin/pip" && echo "${projectDir}/.venv/bin/pip" || echo "${packageManager}"`,
    5000,
  );

  if (packageManager === 'pip' && venvPipCheck.stdout.trim().includes('.venv')) {
    pipPath = venvPipCheck.stdout.trim();
  }

  const listCommand =
    packageManager === 'pip' ? `${pipPath} list --format json` : 'uv pip list --format json';

  // Add debug logging
  if (process.env.CI || process.env.DEBUG_BOTTLES) {
    /* eslint-disable no-console */
    console.log(`[DEBUG] validateInstalledPackages: Using pip path: ${pipPath}`);
    console.log(`[DEBUG] validateInstalledPackages: Command: ${listCommand}`);
    console.log(
      `[DEBUG] validateInstalledPackages: Expected packages: ${expectedPackages.join(', ')}`,
    );

    // Log current working directory
    const cwdResult = await shellRPC.execute('pwd', 5000);
    console.log(`[DEBUG] validateInstalledPackages: Current directory: ${cwdResult.stdout.trim()}`);

    // Log environment variables
    const envResult = await shellRPC.execute('env | grep -E "(VIRTUAL_ENV|PATH|PYTHON)"', 5000);
    console.log(`[DEBUG] validateInstalledPackages: Environment:`);
    console.log(envResult.stdout);

    // Log virtual environment status
    const venvTestResult = await shellRPC.execute('which python', 5000);
    console.log(
      `[DEBUG] validateInstalledPackages: Python location: ${venvTestResult.stdout.trim()}`,
    );

    // Log pip/uv location
    const pmTestResult = await shellRPC.execute(`which ${packageManager}`, 5000);
    console.log(
      `[DEBUG] validateInstalledPackages: ${packageManager} location: ${pmTestResult.stdout.trim()}`,
    );
    /* eslint-enable no-console */
  }

  const result = await shellRPC.execute(listCommand, COMMAND_TIMEOUTS.list);

  if (process.env.CI || process.env.DEBUG_BOTTLES) {
    /* eslint-disable no-console */
    console.log(`[DEBUG] validateInstalledPackages: Exit code: ${result.exitCode}`);
    console.log(`[DEBUG] validateInstalledPackages: Stdout length: ${result.stdout.length}`);
    console.log(`[DEBUG] validateInstalledPackages: Stderr: ${result.stderr}`);
    /* eslint-enable no-console */
  }

  if (result.exitCode !== 0) {
    throw new Error(`Failed to list packages: ${result.stderr}`);
  }

  try {
    interface InstalledPackage {
      name: string;
      version: string;
    }

    const installedPackages = JSON.parse(result.stdout.trim()) as InstalledPackage[];
    const installedNames = installedPackages.map((pkg) => pkg.name.toLowerCase());

    const installed: string[] = [];
    const missing: string[] = [];

    for (const pkg of expectedPackages) {
      const normalizedName = pkg.toLowerCase().replace(/_/g, '-');
      if (
        installedNames.includes(normalizedName) ||
        installedNames.includes(normalizedName.replace(/-/g, '_'))
      ) {
        installed.push(pkg);
      } else {
        missing.push(pkg);
      }
    }

    return { installed, missing };
  } catch {
    return {
      installed: [],
      missing: expectedPackages,
    };
  }
}

/**
 * Test-specific timeout mapping for backward compatibility
 * Maps old integration test timeout names to new centralized timeouts
 */
import { COMMAND_TIMEOUTS, TEST_TIMEOUTS as NEW_TEST_TIMEOUTS } from '../../../config/timeouts.js';
import {
  getPackageManagerTimeout,
  type PackageManager,
  PACKAGE_MANAGER_MULTIPLIERS,
} from '../../../config/package-manager-timeouts.js';
import { isPackageManagerAvailable } from '../../../helpers/environment-cache.js';
import { it } from 'vitest';

export const TEST_TIMEOUTS = {
  // Map old test timeout names to new centralized config
  availability: COMMAND_TIMEOUTS.detection, // Package manager availability checks
  complex: NEW_TEST_TIMEOUTS.e2e, // Complex test scenarios

  // Include all original command timeouts for compatibility
  ...COMMAND_TIMEOUTS,
} as const;

/**
 * Skip utility function for consistent test skipping based on package manager availability
 * Standardizes the skip pattern across all integration tests
 *
 * @param testName - The name of the test
 * @param packageManager - The package manager to check ('pip' | 'uv' | 'npm' | 'pnpm' | 'yarn')
 * @param testFn - The test function to run if package manager is available
 * @param timeout - Optional timeout for the test
 *
 * @example
 * skipIfUnavailable(
 *   'should install packages with pip',
 *   'pip',
 *   async () => {
 *     // Test implementation
 *   },
 *   TEST_TIMEOUTS.install
 * );
 */
export function skipIfUnavailable(
  testName: string,
  packageManager: string,
  testFn: () => void | Promise<void>,
  timeout?: number,
): void {
  // Adjust timeout based on package manager performance characteristics
  let adjustedTimeout = timeout;
  if (timeout && packageManager in PACKAGE_MANAGER_MULTIPLIERS) {
    adjustedTimeout = getPackageManagerTimeout(timeout, packageManager as PackageManager);

    // Log adjustment for debugging (only in verbose mode)
    if (process.env.DEBUG_TIMEOUTS) {
      const multiplier = PACKAGE_MANAGER_MULTIPLIERS[packageManager as PackageManager];
      console.warn(
        `[Timeout] ${packageManager}: ${timeout}ms × ${multiplier} = ${adjustedTimeout}ms`,
      );
    }
  }

  // Use regular it with conditional skip inside
  it(
    testName,
    async () => {
      const isAvailable = await isPackageManagerAvailable(packageManager as 'pip' | 'uv');
      if (!isAvailable) {
        console.warn(`Skipping test - ${packageManager} not available`);
        return;
      }
      await testFn();
    },
    adjustedTimeout,
  );
}

/**
 * Skip utility for multiple package managers
 * Useful when a test requires multiple tools to be available
 *
 * @param testName - The name of the test
 * @param packageManagers - Array of package managers to check
 * @param testFn - The test function to run if all package managers are available
 * @param timeout - Optional timeout for the test
 *
 * @example
 * skipIfAnyUnavailable(
 *   'should compare pip and uv performance',
 *   ['pip', 'uv'],
 *   async () => {
 *     // Test implementation
 *   },
 *   TEST_TIMEOUTS.complex
 * );
 */
export function skipIfAnyUnavailable(
  testName: string,
  packageManagers: string[],
  testFn: () => void | Promise<void>,
  timeout?: number,
): void {
  // For tests involving multiple package managers, use the slowest one's multiplier
  let adjustedTimeout = timeout;
  if (timeout) {
    let maxMultiplier = 1;
    for (const pm of packageManagers) {
      if (pm in PACKAGE_MANAGER_MULTIPLIERS) {
        const multiplier = PACKAGE_MANAGER_MULTIPLIERS[pm as PackageManager];
        maxMultiplier = Math.max(maxMultiplier, multiplier);
      }
    }
    adjustedTimeout = Math.ceil(timeout * maxMultiplier);

    if (process.env.DEBUG_TIMEOUTS && maxMultiplier > 1) {
      console.warn(
        `[Timeout] Multiple PMs ${packageManagers.join('+')}: ${timeout}ms × ${maxMultiplier} = ${adjustedTimeout}ms`,
      );
    }
  }

  it(
    testName,
    async () => {
      for (const pm of packageManagers) {
        const isAvailable = await isPackageManagerAvailable(pm as 'pip' | 'uv');
        if (!isAvailable) {
          console.warn(`Skipping test - ${pm} not available`);
          return;
        }
      }
      await testFn();
    },
    adjustedTimeout,
  );
}
