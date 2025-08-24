/**
 * Path configuration for the bottles system
 */
import { join, resolve, isAbsolute } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

const DEFAULT_BOTTLES_SUBDIR = '.pkg-local-cache/bottles';

/**
 * Get the bottles directory path using BOTTLE_CACHE_ROOT environment variable if set,
 * otherwise falls back to .pkg-local-cache/bottles in the provided base path
 */
function getBottlesDirPath(basePath: string = process.cwd()): string {
  const bottleCacheRoot = process.env.BOTTLE_CACHE_ROOT;

  if (bottleCacheRoot) {
    // If BOTTLE_CACHE_ROOT is set, append 'bottles' subdirectory
    const cacheRoot = isAbsolute(bottleCacheRoot)
      ? bottleCacheRoot
      : resolve(basePath, bottleCacheRoot);
    return join(cacheRoot, 'bottles');
  }

  // Default behavior: use .pkg-local-cache/bottles in basePath
  return join(basePath, DEFAULT_BOTTLES_SUBDIR);
}

/**
 * Get the bottles directory path, creating it if necessary
 * Note: This is synchronous because it's called from constructors
 * The actual directory creation is handled asynchronously in VolumeController.initialize()
 */
export function getBottlesDir(basePath: string = process.cwd()): string {
  const bottlesDir = getBottlesDirPath(basePath);

  // Only create directory if not in a constructor context
  // VolumeController will handle async creation in initialize()
  if (!existsSync(bottlesDir)) {
    mkdirSync(bottlesDir, { recursive: true });
  }

  return bottlesDir;
}
