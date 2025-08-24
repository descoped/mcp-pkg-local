/**
 * Environment detection for package managers
 *
 * This module detects which package managers are available in the current environment.
 * Used by both production code and tests to determine feature availability.
 */

import { ShellRPC } from './shell-rpc/index.js';
import { PACKAGE_MANAGER_TIMEOUTS } from './package-managers/timeouts.js';

export interface PackageManagerInfo {
  available: boolean;
  version?: string;
  error?: string;
  path?: string;
  command?: string; // The actual command to use (e.g., 'pip' or 'pip3')
}

export interface EnvironmentInfo {
  pip: PackageManagerInfo;
  uv: PackageManagerInfo;
  detected: boolean;
  timestamp: number;
}

// Cache detection results for the lifetime of the process
let cachedEnvironment: EnvironmentInfo | null = null;

/**
 * Detect a single package manager using ShellRPC
 */
async function detectPackageManager(
  packageManager: 'pip' | 'uv',
  shellRPC: ShellRPC,
): Promise<PackageManagerInfo> {
  try {
    // For pip, try both pip and pip3 commands
    const commands = packageManager === 'pip' ? ['pip', 'pip3'] : [packageManager];
    let execPath: string | null = null;
    let actualCommand: string = packageManager;

    // First check if the command exists (fail fast)
    for (const cmd of commands) {
      const whichCommand = `which ${cmd}`;
      const whichResult = await shellRPC.execute(whichCommand, PACKAGE_MANAGER_TIMEOUTS.immediate);

      if (whichResult.exitCode === 0 && !whichResult.timedOut) {
        execPath = whichResult.stdout.trim();
        actualCommand = cmd;
        break;
      }
    }

    if (!execPath) {
      return {
        available: false,
        error: `${packageManager} not found in PATH (tried: ${commands.join(', ')})`,
      };
    }

    // Now get the version using the actual command found
    const versionCommand = packageManager === 'pip' ? `${actualCommand} --version` : 'uv --version';
    const result = await shellRPC.execute(versionCommand, PACKAGE_MANAGER_TIMEOUTS.quick);

    if (result.exitCode === 0 && !result.timedOut) {
      let version: string;
      if (packageManager === 'pip') {
        const pipVersionRegex = /pip\s+(\d+\.\d+\.\d+)/;
        const match = pipVersionRegex.exec(result.stdout);
        version = match?.[1] ?? result.stdout.trim();
      } else {
        version = result.stdout.trim().replace(/^uv\s+/, '');
      }

      return {
        available: true,
        version,
        path: execPath,
        command: actualCommand, // Store which command actually works
      };
    } else {
      const error = result.timedOut
        ? `${packageManager} command timed out after ${PACKAGE_MANAGER_TIMEOUTS.quick}ms`
        : result.stderr || 'Command failed';

      return {
        available: false,
        error,
      };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return {
      available: false,
      error: errorMsg,
    };
  }
}

/**
 * Detect available package managers in the environment
 * Results are cached for the lifetime of the process
 */
export async function detectEnvironment(forceRefresh = false): Promise<EnvironmentInfo> {
  // Return cached result if available and not forcing refresh
  if (cachedEnvironment && !forceRefresh) {
    return cachedEnvironment;
  }

  // Fast path: Check if environment variables are set (for CI optimization)
  if (process.env.CI && process.env.PIP_AVAILABLE && process.env.UV_AVAILABLE) {
    const result: EnvironmentInfo = {
      pip: {
        available: process.env.PIP_AVAILABLE === 'true',
        version: process.env.PIP_VERSION ?? 'unknown',
        command: 'pip',
      },
      uv: {
        available: process.env.UV_AVAILABLE === 'true',
        version: process.env.UV_VERSION ?? 'unknown',
        command: 'uv',
      },
      detected: true,
      timestamp: Date.now(),
    };

    // Cache and return the result
    cachedEnvironment = result;

    if (process.env.DEBUG || process.env.NODE_ENV === 'test') {
      console.error('[EnvironmentDetector] Using environment variables (fast path)');
      console.error(
        `[EnvironmentDetector] pip: ${result.pip.available ? '✓' : '✗'}, uv: ${result.uv.available ? '✓' : '✗'}`,
      );
    }

    return result;
  }

  const startTime = Date.now();

  // Create a single ShellRPC instance for detection
  const shellRPC = new ShellRPC();

  try {
    // Detect package managers sequentially to avoid initialization issues
    const pipInfo = await detectPackageManager('pip', shellRPC);
    const uvInfo = await detectPackageManager('uv', shellRPC);

    const result: EnvironmentInfo = {
      pip: pipInfo,
      uv: uvInfo,
      detected: true,
      timestamp: Date.now(),
    };

    // Cache the result
    cachedEnvironment = result;

    const duration = Date.now() - startTime;
    if (process.env.DEBUG || process.env.NODE_ENV === 'test') {
      console.error(`[EnvironmentDetector] Detection completed in ${duration}ms`);
      console.error(
        `[EnvironmentDetector] pip: ${pipInfo.available ? '✓' : '✗'}, uv: ${uvInfo.available ? '✓' : '✗'}`,
      );
    }

    return result;
  } catch (error) {
    console.error('[EnvironmentDetector] Fatal error during detection:', error);
    const fallbackResult: EnvironmentInfo = {
      pip: { available: false, error: 'Detection failed' },
      uv: { available: false, error: 'Detection failed' },
      detected: false,
      timestamp: Date.now(),
    };

    // Cache even the failure to avoid repeated attempts
    cachedEnvironment = fallbackResult;
    return fallbackResult;
  } finally {
    // Always cleanup ShellRPC
    try {
      await shellRPC.cleanup();
    } catch (cleanupError) {
      console.error('[EnvironmentDetector] Failed to cleanup ShellRPC:', cleanupError);
    }
  }
}

/**
 * Get package manager info
 * Uses cached detection if available
 */
export async function getPackageManagerInfo(
  packageManager: 'pip' | 'uv',
): Promise<PackageManagerInfo> {
  const env = await detectEnvironment();
  return packageManager === 'pip' ? env.pip : env.uv;
}
