import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PythonScanner } from '#scanners/python';
import { scanPackagesTool } from '#tools/scan-packages';
import { readPackageTool } from '#tools/read-package';
import { join } from 'node:path';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';

// Create a mock Python environment that simulates authly structure
async function createMockPythonEnvironment(): Promise<string> {
  const testDir = join(tmpdir(), `mcp-test-python-${Date.now()}`);
  await fs.mkdir(testDir, { recursive: true });

  // Create venv structure
  const venvPath = join(testDir, '.venv');
  const sitePackagesPath = join(venvPath, 'lib', 'python3.11', 'site-packages');
  await fs.mkdir(sitePackagesPath, { recursive: true });

  // Create bin/python for environment detection
  const binPath = join(venvPath, 'bin');
  await fs.mkdir(binPath, { recursive: true });
  await fs.writeFile(join(binPath, 'python'), '#!/usr/bin/env python3', { mode: 0o755 });

  // Create mock packages similar to what authly might have
  const mockPackages = [
    {
      name: 'requests',
      version: '2.31.0',
      files: {
        '__init__.py': '"""Requests HTTP Library"""\\n__version__ = "2.31.0"',
        'api.py': 'def get(url, **kwargs): pass',
        'models.py': 'class Response: pass'
      }
    },
    {
      name: 'flask',
      version: '3.0.0',
      files: {
        '__init__.py': 'from .app import Flask\\n__version__ = "3.0.0"',
        'app.py': 'class Flask: pass',
        'blueprints.py': 'class Blueprint: pass'
      }
    },
    {
      name: 'sqlalchemy',
      version: '2.0.23',
      files: {
        '__init__.py': '"""SQLAlchemy ORM"""\\n__version__ = "2.0.23"',
        'orm/__init__.py': 'from .session import Session',
        'orm/session.py': 'class Session: pass'
      }
    },
    {
      name: 'pydantic',
      version: '2.5.0',
      files: {
        '__init__.py': '"""Data validation using Python type annotations"""',
        'main.py': 'class BaseModel: pass'
      }
    }
  ];

  // Create package directories and dist-info
  for (const pkg of mockPackages) {
    // Create package directory
    const pkgPath = join(sitePackagesPath, pkg.name);
    await fs.mkdir(pkgPath, { recursive: true });

    // Create package files
    for (const [filePath, content] of Object.entries(pkg.files)) {
      const fullPath = join(pkgPath, filePath);
      await fs.mkdir(join(fullPath, '..'), { recursive: true });
      await fs.writeFile(fullPath, content);
    }

    // Create dist-info directory
    const distInfoPath = join(sitePackagesPath, `${pkg.name}-${pkg.version}.dist-info`);
    await fs.mkdir(distInfoPath, { recursive: true });

    // Create METADATA file
    const metadata = `Metadata-Version: 2.1
Name: ${pkg.name}
Version: ${pkg.version}
Summary: Mock package for testing
Author: Test Author
License: MIT
`;
    await fs.writeFile(join(distInfoPath, 'METADATA'), metadata);
  }

  // Create project files to help with detection
  await fs.writeFile(join(testDir, 'requirements.txt'), 'requests==2.31.0\\nflask==3.0.0\\nsqlalchemy==2.0.23\\npydantic==2.5.0');
  
  return testDir;
}

