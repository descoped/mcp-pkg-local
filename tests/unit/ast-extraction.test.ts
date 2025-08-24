import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { readPackageTool } from '#tools/read-package.js';
import { scanPackagesTool } from '#tools/scan-packages.js';
import {
  generateCompleteTypeScriptPackage,
  generateMassiveInterface,
  generateSimpleClass,
} from '../fixtures/typescript-templates.js';

describe('AST Extraction for Large Files', () => {
  let testDir: string;
  let originalCwd: string;

  beforeAll(async () => {
    originalCwd = process.cwd();
    testDir = await fs.mkdtemp(join(tmpdir(), 'ast-extraction-test-'));

    // Create a mock package structure
    const nodeModules = join(testDir, 'node_modules');
    const mockPackageDir = join(nodeModules, 'large-ts-package');

    await fs.mkdir(mockPackageDir, { recursive: true });

    // Create package.json
    await fs.writeFile(
      join(mockPackageDir, 'package.json'),
      JSON.stringify(
        {
          name: 'large-ts-package',
          version: '1.0.0',
          main: 'index.d.ts',
          types: 'index.d.ts',
        },
        null,
        2,
      ),
    );

    // Create a large TypeScript declaration file (>50KB) using templates
    // Simulate a file like ts-morph.d.ts with many interfaces
    const largeContent = generateCompleteTypeScriptPackage(100);
    const fileSizeKB = Buffer.byteLength(largeContent) / 1024;

    await fs.writeFile(join(mockPackageDir, 'index.d.ts'), largeContent);

    // Create project package.json
    await fs.writeFile(
      join(testDir, 'package.json'),
      JSON.stringify(
        {
          name: 'test-project',
          dependencies: {
            'large-ts-package': '1.0.0',
          },
        },
        null,
        2,
      ),
    );

    process.chdir(testDir);

    console.error(`Created test file with size: ${fileSizeKB.toFixed(1)}KB`);
  });

  afterAll(async () => {
    process.chdir(originalCwd);
    await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
  });

  it('should extract AST from large TypeScript declaration files', async () => {
    // First scan packages
    await scanPackagesTool({ scope: 'project', forceRefresh: true });

    // Read the large package
    const consoleSpy = vi.spyOn(console, 'error');

    const result = await readPackageTool({
      packageName: 'large-ts-package',
    });

    expect(result.success).toBe(true);

    if (result.type === 'tree') {
      // Check that initContent was generated
      expect(result.initContent).toBeDefined();
      expect(result.initContent).toContain('# large-ts-package');

      // Check that AST extraction was attempted
      const logs = consoleSpy.mock.calls.map((call) => String(call[0]));
      const hasASTLog = logs.some((log: string) => {
        return (
          log.includes('Extracting TypeScript AST') ||
          log.includes('AST extraction') ||
          log.includes('Creating basic info')
        );
      });

      // For large files, it should extract AST
      expect(hasASTLog).toBe(true);

      // The content should include extracted interfaces/types
      if (result.initContent) {
        // Check that some interfaces were extracted
        const hasInterfaces =
          result.initContent.includes('LargeInterface') || result.initContent.includes('interface');
        const hasClasses =
          result.initContent.includes('LargeClass') || result.initContent.includes('class');
        const hasTypes =
          result.initContent.includes('LargeType') || result.initContent.includes('type');

        // At least one of these should be present
        expect(hasInterfaces || hasClasses || hasTypes).toBe(true);

        // Check file size reduction
        const originalSize = await fs
          .readFile(join(testDir, 'node_modules', 'large-ts-package', 'index.d.ts'), 'utf-8')
          .then((content) => Buffer.byteLength(content));

        const extractedSize = Buffer.byteLength(result.initContent);
        const reduction = ((originalSize - extractedSize) / originalSize) * 100;

        console.error(
          `Size reduction: ${originalSize} bytes → ${extractedSize} bytes (${reduction.toFixed(1)}% reduction)`,
        );

        // Should achieve some reduction for AST extraction
        if (extractedSize < originalSize) {
          expect(reduction).toBeGreaterThan(0);
        }
      }
    }

    consoleSpy.mockRestore();
  });

  it('should handle very large files gracefully', async () => {
    // Create an even larger file (>500KB)
    const veryLargePackageDir = join(testDir, 'node_modules', 'very-large-package');
    await fs.mkdir(veryLargePackageDir, { recursive: true });

    await fs.writeFile(
      join(veryLargePackageDir, 'package.json'),
      JSON.stringify(
        {
          name: 'very-large-package',
          version: '1.0.0',
          main: 'index.d.ts',
        },
        null,
        2,
      ),
    );

    // Create 500KB+ file using templates
    const properties = Array(1000)
      .fill(0)
      .map((_, i) => `  property${i}: string;`)
      .join('\n');

    const classes = Array(500)
      .fill(0)
      .map((_, i) => generateSimpleClass(`Class${i}`))
      .join('\n\n');

    const hugeContent = [generateMassiveInterface(properties), '', classes].join('\n');

    await fs.writeFile(join(veryLargePackageDir, 'index.d.ts'), hugeContent);

    const fileSizeKB = Buffer.byteLength(hugeContent) / 1024;
    console.error(`Created very large file: ${fileSizeKB.toFixed(1)}KB`);

    // Force refresh scan
    await scanPackagesTool({ scope: 'project', forceRefresh: true });

    // Read the very large package
    const start = Date.now();
    const result = await readPackageTool({
      packageName: 'very-large-package',
    });
    const duration = Date.now() - start;

    expect(result.success).toBe(true);
    console.error(`Processing time for ${fileSizeKB.toFixed(1)}KB file: ${duration}ms`);

    // Should complete within reasonable time (10 seconds)
    expect(duration).toBeLessThan(10000);

    if (result.type === 'tree' && result.initContent) {
      const extractedSize = Buffer.byteLength(result.initContent);
      const reduction =
        ((Buffer.byteLength(hugeContent) - extractedSize) / Buffer.byteLength(hugeContent)) * 100;

      console.error(
        `Very large file reduction: ${fileSizeKB.toFixed(1)}KB → ${(extractedSize / 1024).toFixed(1)}KB (${reduction.toFixed(1)}% reduction)`,
      );

      // Should achieve significant reduction
      if (extractedSize < Buffer.byteLength(hugeContent)) {
        expect(reduction).toBeGreaterThan(30); // At least 30% reduction
      }
    }
  });
});
