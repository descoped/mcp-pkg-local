import { describe, it, expect, beforeAll } from 'vitest';
import { NodeJSScanner } from '#scanners/nodejs';
import { scanPackagesTool } from '#tools/scan-packages';
import { readPackageTool } from '#tools/read-package';
import { join } from 'node:path';
import { promises as fs } from 'node:fs';

describe('Node.js Environment Integration', () => {
  const projectRoot = process.cwd(); // Use current project as test subject

  describe('NodeJSScanner', () => {
    let scanner: NodeJSScanner;

    beforeAll(() => {
      scanner = new NodeJSScanner(projectRoot);
    });

    it('should detect Node.js project', async () => {
      const result = await scanner.scan();

      expect(result.success).toBe(true);
      expect(result.environment.type).toMatch(/npm|pnpm|yarn/);
      expect(result.environment.nodeVersion).toBeTruthy();
      expect(result.environment.nodeVersion).toContain('v');
    });

    it('should find common Node.js packages', async () => {
      const result = await scanner.scan();
      const packageNames = Object.keys(result.packages);

      // eslint-disable-next-line no-console
      console.log(`Found packages: ${packageNames.slice(0, 10).join(', ')} ...`);

      // We should have many packages
      expect(packageNames.length).toBeGreaterThan(50);

      // Check for common packages we know exist in our dev dependencies
      const hasTypeScript = packageNames.some((name) => name.includes('typescript'));
      const hasVitest = packageNames.some((name) => name.includes('vitest'));
      const hasEslint = packageNames.some((name) => name.includes('eslint'));

      expect(hasTypeScript).toBe(true);
      expect(hasVitest).toBe(true);
      expect(hasEslint).toBe(true);
    });

    it('should handle scoped packages', async () => {
      const result = await scanner.scan();
      const packageNames = Object.keys(result.packages);

      // Check for scoped packages
      const scopedPackages = packageNames.filter((name) => name.startsWith('@'));
      expect(scopedPackages.length).toBeGreaterThan(0);

      // Verify a specific scoped package we know exists
      const hasMCPPackage = scopedPackages.some((name) =>
        name.includes('@modelcontextprotocol/sdk'),
      );
      expect(hasMCPPackage).toBe(true);
    });

    it('should get package location and version', async () => {
      // Test with a known package
      const location = await scanner.getPackageLocation('typescript');
      expect(location).toBeTruthy();
      expect(location).toContain('node_modules');
      expect(location).toContain('typescript');

      const version = await scanner.getPackageVersion('typescript');
      expect(version).toBeTruthy();
      expect(version).toMatch(/^\d+\.\d+\.\d+/); // Semantic version
    });

    it('should detect main entry file', async () => {
      const mainFile = await scanner.getPackageMainFile('typescript');
      expect(mainFile).toBeTruthy();

      // TypeScript's main file should exist
      const location = await scanner.getPackageLocation('typescript');
      if (location && mainFile) {
        const mainPath = join(location, mainFile);
        const exists = await fs
          .access(mainPath)
          .then(() => true)
          .catch(() => false);
        expect(exists).toBe(true);
      }
    });
  });

  describe('scan-packages tool', () => {
    it('should scan Node.js packages successfully', async () => {
      const result = await scanPackagesTool({ forceRefresh: true, limit: 500 }); // Use higher limit for testing

      expect(result.success).toBe(true);
      expect(result.environment.type).toMatch(/npm|pnpm|yarn/);
      expect(result.environment.nodeVersion).toBeTruthy();

      const packageCount = Object.keys(result.packages).length;
      expect(packageCount).toBeGreaterThan(50);

      // Verify package structure
      const firstPackage = Object.values(result.packages)[0];
      expect(firstPackage).toHaveProperty('name');
      expect(firstPackage).toHaveProperty('version');
      expect(firstPackage).toHaveProperty('location');
      expect(firstPackage).toHaveProperty('language', 'javascript');
    });
  });

  describe('read-package tool', () => {
    it('should read package file tree', async () => {
      // First scan to ensure cache with higher limit to include the test package
      const scanResult = await scanPackagesTool({ forceRefresh: true, limit: 500 });
      
      // Get the first available package from scan
      const packageName = Object.keys(scanResult.packages)[0];
      if (!packageName) {
        console.warn('No packages found in scan, skipping test');
        return;
      }

      // Read the package
      const result = await readPackageTool({ packageName });

      expect(result.success).toBe(true);
      if (result.type === 'tree') {
        expect(result.package).toBe(packageName);
        expect(result.version).toBeTruthy();
        expect(result.fileTree).toBeDefined();
        expect(Array.isArray(result.fileTree)).toBe(true);

        // Should have package.json as init content for Node packages
        expect(result.initContent).toBeTruthy();
        if (result.initContent) {
          const parsed = JSON.parse(result.initContent) as { name: string };
          expect(parsed.name).toBe(packageName);
        }
      }
    });

    it('should read specific file from package', async () => {
      // First scan to ensure cache with higher limit to include the test package
      const scanResult = await scanPackagesTool({ forceRefresh: true, limit: 500 });

      // Get a package that likely has package.json
      const packageName = Object.keys(scanResult.packages).find(name => 
        !name.startsWith('@types/')) || Object.keys(scanResult.packages)[0];
      
      if (!packageName) {
        console.warn('No packages found in scan, skipping test');
        return;
      }

      // Read package.json from the package
      const result = await readPackageTool({
        packageName,
        filePath: 'package.json',
      });

      expect(result.success).toBe(true);
      if (result.type === 'file') {
        expect(result.package).toBe(packageName);
        expect(result.filePath).toBe('package.json');
        expect(result.content).toBeTruthy();

        // Verify it's valid JSON
        const parsed = JSON.parse(result.content) as { name: string; version: string };
        expect(parsed.name).toBe(packageName);
        expect(parsed.version).toBeTruthy();
      }
    });

    it('should handle JavaScript source files', async () => {
      // First get file tree to find a .js file
      const treeResult = await readPackageTool({
        packageName: '@babel/helper-validator-identifier',
      });

      if (treeResult.type === 'tree') {
        // Find a .js file
        const jsFile = treeResult.fileTree.find((f) => f.endsWith('.js'));

        if (jsFile) {
          const fileResult = await readPackageTool({
            packageName: '@babel/helper-validator-identifier',
            filePath: jsFile,
          });

          expect(fileResult.success).toBe(true);
          if (fileResult.type === 'file') {
            expect(fileResult.content).toBeTruthy();
            // JavaScript files should be readable text
            expect(fileResult.content.length).toBeGreaterThan(0);
          }
        }
      }
    });
  });
});
