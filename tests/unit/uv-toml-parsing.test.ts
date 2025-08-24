import { describe, it, expect, beforeEach } from 'vitest';
import { UVAdapter } from '#bottles/package-managers/uv';
import type { ShellRPC } from '#bottles/shell-rpc';
import type { VolumeController } from '#bottles/volume-controller';
import { EnvironmentFixtures } from '../bottles/fixtures/environment-fixtures.js';
import type { EnvironmentInfo } from '#bottles/environment-detector';

describe('UV Adapter TOML Parsing', () => {
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

  describe('parseUVLockFile', () => {
    it('should parse a real UV lock file structure', () => {
      const uvLockContent = `version = 1
requires-python = ">=3.9"

[options]
exclude-newer = "2024-01-01T00:00:00Z"

[manifest]
requirements = [
    { name = "authly", editable = true },
    { name = "httpx" },
    { name = "pydantic" },
]

[[package]]
name = "anyio"
version = "4.2.0"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "idna" },
    { name = "sniffio" },
]
sdist = { url = "https://files.pythonhosted.org/packages/anyio-4.2.0.tar.gz", hash = "sha256:abc123" }
wheels = [
    { url = "https://files.pythonhosted.org/packages/anyio-4.2.0-py3-none-any.whl", hash = "sha256:def456" },
]

[[package]]
name = "authly"
version = "0.1.0"
source = { editable = "../authly" }
dependencies = [
    { name = "httpx" },
    { name = "pydantic" },
]

[package.metadata]
requires-dist = [
    { name = "httpx", specifier = ">=0.24.0" },
    { name = "pydantic", specifier = ">=2.0.0" },
]

[[package]]
name = "certifi"
version = "2024.2.2"
source = { registry = "https://pypi.org/simple" }
sdist = { url = "https://files.pythonhosted.org/packages/certifi-2024.2.2.tar.gz", hash = "sha256:xyz789" }`;

      // Access the private method through any type assertion for testing
      const result = adapter.parseUVLockFile(uvLockContent);

      expect(result).toBeDefined();
      expect(result?.version).toBe(1);
      expect(result?.package).toHaveLength(3);

      // Check first package
      const anyio = result?.package?.[0];
      expect(anyio?.name).toBe('anyio');
      expect(anyio?.version).toBe('4.2.0');
      expect(anyio?.dependencies).toHaveLength(2);
      expect(anyio?.dependencies?.[0]?.name).toBe('idna');

      // Check editable package
      const authly = result?.package?.[1];
      expect(authly?.name).toBe('authly');
      expect(authly?.version).toBe('0.1.0');
      expect(authly?.source).toEqual({ editable: '../authly' });
      expect(authly?.dependencies).toHaveLength(2);

      // Check third package
      const certifi = result?.package?.[2];
      expect(certifi?.name).toBe('certifi');
      expect(certifi?.version).toBe('2024.2.2');
    });

    it('should handle missing or invalid lock files gracefully', () => {
      // Empty content
      expect(adapter.parseUVLockFile('')).toBeNull();

      // Invalid TOML
      expect(adapter.parseUVLockFile('invalid = [')).toBeNull();

      // Valid TOML but wrong structure
      expect(adapter.parseUVLockFile('[tool]\nname = "test"')).toBeDefined();
    });
  });

  describe('parsePyprojectToml', () => {
    it('should parse pyproject.toml with UV dependencies', () => {
      const pyprojectContent = `
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "test-project"
version = "0.1.0"
description = "A test project"
readme = "README.md"
requires-python = ">=3.9"
dependencies = [
    "requests>=2.28.0",
    "pydantic>=2.0.0",
    "httpx>=0.24.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-cov>=4.1.0",
]

[tool.uv]
dev-dependencies = [
    "ruff>=0.1.0",
    "mypy>=1.8.0",
    "black>=24.0.0",
]

[tool.uv.sources]
authly = { path = "../authly", editable = true }
custom-lib = { git = "https://github.com/example/custom-lib.git", rev = "main" }`;

      const result = adapter.parsePyprojectToml(pyprojectContent);

      expect(result).toBeDefined();
      expect(result?.name).toBe('test-project');
      expect(result?.version).toBe('0.1.0');
      expect(result?.description).toBe('A test project');
      expect(result?.dependencies).toHaveLength(3);
      expect(result?.dependencies).toContain('requests>=2.28.0');

      // Check UV dev dependencies
      expect(result?.devDependencies).toHaveLength(3);
      expect(result?.devDependencies).toContain('ruff>=0.1.0');
      expect(result?.devDependencies).toContain('mypy>=1.8.0');

      // Check UV sources
      expect(result?.uvSources).toBeDefined();
      expect(result?.uvSources?.authly).toEqual({ path: '../authly', editable: true });
      expect(result?.uvSources?.['custom-lib']).toEqual({
        git: 'https://github.com/example/custom-lib.git',
        rev: 'main',
      });
    });

    it('should handle pyproject.toml without UV sections', () => {
      const pyprojectContent = `
[project]
name = "simple-project"
version = "1.0.0"
dependencies = [
    "numpy>=1.20.0",
]`;

      const result = adapter.parsePyprojectToml(pyprojectContent);

      expect(result).toBeDefined();
      expect(result?.name).toBe('simple-project');
      expect(result?.version).toBe('1.0.0');
      expect(result?.dependencies).toHaveLength(1);
      expect(result?.devDependencies).toHaveLength(0);
      expect(result?.uvSources).toBeUndefined();
    });

    it('should merge all dependency sources correctly', () => {
      const pyprojectContent = `
[project]
name = "complex-project"
version = "2.0.0"
dependencies = [
    "core-dep>=1.0.0",
]

[project.optional-dependencies]
test = ["pytest>=7.0.0"]
docs = ["sphinx>=5.0.0"]

[tool.uv]
dev-dependencies = [
    "black>=23.0.0",
    "ruff>=0.1.0",
]

[tool.uv.sources]
local-lib = { path = "./libs/local-lib" }`;

      const result = adapter.parsePyprojectToml(pyprojectContent);

      expect(result).toBeDefined();
      expect(result?.dependencies).toHaveLength(1);
      expect(result?.dependencies).toContain('core-dep>=1.0.0');

      // UV dev-dependencies should be in devDependencies
      expect(result?.devDependencies).toHaveLength(2);
      expect(result?.devDependencies).toContain('black>=23.0.0');

      // Optional dependencies should also be included in the analysis
      expect(result?.optionalDependencies).toBeDefined();
      expect(result?.optionalDependencies.test).toContain('pytest>=7.0.0');
      expect(result?.optionalDependencies.docs).toContain('sphinx>=5.0.0');
    });

    it('should handle invalid pyproject.toml gracefully', () => {
      // Empty content
      expect(adapter.parsePyprojectToml('')).toBeNull();

      // Invalid TOML
      expect(adapter.parsePyprojectToml('invalid toml {')).toBeNull();

      // Valid TOML but no project section
      expect(adapter.parsePyprojectToml('[tool.other]\nkey = "value"')).toBeNull();
    });
  });
});
