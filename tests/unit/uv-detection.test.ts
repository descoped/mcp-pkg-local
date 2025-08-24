import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UVAdapter } from '#bottles/package-managers/uv';
import type { ShellRPC } from '#bottles/shell-rpc';
import type { VolumeController } from '#bottles/volume-controller';
import * as fs from 'fs/promises';
import { join } from 'path';
import { EnvironmentFixtures } from '../bottles/fixtures/environment-fixtures.js';
import type { EnvironmentInfo } from '#bottles/environment-detector';

// Mock fs module
vi.mock('fs/promises');

describe('UV Project Detection', () => {
  let adapter: UVAdapter;
  let mockShellRPC: ShellRPC;
  let mockVolumeController: VolumeController;
  let environment: EnvironmentInfo;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a minimal mock ShellRPC
    mockShellRPC = {
      execute: () => Promise.resolve({ stdout: '', stderr: '', exitCode: 0 }),
      isAlive: () => true,
      cleanup: () => Promise.resolve(),
      id: 'mock-shell',
    } as unknown as ShellRPC;

    // Create a minimal mock VolumeController
    mockVolumeController = {} as VolumeController;

    environment = EnvironmentFixtures.createFullEnvironment();
    adapter = new UVAdapter(mockShellRPC, mockVolumeController, environment);

    // Default mock for file existence - reject all by default
    vi.mocked(fs.access).mockRejectedValue(new Error('File not found'));
  });

  describe('detectProject', () => {
    it('should have highest confidence with uv.lock present', async () => {
      const projectDir = '/test/project';

      // Mock file existence
      vi.mocked(fs.access).mockImplementation((path) => {
        const pathStr = path.toString();
        if (pathStr.endsWith('pyproject.toml') || pathStr.endsWith('uv.lock')) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('File not found'));
      });

      vi.mocked(fs.readFile).mockResolvedValue(`
[project]
name = "test"
version = "1.0.0"
dependencies = []
`);

      const result = await adapter.detectProject(projectDir);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(0.95);
      expect(result.lockFiles).toContain(join(projectDir, 'uv.lock'));
    });

    it('should detect UV with dependency-groups', async () => {
      const projectDir = '/test/project';

      vi.mocked(fs.access).mockImplementation((path) => {
        const pathStr = path.toString();
        if (pathStr.endsWith('pyproject.toml')) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('File not found'));
      });
      vi.mocked(fs.readFile).mockResolvedValue(`
[project]
name = "test"
version = "1.0.0"

[dependency-groups]
dev = ["pytest>=7.0.0", "ruff>=0.1.0"]
test = ["pytest-cov>=4.0.0"]
`);

      const result = await adapter.detectProject(projectDir);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
      expect(result.metadata?.hasDependencyGroups).toBe(true);
    });

    it('should detect UV with tool.uv configuration', async () => {
      const projectDir = '/test/project';

      vi.mocked(fs.access).mockImplementation((path) => {
        const pathStr = path.toString();
        if (pathStr.endsWith('pyproject.toml')) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('File not found'));
      });
      vi.mocked(fs.readFile).mockResolvedValue(`
[project]
name = "test"
version = "1.0.0"

[tool.uv]
default-groups = ["dev"]

[tool.uv.sources]
mylib = { path = "../mylib", editable = true }
`);

      const result = await adapter.detectProject(projectDir);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
      expect(result.metadata?.hasUVConfig).toBe(true);
      expect(result.metadata?.hasUVSources).toBe(true);
    });

    it('should detect UV with tool.uv.index', async () => {
      const projectDir = '/test/project';

      vi.mocked(fs.access).mockImplementation((path) => {
        const pathStr = path.toString();
        if (pathStr.endsWith('pyproject.toml')) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('File not found'));
      });
      vi.mocked(fs.readFile).mockResolvedValue(`
[project]
name = "test"
version = "1.0.0"

[tool.uv.index]
pypi = { url = "https://pypi.org/simple/", priority = "primary" }
testpypi = { url = "https://test.pypi.org/simple/", priority = "supplemental" }
`);

      const result = await adapter.detectProject(projectDir);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
      expect(result.metadata?.hasUVIndex).toBe(true);
    });

    it('should detect UV workspace projects', async () => {
      const projectDir = '/test/project';

      vi.mocked(fs.access).mockImplementation((path) => {
        const pathStr = path.toString();
        if (pathStr.endsWith('pyproject.toml')) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('File not found'));
      });
      vi.mocked(fs.readFile).mockResolvedValue(`
[project]
name = "test"
version = "1.0.0"

[tool.uv.workspace]
members = ["packages/*"]
`);

      const result = await adapter.detectProject(projectDir);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(0.95);
      expect(result.metadata?.isWorkspace).toBe(true);
    });

    it('should detect legacy UV dev-dependencies', async () => {
      const projectDir = '/test/project';

      vi.mocked(fs.access).mockImplementation((path) => {
        const pathStr = path.toString();
        if (pathStr.endsWith('pyproject.toml')) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('File not found'));
      });
      vi.mocked(fs.readFile).mockResolvedValue(`
[project]
name = "test"
version = "1.0.0"

[tool.uv]
dev-dependencies = ["pytest>=7.0.0"]
`);

      const result = await adapter.detectProject(projectDir);

      expect(result.detected).toBe(true);
      expect(result.metadata?.hasLegacyDevDeps).toBe(true);
    });

    it('should not detect UV for plain pyproject.toml without UV markers', async () => {
      const projectDir = '/test/project';

      vi.mocked(fs.access).mockImplementation((path) => {
        const pathStr = path.toString();
        if (pathStr.endsWith('pyproject.toml')) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('File not found'));
      });
      vi.mocked(fs.readFile).mockResolvedValue(`
[project]
name = "test"
version = "1.0.0"
dependencies = ["requests>=2.28.0"]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
`);

      const result = await adapter.detectProject(projectDir);

      // Base confidence of 0.5 for pyproject.toml
      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(0.5);
      expect(result.metadata?.hasUVConfig).toBeUndefined();
      expect(result.metadata?.hasDependencyGroups).toBeUndefined();
    });

    it('should not confuse Poetry projects with UV', async () => {
      const projectDir = '/test/project';

      // Mock file existence checks
      vi.mocked(fs.access).mockImplementation((path) => {
        const pathStr = path.toString();
        if (pathStr.endsWith('pyproject.toml') || pathStr.endsWith('poetry.lock')) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('File not found'));
      });

      vi.mocked(fs.readFile).mockResolvedValue(`
[tool.poetry]
name = "test"
version = "1.0.0"

[tool.poetry.dependencies]
python = "^3.11"
requests = "^2.28.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.0.0"
`);

      const result = await adapter.detectProject(projectDir);

      // Should still detect as Python project but low UV confidence
      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(0.5); // Base pyproject.toml confidence
      expect(result.metadata?.hasUVConfig).toBeUndefined();
      expect(result.lockFiles).toHaveLength(0); // No uv.lock found
    });

    it('should not detect UV without pyproject.toml', async () => {
      const projectDir = '/test/project';

      // All files return not found (default mock behavior)

      const result = await adapter.detectProject(projectDir);

      expect(result.detected).toBe(false);
      expect(result.confidence).toBe(0.0);
      expect(result.manifestFiles).toHaveLength(0);
    });
  });
});
