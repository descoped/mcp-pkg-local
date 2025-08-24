/**
 * Tests for VolumeController dependency injection
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { TestContext } from '../../utils/test-helpers.js';
import { VolumeController } from '#bottles/volume-controller';

describe('VolumeController Dependency Injection', () => {
  let tempDir: string;
  let testContext: TestContext;
  let projectDir: string;

  beforeEach(async () => {
    testContext = new TestContext();
    tempDir = await testContext.createDir('injection-test');
    projectDir = join(tempDir, 'project');
    mkdirSync(projectDir, { recursive: true });
  });

  afterEach(async (context) => {
    if (context.task.result?.state === 'fail') {
      testContext.markFailed();
    }
    await testContext.cleanup();
  });

  describe('skipAutoDetection', () => {
    it('should skip auto-detection when configured', async () => {
      // Create package.json and requirements.txt in project
      writeFileSync(join(projectDir, 'package.json'), '{}');
      writeFileSync(join(projectDir, 'requirements.txt'), 'requests==2.28.0');

      const controller = new VolumeController('test', {
        skipAutoDetection: true,
        projectDir,
      });

      await controller.initialize();

      // Should have no managers detected despite having package files
      expect(controller.isInitialized()).toBe(true);
      expect(controller.getAllMounts()).toHaveLength(0);
    });

    it('should auto-detect when not skipped', async () => {
      // Create package.json in project
      writeFileSync(join(projectDir, 'package.json'), '{}');

      const controller = new VolumeController('test', {
        skipAutoDetection: false,
        projectDir,
      });

      await controller.initialize();

      // Should detect npm from package.json
      expect(controller.isInitialized()).toBe(true);
      expect(controller.getAllMounts().some((m) => m.manager === 'npm')).toBe(true);

      await controller.cleanup();
    });
  });

  describe('detectedManagers injection', () => {
    it('should use injected managers over auto-detection', async () => {
      // Create package.json (would normally detect npm)
      writeFileSync(join(projectDir, 'package.json'), '{}');

      const controller = new VolumeController('test', {
        detectedManagers: ['pip', 'cargo'], // Inject different managers
        skipAutoDetection: false, // Even with auto-detection enabled
        projectDir,
      });

      await controller.initialize();

      // Should have injected managers, not npm
      const managers = controller.getAllMounts().map((m) => m.manager);
      expect(managers).toContain('pip');
      expect(managers).toContain('cargo');
      expect(managers).not.toContain('npm');

      await controller.cleanup();
    });

    it('should initialize with empty array when injected', async () => {
      const controller = new VolumeController('test', {
        detectedManagers: [], // Explicitly empty
        projectDir,
      });

      await controller.initialize();

      expect(controller.isInitialized()).toBe(true);
      expect(controller.getAllMounts()).toHaveLength(0);
    });

    it('should initialize specific managers only', async () => {
      const controller = new VolumeController('test', {
        detectedManagers: ['uv', 'poetry'],
        baseCacheDir: join(tempDir, 'cache'),
      });

      await controller.initialize();

      const managers = controller.getAllMounts().map((m) => m.manager);
      expect(managers).toEqual(['uv', 'poetry']);

      await controller.cleanup();
    });
  });

  describe('projectDir configuration', () => {
    it('should detect from specified project directory', async () => {
      const customProject = join(tempDir, 'custom-project');
      mkdirSync(customProject, { recursive: true });
      writeFileSync(join(customProject, 'Cargo.toml'), '[package]\nname = "test"');

      const controller = new VolumeController('test', {
        projectDir: customProject,
        skipAutoDetection: false,
      });

      await controller.initialize();

      // Should detect cargo from custom project
      expect(controller.getAllMounts().some((m) => m.manager === 'cargo')).toBe(true);

      await controller.cleanup();
    });

    it('should not detect from wrong directory', async () => {
      // Put files in tempDir but search in projectDir
      writeFileSync(join(tempDir, 'package.json'), '{}');

      const controller = new VolumeController('test', {
        projectDir, // Empty directory
        skipAutoDetection: false,
      });

      await controller.initialize();

      // Should not find anything
      expect(controller.getAllMounts()).toHaveLength(0);
    });
  });

  describe('backward compatibility', () => {
    it('should work with default config (auto-detection enabled)', async () => {
      // Create files in current working directory simulation
      const cwd = process.cwd();
      const testFile = join(cwd, 'test-package.json.tmp');

      try {
        writeFileSync(testFile, '{}');

        const controller = new VolumeController('test', {
          projectDir: cwd,
        });

        await controller.initialize();

        // Default behavior should still work
        expect(controller.isInitialized()).toBe(true);

        await controller.cleanup();
      } finally {
        // Clean up test file
        try {
          rmSync(testFile);
        } catch {
          // Ignore cleanup errors
        }
      }
    });

    it('should handle minimal config', async () => {
      const controller = new VolumeController('test', {
        skipAutoDetection: true, // Only this to prevent auto-detection
      });

      await controller.initialize();

      expect(controller.isInitialized()).toBe(true);
      expect(controller.getBottleId()).toBe('test');
    });
  });

  describe('priority order', () => {
    it('should prioritize injected managers over auto-detection', async () => {
      writeFileSync(join(projectDir, 'package.json'), '{}');
      writeFileSync(join(projectDir, 'requirements.txt'), 'requests');

      const controller = new VolumeController('test', {
        detectedManagers: ['cargo'], // Inject cargo
        skipAutoDetection: false, // Auto-detection enabled
        projectDir,
      });

      await controller.initialize();

      // Should only have cargo, not npm or pip
      const managers = controller.getAllMounts().map((m) => m.manager);
      expect(managers).toEqual(['cargo']);

      await controller.cleanup();
    });

    it('should skip everything when skipAutoDetection is true', async () => {
      writeFileSync(join(projectDir, 'package.json'), '{}');

      const controller = new VolumeController('test', {
        skipAutoDetection: true,
        projectDir,
        // No detectedManagers provided
      });

      await controller.initialize();

      expect(controller.getAllMounts()).toHaveLength(0);
    });
  });
});
