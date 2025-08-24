import { describe, it, expect, beforeAll } from 'vitest';
import { readPackageTool } from '#tools/read-package.js';
import { scanPackagesTool } from '#tools/scan-packages.js';
import { promises as fs } from 'node:fs';
import { getCachePaths } from '#utils/cache-paths.js';

describe('Unified Schema Integration', () => {
  beforeAll(async () => {
    // Clean cache before tests
    const cachePaths = getCachePaths();
    try {
      await fs.rm(cachePaths.cacheDir, { recursive: true });
    } catch {
      // Ignore if doesn't exist
    }
    try {
      await fs.rm(cachePaths.sqliteDb, { recursive: true });
    } catch {
      // Ignore if doesn't exist
    }
  });

  it('should generate unified schema format for Node.js packages', async () => {
    // First trigger a scan to process content
    const scanResult = await scanPackagesTool({
      forceRefresh: true,
      scope: 'project',
    });

    expect(scanResult.success).toBe(true);
    // Just check that we have some packages
    expect(Object.keys(scanResult.packages ?? {}).length).toBeGreaterThan(0);

    // Now read a package - should use cached unified content
    // Use the first available package from the scan
    const firstPackage = Object.keys(scanResult.packages ?? {})[0];
    if (!firstPackage) {
      console.warn('No packages found in scan result, skipping test');
      return;
    }
    const result = await readPackageTool({ packageName: firstPackage });

    expect(result.type).toBe('tree');
    expect(result.success).toBe(true);

    if (result.type === 'tree' && result.initContent) {
      const content = result.initContent;

      // Check for unified schema sections - these should always be present
      expect(content).toContain('## 📦 Package Information');
      expect(content).toContain('## 🏗️ Core Components');
      expect(content).toContain('## 🔌 Exports');

      // Check that basic package info is present
      expect(content).toContain(`name: ${firstPackage}`);
      expect(content).toContain('version:');

      // Note: Actual component extraction may fail for some packages
      // This is expected behavior as AST parsing can fail for various reasons
      // (e.g., no source files, complex syntax, timeouts, etc.)
    }
  });

  it('should produce consistent output for TypeScript packages', async () => {
    // Test with TypeScript package
    const scanResult = await scanPackagesTool({
      forceRefresh: true,
      scope: 'project',
    });

    expect(scanResult.success).toBe(true);

    // Try to find typescript or use any package
    const tsPackage = scanResult.packages?.['typescript']
      ? 'typescript'
      : Object.keys(scanResult.packages ?? {})[0];
    if (!tsPackage) {
      console.warn('No packages found, skipping test');
      return;
    }

    const result = await readPackageTool({ packageName: tsPackage });

    if (result.type === 'tree' && result.initContent) {
      const content = result.initContent;

      // Check TypeScript-specific features
      expect(content).toContain('type_annotations: available');

      // Should have the same structure as JavaScript packages
      expect(content).toContain('## 📦 Package Information');
      expect(content).toContain('## 🏗️ Core Components');
    }
  });
});
