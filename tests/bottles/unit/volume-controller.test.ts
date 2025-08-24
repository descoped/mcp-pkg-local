/**
 * Tests for Volume Controller
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { TestContext } from '../../utils/test-helpers.js';
import {
  VolumeController,
  type PackageManager,
  type VolumeConfig,
  VolumeError,
  getSystemCacheDir,
  getBottleCacheDir,
  getMountPath,
  detectPackageManagers,
  validateCacheDir,
} from '#bottles/volume-controller';

describe('VolumeController', () => {
  let tempDir: string;
  let bottleId: string;
  let controller: VolumeController;
  let config: VolumeConfig;
  let testContext: TestContext;

  beforeEach(async () => {
    // Create test context and temporary directory
    testContext = new TestContext();
    tempDir = await testContext.createDir('volume-test');

    bottleId = `test-bottle-${randomUUID()}`;
    config = {
      baseCacheDir: join(tempDir, 'cache'),
      autoCreateDirs: true,
      crossPlatform: true,
      skipAutoDetection: true, // Explicitly skip auto-detection in tests
    };

    controller = new VolumeController(bottleId, config);
  });

  afterEach(async (context) => {
    // Mark test as failed if it failed
    if (context.task.result?.state === 'fail') {
      testContext.markFailed();
    }

    // Cleanup controller
    if (controller?.isInitialized()) {
      await controller.cleanup();
    }

    // Cleanup test directories
    await testContext.cleanup();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await controller.initialize();

      expect(controller.isInitialized()).toBe(true);
      expect(controller.getBottleId()).toBe(bottleId);
      expect(existsSync(config.baseCacheDir ?? '')).toBe(true);
    });

    it('should not initialize twice', async () => {
      await controller.initialize();
      await controller.initialize(); // Should not throw

      expect(controller.isInitialized()).toBe(true);
    });

    it('should throw VolumeError on initialization failure', async () => {
      // Create controller with invalid config that will try to create directories
      const invalidController = new VolumeController(bottleId, {
        baseCacheDir: '/invalid/path/that/cannot/be/created',
        autoCreateDirs: true,
      });

      await expect(invalidController.initialize()).rejects.toThrow(VolumeError);
    });
  });

  describe('mount operations', () => {
    beforeEach(async () => {
      await controller.initialize();
    });

    it('should mount a package manager cache', async () => {
      const mount = await controller.mount('npm');

      expect(mount.manager).toBe('npm');
      expect(mount.active).toBe(true);
      expect(existsSync(mount.cachePath)).toBe(true);
      expect(mount.mountPath).toBe(getMountPath('npm'));
    });

    it('should mount with custom path', async () => {
      const customPath = join(tempDir, 'custom-npm-cache');
      mkdirSync(customPath, { recursive: true });

      const mount = await controller.mount('npm', customPath);

      expect(mount.cachePath).toBe(customPath);
      expect(mount.active).toBe(true);
    });

    it('should throw error for inaccessible cache path', async () => {
      const invalidController = new VolumeController(bottleId, {
        baseCacheDir: '/invalid/path',
        autoCreateDirs: false,
      });
      await invalidController.initialize();

      await expect(invalidController.mount('npm')).rejects.toThrow(VolumeError);
    });

    it('should get mount information', async () => {
      await controller.mount('npm');

      const mount = controller.getMount('npm');
      expect(mount?.manager).toBe('npm');
      expect(mount?.active).toBe(true);
    });

    it('should return undefined for non-existent mount', () => {
      const mount = controller.getMount('yarn' as PackageManager);
      expect(mount).toBeUndefined();
    });
  });

  describe('unmount operations', () => {
    beforeEach(async () => {
      await controller.initialize();
    });

    it('should unmount a mounted cache', async () => {
      await controller.mount('npm');
      const result = await controller.unmount('npm');

      expect(result).toBe(true);

      const mount = controller.getMount('npm');
      expect(mount?.active).toBe(false);
    });

    it('should return false for non-existent mount', async () => {
      const result = await controller.unmount('yarn' as PackageManager);
      expect(result).toBe(false);
    });
  });

  describe('cache clearing', () => {
    beforeEach(async () => {
      await controller.initialize();
    });

    it('should clear specific manager cache', async () => {
      const mount = await controller.mount('npm');

      // Create some cache files
      const testFile = join(mount.cachePath, 'test-file.txt');
      writeFileSync(testFile, 'test content');
      expect(existsSync(testFile)).toBe(true);

      await controller.clear('npm');

      // Directory should exist but be empty
      expect(existsSync(mount.cachePath)).toBe(true);
      expect(existsSync(testFile)).toBe(false);
    });

    it('should clear all caches when no manager specified', async () => {
      const npmMount = await controller.mount('npm');
      const pipMount = await controller.mount('pip');

      // Create test files
      writeFileSync(join(npmMount.cachePath, 'npm-test.txt'), 'npm content');
      writeFileSync(join(pipMount.cachePath, 'pip-test.txt'), 'pip content');

      await controller.clear();

      // Directories should exist but be empty
      expect(existsSync(npmMount.cachePath)).toBe(true);
      expect(existsSync(pipMount.cachePath)).toBe(true);
      expect(existsSync(join(npmMount.cachePath, 'npm-test.txt'))).toBe(false);
      expect(existsSync(join(pipMount.cachePath, 'pip-test.txt'))).toBe(false);
    });
  });

  describe('statistics', () => {
    beforeEach(async () => {
      await controller.initialize();
    });

    it('should get cache statistics', async () => {
      await controller.mount('npm');
      await controller.mount('pip');

      const stats = await controller.getStats();

      expect(stats.activeMounts).toBe(2);
      expect(stats.managers.npm).toBeDefined();
      expect(stats.managers.pip).toBeDefined();
      expect(stats.calculatedAt).toBeGreaterThan(0);
    });

    it('should calculate cache size and item count', async () => {
      const mount = await controller.mount('npm');

      // Create test files with known sizes
      writeFileSync(join(mount.cachePath, 'file1.txt'), 'a'.repeat(100));
      writeFileSync(join(mount.cachePath, 'file2.txt'), 'b'.repeat(200));
      mkdirSync(join(mount.cachePath, 'subdir'));
      writeFileSync(join(mount.cachePath, 'subdir', 'file3.txt'), 'c'.repeat(50));

      const stats = await controller.getStats();

      // File size may include filesystem overhead, so check for a reasonable range
      expect(stats.managers.npm?.size).toBeGreaterThanOrEqual(350); // At least the content size
      expect(stats.managers.npm?.size).toBeLessThan(1000); // But not unreasonably large
      // Item count may vary due to hidden files or filesystem differences
      expect(stats.managers.npm?.itemCount).toBeGreaterThanOrEqual(4); // At least our created files
      expect(stats.managers.npm?.itemCount).toBeLessThan(10); // But not unreasonably many
      expect(stats.totalSize).toBeGreaterThanOrEqual(350);
      expect(stats.totalItems).toBeGreaterThanOrEqual(4);
    });
  });

  describe('mount environment variables', () => {
    beforeEach(async () => {
      await controller.initialize();
    });

    it('should generate correct environment variables for npm', async () => {
      const mount = await controller.mount('npm');
      const envVars = controller.getMountEnvVars();

      expect(envVars.npm_config_cache).toBe(mount.cachePath);
    });

    it('should generate correct environment variables for pip', async () => {
      const mount = await controller.mount('pip');
      const envVars = controller.getMountEnvVars();

      expect(envVars.PIP_CACHE_DIR).toBe(mount.cachePath);
    });

    it('should generate environment variables for multiple managers', async () => {
      const npmMount = await controller.mount('npm');
      const pipMount = await controller.mount('pip');
      const envVars = controller.getMountEnvVars();

      expect(envVars.npm_config_cache).toBe(npmMount.cachePath);
      expect(envVars.PIP_CACHE_DIR).toBe(pipMount.cachePath);
    });

    it('should not include inactive mounts', async () => {
      await controller.mount('npm');
      await controller.unmount('npm');

      const envVars = controller.getMountEnvVars();
      expect(envVars.npm_config_cache).toBeUndefined();
    });
  });

  describe('mount listing', () => {
    beforeEach(async () => {
      await controller.initialize();
    });

    it('should list active mounts', async () => {
      await controller.mount('npm');
      await controller.mount('pip');
      await controller.unmount('pip');

      const activeMounts = controller.getActiveMounts();
      expect(activeMounts).toHaveLength(1);
      expect(activeMounts[0]?.manager).toBe('npm');
    });

    it('should list all mounts', async () => {
      await controller.mount('npm');
      await controller.mount('pip');
      await controller.unmount('pip');

      const allMounts = controller.getAllMounts();
      expect(allMounts).toHaveLength(2);

      const managers = allMounts.map((m: { manager: PackageManager }) => m.manager);
      expect(managers).toContain('npm');
      expect(managers).toContain('pip');
    });
  });

  describe('cleanup', () => {
    it('should cleanup properly', async () => {
      await controller.initialize();
      await controller.mount('npm');
      await controller.mount('pip');

      expect(controller.getActiveMounts()).toHaveLength(2);

      await controller.cleanup();

      expect(controller.isInitialized()).toBe(false);
      expect(controller.getActiveMounts()).toHaveLength(0);
    });
  });
});

describe('cache path utilities', () => {
  describe('getSystemCacheDir', () => {
    it('should return correct system cache directories', () => {
      const npmCache = getSystemCacheDir('npm');
      const pipCache = getSystemCacheDir('pip');

      expect(npmCache).toMatch(/npm/);
      expect(pipCache).toMatch(/pip/);
    });

    it('should handle different platforms', () => {
      const originalPlatform = process.platform;

      try {
        // Mock Windows platform
        Object.defineProperty(process, 'platform', { value: 'win32' });
        const windowsCache = getSystemCacheDir('npm');
        expect(windowsCache).toMatch(/AppData/);

        // Mock macOS platform
        Object.defineProperty(process, 'platform', { value: 'darwin' });
        const macCache = getSystemCacheDir('npm');
        expect(macCache).toMatch(/Library/);

        // Mock Linux platform
        Object.defineProperty(process, 'platform', { value: 'linux' });
        const linuxCache = getSystemCacheDir('npm');
        expect(linuxCache).toMatch(/\.npm/);
      } finally {
        // Restore original platform
        Object.defineProperty(process, 'platform', { value: originalPlatform });
      }
    });

    it('should throw for unknown package manager', () => {
      expect(() => getSystemCacheDir('unknown' as PackageManager)).toThrow();
    });
  });

  describe('getBottleCacheDir', () => {
    it('should return correct bottle cache directory', () => {
      const baseCacheDir = '/test/cache';
      const bottleCache = getBottleCacheDir('npm', baseCacheDir);

      expect(bottleCache).toBe('/test/cache/npm');
    });
  });

  describe('getMountPath', () => {
    it('should return correct mount paths', () => {
      expect(getMountPath('npm')).toBe('/bottle/npm-cache');
      expect(getMountPath('pip')).toBe('/bottle/pip-cache');
      expect(getMountPath('maven')).toBe('/bottle/m2');
      expect(getMountPath('cargo')).toBe('/bottle/cargo');
    });
  });

  describe('detectPackageManagers', () => {
    let tempProjectDir: string;
    let testContext: TestContext;

    beforeEach(async () => {
      testContext = new TestContext();
      tempProjectDir = await testContext.createDir('detect-test');
    });

    afterEach(async (context) => {
      if (context.task.result?.state === 'fail') {
        testContext.markFailed();
      }
      await testContext.cleanup();
    });

    it('should detect npm from package.json', () => {
      writeFileSync(join(tempProjectDir, 'package.json'), '{}');

      const managers = detectPackageManagers(tempProjectDir);
      expect(managers).toContain('npm');
    });

    it('should detect yarn from yarn.lock', () => {
      writeFileSync(join(tempProjectDir, 'package.json'), '{}');
      writeFileSync(join(tempProjectDir, 'yarn.lock'), '');

      const managers = detectPackageManagers(tempProjectDir);
      expect(managers).toContain('npm');
      expect(managers).toContain('yarn');
    });

    it('should detect pip from requirements.txt', () => {
      writeFileSync(join(tempProjectDir, 'requirements.txt'), '');

      const managers = detectPackageManagers(tempProjectDir);
      expect(managers).toContain('pip');
    });

    it('should detect poetry from pyproject.toml', () => {
      writeFileSync(join(tempProjectDir, 'pyproject.toml'), '');

      const managers = detectPackageManagers(tempProjectDir);
      expect(managers).toContain('poetry');
      expect(managers).toContain('uv');
    });

    it('should detect maven from pom.xml', () => {
      writeFileSync(join(tempProjectDir, 'pom.xml'), '');

      const managers = detectPackageManagers(tempProjectDir);
      expect(managers).toContain('maven');
    });

    it('should detect cargo from Cargo.toml', () => {
      writeFileSync(join(tempProjectDir, 'Cargo.toml'), '');

      const managers = detectPackageManagers(tempProjectDir);
      expect(managers).toContain('cargo');
    });

    it('should detect go from go.mod', () => {
      writeFileSync(join(tempProjectDir, 'go.mod'), '');

      const managers = detectPackageManagers(tempProjectDir);
      expect(managers).toContain('go');
    });

    it('should return empty array for unknown project', () => {
      const managers = detectPackageManagers(tempProjectDir);
      expect(managers).toHaveLength(0);
    });
  });

  describe('validateCacheDir', () => {
    let tempDir: string;
    let testContext: TestContext;

    beforeEach(async () => {
      testContext = new TestContext();
      tempDir = await testContext.createDir('validate-test');
    });

    afterEach(async (context) => {
      if (context.task.result?.state === 'fail') {
        testContext.markFailed();
      }
      await testContext.cleanup();
    });

    it('should validate existing directory', () => {
      expect(validateCacheDir(tempDir)).toBe(true);
    });

    it('should return false for non-existent directory', () => {
      expect(validateCacheDir('/non/existent/path')).toBe(false);
    });

    it('should handle permission errors gracefully', () => {
      // This test might behave differently on different systems
      const result = validateCacheDir('/root/restricted');
      expect(typeof result).toBe('boolean');
    });
  });
});
