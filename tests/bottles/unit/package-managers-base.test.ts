/**
 * Tests for base package manager adapter
 */

import { describe, it, expect, afterEach, beforeAll, afterAll } from 'vitest';
import { join } from 'node:path';
import { mkdir, writeFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { ShellRPC } from '#bottles/shell-rpc';
import { VolumeController } from '#bottles/volume-controller';
import { TestContext } from '../../utils/test-helpers.js';
import { EnvironmentFixtures } from '../fixtures/environment-fixtures.js';
import {
  BasePackageManagerAdapter,
  PackageManagerAdapterFactory,
  PackageManagerError,
  type DetectionResult,
  type Manifest,
  type InstallOptions,
  type PackageInfo,
} from '#bottles/package-managers/base';
import type { EnvironmentInfo } from '#bottles/environment-detector';

// Mock adapter for testing with exposed protected methods
class MockPackageManagerAdapter extends BasePackageManagerAdapter {
  public readonly name = 'pip' as const;
  public readonly displayName = 'pip (Mock)';
  public readonly executable = 'pip';
  public readonly manifestFiles = ['requirements.txt', 'pyproject.toml'];
  public readonly lockFiles = ['requirements.lock', 'poetry.lock'];

  // Expose protected methods for testing
  public normalizePackageNameExposed(name: string): string {
    return super.normalizePackageName(name);
  }

  public parseVersionSpecExposed(spec: string): {
    name: string;
    version: string;
    constraint?: string;
  } {
    return super.parseVersionSpec(spec);
  }

  public buildCommandArgsExposed(options: InstallOptions = {}): string[] {
    return super.buildCommandArgs(options);
  }

  public async detectProject(dir: string): Promise<DetectionResult> {
    const manifestFiles = await super.findManifestFiles(dir);
    const lockFiles = await super.findLockFiles(dir);

    return {
      detected: manifestFiles.length > 0,
      confidence: manifestFiles.length > 0 ? 0.9 : 0.0,
      manifestFiles,
      lockFiles,
    };
  }

  public async parseManifest(projectDir: string): Promise<Manifest> {
    const manifestFiles = await super.findManifestFiles(projectDir);

    if (manifestFiles.length === 0) {
      throw new PackageManagerError(
        'No manifest files found',
        'NO_MANIFEST',
        'Ensure requirements.txt or pyproject.toml exists in the project',
      );
    }

    return {
      name: 'mock-project',
      version: '1.0.0',
      dependencies: { requests: '>=2.0.0' },
      devDependencies: { pytest: '>=7.0.0' },
      optionalDependencies: {},
    };
  }

  public async installPackages(packages: string[], options: InstallOptions = {}): Promise<void> {
    const args = super.buildCommandArgs(options);
    const env = await super.getEnvironmentVariables(options);

    await super.executeCommand(
      `${this.executable} install ${args.join(' ')} ${packages.join(' ')}`,
      { cwd: options.cwd, env, suppressErrors: true },
    );
  }

  public async uninstallPackages(
    packages: string[],
    options: Omit<InstallOptions, 'dev' | 'optional'> = {},
  ): Promise<void> {
    const env = await super.getEnvironmentVariables(options);

    await super.executeCommand(`${this.executable} uninstall -y ${packages.join(' ')}`, {
      cwd: options.cwd,
      env,
      suppressErrors: true,
    });
  }

  public getInstalledPackages(projectDir?: string): Promise<PackageInfo[]> {
    const resolvedDir = super.resolveProjectDir(projectDir);

    return Promise.resolve([
      {
        name: 'requests',
        version: '2.31.0',
        location: join(resolvedDir, '.venv/lib/python3.11/site-packages/requests'),
        isDev: false,
        isOptional: false,
      },
      {
        name: 'pytest',
        version: '7.4.0',
        location: join(resolvedDir, '.venv/lib/python3.11/site-packages/pytest'),
        isDev: true,
        isOptional: false,
      },
    ]);
  }
}

describe('Base Package Manager Adapter', () => {
  let tempDir: string;
  let shellRPC: ShellRPC;
  let volumeController: VolumeController;
  let adapter: MockPackageManagerAdapter;
  let testContext: TestContext;
  let mockEnvironment: EnvironmentInfo;

  beforeAll(async () => {
    testContext = new TestContext();
    tempDir = await testContext.createDir('pkg-managers');
    mockEnvironment = EnvironmentFixtures.createMockEnvironment();
    try {
      // Verify directory was created
      await access(tempDir, constants.F_OK);
    } catch (error) {
      throw new Error(
        `Failed to create test temp directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  });

  afterAll(async () => {
    await testContext.cleanup();
  });

  afterEach(async (context) => {
    // Mark test as failed if it failed (affects cleanup behavior)
    if (context.task.result?.state === 'fail') {
      testContext.markFailed();
    }

    if (shellRPC) {
      await shellRPC.cleanup();
    }
    if (volumeController) {
      await volumeController.cleanup?.();
    }
  });

  describe('Initialization', () => {
    it('should create adapter with required properties', () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new MockPackageManagerAdapter(shellRPC, volumeController, mockEnvironment, tempDir);

      expect(adapter.name).toBe('pip');
      expect(adapter.displayName).toBe('pip (Mock)');
      expect(adapter.executable).toBe('pip');
      expect(adapter.manifestFiles).toEqual(['requirements.txt', 'pyproject.toml']);
      expect(adapter.lockFiles).toEqual(['requirements.lock', 'poetry.lock']);
    });
  });

  describe('File Operations', () => {
    it('should detect manifest files correctly', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new MockPackageManagerAdapter(shellRPC, volumeController, mockEnvironment, tempDir);

      // Ensure temp directory exists before writing files
      await mkdir(tempDir, { recursive: true });

      // Create a requirements.txt file
      await writeFile(join(tempDir, 'requirements.txt'), 'requests>=2.0.0\npytest>=7.0.0\n');

      const result = await adapter.detectProject(tempDir);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(0.9);
      expect(result.manifestFiles).toContain(join(tempDir, 'requirements.txt'));
    });

    it('should not detect when no manifest files exist', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new MockPackageManagerAdapter(shellRPC, volumeController, mockEnvironment, tempDir);

      const emptyDir = join(tempDir, 'empty');
      await mkdir(emptyDir, { recursive: true });

      const result = await adapter.detectProject(emptyDir);

      expect(result.detected).toBe(false);
      expect(result.confidence).toBe(0.0);
      expect(result.manifestFiles).toHaveLength(0);
    });

    it('should parse manifest correctly', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new MockPackageManagerAdapter(shellRPC, volumeController, mockEnvironment, tempDir);

      // Ensure temp directory exists before writing files
      await mkdir(tempDir, { recursive: true });

      // Create a requirements.txt file
      await writeFile(join(tempDir, 'requirements.txt'), 'requests>=2.0.0\npytest>=7.0.0\n');

      const manifest = await adapter.parseManifest(tempDir);

      expect(manifest.name).toBe('mock-project');
      expect(manifest.version).toBe('1.0.0');
      expect(manifest.dependencies).toHaveProperty('requests');
      expect(manifest.devDependencies).toHaveProperty('pytest');
    });

    it('should throw error when parsing manifest with no files', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new MockPackageManagerAdapter(shellRPC, volumeController, mockEnvironment, tempDir);

      const emptyDir = join(tempDir, 'empty-manifest');
      await mkdir(emptyDir, { recursive: true });

      await expect(adapter.parseManifest(emptyDir)).rejects.toThrow(PackageManagerError);
    });
  });

  describe('Package Operations', () => {
    it('should get installed packages', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new MockPackageManagerAdapter(shellRPC, volumeController, mockEnvironment, tempDir);

      const packages = await adapter.getInstalledPackages();

      expect(packages).toHaveLength(2);
      expect(packages[0]?.name).toBe('requests');
      expect(packages[0]?.isDev).toBe(false);
      expect(packages[1]?.name).toBe('pytest');
      expect(packages[1]?.isDev).toBe(true);
    });

    it('should validate installation', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new MockPackageManagerAdapter(shellRPC, volumeController, mockEnvironment, tempDir);

      const validation = await adapter.validateInstallation();

      // Since pip might not be available in test environment, check structure
      expect(validation).toHaveProperty('valid');
      expect(validation).toHaveProperty('issues');
      expect(validation).toHaveProperty('warnings');
      expect(validation).toHaveProperty('environment');
      expect(validation.environment).toHaveProperty('packageManager', 'pip');
    });
  });

  describe('Cache Integration', () => {
    it('should get cache paths from volume controller', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      await volumeController.initialize();

      // Create a mount for the pip package manager
      await volumeController.mount('pip', join(tempDir, 'cache'));

      adapter = new MockPackageManagerAdapter(shellRPC, volumeController, mockEnvironment, tempDir);

      const cachePaths = await adapter.getCachePaths();

      expect(cachePaths).toHaveProperty('global');
      expect(cachePaths).toHaveProperty('local');
      expect(cachePaths).toHaveProperty('temp');
      expect(typeof cachePaths.global).toBe('string');
    });
  });

  describe('Utility Methods', () => {
    it('should normalize package names', () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new MockPackageManagerAdapter(shellRPC, volumeController, mockEnvironment, tempDir);

      // Access protected method for testing
      const normalized = adapter.normalizePackageNameExposed('  REQUESTS  ');
      expect(normalized).toBe('requests');
    });

    it('should parse version specifications', () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new MockPackageManagerAdapter(shellRPC, volumeController, mockEnvironment, tempDir);

      // Access protected method for testing
      const parsed = adapter.parseVersionSpecExposed('requests>=2.0.0');
      expect(parsed.name).toBe('requests');
      expect(parsed.constraint).toBe('>=2.0.0');
    });

    it('should build command arguments correctly', () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new MockPackageManagerAdapter(shellRPC, volumeController, mockEnvironment, tempDir);

      // Access protected method for testing
      const args = adapter.buildCommandArgsExposed({
        dev: true,
        force: true,
        index: 'https://pypi.org/simple',
        extraArgs: ['--no-cache'],
      });

      expect(args).toContain('--dev');
      expect(args).toContain('--force-reinstall');
      expect(args).toContain('--index-url');
      expect(args).toContain('https://pypi.org/simple');
      expect(args).toContain('--no-cache');
    });
  });
});

describe('Package Manager Adapter Factory', () => {
  let tempDir: string;
  let shellRPC: ShellRPC;
  let volumeController: VolumeController;
  let testContext: TestContext;
  let mockEnvironment: EnvironmentInfo;

  beforeAll(async () => {
    testContext = new TestContext();
    tempDir = await testContext.createDir('factory');
    mockEnvironment = EnvironmentFixtures.createMockEnvironment();
  });

  afterAll(async () => {
    await testContext.cleanup();
  });

  afterEach(async (context) => {
    // Mark test as failed if it failed (affects cleanup behavior)
    if (context.task.result?.state === 'fail') {
      testContext.markFailed();
    }

    if (shellRPC) {
      await shellRPC.cleanup();
    }
    if (volumeController) {
      await volumeController.cleanup?.();
    }
  });

  describe('Adapter Registration', () => {
    it('should register and create adapters', () => {
      PackageManagerAdapterFactory.register('pip', MockPackageManagerAdapter);

      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-factory', {
        skipAutoDetection: true,
      });

      const adapter = PackageManagerAdapterFactory.create(
        'pip',
        shellRPC,
        volumeController,
        mockEnvironment,
        tempDir,
      );

      expect(adapter).toBeInstanceOf(MockPackageManagerAdapter);
      expect(adapter.name).toBe('pip');
    });

    it('should throw error for unregistered adapter', () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-factory', {
        skipAutoDetection: true,
      });

      expect(() => {
        PackageManagerAdapterFactory.create(
          'poetry' as 'pip',
          shellRPC,
          volumeController,
          mockEnvironment,
          tempDir,
        );
      }).toThrow(PackageManagerError);
    });

    it('should list registered adapters', () => {
      PackageManagerAdapterFactory.register('pip', MockPackageManagerAdapter);

      const registered = PackageManagerAdapterFactory.getRegisteredAdapters();
      expect(registered).toContain('pip');
    });

    it('should auto-detect adapters', async () => {
      PackageManagerAdapterFactory.register('pip', MockPackageManagerAdapter);

      // Ensure temp directory exists before writing files
      await mkdir(tempDir, { recursive: true });

      // Create a requirements.txt file for detection
      await writeFile(join(tempDir, 'requirements.txt'), 'requests>=2.0.0\n');

      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-factory', {
        skipAutoDetection: true,
      });

      const detected = await PackageManagerAdapterFactory.autoDetect(
        tempDir,
        shellRPC,
        volumeController,
        mockEnvironment,
      );

      expect(detected).toHaveLength(1);
      expect(detected[0]?.name).toBe('pip');
    });
  });
});
