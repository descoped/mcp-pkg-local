import { describe, it, expect } from 'vitest';
import * as TOML from 'smol-toml';

describe('Real-world UV file parsing', () => {
  describe('authly uv.lock structure', () => {
    it('should parse real authly uv.lock structure', () => {
      // Simplified version of authly's uv.lock structure
      const uvLockContent = `version = 1
revision = 3
requires-python = ">=3.11"

[[package]]
name = "annotated-types"
version = "0.7.0"
source = { registry = "https://pypi.org/simple" }
sdist = { url = "https://files.pythonhosted.org/packages/annotated-types-0.7.0.tar.gz", hash = "sha256:1f02e8b43a8fbbc3f3e0d4f0f4bfc8131bcb4eebe8849b8e5c773f3a1c582a53a", size = 16081 }
wheels = [
    { url = "https://files.pythonhosted.org/packages/annotated_types-0.7.0-py3-none-any.whl", hash = "sha256:aff07c09a53a08bc8cfccb9c85b05f1aa9a2a6f23728d790723543408344ce89", size = 11894 },
]

[[package]]
name = "authly"
version = "0.5.8"
source = { editable = "." }
dependencies = [
    { name = "certifi" },
    { name = "cffi", marker = "platform_python_implementation != 'PyPy'" },
    { name = "httpx" },
    { name = "jwt" },
    { name = "onelogin" },
    { name = "pydantic" },
    { name = "pytz" },
    { name = "qrcode" },
    { name = "redis", extra = ["redis"] },
    { name = "rich" },
    { name = "typer" },
]

[package.optional-dependencies]
embedded = [
    { name = "testcontainers", extra = ["redis"] },
]
redis = [
    { name = "redis", extra = ["hiredis"] },
]
test = [
    { name = "aioresponses" },
    { name = "authly", extra = ["embedded", "redis"] },
    { name = "mypy" },
    { name = "pytest" },
    { name = "pytest-asyncio" },
    { name = "pytest-cov" },
    { name = "pytest-env" },
    { name = "pytest-httpx" },
    { name = "pytest-xdist" },
    { name = "respx" },
    { name = "types-pytz" },
    { name = "types-redis" },
]

[package.metadata]
requires-dist = [
    { name = "aioresponses", marker = "extra == 'test'", specifier = ">=0.7.7" },
    { name = "authly", extras = ["embedded", "redis"], marker = "extra == 'test'" },
    { name = "certifi", specifier = ">=2024.8.30" },
    { name = "cffi", marker = "platform_python_implementation != 'PyPy'", specifier = ">=1.17.1" },
    { name = "httpx", specifier = ">=0.28.1" },
    { name = "jwt", specifier = ">=1.3.1" },
    { name = "mypy", marker = "extra == 'test'", specifier = ">=1.14.1" },
    { name = "onelogin", specifier = ">=2.1.1" },
    { name = "pydantic", specifier = ">=2.10.5" },
    { name = "pytest", marker = "extra == 'test'", specifier = ">=8.3.4" },
    { name = "pytest-asyncio", marker = "extra == 'test'", specifier = ">=0.25.0" },
    { name = "pytest-cov", marker = "extra == 'test'", specifier = ">=6.0.0" },
    { name = "pytest-env", marker = "extra == 'test'", specifier = ">=1.1.5" },
    { name = "pytest-httpx", marker = "extra == 'test'", specifier = ">=0.35.0" },
    { name = "pytest-xdist", marker = "extra == 'test'", specifier = ">=3.6.1" },
    { name = "pytz", specifier = ">=2024.2" },
    { name = "qrcode", specifier = ">=8.0" },
    { name = "redis", extras = ["hiredis"], marker = "extra == 'redis'", specifier = ">=5.2.1" },
    { name = "respx", marker = "extra == 'test'", specifier = ">=0.22.0" },
    { name = "rich", specifier = ">=13.9.4" },
    { name = "testcontainers", extras = ["redis"], marker = "extra == 'embedded'", specifier = ">=4.9.0" },
    { name = "typer", specifier = ">=0.15.1" },
    { name = "types-pytz", marker = "extra == 'test'", specifier = ">=2024.2.0.20241221" },
    { name = "types-redis", marker = "extra == 'test'", specifier = ">=4.6.0.20241126" },
]

[[package]]
name = "bcrypt"
version = "4.2.1"
source = { registry = "https://pypi.org/simple" }
sdist = { url = "https://files.pythonhosted.org/packages/bcrypt-4.2.1.tar.gz", hash = "sha256:622baa6", size = 26440 }
wheels = [
    { url = "https://files.pythonhosted.org/packages/bcrypt-4.2.1-cp39-abi3-macosx_10_12_universal2.whl", hash = "sha256:3bef6aa", size = 492193 },
    { url = "https://files.pythonhosted.org/packages/bcrypt-4.2.1-cp39-abi3-manylinux_2_17_aarch64.whl", hash = "sha256:2018f37", size = 276163 },
    { url = "https://files.pythonhosted.org/packages/bcrypt-4.2.1-cp39-abi3-manylinux_2_17_x86_64.whl", hash = "sha256:abcdef", size = 279975 },
    { url = "https://files.pythonhosted.org/packages/bcrypt-4.2.1-cp39-abi3-manylinux_2_28_aarch64.whl", hash = "sha256:123456", size = 275910 },
    { url = "https://files.pythonhosted.org/packages/bcrypt-4.2.1-cp39-abi3-manylinux_2_28_x86_64.whl", hash = "sha256:789abc", size = 275928 },
    { url = "https://files.pythonhosted.org/packages/bcrypt-4.2.1-cp39-abi3-musllinux_1_1_aarch64.whl", hash = "sha256:fedcba", size = 306872 },
    { url = "https://files.pythonhosted.org/packages/bcrypt-4.2.1-cp39-abi3-musllinux_1_1_x86_64.whl", hash = "sha256:135790", size = 313577 },
    { url = "https://files.pythonhosted.org/packages/bcrypt-4.2.1-cp39-abi3-musllinux_1_2_aarch64.whl", hash = "sha256:246810", size = 318074 },
    { url = "https://files.pythonhosted.org/packages/bcrypt-4.2.1-cp39-abi3-musllinux_1_2_x86_64.whl", hash = "sha256:369121", size = 338912 },
    { url = "https://files.pythonhosted.org/packages/bcrypt-4.2.1-cp39-abi3-win32.whl", hash = "sha256:482014", size = 162100 },
    { url = "https://files.pythonhosted.org/packages/bcrypt-4.2.1-cp39-abi3-win_amd64.whl", hash = "sha256:593625", size = 153589 },
    { url = "https://files.pythonhosted.org/packages/bcrypt-4.2.1-pp310-pypy310_pp73-manylinux_2_28_aarch64.whl", hash = "sha256:605040", size = 270091 },
    { url = "https://files.pythonhosted.org/packages/bcrypt-4.2.1-pp310-pypy310_pp73-manylinux_2_28_x86_64.whl", hash = "sha256:716252", size = 270020 },
]`;

      const parsed = TOML.parse(uvLockContent) as Record<string, unknown>;

      // Check top-level fields
      expect(parsed.version).toBe(1);
      expect(parsed.revision).toBe(3);
      expect(parsed['requires-python']).toBe('>=3.11');

      // Check package array
      const packages = parsed.package as Array<Record<string, unknown>>;
      expect(packages).toHaveLength(3);

      // Check annotated-types package
      const annotatedTypes = packages[0];
      expect(annotatedTypes?.name).toBe('annotated-types');
      expect(annotatedTypes?.version).toBe('0.7.0');
      const source1 = annotatedTypes?.source as Record<string, unknown>;
      expect(source1.registry).toBe('https://pypi.org/simple');

      // Check authly package (editable)
      const authly = packages[1];
      expect(authly?.name).toBe('authly');
      expect(authly?.version).toBe('0.5.8');
      const source2 = authly?.source as Record<string, unknown>;
      expect(source2.editable).toBe('.');

      // Check dependencies with markers and extras
      const dependencies = authly?.dependencies as Array<Record<string, unknown>>;
      expect(dependencies).toBeDefined();
      expect(dependencies.length).toBeGreaterThan(0);

      // Find the cffi dependency with marker
      const cffiDep = dependencies.find((d) => d.name === 'cffi');
      expect(cffiDep).toBeDefined();
      expect(cffiDep?.marker).toBe("platform_python_implementation != 'PyPy'");

      // Find redis with extra
      const redisDep = dependencies.find((d) => d.name === 'redis');
      expect(redisDep).toBeDefined();
      expect(redisDep?.extra).toEqual(['redis']);

      // Check optional dependencies
      const optionalDeps = authly?.['optional-dependencies'] as Record<
        string,
        Array<Record<string, unknown>>
      >;
      expect(optionalDeps).toBeDefined();
      expect(optionalDeps.test).toBeDefined();
      expect(optionalDeps.redis).toBeDefined();
      expect(optionalDeps.embedded).toBeDefined();

      // Check metadata
      const metadata = authly?.metadata as Record<string, unknown>;
      expect(metadata).toBeDefined();
      const requiresDist = metadata['requires-dist'] as Array<Record<string, unknown>>;
      expect(requiresDist).toBeDefined();
      expect(requiresDist.length).toBeGreaterThan(0);

      // Check bcrypt package with multiple wheels
      const bcrypt = packages[2];
      expect(bcrypt?.name).toBe('bcrypt');
      const wheels = bcrypt?.wheels as Array<Record<string, unknown>>;
      expect(wheels).toBeDefined();
      expect(wheels.length).toBe(13); // Multiple platform wheels
    });
  });

  describe('authly pyproject.toml structure', () => {
    it('should parse real authly pyproject.toml structure', () => {
      const pyprojectContent = `
[project]
name = "authly"
version = "0.5.8"
description = "Authorization & User Token Handling Layer for You"
authors = [
    { name = "Ove Ranheim", email = "ove@descoped.io" },
]
requires-python = ">=3.11"
readme = "README.md"
keywords = [
    "OAuth2",
    "Authorization",
    "Security",
    "Authentication",
    "JWT",
    "SAML",
]
classifiers = [
    "Development Status :: 4 - Beta",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: Apache Software License",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
    "Programming Language :: Python :: 3.13",
]
dependencies = [
    "certifi>=2024.8.30",
    "cffi>=1.17.1; platform_python_implementation != 'PyPy'",
    "httpx>=0.28.1",
    "jwt>=1.3.1",
    "onelogin>=2.1.1",
    "pydantic>=2.10.5",
    "pytz>=2024.2",
    "qrcode>=8.0",
    "rich>=13.9.4",
    "typer>=0.15.1",
]

[project.scripts]
authly = "authly.__main__:main"

[project.urls]
Homepage = "https://github.com/descoped/authly"
Repository = "https://github.com/descoped/authly.git"
Issues = "https://github.com/descoped/authly/issues"

[dependency-groups]
redis = [
    "redis[hiredis]>=5.2.1",
]
embedded = [
    "testcontainers[redis]>=4.9.0",
]
dev = [
    "build>=1.2.2.post1",
    "hatch>=1.14.0",
    "ruff>=0.9.1",
    "setuptools>=75.8.0",
    "twine>=6.0.1",
    "wheel>=0.45.1",
]
test = [
    "aioresponses>=0.7.7",
    "mypy>=1.14.1",
    "pytest>=8.3.4",
    "pytest-asyncio>=0.25.0",
    "pytest-cov>=6.0.0",
    "pytest-env>=1.1.5",
    "pytest-httpx>=0.35.0",
    "pytest-xdist>=3.6.1",
    "respx>=0.22.0",
    "types-pytz>=2024.2.0.20241221",
    "types-redis>=4.6.0.20241126",
]

[tool.pytest.ini_options]
pythonpath = ["."]
testpaths = ["tests"]
python_files = ["*_test.py", "test_*.py", "*_tests.py"]
asyncio_mode = "auto"
asyncio_default_fixture_loop_scope = "function"
markers = [
    'slow: marks tests as slow (deselect with -m "not slow")',
    "integration: marks tests as integration tests",
    "unit: marks tests as unit tests",
]
addopts = "-v --tb=short"
log_cli = true
log_cli_level = "INFO"
timeout = 60

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build]
exclude = [
    ".*",
    ".*/**",
    "scripts/**",
    "tests/**",
    "docs/**",
    "examples/**",
]

[tool.uv.index]
pypi = { url = "https://pypi.org/simple/", priority = "primary" }
testpypi = { url = "https://test.pypi.org/simple/", priority = "supplemental" }

[tool.ruff]
target-version = "py311"
line-length = 120
exclude = [
    ".bzr",
    ".direnv",
    ".eggs",
    ".git",
    ".hg",
    ".mypy_cache",
    ".nox",
    ".pants.d",
    ".ruff_cache",
    ".svn",
    ".tox",
    ".venv",
    "__pypackages__",
    "_build",
    "buck-out",
    "build",
    "dist",
    "node_modules",
    "venv",
]

[tool.ruff.lint]
select = [
    "E",  # pycodestyle errors
    "W",  # pycodestyle warnings
    "F",  # pyflakes
    "I",  # isort
    "B",  # flake8-bugbear
    "C4", # flake8-comprehensions
    "UP", # pyupgrade
]
ignore = [
    "E501", # line too long, handled by black
    "B008", # do not perform function calls in argument defaults
    "C901", # too complex
    "W191", # indentation contains tabs
]

[tool.ruff.lint.per-file-ignores]
"__init__.py" = ["F401"]

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
skip-magic-trailing-comma = false
line-ending = "auto"

[tool.ruff.lint.isort]
known-third-party = ["httpx", "pydantic", "pytest"]

[tool.ruff.lint.pyupgrade]
keep-runtime-typing = true`;

      const parsed = TOML.parse(pyprojectContent) as Record<string, unknown>;

      // Check [project] section
      const project = parsed.project as Record<string, unknown>;
      expect(project.name).toBe('authly');
      expect(project.version).toBe('0.5.8');
      expect(project.description).toBe('Authorization & User Token Handling Layer for You');
      expect(project['requires-python']).toBe('>=3.11');

      // Check authors
      const authors = project.authors as Array<Record<string, unknown>>;
      expect(authors).toHaveLength(1);
      expect(authors[0]?.name).toBe('Ove Ranheim');
      expect(authors[0]?.email).toBe('ove@descoped.io');

      // Check dependencies with markers
      const deps = project.dependencies as string[];
      expect(deps).toBeDefined();
      expect(deps).toContain('httpx>=0.28.1');
      expect(deps).toContain("cffi>=1.17.1; platform_python_implementation != 'PyPy'");

      // Check scripts
      const scripts = project.scripts as Record<string, string>;
      expect(scripts.authly).toBe('authly.__main__:main');

      // Check URLs
      const urls = project.urls as Record<string, string>;
      expect(urls.Homepage).toBe('https://github.com/descoped/authly');

      // Check [dependency-groups] (UV's new format)
      const depGroups = parsed['dependency-groups'] as Record<string, string[]>;
      expect(depGroups).toBeDefined();
      expect(depGroups.redis).toContain('redis[hiredis]>=5.2.1');
      expect(depGroups.dev).toContain('ruff>=0.9.1');
      expect(depGroups.test).toContain('pytest>=8.3.4');

      // Check [tool.pytest.ini_options]
      const tool = parsed.tool as Record<string, unknown>;
      const pytest = tool.pytest as Record<string, unknown>;
      const pytestOptions = pytest.ini_options as Record<string, unknown>;
      expect(pytestOptions.pythonpath).toEqual(['.']);
      expect(pytestOptions.testpaths).toEqual(['tests']);

      // Check [tool.uv.index]
      const uv = tool.uv as Record<string, unknown>;
      const index = uv.index as Record<string, unknown>;
      const pypi = index.pypi as Record<string, unknown>;
      expect(pypi.url).toBe('https://pypi.org/simple/');
      expect(pypi.priority).toBe('primary');

      // Check [tool.ruff]
      const ruff = tool.ruff as Record<string, unknown>;
      expect(ruff['target-version']).toBe('py311');
      expect(ruff['line-length']).toBe(120);
    });
  });

  describe('Edge cases from real-world files', () => {
    it('should handle revision field in uv.lock', () => {
      const content = `version = 1
revision = 3
requires-python = ">=3.11"`;

      const parsed = TOML.parse(content) as Record<string, unknown>;
      expect(parsed.version).toBe(1);
      expect(parsed.revision).toBe(3);
      expect(parsed['requires-python']).toBe('>=3.11');
    });

    it('should handle dependency-groups (UV specific format)', () => {
      const content = `
[dependency-groups]
redis = ["redis[hiredis]>=5.2.1"]
dev = ["ruff>=0.9.1", "mypy>=1.14.1"]`;

      const parsed = TOML.parse(content) as Record<string, unknown>;
      const depGroups = parsed['dependency-groups'] as Record<string, string[]>;
      expect(depGroups.redis).toEqual(['redis[hiredis]>=5.2.1']);
      expect(depGroups.dev).toContain('ruff>=0.9.1');
    });

    it('should handle package metadata with extras and markers', () => {
      const content = `
[[package]]
name = "authly"
version = "0.5.8"
dependencies = [
    { name = "redis", extra = ["redis"] },
    { name = "cffi", marker = "platform_python_implementation != 'PyPy'" },
]

[package.metadata]
requires-dist = [
    { name = "redis", extras = ["hiredis"], marker = "extra == 'redis'", specifier = ">=5.2.1" },
]`;

      const parsed = TOML.parse(content) as Record<string, unknown>;
      const packages = parsed.package as Array<Record<string, unknown>>;
      const authly = packages[0];

      // Check dependencies with extra and marker
      const deps = authly?.dependencies as Array<Record<string, unknown>>;
      const redisDep = deps.find((d) => d.name === 'redis');
      expect(redisDep?.extra).toEqual(['redis']);

      const cffiDep = deps.find((d) => d.name === 'cffi');
      expect(cffiDep?.marker).toBe("platform_python_implementation != 'PyPy'");

      // Check metadata
      const metadata = authly?.metadata as Record<string, unknown>;
      const requiresDist = metadata['requires-dist'] as Array<Record<string, unknown>>;
      const redisReq = requiresDist[0];
      expect(redisReq?.extras).toEqual(['hiredis']);
      expect(redisReq?.marker).toBe("extra == 'redis'");
      expect(redisReq?.specifier).toBe('>=5.2.1');
    });
  });
});
