import { describe, it, expect, beforeAll } from 'vitest';
import { PythonScanner } from '#scanners/python';
import { scanPackagesTool } from '#tools/scan-packages';
import { readPackageTool } from '#tools/read-package';
import { join } from 'node:path';
import { promises as fs } from 'node:fs';

// Test with the actual authly venv as specified in CLAUDE.md
const AUTHLY_PATH = join(process.cwd(), '..', 'authly');

describe('Authly Virtual Environment Integration', () => {
  beforeAll(async () => {
    // Check if authly venv exists
    const venvPath = join(AUTHLY_PATH, '.venv');
    try {
      await fs.access(venvPath);
    } catch {
      console.warn('Authly venv not found, skipping integration tests');
      return;
    }
  });

  describe('PythonScanner', () => {
    it('should detect authly virtual environment', async () => {
      const scanner = new PythonScanner(AUTHLY_PATH);
      const result = await scanner.scan();

      expect(result.success).toBe(true);
      expect(result.environment.type).toBe('.venv');
      expect(result.environment.pythonVersion).toMatch(/3\.11\.\d+/);
      expect(Object.keys(result.packages).length).toBeGreaterThan(0);
    });

    it('should find common Python packages', async () => {
      const scanner = new PythonScanner(AUTHLY_PATH);
      const result = await scanner.scan();

      // Check for some common packages that might be in authly
      const packageNames = Object.keys(result.packages);
      console.log('Found packages:', packageNames.slice(0, 10).join(', '), '...');

      expect(packageNames.length).toBeGreaterThan(0);
    });
  });

  describe('scan-packages tool', () => {
    it('should scan authly packages successfully', async () => {
      // Change to authly directory for this test
      const originalCwd = process.cwd();
      process.chdir(AUTHLY_PATH);

      try {
        const result = await scanPackagesTool({ forceRefresh: true });

        expect(result.success).toBe(true);
        expect(result.environment.pythonVersion).toMatch(/3\.11\.\d+/);
        expect(Object.keys(result.packages).length).toBeGreaterThan(0);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('read-package tool', () => {
    it('should read package file tree', async () => {
      const originalCwd = process.cwd();
      process.chdir(AUTHLY_PATH);

      try {
        // First scan to populate cache
        await scanPackagesTool({ forceRefresh: true });

        // Try to read a common package (we'll check what's available first)
        const scanResult = await scanPackagesTool({ forceRefresh: false });
        const firstPackage = Object.keys(scanResult.packages)[0];

        if (firstPackage) {
          const result = await readPackageTool({
            packageName: firstPackage,
          });

          expect(result.success).toBe(true);
          if (result.type === 'tree') {
            expect(result.package).toBe(firstPackage);
            expect(Array.isArray(result.fileTree)).toBe(true);
          }
        }
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should read specific file from package', async () => {
      const originalCwd = process.cwd();
      process.chdir(AUTHLY_PATH);

      try {
        // First scan to populate cache
        await scanPackagesTool({ forceRefresh: true });

        // Try to read __init__.py from first package that has it
        const scanResult = await scanPackagesTool({ forceRefresh: false });

        for (const packageName of Object.keys(scanResult.packages)) {
          const treeResult = await readPackageTool({ packageName });

          if (treeResult.type === 'tree' && treeResult.fileTree.includes('__init__.py')) {
            const fileResult = await readPackageTool({
              packageName,
              filePath: '__init__.py',
            });

            expect(fileResult.success).toBe(true);
            if (fileResult.type === 'file') {
              expect(fileResult.content).toBeDefined();
              expect(typeof fileResult.content).toBe('string');
            }
            break;
          }
        }
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});
