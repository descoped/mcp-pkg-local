/**
 * Package Manager Specific Timeout Configuration
 *
 * UV (Rust-based) is significantly faster than pip (Python-based).
 * This module provides package-manager-aware timeout multipliers
 * to ensure tests have adequate time based on the tool's performance.
 *
 * Performance characteristics:
 * - UV: Rust implementation, 3-10x faster than pip
 * - Pip: Python implementation, standard performance
 * - Poetry: Python implementation, similar to pip
 * - Pipenv: Python implementation, slower than pip
 */

/**
 * Performance multipliers for different package managers
 * UV is the baseline (1.0x) as it's the fastest
 */
export const PACKAGE_MANAGER_MULTIPLIERS = {
  // Rust-based, extremely fast
  uv: 1.0,

  // Python-based, standard speed
  pip: 3.0, // ~3x slower than UV for most operations
  poetry: 3.5, // Slightly slower than pip due to dependency resolution
  pipenv: 4.0, // Slower due to additional overhead

  // JavaScript package managers (for future)
  npm: 2.0, // Reasonably fast but not as fast as UV
  pnpm: 1.5, // Faster than npm, closer to UV
  yarn: 1.8, // Between npm and pnpm
  bun: 1.0, // Rust-like performance
} as const;

export type PackageManager = keyof typeof PACKAGE_MANAGER_MULTIPLIERS;

/**
 * Get timeout adjusted for package manager performance
 *
 * @param baseTimeout - The base timeout value (typically for UV)
 * @param packageManager - The package manager being used
 * @returns Adjusted timeout value
 *
 * @example
 * // For a test that takes 2s with UV but 6s with pip:
 * getPackageManagerTimeout(5000, 'uv')  // Returns 5000ms
 * getPackageManagerTimeout(5000, 'pip') // Returns 15000ms
 */
export function getPackageManagerTimeout(
  baseTimeout: number,
  packageManager: PackageManager,
): number {
  const multiplier = PACKAGE_MANAGER_MULTIPLIERS[packageManager] ?? 1.0;
  return Math.ceil(baseTimeout * multiplier);
}
