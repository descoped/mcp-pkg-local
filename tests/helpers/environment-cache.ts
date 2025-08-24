/**
 * Cached environment detection for tests
 *
 * This module provides a cached version of environment detection that is shared
 * across all tests to avoid redundant detection calls that take ~700ms each.
 */

import { detectEnvironment, type EnvironmentInfo } from '#bottles/environment-detector';

// Cache the environment detection result
let cachedEnvironment: EnvironmentInfo | null = null;
let detectionPromise: Promise<EnvironmentInfo> | null = null;

/**
 * Get the cached environment detection result.
 * This is populated during global test setup and reused across all tests.
 *
 * @returns The cached environment info
 */
export async function getCachedEnvironment(): Promise<EnvironmentInfo> {
  // If we already have a cached result, return it immediately
  if (cachedEnvironment) {
    return cachedEnvironment;
  }

  // If detection is already in progress, wait for it
  if (detectionPromise) {
    return detectionPromise;
  }

  // Start detection and cache the promise to prevent concurrent calls
  detectionPromise = detectEnvironment().then((env) => {
    cachedEnvironment = env;
    detectionPromise = null;
    return env;
  });

  return detectionPromise;
}

/**
 * Check if a package manager is available without re-detecting.
 *
 * @param packageManager The package manager to check
 * @returns True if the package manager is available
 */
export async function isPackageManagerAvailable(packageManager: 'pip' | 'uv'): Promise<boolean> {
  const env = await getCachedEnvironment();
  return env[packageManager].available;
}
