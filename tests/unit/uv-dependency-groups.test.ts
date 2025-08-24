import { describe, it, expect, beforeEach } from 'vitest';
import { UVAdapter } from '#bottles/package-managers/uv';
import type { ShellRPC } from '#bottles/shell-rpc';
import type { VolumeController } from '#bottles/volume-controller';
import { EnvironmentFixtures } from '../bottles/fixtures/environment-fixtures.js';
import type { EnvironmentInfo } from '#bottles/environment-detector';

// Type for the parsed pyproject result (for testing purposes)
interface ParsedPyproject {
  name?: string;
  version?: string;
  dependencies?: string[];
  devDependencies?: string[];
  dependencyGroups?: Record<string, string[]>;
  uvIndex?: Record<string, { url: string; priority: string }>;
  uvSources?: Record<string, { path?: string; editable?: boolean }>;
}

describe('UV Dependency Groups Parsing', () => {
  let adapter: UVAdapter;
  let mockShellRPC: ShellRPC;
  let mockVolumeController: VolumeController;
  let environment: EnvironmentInfo;

  beforeEach(() => {
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
  });

  describe('parsePyprojectToml with dependency-groups', () => {
    it('should parse dependency-groups at top level (UV format)', () => {
      const pyprojectContent = `
[project]
name = "test-project"
version = "1.0.0"
dependencies = [
    "httpx>=0.24.0",
    "pydantic>=2.0.0",
]

[dependency-groups]
dev = [
    "ruff>=0.1.0",
    "mypy>=1.8.0",
    "black>=24.0.0",
]
test = [
    "pytest>=7.0.0",
    "pytest-cov>=4.0.0",
]
redis = [
    "redis[hiredis]>=5.2.1",
]
embedded = [
    "testcontainers[redis]>=4.9.0",
]

[tool.uv.index]
pypi = { url = "https://pypi.org/simple/", priority = "primary" }
testpypi = { url = "https://test.pypi.org/simple/", priority = "supplemental" }`;

      const result = adapter.parsePyprojectToml(pyprojectContent) as ParsedPyproject;

      expect(result).toBeDefined();
      expect(result.name).toBe('test-project');

      // Check regular dependencies
      expect(result.dependencies).toEqual(['httpx>=0.24.0', 'pydantic>=2.0.0']);

      // Check dev dependencies (should include dev and test groups)
      expect(result.devDependencies).toContain('ruff>=0.1.0');
      expect(result.devDependencies).toContain('mypy>=1.8.0');
      expect(result.devDependencies).toContain('pytest>=7.0.0');
      expect(result.devDependencies).toContain('pytest-cov>=4.0.0');

      // Check dependency groups are stored
      expect(result.dependencyGroups).toBeDefined();
      expect(result.dependencyGroups?.dev).toEqual(['ruff>=0.1.0', 'mypy>=1.8.0', 'black>=24.0.0']);
      expect(result.dependencyGroups?.redis).toEqual(['redis[hiredis]>=5.2.1']);

      // Check UV index configuration
      expect(result.uvIndex).toBeDefined();
      expect(result.uvIndex?.pypi).toEqual({
        url: 'https://pypi.org/simple/',
        priority: 'primary',
      });
    });

    it('should handle missing dependency-groups gracefully', () => {
      const pyprojectContent = `
[project]
name = "simple-project"
version = "1.0.0"
dependencies = ["requests>=2.28.0"]

[tool.uv.sources]
mylib = { path = "../mylib", editable = true }`;

      const result = adapter.parsePyprojectToml(pyprojectContent) as ParsedPyproject;

      expect(result).toBeDefined();
      expect(result.name).toBe('simple-project');
      expect(result.dependencies).toEqual(['requests>=2.28.0']);
      expect(result.devDependencies).toEqual([]);
      expect(result.dependencyGroups).toBeUndefined();

      // Should still parse UV sources
      expect(result.uvSources).toBeDefined();
      expect(result.uvSources?.mylib).toEqual({
        path: '../mylib',
        editable: true,
      });
    });

    it('should not confuse with Poetry format', () => {
      // Poetry uses [tool.poetry.dependencies] and [tool.poetry.group.dev.dependencies]
      // UV uses [dependency-groups] at top level
      const poetryStyleContent = `
[project]
name = "poetry-style"
version = "1.0.0"

[tool.poetry.dependencies]
python = "^3.11"
requests = "^2.28.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.0.0"`;

      // Access private method for testing
      const result = adapter.parsePyprojectToml(poetryStyleContent) as ParsedPyproject;

      expect(result).toBeDefined();
      expect(result.name).toBe('poetry-style');

      // Should not pick up Poetry-style dependencies
      expect(result.dependencies).toEqual([]);
      expect(result.devDependencies).toEqual([]);
      expect(result.dependencyGroups).toBeUndefined();
    });

    it('should handle both old and new UV formats', () => {
      // Some projects might still use [tool.uv.dev-dependencies]
      const mixedFormat = `
[project]
name = "mixed-format"
version = "1.0.0"
dependencies = ["httpx>=0.24.0"]

[dependency-groups]
test = ["pytest>=7.0.0"]

[tool.uv]
dev-dependencies = ["ruff>=0.1.0"]
sources = { mylib = { path = "../mylib" } }`;

      // Access private method for testing
      const result = adapter.parsePyprojectToml(mixedFormat) as ParsedPyproject;

      expect(result).toBeDefined();

      // Should pick up from dependency-groups
      expect(result.devDependencies).toContain('pytest>=7.0.0');

      // Note: Current implementation prioritizes dependency-groups over tool.uv.dev-dependencies
      // This is correct as dependency-groups is the newer format
      expect(result.dependencyGroups).toBeDefined();
      expect(result.dependencyGroups?.test).toEqual(['pytest>=7.0.0']);
    });

    it('should correctly identify dev-related dependency groups', () => {
      const content = `
[project]
name = "test"
version = "1.0.0"

[dependency-groups]
dev = ["black>=23.0.0"]
development = ["isort>=5.0.0"]
test = ["pytest>=7.0.0"]
testing = ["tox>=4.0.0"]
lint = ["ruff>=0.1.0"]
type-check = ["mypy>=1.0.0"]
docs = ["sphinx>=5.0.0"]
build = ["build>=1.0.0"]`;

      // Access private method for testing
      const result = adapter.parsePyprojectToml(content) as ParsedPyproject;

      expect(result).toBeDefined();

      // Should include dev, development, test, testing, lint, type-check
      // Should NOT include docs, build (not in devGroupNames list)
      expect(result.devDependencies).toContain('black>=23.0.0');
      expect(result.devDependencies).toContain('isort>=5.0.0');
      expect(result.devDependencies).toContain('pytest>=7.0.0');
      expect(result.devDependencies).toContain('tox>=4.0.0');
      expect(result.devDependencies).toContain('ruff>=0.1.0');
      expect(result.devDependencies).toContain('mypy>=1.0.0');
      expect(result.devDependencies).not.toContain('sphinx>=5.0.0');
      expect(result.devDependencies).not.toContain('build>=1.0.0');
    });
  });
});
