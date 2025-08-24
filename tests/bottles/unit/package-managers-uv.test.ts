/**
 * Tests for UV package manager adapter
 */

import { describe, it, expect, afterEach, beforeAll, afterAll } from 'vitest';
import { join } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { ShellRPC } from '#bottles/shell-rpc';
import { VolumeController } from '#bottles/volume-controller';
import { UVAdapter } from '#bottles/package-managers/uv';
import { PackageManagerAdapterFactory, PackageManagerError } from '#bottles/package-managers/base';
import type { InstallOptions } from '#bottles/package-managers/base';
// Import registry to auto-register adapters
import '#bottles/package-managers/registry.js';
import { TestContext } from '../../utils/test-helpers.js';
import { EnvironmentFixtures } from '../fixtures/environment-fixtures.js';
import type { EnvironmentInfo } from '#bottles/environment-detector';

// Test-specific subclass to expose protected methods and allow method mocking
class TestUVAdapter extends UVAdapter {
  public getEnvironmentVariablesExposed(options?: InstallOptions): Promise<Record<string, string>> {
    return this.getEnvironmentVariables(options);
  }

  // Allow executeCommand to be mocked
  public executeCommand = super.executeCommand;
}

describe('UV Package Manager Adapter', () => {
  let tempDir: string;
  let shellRPC: ShellRPC;
  let volumeController: VolumeController;
  let testAdapter: TestUVAdapter;
  let testContext: TestContext;
  let mockEnvironment: EnvironmentInfo;

  beforeAll(async () => {
    testContext = new TestContext();
    tempDir = await testContext.createDir('uv-adapter');
    mockEnvironment = EnvironmentFixtures.createMockEnvironment();
  });

  afterAll(async () => {
    await testContext.cleanup();
  });

  // Helper function to create adapter with mount
  async function createAdapterWithMount(): Promise<TestUVAdapter> {
    shellRPC = new ShellRPC();
    volumeController = new VolumeController('test-bottle', {
      skipAutoDetection: true,
    });
    await volumeController.mount('uv', join(tempDir, 'cache'));
    return new TestUVAdapter(shellRPC, volumeController, mockEnvironment, tempDir);
  }

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
    it('should create UV adapter with required properties', () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      testAdapter = new TestUVAdapter(shellRPC, volumeController, mockEnvironment, tempDir);

      expect(testAdapter.name).toBe('uv');
      expect(testAdapter.displayName).toBe('uv');
      expect(testAdapter.executable).toBe('uv');
      expect(testAdapter.manifestFiles).toEqual(['pyproject.toml']);
      expect(testAdapter.lockFiles).toEqual(['uv.lock']);
    });

    it('should be registered with the factory', () => {
      const registered = PackageManagerAdapterFactory.getRegisteredAdapters();
      expect(registered).toContain('uv');
    });
  });

  describe('Project Detection', () => {
    it('should not detect UV without pyproject.toml', async () => {
      testAdapter = await createAdapterWithMount();

      const emptyDir = join(tempDir, 'empty');
      await mkdir(emptyDir, { recursive: true });

      const result = await testAdapter.detectProject(emptyDir);

      expect(result.detected).toBe(false);
      expect(result.confidence).toBe(0.0);
      expect(result.manifestFiles).toHaveLength(0);
    });

    it('should detect UV with pyproject.toml (basic)', async () => {
      testAdapter = await createAdapterWithMount();

      const basicDir = join(tempDir, 'basic');
      await mkdir(basicDir, { recursive: true });
      await writeFile(
        join(basicDir, 'pyproject.toml'),
        `
[project]
name = "test-project"
version = "0.1.0"
dependencies = ["requests>=2.0.0"]
`,
      );

      const result = await testAdapter.detectProject(basicDir);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(0.5);
      expect(result.manifestFiles).toContain(join(basicDir, 'pyproject.toml'));
    });

    it('should detect UV with high confidence when [tool.uv] section exists', async () => {
      testAdapter = await createAdapterWithMount();

      const uvDir = join(tempDir, 'uv-config');
      await mkdir(uvDir, { recursive: true });
      await writeFile(
        join(uvDir, 'pyproject.toml'),
        `
[project]
name = "test-project"
version = "0.1.0"
dependencies = ["requests>=2.0.0"]

[tool.uv]
dev-dependencies = ["pytest>=7.0.0"]
`,
      );

      const result = await testAdapter.detectProject(uvDir);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(0.9);
      expect(result.metadata?.hasUVConfig).toBe(true);
    });

    it('should detect UV with highest confidence when uv.lock exists', async () => {
      testAdapter = await createAdapterWithMount();

      const lockDir = join(tempDir, 'with-lock');
      await mkdir(lockDir, { recursive: true });
      await writeFile(
        join(lockDir, 'pyproject.toml'),
        `
[project]
name = "test-project"
version = "0.1.0"
dependencies = ["requests>=2.0.0"]
`,
      );
      await writeFile(
        join(lockDir, 'uv.lock'),
        JSON.stringify(
          {
            version: 1,
            requires_python: '>=3.8',
            package: [
              {
                name: 'requests',
                version: '2.31.0',
                source: { registry: 'https://pypi.org/simple' },
                dependencies: [],
                summary: 'Python HTTP for Humans.',
              },
            ],
          },
          null,
          2,
        ),
      );

      const result = await testAdapter.detectProject(lockDir);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(0.95);
      expect(result.lockFiles).toContain(join(lockDir, 'uv.lock'));
      expect(result.metadata?.hasLockFile).toBe(true);
    });

    it('should detect workspace projects with highest confidence', async () => {
      testAdapter = await createAdapterWithMount();

      const workspaceDir = join(tempDir, 'workspace');
      await mkdir(workspaceDir, { recursive: true });
      await writeFile(
        join(workspaceDir, 'pyproject.toml'),
        `
[project]
name = "workspace-root"
version = "0.1.0"

[tool.uv.workspace]
members = ["packages/*"]
`,
      );

      const result = await testAdapter.detectProject(workspaceDir);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(0.95);
      expect(result.metadata?.isWorkspace).toBe(true);
    });
  });

  describe('Manifest Parsing', () => {
    it('should return undefined when no pyproject.toml exists', async () => {
      testAdapter = await createAdapterWithMount();

      const emptyDir = join(tempDir, 'empty-manifest');
      await mkdir(emptyDir, { recursive: true });

      const manifest = await testAdapter.parseManifest(emptyDir);

      expect(manifest).toBeUndefined();
    });

    it('should parse basic pyproject.toml', async () => {
      testAdapter = await createAdapterWithMount();

      const basicParseDir = join(tempDir, 'basic-parse');
      await mkdir(basicParseDir, { recursive: true });
      await writeFile(
        join(basicParseDir, 'pyproject.toml'),
        `
[project]
name = "test-project"
version = "0.1.0"
description = "A test project"
requires-python = ">=3.8"
authors = [
    { name = "Test Author", email = "test@example.com" }
]
license = "MIT"
dependencies = [
    "requests>=2.0.0",
    "click~=8.0"
]
`,
      );

      const manifest = await testAdapter.parseManifest(basicParseDir);
      if (!manifest) throw new Error('Manifest should be defined');
      expect(manifest.name).toBe('test-project');
      expect(manifest.version).toBe('0.1.0');
      expect(manifest.description).toBe('A test project');
      expect(manifest.pythonRequires).toBe('>=3.8');
      expect(manifest.license).toBe('MIT');
      expect(manifest.dependencies).toHaveProperty('requests', '>=2.0.0');
      expect(manifest.dependencies).toHaveProperty('click', '~=8.0');
      expect(manifest.author).toEqual({ name: 'Test Author', email: 'test@example.com' });
    });

    it('should parse UV-specific dev-dependencies', async () => {
      testAdapter = await createAdapterWithMount();

      const devDepsDir = join(tempDir, 'dev-deps');
      await mkdir(devDepsDir, { recursive: true });
      await writeFile(
        join(devDepsDir, 'pyproject.toml'),
        `
[project]
name = "test-project"
version = "0.1.0"
dependencies = ["requests>=2.0.0"]

[tool.uv]
dev-dependencies = [
    "pytest>=7.0.0",
    "black>=23.0.0"
]
`,
      );

      const manifest = await testAdapter.parseManifest(devDepsDir);
      if (!manifest) throw new Error('Manifest should be defined');
      expect(manifest.devDependencies).toHaveProperty('pytest', '>=7.0.0');
      expect(manifest.devDependencies).toHaveProperty('black', '>=23.0.0');
    });

    it('should parse optional dependencies', async () => {
      testAdapter = await createAdapterWithMount();

      const optionalDir = join(tempDir, 'optional-deps');
      await mkdir(optionalDir, { recursive: true });
      await writeFile(
        join(optionalDir, 'pyproject.toml'),
        `
[project]
name = "test-project"
version = "0.1.0"
dependencies = ["requests>=2.0.0"]

[project.optional-dependencies]
test = ["pytest>=7.0.0", "coverage>=6.0"]
docs = ["sphinx>=4.0.0", "mkdocs>=1.4"]
`,
      );

      const manifest = await testAdapter.parseManifest(optionalDir);
      if (!manifest) throw new Error('Manifest should be defined');
      expect(manifest.optionalDependencies).toHaveProperty('pytest[test]', '>=7.0.0');
      expect(manifest.optionalDependencies).toHaveProperty('coverage[test]', '>=6.0');
      expect(manifest.optionalDependencies).toHaveProperty('sphinx[docs]', '>=4.0.0');
      expect(manifest.optionalDependencies).toHaveProperty('mkdocs[docs]', '>=1.4');
    });

    it('should use lock file versions when available', async () => {
      testAdapter = await createAdapterWithMount();

      const lockVersionDir = join(tempDir, 'lock-versions');
      await mkdir(lockVersionDir, { recursive: true });
      await writeFile(
        join(lockVersionDir, 'pyproject.toml'),
        `
[project]
name = "test-project"
version = "0.1.0"
dependencies = ["requests>=2.0.0"]
`,
      );
      await writeFile(
        join(lockVersionDir, 'uv.lock'),
        `version = 1
requires-python = ">=3.9"
lock-version = 4

[[package]]
name = "requests"
version = "2.31.0"
source = { registry = "https://pypi.org/simple" }
dependencies = []
summary = "Python HTTP for Humans."
`,
      );

      const manifest = await testAdapter.parseManifest(lockVersionDir);
      if (!manifest) throw new Error('Manifest should be defined');
      expect(manifest.dependencies).toHaveProperty('requests', '2.31.0'); // Exact version from lock
      expect(manifest.pythonRequires).toBe('>=3.9'); // From lock file
      expect(manifest.metadata?.hasLockFile).toBe(true);
      expect(manifest.metadata?.lockFileVersion).toBe(4);
    });
  });

  describe('Cache Integration', () => {
    it('should get cache paths with UV-specific structure', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      await volumeController.mount('uv', join(tempDir, 'cache'));

      testAdapter = new TestUVAdapter(shellRPC, volumeController, mockEnvironment, tempDir);

      const cachePaths = await testAdapter.getCachePaths();

      expect(cachePaths).toHaveProperty('global');
      expect(cachePaths).toHaveProperty('local');
      expect(cachePaths).toHaveProperty('temp');
      expect(cachePaths).toHaveProperty('additional');
      expect(cachePaths.additional).toBeDefined();
      expect(Array.isArray(cachePaths.additional)).toBe(true);

      if (cachePaths.additional) {
        expect(cachePaths.additional.length).toBeGreaterThan(0);

        // Check that the additional paths contain the expected subdirectories
        const additionalPaths = cachePaths.additional;
        const hasBuilds = additionalPaths.some((path) => path.includes('builds'));
        const hasWheels = additionalPaths.some((path) => path.includes('wheels'));
        const hasGit = additionalPaths.some((path) => path.includes('git'));

        expect(hasBuilds).toBe(true);
        expect(hasWheels).toBe(true);
        expect(hasGit).toBe(true);
      }
    });

    it('should fallback to default UV cache location without volume controller', async () => {
      // Create adapter without initializing volume controller
      testAdapter = await createAdapterWithMount();

      const cachePaths = await testAdapter.getCachePaths();

      expect(typeof cachePaths.global).toBe('string');
      expect(cachePaths.global).toContain('uv');
    });
  });

  describe('Environment Variables', () => {
    it('should include UV-specific environment variables', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      await volumeController.mount('uv', join(tempDir, 'cache'));

      testAdapter = new TestUVAdapter(shellRPC, volumeController, mockEnvironment, tempDir);

      // Access protected method for testing
      const envVars = await testAdapter.getEnvironmentVariablesExposed();

      expect(envVars).toHaveProperty('UV_CACHE_DIR');
      expect(envVars).toHaveProperty('UV_PROJECT_ENVIRONMENT');
      expect(envVars.UV_PROJECT_ENVIRONMENT).toContain('.venv');
    });
  });

  describe('Command Building', () => {
    it('should build install command with no packages (sync)', async () => {
      testAdapter = await createAdapterWithMount();

      // Create proper UV project context with pyproject.toml
      const projectDir = join(tempDir, 'sync-empty');
      await mkdir(projectDir, { recursive: true });
      await writeFile(
        join(projectDir, 'pyproject.toml'),
        `
[project]
name = "test-project"
version = "0.1.0"
dependencies = []
`,
      );

      // Override project directory for this test
      testAdapter = new TestUVAdapter(
        testAdapter['shellRPC'],
        testAdapter['volumeController'],
        mockEnvironment,
        projectDir,
      );

      // Mock executeCommand to capture the command
      let capturedCommand = '';
      testAdapter.executeCommand = (command: string) => {
        capturedCommand = command;
        return Promise.resolve({
          command,
          exitCode: 0,
          stdout: '',
          stderr: '',
          duration: 0,
          timedOut: false,
        });
      };

      await testAdapter.installPackages([]);
      expect(capturedCommand).toContain('uv sync');
    });

    it('should build install command for regular packages', async () => {
      testAdapter = await createAdapterWithMount();

      // Create proper UV project context with pyproject.toml
      const projectDir = join(tempDir, 'install-regular');
      await mkdir(projectDir, { recursive: true });
      await writeFile(
        join(projectDir, 'pyproject.toml'),
        `
[project]
name = "test-project"
version = "0.1.0"
dependencies = []
`,
      );

      // Override project directory for this test
      testAdapter = new TestUVAdapter(
        testAdapter['shellRPC'],
        testAdapter['volumeController'],
        mockEnvironment,
        projectDir,
      );

      let capturedCommand = '';
      testAdapter.executeCommand = (command: string) => {
        capturedCommand = command;
        return Promise.resolve({
          command,
          exitCode: 0,
          stdout: '',
          stderr: '',
          duration: 0,
          timedOut: false,
        });
      };

      await testAdapter.installPackages(['requests', 'click']);
      expect(capturedCommand).toContain('uv add');
      expect(capturedCommand).toContain('requests');
      expect(capturedCommand).toContain('click');
    });

    it('should build install command for dev packages', async () => {
      testAdapter = await createAdapterWithMount();

      // Create proper UV project context with pyproject.toml
      const projectDir = join(tempDir, 'install-dev');
      await mkdir(projectDir, { recursive: true });
      await writeFile(
        join(projectDir, 'pyproject.toml'),
        `
[project]
name = "test-project"
version = "0.1.0"
dependencies = []
`,
      );

      // Override project directory for this test
      testAdapter = new TestUVAdapter(
        testAdapter['shellRPC'],
        testAdapter['volumeController'],
        mockEnvironment,
        projectDir,
      );

      let capturedCommand = '';
      testAdapter.executeCommand = (command: string) => {
        capturedCommand = command;
        return Promise.resolve({
          command,
          exitCode: 0,
          stdout: '',
          stderr: '',
          duration: 0,
          timedOut: false,
        });
      };

      await testAdapter.installPackages(['pytest'], { dev: true });
      expect(capturedCommand).toContain('uv add --dev');
      expect(capturedCommand).toContain('pytest');
    });

    it('should build uninstall command', async () => {
      testAdapter = await createAdapterWithMount();

      // Create proper UV project context with pyproject.toml
      const projectDir = join(tempDir, 'uninstall');
      await mkdir(projectDir, { recursive: true });
      await writeFile(
        join(projectDir, 'pyproject.toml'),
        `
[project]
name = "test-project"
version = "0.1.0"
dependencies = []
`,
      );

      // Override project directory for this test
      testAdapter = new TestUVAdapter(
        testAdapter['shellRPC'],
        testAdapter['volumeController'],
        mockEnvironment,
        projectDir,
      );

      let capturedCommand = '';
      testAdapter.executeCommand = (command: string) => {
        capturedCommand = command;
        return Promise.resolve({
          command,
          exitCode: 0,
          stdout: '',
          stderr: '',
          duration: 0,
          timedOut: false,
        });
      };

      await testAdapter.uninstallPackages(['requests']);
      expect(capturedCommand).toContain('uv remove');
      expect(capturedCommand).toContain('requests');
    });
  });

  describe('Package Listing', () => {
    it('should parse pip list JSON output', async () => {
      testAdapter = await createAdapterWithMount();

      // Create minimal pyproject.toml for parseManifest
      const listDir = join(tempDir, 'list-packages');
      await mkdir(listDir, { recursive: true });
      // Create a mock .venv directory so getInstalledPackages doesn't return empty
      await mkdir(join(listDir, '.venv'), { recursive: true });
      await writeFile(
        join(listDir, 'pyproject.toml'),
        `
[project]
name = "test-project"
version = "0.1.0"
dependencies = ["requests>=2.0.0"]

[tool.uv]
dev-dependencies = ["pytest>=7.0.0"]
`,
      );

      // Mock executeCommand to return pip list output
      testAdapter.executeCommand = (command: string) => {
        if (command.includes('pip list')) {
          return Promise.resolve({
            command,
            exitCode: 0,
            stdout: JSON.stringify([
              { name: 'requests', version: '2.31.0', location: '/path/to/requests' },
              { name: 'pytest', version: '7.4.0', location: '/path/to/pytest' },
              { name: 'click', version: '8.1.0', location: '/path/to/click' },
            ]),
            stderr: '',
            duration: 100,
            timedOut: false,
          });
        }
        return Promise.resolve({
          command,
          exitCode: 0,
          stdout: '',
          stderr: '',
          duration: 0,
          timedOut: false,
        });
      };

      const packages = await testAdapter.getInstalledPackages(listDir);

      expect(packages).toHaveLength(3);
      expect(packages.find((p) => p.name === 'requests')).toEqual({
        name: 'requests',
        version: '2.31.0',
        location: '/path/to/requests',
        isDev: false,
        isOptional: false,
        metadata: { editable: false, manager: 'uv' },
      });
      expect(packages.find((p) => p.name === 'pytest')).toEqual(
        expect.objectContaining({
          name: 'pytest',
          isDev: true,
        }),
      );
    });

    it('should handle editable packages', async () => {
      testAdapter = await createAdapterWithMount();

      const editableDir = join(tempDir, 'editable');
      await mkdir(editableDir, { recursive: true });
      // Create a mock .venv directory so getInstalledPackages doesn't return empty
      await mkdir(join(editableDir, '.venv'), { recursive: true });
      await writeFile(
        join(editableDir, 'pyproject.toml'),
        `
[project]
name = "test-project"
version = "0.1.0"
dependencies = ["requests>=2.0.0"]
`,
      );

      testAdapter.executeCommand = (command: string) => {
        if (command.includes('pip list')) {
          return Promise.resolve({
            command,
            exitCode: 0,
            stdout: JSON.stringify([
              {
                name: 'mypackage',
                version: '0.1.0',
                editable_project_location: '/path/to/mypackage',
              },
            ]),
            stderr: '',
            duration: 100,
            timedOut: false,
          });
        }
        return Promise.resolve({
          command,
          exitCode: 0,
          stdout: '',
          stderr: '',
          duration: 0,
          timedOut: false,
        });
      };

      const packages = await testAdapter.getInstalledPackages(editableDir);

      expect(packages[0]).toEqual(
        expect.objectContaining({
          name: 'mypackage',
          location: '/path/to/mypackage',
          metadata: { editable: true, manager: 'uv' },
        }),
      );
    });
  });

  describe('Validation', () => {
    it('should validate UV installation', async () => {
      testAdapter = await createAdapterWithMount();

      // Mock UV version command
      testAdapter.executeCommand = (command: string) => {
        if (command.includes('--version')) {
          return Promise.resolve({
            command,
            exitCode: 0,
            stdout: 'uv 0.1.35',
            stderr: '',
            duration: 100,
            timedOut: false,
          });
        }
        return Promise.resolve({
          command,
          exitCode: 1,
          stdout: '',
          stderr: 'Command not found',
          duration: 100,
          timedOut: false,
        });
      };

      const validation = await testAdapter.validateInstallation();

      expect(validation.environment).toHaveProperty('uvVersion', '0.1.35');
    });

    it('should detect missing UV installation', async () => {
      testAdapter = await createAdapterWithMount();

      // Mock failed UV command
      testAdapter.executeCommand = () =>
        Promise.resolve({
          command: 'uv --version',
          exitCode: 127,
          stdout: '',
          stderr: 'uv: command not found',
          duration: 100,
          timedOut: false,
        });

      const validation = await testAdapter.validateInstallation();

      expect(validation.valid).toBe(false);
      expect(validation.issues).toContain('UV is not installed or not accessible');
    });
  });

  describe('Virtual Environment Management', () => {
    it('should create virtual environment with UV', async () => {
      testAdapter = await createAdapterWithMount();

      let capturedCommand = '';
      testAdapter.executeCommand = (command: string) => {
        capturedCommand = command;
        return Promise.resolve({
          command,
          exitCode: 0,
          stdout: '',
          stderr: '',
          duration: 0,
          timedOut: false,
        });
      };

      const venvDir = join(tempDir, 'venv-create');
      await mkdir(venvDir, { recursive: true });

      await testAdapter.createEnvironment(venvDir);
      expect(capturedCommand).toContain('uv venv');
    });

    it('should create virtual environment with specific Python version', async () => {
      testAdapter = await createAdapterWithMount();

      let capturedCommand = '';
      testAdapter.executeCommand = (command: string) => {
        capturedCommand = command;
        return Promise.resolve({
          command,
          exitCode: 0,
          stdout: '',
          stderr: '',
          duration: 0,
          timedOut: false,
        });
      };

      const venvDir = join(tempDir, 'venv-python-version');
      await mkdir(venvDir, { recursive: true });

      await testAdapter.createEnvironment(venvDir, '3.11');
      expect(capturedCommand).toContain('uv venv --clear --python=3.11');
    });

    it('should return activation environment variables', async () => {
      testAdapter = await createAdapterWithMount();

      const venvDir = join(tempDir, 'venv-activate');
      await mkdir(venvDir, { recursive: true });
      // Create .venv directory to simulate existing environment
      await mkdir(join(venvDir, '.venv', 'bin'), { recursive: true });
      await writeFile(
        join(venvDir, '.venv', 'bin', 'python'),
        '#!/usr/bin/env python3\nprint("Python")\n',
      );

      const envVars = await testAdapter.activateEnvironment(venvDir);

      expect(envVars).toHaveProperty('VIRTUAL_ENV');
      expect(envVars).toHaveProperty('PATH');
      expect(envVars).toHaveProperty('PYTHON');
      expect(envVars.VIRTUAL_ENV).toContain('.venv');
      expect(envVars.PATH).toContain('.venv');
    });

    it('should throw error when virtual environment does not exist', async () => {
      testAdapter = await createAdapterWithMount();

      const nonexistentDir = join(tempDir, 'nonexistent-venv');

      await expect(testAdapter.activateEnvironment(nonexistentDir)).rejects.toThrow(
        PackageManagerError,
      );
    });
  });

  // Note: Temp directory cleanup is handled by TestContext in parent describe block

  describe('Auto-detection Integration', () => {
    it('should be detected by factory auto-detect', async () => {
      const autoDetectDir = join(tempDir, 'auto-detect');
      await mkdir(autoDetectDir, { recursive: true });
      await writeFile(
        join(autoDetectDir, 'pyproject.toml'),
        `
[project]
name = "test-project"
version = "0.1.0"

[tool.uv]
dev-dependencies = ["pytest>=7.0.0"]
`,
      );
      await writeFile(join(autoDetectDir, 'uv.lock'), '{"version": 1}');

      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-factory', {
        skipAutoDetection: true,
      });

      const detected = await PackageManagerAdapterFactory.autoDetect(
        autoDetectDir,
        shellRPC,
        volumeController,
        mockEnvironment,
      );

      expect(detected.length).toBeGreaterThan(0);
      expect(detected.some((adapter) => adapter.name === 'uv')).toBe(true);
    });
  });
});
