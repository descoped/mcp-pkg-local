import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { UnifiedCache } from '#utils/cache.js';
import { getBottlesDir } from '#bottles/paths.js';

describe('BOTTLE_CACHE_ROOT Environment Variable Support', () => {
  let originalEnv: string | undefined;
  let testCacheDir: string;

  beforeEach(() => {
    // Save original environment
    originalEnv = process.env.BOTTLE_CACHE_ROOT;

    // Create a unique test cache directory
    testCacheDir = join(tmpdir(), `test-bottle-cache-${Date.now()}`);
    mkdirSync(testCacheDir, { recursive: true });
  });

  afterEach(() => {
    // Restore original environment
    if (originalEnv !== undefined) {
      process.env.BOTTLE_CACHE_ROOT = originalEnv;
    } else {
      delete process.env.BOTTLE_CACHE_ROOT;
    }

    // Clean up test directory
    if (existsSync(testCacheDir)) {
      rmSync(testCacheDir, { recursive: true, force: true });
    }
  });

  it('should use default .pkg-local-cache when BOTTLE_CACHE_ROOT is not set', () => {
    delete process.env.BOTTLE_CACHE_ROOT;

    const testProjectDir = join(tmpdir(), `test-project-${Date.now()}`);
    mkdirSync(testProjectDir, { recursive: true });

    try {
      const cache = new UnifiedCache(testProjectDir);

      // Check that cache directory is created in expected location
      const expectedCacheDir = join(testProjectDir, '.pkg-local-cache');
      expect(existsSync(expectedCacheDir)).toBe(true);

      cache.close();
    } finally {
      if (existsSync(testProjectDir)) {
        rmSync(testProjectDir, { recursive: true, force: true });
      }
    }
  });

  it('should use BOTTLE_CACHE_ROOT when set to absolute path', () => {
    process.env.BOTTLE_CACHE_ROOT = testCacheDir;

    const testProjectDir = join(tmpdir(), `test-project-${Date.now()}`);
    mkdirSync(testProjectDir, { recursive: true });

    try {
      const cache = new UnifiedCache(testProjectDir);

      // Check that cache directory is created in BOTTLE_CACHE_ROOT location
      expect(existsSync(testCacheDir)).toBe(true);

      cache.close();
    } finally {
      if (existsSync(testProjectDir)) {
        rmSync(testProjectDir, { recursive: true, force: true });
      }
    }
  });

  it('should use BOTTLE_CACHE_ROOT when set to relative path', () => {
    const relativePath = 'custom-cache';
    process.env.BOTTLE_CACHE_ROOT = relativePath;

    const testProjectDir = join(tmpdir(), `test-project-${Date.now()}`);
    mkdirSync(testProjectDir, { recursive: true });

    try {
      const cache = new UnifiedCache(testProjectDir);

      // Check that cache directory is created relative to project dir
      const expectedCacheDir = resolve(testProjectDir, relativePath);
      expect(existsSync(expectedCacheDir)).toBe(true);

      cache.close();
    } finally {
      if (existsSync(testProjectDir)) {
        rmSync(testProjectDir, { recursive: true, force: true });
      }
    }
  });

  it('should use BOTTLE_CACHE_ROOT for bottles directory', () => {
    process.env.BOTTLE_CACHE_ROOT = testCacheDir;

    const testProjectDir = join(tmpdir(), `test-project-${Date.now()}`);
    mkdirSync(testProjectDir, { recursive: true });

    try {
      const bottlesDir = getBottlesDir(testProjectDir);

      // Check that bottles directory is created under BOTTLE_CACHE_ROOT
      const expectedBottlesDir = join(testCacheDir, 'bottles');
      expect(bottlesDir).toBe(expectedBottlesDir);
      expect(existsSync(expectedBottlesDir)).toBe(true);
    } finally {
      if (existsSync(testProjectDir)) {
        rmSync(testProjectDir, { recursive: true, force: true });
      }
    }
  });

  it('should use default bottles location when BOTTLE_CACHE_ROOT is not set', () => {
    delete process.env.BOTTLE_CACHE_ROOT;

    const testProjectDir = join(tmpdir(), `test-project-${Date.now()}`);
    mkdirSync(testProjectDir, { recursive: true });

    try {
      const bottlesDir = getBottlesDir(testProjectDir);

      // Check that bottles directory is created in default location
      const expectedBottlesDir = join(testProjectDir, '.pkg-local-cache', 'bottles');
      expect(bottlesDir).toBe(expectedBottlesDir);
      expect(existsSync(expectedBottlesDir)).toBe(true);
    } finally {
      if (existsSync(testProjectDir)) {
        rmSync(testProjectDir, { recursive: true, force: true });
      }
    }
  });
});
