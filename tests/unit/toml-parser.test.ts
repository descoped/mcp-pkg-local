import { describe, it, expect } from 'vitest';
import * as TOML from 'smol-toml';

describe('TOML Parser', () => {
  describe('UV Lock File Parsing', () => {
    it('should parse a basic UV lock file', () => {
      const uvLockContent = `version = 1
requires-python = ">=3.9"

[[package]]
name = "requests"
version = "2.31.0"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "certifi" },
    { name = "charset-normalizer" },
    { name = "idna" },
    { name = "urllib3" },
]
sdist = { url = "https://files.pythonhosted.org/packages/requests-2.31.0.tar.gz", hash = "sha256:942c5a758f98d790eaed1a29cb6eefc7ffb0d1cf7af05c3d2791656dbd6ad1e1" }
wheels = [
    { url = "https://files.pythonhosted.org/packages/requests-2.31.0-py3-none-any.whl", hash = "sha256:58cd2187c01e70e6e26505bca751777aa9f2ee0b7f4300988b709f44e013003f" },
]

[[package]]
name = "certifi"
version = "2023.7.22"
source = { registry = "https://pypi.org/simple" }`;

      const parsed = TOML.parse(uvLockContent) as Record<string, unknown>;

      expect(parsed.version).toBe(1);
      expect(parsed['requires-python']).toBe('>=3.9');
      expect(Array.isArray(parsed.package)).toBe(true);

      const packages = parsed.package as Array<Record<string, unknown>>;
      expect(packages).toHaveLength(2);

      const requests = packages[0];
      expect(requests).toBeDefined();
      expect(requests?.name).toBe('requests');
      expect(requests?.version).toBe('2.31.0');
      expect(Array.isArray(requests?.dependencies)).toBe(true);

      const deps = requests?.dependencies as Array<Record<string, unknown>>;
      expect(deps).toHaveLength(4);
      expect(deps[0]).toEqual({ name: 'certifi' });
    });

    it('should handle complex nested structures', () => {
      const complexToml = `
[tool.uv]
dev-dependencies = [
    "pytest>=7.0.0",
    "black>=23.0.0",
    "mypy>=1.0.0",
]

[tool.uv.sources]
authly = { path = "../authly", editable = true }

[[package]]
name = "authly"
version = "0.1.0"
source = { editable = "../authly" }
dependencies = [
    { name = "httpx", marker = "python_version >= '3.9'" },
]

[package.metadata]
requires-dist = [
    { name = "httpx", specifier = ">=0.24.0" },
]`;

      const parsed = TOML.parse(complexToml) as Record<string, unknown>;

      // Check tool.uv section
      const tool = parsed.tool as Record<string, unknown>;
      expect(tool).toBeDefined();
      const uv = tool.uv as Record<string, unknown>;
      expect(uv).toBeDefined();
      expect(Array.isArray(uv['dev-dependencies'])).toBe(true);

      const devDeps = uv['dev-dependencies'] as string[];
      expect(devDeps).toContain('pytest>=7.0.0');

      // Check sources
      const sources = uv.sources as Record<string, unknown>;
      expect(sources).toBeDefined();
      const authly = sources.authly as Record<string, unknown>;
      expect(authly.path).toBe('../authly');
      expect(authly.editable).toBe(true);

      // Check package array
      const packages = parsed.package as Array<Record<string, unknown>>;
      expect(packages).toHaveLength(1);
      expect(packages[0]?.name).toBe('authly');
    });

    it('should handle pyproject.toml files', () => {
      const pyprojectContent = `
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "my-package"
version = "0.1.0"
description = "A test package"
dependencies = [
    "requests>=2.28.0",
    "pydantic>=2.0.0",
    "typing-extensions>=4.0.0; python_version < '3.11'",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "black>=23.0.0",
]
test = [
    "pytest-cov>=4.0.0",
    "pytest-mock>=3.0.0",
]

[tool.uv]
dev-dependencies = [
    "ruff>=0.1.0",
    "mypy>=1.0.0",
]`;

      const parsed = TOML.parse(pyprojectContent) as Record<string, unknown>;

      // Check project section
      const project = parsed.project as Record<string, unknown>;
      expect(project.name).toBe('my-package');
      expect(project.version).toBe('0.1.0');
      expect(Array.isArray(project.dependencies)).toBe(true);

      const deps = project.dependencies as string[];
      expect(deps).toHaveLength(3);
      expect(deps).toContain('requests>=2.28.0');

      // Check optional dependencies
      const optionalDeps = project['optional-dependencies'] as Record<string, string[]>;
      expect(optionalDeps.dev).toContain('pytest>=7.0.0');
      expect(optionalDeps.test).toContain('pytest-cov>=4.0.0');

      // Check tool.uv section
      const tool = parsed.tool as Record<string, unknown>;
      const uv = tool.uv as Record<string, unknown>;
      const uvDevDeps = uv['dev-dependencies'] as string[];
      expect(uvDevDeps).toContain('ruff>=0.1.0');
    });

    it('should handle edge cases gracefully', () => {
      // Empty TOML
      const emptyParsed = TOML.parse('') as Record<string, unknown>;
      expect(Object.keys(emptyParsed)).toHaveLength(0);

      // Invalid TOML should throw
      expect(() => TOML.parse('invalid = [')).toThrow();

      // Unicode and special characters
      const unicodeToml = `
name = "测试包"
description = "A package with émojis 🚀"
path = "C:\\\\Users\\\\test\\\\project"`;

      const unicodeParsed = TOML.parse(unicodeToml) as Record<string, unknown>;
      expect(unicodeParsed.name).toBe('测试包');
      expect(unicodeParsed.description).toBe('A package with émojis 🚀');
      expect(unicodeParsed.path).toBe('C:\\Users\\test\\project');
    });

    it('should parse arrays of tables correctly', () => {
      const arrayTableToml = `
[[package]]
name = "package-a"
version = "1.0.0"

[[package]]
name = "package-b"
version = "2.0.0"
dependencies = [
    { name = "package-a", version = "^1.0.0" },
]

[[package]]
name = "package-c"
version = "3.0.0"`;

      const parsed = TOML.parse(arrayTableToml) as Record<string, unknown>;
      const packages = parsed.package as Array<Record<string, unknown>>;

      expect(packages).toHaveLength(3);
      expect(packages[0]?.name).toBe('package-a');
      expect(packages[1]?.name).toBe('package-b');
      expect(packages[2]?.name).toBe('package-c');

      const packageB = packages[1];
      const deps = packageB?.dependencies as Array<Record<string, unknown>>;
      expect(deps).toHaveLength(1);
      expect(deps[0]?.name).toBe('package-a');
      expect(deps[0]?.version).toBe('^1.0.0');
    });

    it('should handle inline tables and arrays', () => {
      const inlineToml = [
        'package = { name = "inline-package", version = "1.0.0" }',
        'authors = ["John Doe <john@example.com>", "Jane Smith <jane@example.com>"]',
        'metadata = { python = ">=3.9", platform = ["linux", "darwin", "win32"] }',
      ].join('\n');

      const parsed = TOML.parse(inlineToml) as Record<string, unknown>;

      const pkg = parsed.package as Record<string, unknown>;
      expect(pkg.name).toBe('inline-package');
      expect(pkg.version).toBe('1.0.0');

      const authors = parsed.authors as string[];
      expect(authors).toHaveLength(2);
      expect(authors[0]).toBe('John Doe <john@example.com>');

      const metadata = parsed.metadata as Record<string, unknown>;
      expect(metadata.python).toBe('>=3.9');
      const platforms = metadata.platform as string[];
      expect(platforms).toEqual(['linux', 'darwin', 'win32']);
    });

    it('should preserve data types correctly', () => {
      const typestoml = `
string = "hello"
integer = 42
float = 3.14
boolean = true
datetime = 2024-01-15T10:30:00Z
array = [1, 2, 3]
mixed = ["string", 123, true]`;

      const parsed = TOML.parse(typestoml) as Record<string, unknown>;

      expect(typeof parsed.string).toBe('string');
      expect(parsed.string).toBe('hello');

      expect(typeof parsed.integer).toBe('number');
      expect(parsed.integer).toBe(42);

      expect(typeof parsed.float).toBe('number');
      expect(parsed.float).toBe(3.14);

      expect(typeof parsed.boolean).toBe('boolean');
      expect(parsed.boolean).toBe(true);

      expect(parsed.datetime).toBeInstanceOf(Date);

      const array = parsed.array as number[];
      expect(array).toEqual([1, 2, 3]);

      const mixed = parsed.mixed as unknown[];
      expect(mixed).toEqual(['string', 123, true]);
    });
  });
});
