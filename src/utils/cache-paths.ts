/**
 * Utility functions for cache path resolution
 * Centralizes the logic for BOTTLE_CACHE_ROOT environment variable handling
 */
import { join, resolve, isAbsolute } from 'node:path';

const DEFAULT_CACHE_DIR_NAME = '.pkg-local-cache';

/**
 * Get the cache directory path using BOTTLE_CACHE_ROOT environment variable if set,
 * otherwise falls back to .pkg-local-cache in the provided base path
 */
export function getCacheDir(basePath: string = process.cwd()): string {
  const bottleCacheRoot = process.env.BOTTLE_CACHE_ROOT;

  if (bottleCacheRoot) {
    // If BOTTLE_CACHE_ROOT is set, use it directly if absolute, or resolve relative to basePath
    return isAbsolute(bottleCacheRoot) ? bottleCacheRoot : resolve(basePath, bottleCacheRoot);
  }

  // Default behavior: use .pkg-local-cache in basePath
  return join(basePath, DEFAULT_CACHE_DIR_NAME);
}

/**
 * Get the SQLite database path using BOTTLE_CACHE_ROOT environment variable if set
 */
export function getSQLiteDbPath(basePath: string = process.cwd()): string {
  const bottleCacheRoot = process.env.BOTTLE_CACHE_ROOT;

  if (bottleCacheRoot) {
    const cacheRoot = isAbsolute(bottleCacheRoot)
      ? bottleCacheRoot
      : resolve(basePath, bottleCacheRoot);
    return join(cacheRoot, 'cache.db');
  }

  // Default behavior: use .pkg-local-cache.db in basePath
  return join(basePath, '.pkg-local-cache.db');
}

/**
 * Get the bottles directory path using BOTTLE_CACHE_ROOT environment variable if set,
 * otherwise falls back to .pkg-local-cache/bottles in the provided base path
 */
export function getBottlesDirPath(basePath: string = process.cwd()): string {
  const bottleCacheRoot = process.env.BOTTLE_CACHE_ROOT;

  if (bottleCacheRoot) {
    // If BOTTLE_CACHE_ROOT is set, append 'bottles' subdirectory
    const cacheRoot = isAbsolute(bottleCacheRoot)
      ? bottleCacheRoot
      : resolve(basePath, bottleCacheRoot);
    return join(cacheRoot, 'bottles');
  }

  // Default behavior: use .pkg-local-cache/bottles in basePath
  return join(basePath, DEFAULT_CACHE_DIR_NAME, 'bottles');
}

/**
 * Get cache paths for testing and utilities
 */
export function getCachePaths(basePath: string = process.cwd()): {
  cacheDir: string;
  sqliteDb: string;
  bottlesDir: string;
} {
  return {
    cacheDir: getCacheDir(basePath),
    sqliteDb: getSQLiteDbPath(basePath),
    bottlesDir: getBottlesDirPath(basePath),
  };
}
