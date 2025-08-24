/**
 * Tests for Pip package manager adapter
 */

import { describe, it, expect, afterEach, beforeAll, afterAll } from 'vitest';
import { join } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { ShellRPC } from '#bottles/shell-rpc';
import { VolumeController } from '#bottles/volume-controller';
import { PipAdapter } from '#bottles/package-managers/pip';
import { PackageManagerAdapterFactory } from '#bottles/package-managers/base';
import type { InstallOptions } from '#bottles/package-managers/base';
import type { EnvironmentInfo } from '#bottles/environment-detector';
import { EnvironmentFixtures } from '../fixtures/environment-fixtures.js';
// Import registry to auto-register adapters
import '#bottles/package-managers/registry.js';
import { TestContext } from '../../utils/test-helpers.js';

// Test-specific subclass to expose protected methods
class TestPipAdapter extends PipAdapter {
  public getEnvironmentVariablesExposed(options?: InstallOptions): Promise<Record<string, string>> {
    return this.getEnvironmentVariables(options);
  }
}

describe('Pip Package Manager Adapter', () => {
  let tempDir: string;
  let shellRPC: ShellRPC;
  let volumeController: VolumeController;
  let adapter: PipAdapter;
  let testAdapter: TestPipAdapter;
  let testContext: TestContext;
  let environment: EnvironmentInfo;

  beforeAll(async () => {
    testContext = new TestContext();
    tempDir = await testContext.createDir('pip-adapter');
    // Setup mock environment for all tests
    environment = EnvironmentFixtures.createFullEnvironment();
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
    it('should create pip adapter with required properties', () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new PipAdapter(shellRPC, volumeController, environment, tempDir);

      expect(adapter.name).toBe('pip');
      expect(adapter.displayName).toBe('pip');
      expect(adapter.executable).toBe('pip');
      expect(adapter.manifestFiles).toEqual([
        'requirements.txt',
        'requirements-dev.txt',
        'requirements-test.txt',
        'dev-requirements.txt',
        'setup.py',
        'setup.cfg',
        'pyproject.toml',
      ]);
      expect(adapter.lockFiles).toEqual([
        'requirements-lock.txt',
        'requirements.lock',
        'pip-compile.lock',
      ]);
    });

    it('should be registered with the factory', () => {
      const registered = PackageManagerAdapterFactory.getRegisteredAdapters();
      expect(registered).toContain('pip');
    });
  });

  describe('Project Detection', () => {
    it('should not detect pip without any manifest files', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new PipAdapter(shellRPC, volumeController, environment, tempDir);

      const emptyDir = join(tempDir, 'empty');
      await mkdir(emptyDir, { recursive: true });

      const result = await adapter.detectProject(emptyDir);

      expect(result.detected).toBe(false);
      expect(result.confidence).toBe(0.0);
      expect(result.manifestFiles).toHaveLength(0);
    });

    it('should detect pip with requirements.txt (high confidence)', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new PipAdapter(shellRPC, volumeController, environment, tempDir);

      const requirementsDir = join(tempDir, 'requirements');
      await mkdir(requirementsDir, { recursive: true });
      await writeFile(
        join(requirementsDir, 'requirements.txt'),
        `
# Production dependencies
requests>=2.25.0
flask==2.3.2
gunicorn>=20.1.0

# With version ranges
django>=4.0,<5.0

# With environment markers
pytest>=7.0.0; python_version >= "3.8"
`,
      );

      const result = await adapter.detectProject(requirementsDir);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(0.8);
      expect(result.manifestFiles).toContain(join(requirementsDir, 'requirements.txt'));
      expect(result.metadata?.hasRequirements).toBe(true);
      expect(result.metadata?.requirementFiles).toBe(1);
    });

    it('should detect pip with multiple requirement files', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new PipAdapter(shellRPC, volumeController, environment, tempDir);

      const multiReqDir = join(tempDir, 'multi-requirements');
      await mkdir(multiReqDir, { recursive: true });

      await writeFile(join(multiReqDir, 'requirements.txt'), 'requests>=2.25.0');
      await writeFile(
        join(multiReqDir, 'requirements-dev.txt'),
        `
-r requirements.txt
pytest>=7.0.0
black>=22.0.0
`,
      );
      await writeFile(
        join(multiReqDir, 'requirements-test.txt'),
        `
-r requirements-dev.txt
coverage>=6.0.0
`,
      );

      const result = await adapter.detectProject(multiReqDir);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(0.8);
      expect(result.manifestFiles).toHaveLength(3);
      expect(result.metadata?.requirementFiles).toBe(3);
    });

    it('should detect pip with setup.py', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new PipAdapter(shellRPC, volumeController, environment, tempDir);

      const setupDir = join(tempDir, 'setup-py');
      await mkdir(setupDir, { recursive: true });
      await writeFile(
        join(setupDir, 'setup.py'),
        `
from setuptools import setup, find_packages

setup(
    name="test-project",
    version="0.1.0",
    description="A test project",
    packages=find_packages(),
    install_requires=[
        "requests>=2.25.0",
        "flask==2.3.2",
    ],
    extras_require={
        "dev": ["pytest>=7.0.0", "black>=22.0.0"],
        "test": ["coverage>=6.0.0"],
    },
    python_requires=">=3.8",
)
`,
      );

      const result = await adapter.detectProject(setupDir);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(0.7);
      expect(result.manifestFiles).toContain(join(setupDir, 'setup.py'));
      expect(result.metadata?.hasSetupFiles).toBe(true);
    });

    it('should detect pip with setup.cfg', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new PipAdapter(shellRPC, volumeController, environment, tempDir);

      const setupCfgDir = join(tempDir, 'setup-cfg');
      await mkdir(setupCfgDir, { recursive: true });
      await writeFile(
        join(setupCfgDir, 'setup.cfg'),
        `
[metadata]
name = test-project
version = 0.1.0
description = A test project
author = Test Author
license = MIT
python_requires = >=3.8

[options]
packages = find:
install_requires =
    requests>=2.25.0
    flask==2.3.2

[options.extras_require]
dev =
    pytest>=7.0.0
    black>=22.0.0
test =
    coverage>=6.0.0
`,
      );

      const result = await adapter.detectProject(setupCfgDir);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(0.7);
      expect(result.manifestFiles).toContain(join(setupCfgDir, 'setup.cfg'));
      expect(result.metadata?.hasSetupFiles).toBe(true);
    });

    it('should detect pip with pyproject.toml (lower confidence when no other tools)', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new PipAdapter(shellRPC, volumeController, environment, tempDir);

      const pyprojectDir = join(tempDir, 'pyproject-pip');
      await mkdir(pyprojectDir, { recursive: true });
      await writeFile(
        join(pyprojectDir, 'pyproject.toml'),
        `
[build-system]
requires = ["setuptools>=45", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "test-project"
version = "0.1.0"
description = "A test project"
dependencies = [
    "requests>=2.25.0",
    "flask==2.3.2",
]

[project.optional-dependencies]
dev = ["pytest>=7.0.0", "black>=22.0.0"]
test = ["coverage>=6.0.0"]
`,
      );

      const result = await adapter.detectProject(pyprojectDir);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(0.6);
      expect(result.manifestFiles).toContain(join(pyprojectDir, 'pyproject.toml'));
      expect(result.metadata?.hasPyprojectToml).toBe(true);
    });

    it('should have lower confidence for pyproject.toml with other tool markers', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new PipAdapter(shellRPC, volumeController, environment, tempDir);

      const uvProjectDir = join(tempDir, 'pyproject-uv');
      await mkdir(uvProjectDir, { recursive: true });
      await writeFile(
        join(uvProjectDir, 'pyproject.toml'),
        `
[project]
name = "test-project"
version = "0.1.0"

[tool.uv]
dev-dependencies = ["pytest>=7.0.0"]
`,
      );

      const result = await adapter.detectProject(uvProjectDir);

      expect(result.detected).toBe(false);
      expect(result.confidence).toBe(0.4);
    });

    it('should detect pip with virtual environment', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new PipAdapter(shellRPC, volumeController, environment, tempDir);

      const venvDir = join(tempDir, 'with-venv');
      await mkdir(venvDir, { recursive: true });
      await mkdir(join(venvDir, '.venv'), { recursive: true });
      await writeFile(join(venvDir, 'requirements.txt'), 'requests>=2.25.0');

      const result = await adapter.detectProject(venvDir);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(0.8);
      expect(result.metadata?.hasVenv).toBe(true);
      expect(result.metadata?.hasRequirements).toBe(true);
    });

    it('should detect pip with lock files (highest confidence)', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new PipAdapter(shellRPC, volumeController, environment, tempDir);

      const lockDir = join(tempDir, 'with-lock');
      await mkdir(lockDir, { recursive: true });
      await writeFile(join(lockDir, 'requirements.txt'), 'requests>=2.25.0');
      await writeFile(
        join(lockDir, 'requirements-lock.txt'),
        `
# Generated lock file
requests==2.31.0
urllib3==2.0.4
certifi==2023.7.22
charset-normalizer==3.2.0
idna==3.4
`,
      );

      const result = await adapter.detectProject(lockDir);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(0.9);
      expect(result.lockFiles).toContain(join(lockDir, 'requirements-lock.txt'));
      expect(result.metadata?.hasLockFiles).toBe(true);
    });
  });

  describe('Manifest Parsing', () => {
    it('should return undefined when no manifest files exist', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new PipAdapter(shellRPC, volumeController, environment, tempDir);

      const emptyDir = join(tempDir, 'empty-manifest');
      await mkdir(emptyDir, { recursive: true });

      const manifest = await adapter.parseManifest(emptyDir);

      expect(manifest).toBeUndefined();
    });

    it('should parse requirements.txt with various formats', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new PipAdapter(shellRPC, volumeController, environment, tempDir);

      const parseDir = join(tempDir, 'parse-requirements');
      await mkdir(parseDir, { recursive: true });
      await writeFile(
        join(parseDir, 'requirements.txt'),
        `
# Comments should be ignored
requests>=2.25.0  # inline comments too
flask==2.3.2
gunicorn>=20.1.0,<21.0.0

# Environment markers
pytest>=7.0.0; python_version >= "3.8"

# Extras
requests[security]>=2.25.0
django[bcrypt,argon2]>=4.0.0

# Editable installs
-e .
-e git+https://github.com/user/repo.git@main#egg=mypackage

# Includes are parsed recursively
# -r other-requirements.txt

# URLs
https://files.pythonhosted.org/packages/.../package.whl
git+https://github.com/user/repo.git@v1.0.0#egg=another-package

# Index URLs (should be skipped for dependencies)
--index-url https://pypi.org/simple
--extra-index-url https://test.pypi.org/simple
`,
      );

      const manifest = await adapter.parseManifest(parseDir);

      expect(manifest).toBeDefined();
      if (!manifest) throw new Error('Manifest should be defined');
      expect(manifest.dependencies).toBeDefined();

      expect(manifest.dependencies['requests']).toBe('>=2.25.0');
      expect(manifest.dependencies['flask']).toBe('==2.3.2');
      expect(manifest.dependencies['gunicorn']).toBe('>=20.1.0,<21.0.0');
      expect(manifest.dependencies['pytest']).toBe('>=7.0.0');
      expect(manifest.dependencies['django']).toBe('>=4.0.0');

      // VCS and URL dependencies should be included
      expect(manifest.dependencies['mypackage']).toBe('*');
      expect(manifest.dependencies['another-package']).toBe('*');

      expect(manifest.metadata?.hasRequirements).toBe(true);
    });

    it('should parse dev requirements separately', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new PipAdapter(shellRPC, volumeController, environment, tempDir);

      const devDir = join(tempDir, 'dev-requirements');
      await mkdir(devDir, { recursive: true });
      await writeFile(join(devDir, 'requirements.txt'), 'requests>=2.25.0');
      await writeFile(
        join(devDir, 'requirements-dev.txt'),
        `
pytest>=7.0.0
black>=22.0.0
mypy>=1.0.0
`,
      );

      const manifest = await adapter.parseManifest(devDir);
      if (!manifest) throw new Error('Manifest should be defined');
      expect(manifest.dependencies['requests']).toBe('>=2.25.0');
      expect(manifest.devDependencies['pytest']).toBe('>=7.0.0');
      expect(manifest.devDependencies['black']).toBe('>=22.0.0');
      expect(manifest.devDependencies['mypy']).toBe('>=1.0.0');
    });

    it('should parse setup.py metadata', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new PipAdapter(shellRPC, volumeController, environment, tempDir);

      const setupDir = join(tempDir, 'setup-parse');
      await mkdir(setupDir, { recursive: true });
      await writeFile(
        join(setupDir, 'setup.py'),
        `
from setuptools import setup

setup(
    name="test-package",
    version="1.0.0",
    description="A test package for parsing",
    author="Test Author",
    author_email="test@example.com",
    license="MIT",
    python_requires=">=3.8",
    install_requires=[
        "requests>=2.25.0",
        "flask==2.3.2",
    ],
    extras_require={
        "dev": ["pytest>=7.0.0", "black>=22.0.0"],
        "test": ["coverage>=6.0.0"],
    },
)
`,
      );

      const manifest = await adapter.parseManifest(setupDir);
      if (!manifest) throw new Error('Manifest should be defined');
      expect(manifest.name).toBe('test-package');
      expect(manifest.version).toBe('1.0.0');
      expect(manifest.description).toBe('A test package for parsing');
      expect(manifest.author).toBe('Test Author');
      expect(manifest.license).toBe('MIT');
      expect(manifest.pythonRequires).toBe('>=3.8');

      expect(manifest.dependencies['requests']).toBe('>=2.25.0');
      expect(manifest.dependencies['flask']).toBe('==2.3.2');

      expect(manifest.optionalDependencies['pytest[dev]']).toBe('>=7.0.0');
      expect(manifest.optionalDependencies['black[dev]']).toBe('>=22.0.0');
      expect(manifest.optionalDependencies['coverage[test]']).toBe('>=6.0.0');
    });

    it('should parse setup.cfg metadata', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new PipAdapter(shellRPC, volumeController, environment, tempDir);

      const cfgDir = join(tempDir, 'setup-cfg-parse');
      await mkdir(cfgDir, { recursive: true });
      await writeFile(
        join(cfgDir, 'setup.cfg'),
        `
[metadata]
name = cfg-package
version = 2.0.0
description = A test package from setup.cfg
author = CFG Author
license = Apache-2.0
python_requires = >=3.9

[options]
packages = find:
install_requires =
    requests>=2.25.0
    flask==2.3.2
    # Comments in cfg files
    gunicorn>=20.1.0

[options.extras_require]
dev =
    pytest>=7.0.0
    black>=22.0.0
test =
    coverage>=6.0.0
    tox>=4.0.0
`,
      );

      const manifest = await adapter.parseManifest(cfgDir);
      if (!manifest) throw new Error('Manifest should be defined');
      expect(manifest.name).toBe('cfg-package');
      expect(manifest.version).toBe('2.0.0');
      expect(manifest.description).toBe('A test package from setup.cfg');
      expect(manifest.author).toBe('CFG Author');
      expect(manifest.license).toBe('Apache-2.0');
      expect(manifest.pythonRequires).toBe('>=3.9');

      expect(manifest.dependencies['requests']).toBe('>=2.25.0');
      expect(manifest.dependencies['flask']).toBe('==2.3.2');
      expect(manifest.dependencies['gunicorn']).toBe('>=20.1.0');
    });

    it('should parse pyproject.toml metadata (PEP 621)', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new PipAdapter(shellRPC, volumeController, environment, tempDir);

      const tomlDir = join(tempDir, 'pyproject-parse');
      await mkdir(tomlDir, { recursive: true });
      await writeFile(
        join(tomlDir, 'pyproject.toml'),
        `
[build-system]
requires = ["setuptools>=45", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "toml-package"
version = "3.0.0"
description = "A test package from pyproject.toml"
requires-python = ">=3.10"
license = {text = "BSD-3-Clause"}
authors = [
    {name = "TOML Author", email = "toml@example.com"}
]
dependencies = [
    "requests>=2.25.0",
    "flask==2.3.2",
]

[project.optional-dependencies]
dev = ["pytest>=7.0.0", "black>=22.0.0"]
test = ["coverage>=6.0.0", "tox>=4.0.0"]
docs = ["sphinx>=4.0.0"]
`,
      );

      const manifest = await adapter.parseManifest(tomlDir);
      if (!manifest) throw new Error('Manifest should be defined');
      expect(manifest.name).toBe('toml-package');
      expect(manifest.version).toBe('3.0.0');
      expect(manifest.description).toBe('A test package from pyproject.toml');
      expect(manifest.author).toBe('TOML Author');
      expect(manifest.license).toBe('BSD-3-Clause');
      expect(manifest.pythonRequires).toBe('>=3.10');

      expect(manifest.dependencies['requests']).toBe('>=2.25.0');
      expect(manifest.dependencies['flask']).toBe('==2.3.2');

      expect(manifest.optionalDependencies['pytest[dev]']).toBe('>=7.0.0');
      expect(manifest.optionalDependencies['black[dev]']).toBe('>=22.0.0');
      expect(manifest.optionalDependencies['coverage[test]']).toBe('>=6.0.0');
      expect(manifest.optionalDependencies['tox[test]']).toBe('>=4.0.0');
      expect(manifest.optionalDependencies['sphinx[docs]']).toBe('>=4.0.0');
    });

    it('should handle requirement includes (-r)', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new PipAdapter(shellRPC, volumeController, environment, tempDir);

      const includeDir = join(tempDir, 'includes');
      await mkdir(includeDir, { recursive: true });

      // Base requirements
      await writeFile(
        join(includeDir, 'base.txt'),
        `
requests>=2.25.0
flask==2.3.2
`,
      );

      // Main requirements that include base
      await writeFile(
        join(includeDir, 'requirements.txt'),
        `
-r base.txt
gunicorn>=20.1.0
celery>=5.0.0
`,
      );

      const manifest = await adapter.parseManifest(includeDir);
      if (!manifest) throw new Error('Manifest should be defined');
      expect(manifest.dependencies['requests']).toBe('>=2.25.0');
      expect(manifest.dependencies['flask']).toBe('==2.3.2');
      expect(manifest.dependencies['gunicorn']).toBe('>=20.1.0');
      expect(manifest.dependencies['celery']).toBe('>=5.0.0');
    });

    it('should parse complex requirement specifications', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new PipAdapter(shellRPC, volumeController, environment, tempDir);

      const complexDir = join(tempDir, 'complex');
      await mkdir(complexDir, { recursive: true });
      await writeFile(
        join(complexDir, 'requirements.txt'),
        `
# Complex version specifications
django>=4.0,<5.0,!=4.1.0
requests>=2.25.0,<3.0.0

# Environment markers
pytest>=7.0.0; python_version >= "3.8"
typing-extensions>=4.0.0; python_version < "3.10"

# Multiple markers
black>=22.0.0; python_version >= "3.7" and platform_system != "Windows"

# Extras with version constraints
requests[security,socks]>=2.25.0
psycopg2-binary[pool]>=2.9.0; sys_platform != "win32"

# Direct URLs with fragments
git+https://github.com/django/django.git@stable/4.2.x#egg=django
https://files.pythonhosted.org/packages/source/r/requests/requests-2.31.0.tar.gz#egg=requests

# Local paths
-e ./my-local-package
./another-local-package

# VCS with specific commits
git+ssh://git@github.com/user/repo.git@abc1234#egg=myrepo
hg+https://hg.example.com/repo@v1.0#egg=hgrepo
`,
      );

      const manifest = await adapter.parseManifest(complexDir);

      if (!manifest) throw new Error('Manifest should be defined');
      // These packages are overridden by VCS URLs later in the file
      expect(manifest.dependencies['django']).toBe('*'); // Overridden by git URL
      expect(manifest.dependencies['requests']).toBe('*'); // Overridden by direct URL
      expect(manifest.dependencies['pytest']).toBe('>=7.0.0');
      expect(manifest.dependencies['typing-extensions']).toBe('>=4.0.0');
      expect(manifest.dependencies['black']).toBe('>=22.0.0');
      expect(manifest.dependencies['psycopg2-binary']).toBe('>=2.9.0');

      // VCS and URL dependencies
      expect(manifest.dependencies['myrepo']).toBe('*');
      expect(manifest.dependencies['hgrepo']).toBe('*');
    });

    it('should combine manifest files correctly', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new PipAdapter(shellRPC, volumeController, environment, tempDir);

      const combinedDir = join(tempDir, 'combined');
      await mkdir(combinedDir, { recursive: true });

      // requirements.txt
      await writeFile(join(combinedDir, 'requirements.txt'), 'requests>=2.25.0');

      // setup.py with additional metadata
      await writeFile(
        join(combinedDir, 'setup.py'),
        `
setup(
    name="combined-project",
    version="1.0.0",
    install_requires=["flask==2.3.2"],
    extras_require={"dev": ["pytest>=7.0.0"]},
)
`,
      );

      // pyproject.toml with more metadata
      await writeFile(
        join(combinedDir, 'pyproject.toml'),
        `
[project]
description = "Combined from pyproject.toml"
license = {text = "MIT"}
authors = [{name = "Combined Author"}]
`,
      );

      const manifest = await adapter.parseManifest(combinedDir);

      if (!manifest) throw new Error('Manifest should be defined');
      // Should combine dependencies from all sources
      expect(manifest.dependencies['requests']).toBe('>=2.25.0');
      expect(manifest.dependencies['flask']).toBe('==2.3.2');
      expect(manifest.optionalDependencies['pytest[dev]']).toBe('>=7.0.0');

      // Metadata should be combined (last wins for conflicts)
      expect(manifest.name).toBe('combined-project');
      expect(manifest.version).toBe('1.0.0');
      expect(manifest.description).toBe('Combined from pyproject.toml');
      expect(manifest.license).toBe('MIT');
      expect(manifest.author).toBe('Combined Author');
    });
  });

  describe('Cache Paths', () => {
    it('should return pip cache paths', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      await volumeController.mount('pip', join(tempDir, 'cache'));
      adapter = new PipAdapter(shellRPC, volumeController, environment, tempDir);

      const cachePaths = await adapter.getCachePaths();

      expect(cachePaths).toBeDefined();
      expect(cachePaths.global).toBeDefined();
      expect(cachePaths.local).toBeDefined();
      expect(cachePaths.temp).toBeDefined();
      expect(cachePaths.additional).toBeDefined();

      // Check that some paths contain the expected directories
      const hasWheels = cachePaths.additional?.some((path) => path.includes('wheels'));
      const hasHttp = cachePaths.additional?.some((path) => path.includes('http'));

      expect(hasWheels).toBe(true);
      expect(hasHttp).toBe(true);
    });
  });

  describe('Environment Variables', () => {
    it('should set pip-specific environment variables', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      await volumeController.mount('pip', join(tempDir, 'cache'));
      testAdapter = new TestPipAdapter(shellRPC, volumeController, environment, tempDir);

      // Access the protected method through exposed method
      const env = await testAdapter.getEnvironmentVariablesExposed();

      expect(env.PIP_CACHE_DIR).toBeDefined();
      expect(env.PIP_DISABLE_PIP_VERSION_CHECK).toBe('1');
      expect(env.PIP_NO_COLOR).toBe('1');
    });

    it('should merge custom environment variables', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      await volumeController.mount('pip', join(tempDir, 'cache'));
      testAdapter = new TestPipAdapter(shellRPC, volumeController, environment, tempDir);

      const customEnv = {
        CUSTOM_VAR: 'custom-value',
        PIP_TIMEOUT: '60',
      };

      // Access the protected method through exposed method
      const env = await testAdapter.getEnvironmentVariablesExposed({ env: customEnv });

      expect(env.CUSTOM_VAR).toBe('custom-value');
      expect(env.PIP_TIMEOUT).toBe('60');
      expect(env.PIP_DISABLE_PIP_VERSION_CHECK).toBe('1');
    });
  });

  describe('Requirement Parsing Edge Cases', () => {
    it('should handle empty and comment-only files', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new PipAdapter(shellRPC, volumeController, environment, tempDir);

      const edgeDir = join(tempDir, 'edge-cases');
      await mkdir(edgeDir, { recursive: true });
      await writeFile(
        join(edgeDir, 'requirements.txt'),
        `
# This file only has comments


# And empty lines

`,
      );

      const manifest = await adapter.parseManifest(edgeDir);
      if (!manifest) throw new Error('Manifest should be defined');
      expect(Object.keys(manifest.dependencies)).toHaveLength(0);
    });

    it('should handle malformed requirement lines gracefully', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new PipAdapter(shellRPC, volumeController, environment, tempDir);

      const malformedDir = join(tempDir, 'malformed');
      await mkdir(malformedDir, { recursive: true });
      await writeFile(
        join(malformedDir, 'requirements.txt'),
        `
# Valid requirements
requests>=2.25.0

# Malformed lines (should be skipped gracefully)
invalid-vcs-url-without-egg
git+https://github.com/user/repo.git  # missing #egg=name

# Valid requirement after malformed
flask==2.3.2
`,
      );

      const manifest = await adapter.parseManifest(malformedDir);
      if (!manifest) throw new Error('Manifest should be defined');
      expect(manifest.dependencies['requests']).toBe('>=2.25.0');
      expect(manifest.dependencies['flask']).toBe('==2.3.2');
      // Malformed entries should be skipped
    });

    it('should handle constraint files correctly (skip for dependencies)', async () => {
      shellRPC = new ShellRPC();
      volumeController = new VolumeController('test-bottle', {
        skipAutoDetection: true,
      });
      adapter = new PipAdapter(shellRPC, volumeController, environment, tempDir);

      const constraintDir = join(tempDir, 'constraints');
      await mkdir(constraintDir, { recursive: true });
      await writeFile(
        join(constraintDir, 'constraints.txt'),
        `
# Constraints file
requests==2.31.0
flask==2.3.2
`,
      );
      await writeFile(
        join(constraintDir, 'requirements.txt'),
        `
# Regular dependencies
-c constraints.txt
requests>=2.25.0
gunicorn>=20.1.0
`,
      );

      const manifest = await adapter.parseManifest(constraintDir);
      if (!manifest) throw new Error('Manifest should be defined');
      // Should include requirements but not constraints
      expect(manifest.dependencies['requests']).toBe('>=2.25.0');
      expect(manifest.dependencies['gunicorn']).toBe('>=20.1.0');
    });
  });
});
