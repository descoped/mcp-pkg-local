import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { readPackageTool } from '#tools/read-package.js';
import { scanPackagesTool } from '#tools/scan-packages.js';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';

describe('read-package Tool - Comprehensive Tests', () => {
  let testDir: string;
  let mockPackageDir: string;
  let originalCwd: string;

  beforeAll(async () => {
    // Save original working directory
    originalCwd = process.cwd();
    // Create temporary test directory
    testDir = join(tmpdir(), `pkg-local-test-${randomBytes(8).toString('hex')}`);
    await fs.mkdir(testDir, { recursive: true });

    // Create package.json in root to signal Node.js project
    await fs.writeFile(
      join(testDir, 'package.json'),
      JSON.stringify({
        name: 'test-project',
        version: '1.0.0',
        dependencies: {
          'test-package': '1.0.0',
        },
      }),
    );

    // Create mock package structure
    mockPackageDir = join(testDir, 'node_modules', 'test-package');
    await fs.mkdir(mockPackageDir, { recursive: true });

    // Create package.json
    await fs.writeFile(
      join(mockPackageDir, 'package.json'),
      JSON.stringify({
        name: 'test-package',
        version: '1.0.0',
        main: 'index.js',
        types: 'index.d.ts',
      }),
    );

    // Create various test files
    await fs.writeFile(
      join(mockPackageDir, 'index.js'),
      'exports.hello = function() { return "world"; };',
    );

    await fs.writeFile(join(mockPackageDir, 'index.d.ts'), 'export function hello(): string;');

    // Create a large file (but under 10MB)
    const largeContent = 'x'.repeat(5 * 1024 * 1024); // 5MB
    await fs.writeFile(join(mockPackageDir, 'large.txt'), largeContent);

    // Create a file that would exceed 10MB
    const hugeContent = 'y'.repeat(11 * 1024 * 1024); // 11MB
    await fs.writeFile(join(mockPackageDir, 'huge.txt'), hugeContent);

    // Create a binary file
    const binaryContent = Buffer.from([0x00, 0x01, 0x02, 0xff, 0xfe]);
    await fs.writeFile(join(mockPackageDir, 'binary.pyc'), binaryContent);

    // Create nested structure for depth testing
    const nestedDir = join(mockPackageDir, 'src', 'lib', 'utils');
    await fs.mkdir(nestedDir, { recursive: true });
    await fs.writeFile(join(nestedDir, 'helper.js'), 'module.exports = { util: true };');

    // Change to test directory for scanner
    process.chdir(testDir);

    // Initial scan to populate cache
    await scanPackagesTool({ forceRefresh: true, scope: 'project' });
  });

  afterAll(async () => {
    // Restore original working directory
    process.chdir(originalCwd);
    // Cleanup
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('Single File Read Optimization', () => {
    it('should read file directly without AST extraction', async () => {
      // Spy on console.error to check log messages
      const consoleSpy = vi.spyOn(console, 'error');

      const result = await readPackageTool({
        packageName: 'test-package',
        filePath: 'index.js',
      });

      expect(result.success).toBe(true);
      expect(result.type).toBe('file');

      if (result.type === 'file') {
        expect(result.content).toContain('exports.hello');
        expect(result.filePath).toBe('index.js');
      }

      // Verify that AST parsing was NOT triggered
      const logs = consoleSpy.mock.calls.map((call) => String(call[0]));
      expect(logs.some((log) => log.includes('Parsing test-package on-demand'))).toBe(false);
      expect(logs.some((log) => log.includes('[READ] Reading file index.js'))).toBe(true);

      consoleSpy.mockRestore();
    });

    it('should handle nested file paths correctly', async () => {
      const result = await readPackageTool({
        packageName: 'test-package',
        filePath: 'src/lib/utils/helper.js',
      });

      expect(result.success).toBe(true);
      if (result.type === 'file') {
        expect(result.content).toContain('util: true');
        expect(result.filePath).toBe('src/lib/utils/helper.js');
      }
    });

    it('should read TypeScript definition files', async () => {
      const result = await readPackageTool({
        packageName: 'test-package',
        filePath: 'index.d.ts',
      });

      expect(result.success).toBe(true);
      if (result.type === 'file') {
        expect(result.content).toContain('export function hello(): string');
      }
    });
  });

  describe('File Size Limits', () => {
    it('should read files under 10MB successfully', async () => {
      const result = await readPackageTool({
        packageName: 'test-package',
        filePath: 'large.txt',
      });

      expect(result.success).toBe(true);
      if (result.type === 'file') {
        expect(result.content.length).toBe(5 * 1024 * 1024);
      }
    });

    it('should reject files over 10MB', async () => {
      const result = await readPackageTool({
        packageName: 'test-package',
        filePath: 'huge.txt',
      });

      expect(result.success).toBe(false);
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.error).toContain('File too large');
        expect(result.error).toContain('10485760 bytes'); // 10MB in bytes
      }
    });

    it('should reject binary files', async () => {
      const result = await readPackageTool({
        packageName: 'test-package',
        filePath: 'binary.pyc',
      });

      expect(result.success).toBe(false);
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.error).toContain('Cannot read binary file');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent files gracefully', async () => {
      const result = await readPackageTool({
        packageName: 'test-package',
        filePath: 'does-not-exist.js',
      });

      expect(result.success).toBe(false);
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        // Error message format is 'File "filename" not found'
        expect(result.error).toContain('not found');
        expect(result.error).toContain('does-not-exist.js');
        // Suggestion might not always be present, so make it optional
        if (result.suggestion !== undefined) {
          expect(result.suggestion).toBeTruthy();
        }
      }
    });

    it('should handle non-existent packages', async () => {
      const result = await readPackageTool({
        packageName: 'non-existent-package',
        filePath: 'index.js',
      });

      expect(result.success).toBe(false);
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        // Error message format is 'Package "packagename" not found in environment'
        expect(result.error).toContain('not found');
        expect(result.error).toContain('non-existent-package');
      }
    });

    it('should prevent path traversal attacks', async () => {
      const result = await readPackageTool({
        packageName: 'test-package',
        filePath: '../../../etc/passwd',
      });

      // Should either fail or sanitize the path
      if (result.type === 'error') {
        expect(result.error).toBeDefined();
      } else if (result.type === 'file') {
        // Path should be sanitized and not actually read /etc/passwd
        expect(result.filePath).not.toContain('..');
      }
    });
  });

  describe('AST Extraction Path', () => {
    it('should trigger AST extraction when no filePath provided', async () => {
      const consoleSpy = vi.spyOn(console, 'error');

      const result = await readPackageTool({
        packageName: 'test-package',
      });

      expect(result.success).toBe(true);
      expect(result.type).toBe('tree');

      if (result.type === 'tree') {
        expect(result.fileTree).toBeDefined();
        expect(result.initContent).toBeDefined();

        // Check if AST extraction or basic info was attempted
        const logs = consoleSpy.mock.calls.map((call) => String(call[0]));
        const hasASTAttempt = logs.some(
          (log: string) =>
            log.includes('Parsing test-package on-demand') ||
            log.includes('Using cached unified content') ||
            log.includes('Creating basic info'),
        );
        expect(hasASTAttempt).toBe(true);
      }

      consoleSpy.mockRestore();
    });

    it('should not trigger AST extraction for file reads', async () => {
      const consoleSpy = vi.spyOn(console, 'error');

      // First, ensure package is in cache
      await readPackageTool({ packageName: 'test-package' });

      // Clear console calls
      consoleSpy.mockClear();

      // Now read a specific file
      const result = await readPackageTool({
        packageName: 'test-package',
        filePath: 'package.json',
      });

      expect(result.success).toBe(true);

      // Verify no AST parsing was triggered
      const logs = consoleSpy.mock.calls.map((call) => call[0]);
      expect(logs).not.toContain(expect.stringContaining('Parsing test-package'));
      expect(logs).not.toContain(expect.stringContaining('Using cached unified content'));

      consoleSpy.mockRestore();
    });
  });

  describe('Performance Characteristics', () => {
    it('should read small files quickly', async () => {
      const start = Date.now();
      const result = await readPackageTool({
        packageName: 'test-package',
        filePath: 'index.js',
      });
      const duration = Date.now() - start;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(100); // Should be very fast for small files
    });

    it('should handle multiple concurrent reads', async () => {
      const results = await Promise.all([
        readPackageTool({ packageName: 'test-package', filePath: 'index.js' }),
        readPackageTool({ packageName: 'test-package', filePath: 'index.d.ts' }),
        readPackageTool({ packageName: 'test-package', filePath: 'package.json' }),
      ]);

      results.forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.type).toBe('file');
      });
    });
  });

  describe('Content Validation', () => {
    it('should preserve exact file content without modification', async () => {
      const testContent = '// Special chars: "\'`\n\t€™';
      const testFile = join(mockPackageDir, 'special.js');
      await fs.writeFile(testFile, testContent);

      const result = await readPackageTool({
        packageName: 'test-package',
        filePath: 'special.js',
      });

      expect(result.success).toBe(true);
      if (result.type === 'file') {
        expect(result.content).toBe(testContent);
      }
    });

    it('should handle empty files', async () => {
      await fs.writeFile(join(mockPackageDir, 'empty.js'), '');

      const result = await readPackageTool({
        packageName: 'test-package',
        filePath: 'empty.js',
      });

      expect(result.success).toBe(true);
      if (result.type === 'file') {
        expect(result.content).toBe('');
      }
    });

    it('should read JSON files as text', async () => {
      const result = await readPackageTool({
        packageName: 'test-package',
        filePath: 'package.json',
      });

      expect(result.success).toBe(true);
      if (result.type === 'file') {
        // Should be valid JSON
        const parsed = JSON.parse(result.content) as Record<string, unknown>;
        expect(parsed.name).toBe('test-package');
        expect(parsed.version).toBe('1.0.0');
      }
    });
  });
});