describe('Python Virtual Environment Integration (Mock)', () => {
  let testDir: string;

  beforeAll(async () => {
    testDir = await createMockPythonEnvironment();
  });

  afterAll(async () => {
    // Clean up test directory
    if (testDir) {
      await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
    }
  });

  describe('PythonScanner', () => {
    it('should detect mock virtual environment', async () => {
      const scanner = new PythonScanner(testDir);
      const result = await scanner.scan();

      expect(result.success).toBe(true);
      expect(result.environment.type).toBe('.venv');
      expect(result.environment.path).toContain('.venv');
      expect(Object.keys(result.packages).length).toBe(4);
    });

    it('should find all mock Python packages with correct versions', async () => {
      const scanner = new PythonScanner(testDir);
      const result = await scanner.scan();

      const packageNames = Object.keys(result.packages);
      expect(packageNames).toContain('requests');
      expect(packageNames).toContain('flask');
      expect(packageNames).toContain('sqlalchemy');
      expect(packageNames).toContain('pydantic');

      expect(result.packages['requests']?.version).toBe('2.31.0');
      expect(result.packages['flask']?.version).toBe('3.0.0');
      expect(result.packages['sqlalchemy']?.version).toBe('2.0.23');
      expect(result.packages['pydantic']?.version).toBe('2.5.0');
    });

    it('should correctly identify package locations', async () => {
      const scanner = new PythonScanner(testDir);
      const result = await scanner.scan();

      for (const [name, info] of Object.entries(result.packages)) {
        expect(info.location).toContain(name);
        expect(info.language).toBe('python');
      }
    });
  });

  describe('scan-packages tool', () => {
    it('should scan mock packages successfully', async () => {
      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        const result = await scanPackagesTool({ forceRefresh: true });

        expect(result.success).toBe(true);
        expect(result.environment.type).toBe('.venv');
        expect(Object.keys(result.packages).length).toBe(4);
        
        // Verify all expected packages are present
        expect(result.packages).toHaveProperty('requests');
        expect(result.packages).toHaveProperty('flask');
        expect(result.packages).toHaveProperty('sqlalchemy');
        expect(result.packages).toHaveProperty('pydantic');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should use cache on subsequent calls', async () => {
      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        // First call with forceRefresh
        const result1 = await scanPackagesTool({ forceRefresh: true });
        expect(result1.success).toBe(true);

        // Second call without forceRefresh should use cache
        const result2 = await scanPackagesTool({ forceRefresh: false });
        expect(result2.success).toBe(true);
        expect(result2.packages).toEqual(result1.packages);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('read-package tool', () => {
    it('should read package file tree', async () => {
      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        // First scan to populate cache
        await scanPackagesTool({ forceRefresh: true });

        // Read the requests package tree
        const result = await readPackageTool({
          packageName: 'requests',
          includeTree: true,
        });

        expect(result.success).toBe(true);
        if (result.type === 'tree') {
          expect(result.package).toBe('requests');
          expect(result.fileTree).toContain('__init__.py');
          expect(result.fileTree).toContain('api.py');
          expect(result.fileTree).toContain('models.py');
        }
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should read specific file from package', async () => {
      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        // First scan to populate cache
        await scanPackagesTool({ forceRefresh: true });

        // Read __init__.py from flask package
        const fileResult = await readPackageTool({
          packageName: 'flask',
          filePath: '__init__.py',
        });

        expect(fileResult.success).toBe(true);
        if (fileResult.type === 'file') {
          expect(fileResult.content).toContain('Flask');
          expect(fileResult.content).toContain('3.0.0');
        }
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle nested package files', async () => {
      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        await scanPackagesTool({ forceRefresh: true });

        // Read nested file from sqlalchemy
        const treeResult = await readPackageTool({
          packageName: 'sqlalchemy',
          includeTree: true,
        });

        if (treeResult.type === 'tree') {
          expect(treeResult.fileTree).toContain('orm/__init__.py');
          expect(treeResult.fileTree).toContain('orm/session.py');
        }

        // Read the nested session.py file
        const fileResult = await readPackageTool({
          packageName: 'sqlalchemy',
          filePath: 'orm/session.py',
        });

        if (fileResult.type === 'file') {
          expect(fileResult.content).toContain('class Session');
        }
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should return error for non-existent package', async () => {
      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        await scanPackagesTool({ forceRefresh: true });

        const result = await readPackageTool({
          packageName: 'non-existent-package',
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('not found');
        }
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should return error for non-existent file', async () => {
      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        await scanPackagesTool({ forceRefresh: true });

        const result = await readPackageTool({
          packageName: 'requests',
          filePath: 'non-existent.py',
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('not found');
        }
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});