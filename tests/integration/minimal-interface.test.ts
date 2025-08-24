import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { scanPackagesTool } from '#tools/scan-packages.js';
import { readPackageTool } from '#tools/read-package.js';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('Minimal Interface Tests', () => {
  let testDir: string;
  let originalCwd: string;

  beforeAll(async () => {
    // Create a test directory with a simple Node.js project
    testDir = await fs.mkdtemp(join(tmpdir(), 'minimal-interface-test-'));
    originalCwd = process.cwd();

    // Create a minimal package.json
    await fs.writeFile(
      join(testDir, 'package.json'),
      JSON.stringify(
        {
          name: 'test-project',
          version: '1.0.0',
          dependencies: {
            lodash: '^4.17.21',
          },
          devDependencies: {
            vitest: '^3.0.0',
          },
        },
        null,
        2,
      ),
    );

    // Create minimal node_modules structure
    const nodeModules = join(testDir, 'node_modules');
    await fs.mkdir(nodeModules, { recursive: true });

    // Create lodash package
    const lodashDir = join(nodeModules, 'lodash');
    await fs.mkdir(lodashDir, { recursive: true });
    await fs.writeFile(
      join(lodashDir, 'package.json'),
      JSON.stringify(
        {
          name: 'lodash',
          version: '4.17.21',
          main: 'index.js',
        },
        null,
        2,
      ),
    );
    await fs.writeFile(
      join(lodashDir, 'index.js'),
      'module.exports = { debounce: function() {} };',
    );

    // Create vitest package
    const vitestDir = join(nodeModules, 'vitest');
    await fs.mkdir(vitestDir, { recursive: true });
    await fs.writeFile(
      join(vitestDir, 'package.json'),
      JSON.stringify(
        {
          name: 'vitest',
          version: '3.0.0',
          main: 'dist/index.js',
        },
        null,
        2,
      ),
    );

    // Change to test directory
    process.chdir(testDir);
  });

  afterAll(async () => {
    // Restore original directory
    process.chdir(originalCwd);

    // Clean up test directory
    if (testDir) {
      await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
    }
  });

  describe('scan-packages minimal interface', () => {
    it('should return summary when scope is "all"', async () => {
      const result = await scanPackagesTool({ scope: 'all' });

      console.error('Result:', JSON.stringify(result, null, 2));
      expect(result.success).toBe(true);
      expect(result.type).toBe('summary');

      if (result.type === 'summary') {
        expect(result.totalPackages).toBeGreaterThan(0);
        expect(result.categories).toBeDefined();
        expect(result.packages).toBeUndefined(); // No package list in summary
      }
    });

    it('should return project dependencies when scope is "project"', async () => {
      const result = await scanPackagesTool({ scope: 'project' });

      expect(result.success).toBe(true);
      expect(result.type).toBe('packages');

      if (result.type === 'packages') {
        const packageNames = Object.keys(result.packages ?? {});
        expect(packageNames).toContain('lodash');
        expect(packageNames).toContain('vitest');
        expect(packageNames.length).toBeLessThanOrEqual(10); // Limited set
      }
    });
  });

  describe('read-package minimal interface', () => {
    it('should return comprehensive package info with just packageName', async () => {
      // First scan to populate cache
      await scanPackagesTool({ scope: 'project' });

      const result = await readPackageTool({ packageName: 'lodash' });

      expect(result.success).toBe(true);
      expect(result.type).toBe('tree');

      if (result.type === 'tree') {
        expect(result.package).toBe('lodash');
        expect(result.version).toBe('4.17.21');
        expect(result.fileTree).toBeDefined();
        expect(result.mainFiles).toContain('package.json');
        expect(result.initContent).toBeDefined(); // Unified content
      }
    });

    it('should handle non-existent package gracefully', async () => {
      const result = await readPackageTool({ packageName: 'non-existent-package' });

      expect(result.success).toBe(false);
      expect(result.type).toBe('error');

      if (result.type === 'error') {
        expect(result.error).toContain('not found');
        expect(result.error).toContain('non-existent-package');
      }
    });
  });

  describe('Backward compatibility', () => {
    it('should handle old scan-packages call without scope', async () => {
      // Old way without scope parameter
      const result = await scanPackagesTool({});

      // Should default to 'all' scope and return summary
      expect(result.success).toBe(true);
      expect(result.type).toBe('summary');
    });

    it('should handle forceRefresh parameter', async () => {
      // This parameter is still supported
      const result = await scanPackagesTool({
        scope: 'project',
        forceRefresh: true,
      });

      expect(result.success).toBe(true);
      expect(result.type).toBe('packages');
    });
  });
});
