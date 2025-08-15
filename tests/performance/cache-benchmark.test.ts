import { describe, it, expect, beforeAll } from 'vitest';
import { scanPackagesTool } from '#tools/scan-packages';
import { readPackageTool } from '#tools/read-package';

describe.sequential('Cache Performance Benchmark', () => {
  beforeAll(async () => {
    // Ensure we have a populated cache for testing
    console.error('[BENCHMARK] Preparing cache with initial scan...');
    await scanPackagesTool({ forceRefresh: true, limit: 500 });
  });

  describe('SQLite Cache Performance', () => {
    it('should measure cache vs no-cache performance', async () => {
      // Force refresh to measure cold scan
      console.error('[BENCHMARK] Testing cold scan performance...');
      const coldStart = Date.now();
      const coldResult = await scanPackagesTool({ forceRefresh: true, limit: 200 });
      const coldTime = Date.now() - coldStart;

      expect(coldResult.success).toBe(true);
      const packageCount = Object.keys(coldResult.packages).length;
      console.error(
        `[BENCHMARK] Cold scan: ${coldTime}ms for ${packageCount} packages (${(coldTime / packageCount).toFixed(1)}ms per package)`,
      );

      // Warm scan from cache
      console.error('[BENCHMARK] Testing warm scan performance...');
      const warmStart = Date.now();
      const warmResult = await scanPackagesTool({ limit: 200 });
      const warmTime = Date.now() - warmStart;

      expect(warmResult.success).toBe(true);
      console.error(`[BENCHMARK] Warm scan: ${warmTime}ms (from cache)`);

      const speedup = (coldTime / warmTime).toFixed(1);
      console.error(`[BENCHMARK] Cache speedup: ${speedup}x faster`);

      // SQLite cache should provide significant speedup
      if (warmTime < coldTime) {
        console.error('[BENCHMARK] ✅ Cache is providing performance benefit');
      } else {
        console.error('[BENCHMARK] ⚠️ Cache is not providing expected speedup');
      }
    });

    it('should measure rapid cache hits', async () => {
      // Ensure cache is populated
      await scanPackagesTool({ forceRefresh: true, limit: 100 });

      console.error('[BENCHMARK] Testing rapid cache hits...');
      const iterations = 10;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        const result = await scanPackagesTool({ limit: 100 });
        const duration = Date.now() - start;
        times.push(duration);
        expect(result.success).toBe(true);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);

      console.error(`[BENCHMARK] ${iterations} cache hits:`);
      console.error(`  - Average: ${avgTime.toFixed(1)}ms`);
      console.error(`  - Min: ${minTime}ms`);
      console.error(`  - Max: ${maxTime}ms`);

      // Cache hits should be consistently fast
      expect(avgTime).toBeLessThan(500); // Less than 500ms average
    });
  });

  describe('Filter Performance', () => {
    it('should measure filter operation performance', async () => {
      // Ensure cache is populated with many packages
      await scanPackagesTool({ forceRefresh: true, limit: 500 });

      const filterTests = [
        { name: 'No filter (limit 50)', params: { limit: 50 } },
        { name: 'Regex filter', params: { filter: '^@babel/', limit: 100 } },
        { name: 'Category filter', params: { category: 'production' as const, limit: 100 } },
        { name: 'Exclude @types', params: { includeTypes: false, limit: 100 } },
        { name: 'Summary mode', params: { summary: true } },
        {
          name: 'Combined filters',
          params: {
            category: 'production' as const,
            includeTypes: false,
            filter: '^[a-m]',
            limit: 50,
          },
        },
      ];

      console.error('[BENCHMARK] Filter performance:');

      for (const test of filterTests) {
        const start = Date.now();
        const result = await scanPackagesTool(test.params);
        const duration = Date.now() - start;

        expect(result.success).toBe(true);
        const count = Object.keys(result.packages).length;
        console.error(`  - ${test.name}: ${duration}ms (${count} packages)`);

        // All filter operations should be fast
        expect(duration).toBeLessThan(1000); // Less than 1 second
      }
    });

    it('should measure package group filtering', async () => {
      const groups: Array<'testing' | 'building' | 'linting' | 'typescript'> = [
        'testing',
        'building',
        'linting',
        'typescript',
      ];

      console.error('[BENCHMARK] Package group filtering:');

      for (const group of groups) {
        const start = Date.now();
        const result = await scanPackagesTool({ group, limit: 100 });
        const duration = Date.now() - start;

        expect(result.success).toBe(true);
        const count = Object.keys(result.packages).length;
        console.error(`  - Group "${group}": ${duration}ms (${count} packages)`);

        // Group filtering should be fast
        expect(duration).toBeLessThan(1000);
      }
    });
  });

  describe('Read Package Performance', () => {
    it('should measure package reading performance', async () => {
      // Get some packages to test
      const scanResult = await scanPackagesTool({ limit: 50 });
      const packages = Object.keys(scanResult.packages).slice(0, 5);

      console.error('[BENCHMARK] Package reading performance:');

      for (const packageName of packages) {
        // Read file tree
        const treeStart = Date.now();
        const treeResult = await readPackageTool({ packageName });
        const treeTime = Date.now() - treeStart;

        // Skip if package not found (might not be in cache)
        if (treeResult.type === 'error' && treeResult.error?.includes('not found')) {
          console.warn(`Skipping test for ${packageName}: not found in cache`);
          continue;
        }
        expect(treeResult.success).toBe(true);

        if (treeResult.type === 'tree' && treeResult.fileTree) {
          console.error(`  - ${packageName}: ${treeTime}ms (${treeResult.fileTree.length} files)`);

          // Try reading a specific file if available
          if (treeResult.fileTree.length > 0) {
            const fileStart = Date.now();
            const fileResult = await readPackageTool({
              packageName,
              filePath: treeResult.fileTree[0],
            });
            const fileTime = Date.now() - fileStart;

            if (fileResult.success && fileResult.type === 'file') {
              console.error(`    - Read ${treeResult.fileTree[0]}: ${fileTime}ms`);
            }
          }
        }

        // Reading should be fast
        expect(treeTime).toBeLessThan(500);
      }
    });

    it('should measure lazy loading performance', async () => {
      const scanResult = await scanPackagesTool({ limit: 100 });
      const testPackage =
        Object.keys(scanResult.packages).find((p) => !p.startsWith('@types/')) ?? 'typescript';

      console.error(`[BENCHMARK] Lazy loading for package: ${testPackage}`);

      // Default (lazy) - only main files
      const lazyStart = Date.now();
      const lazyResult = await readPackageTool({ packageName: testPackage });
      const lazyTime = Date.now() - lazyStart;

      // Full tree
      const fullStart = Date.now();
      const fullResult = await readPackageTool({
        packageName: testPackage,
        includeTree: true,
      });
      const fullTime = Date.now() - fullStart;

      // With depth limit
      const depthStart = Date.now();
      const depthResult = await readPackageTool({
        packageName: testPackage,
        includeTree: true,
        maxDepth: 2,
      });
      const depthTime = Date.now() - depthStart;

      if (lazyResult.type === 'tree' && fullResult.type === 'tree' && depthResult.type === 'tree') {
        console.error(
          `  - Lazy (main files): ${lazyTime}ms (${lazyResult.fileTree?.length || 0} files)`,
        );
        console.error(`  - Full tree: ${fullTime}ms (${fullResult.fileTree?.length || 0} files)`);
        console.error(
          `  - Depth limit 2: ${depthTime}ms (${depthResult.fileTree?.length || 0} files)`,
        );

        // Lazy should be faster than full
        if (lazyTime < fullTime) {
          console.error(
            `  - ✅ Lazy loading is ${(fullTime / lazyTime).toFixed(1)}x faster than full tree`,
          );
        }
      }
    });
  });

  describe('Overall Performance Summary', () => {
    it('should provide performance summary', async () => {
      console.error('\n[BENCHMARK] === Performance Summary ===');

      // Test a full workflow
      const workflowStart = Date.now();

      // 1. Fresh scan
      const scan1 = Date.now();
      await scanPackagesTool({ forceRefresh: true, limit: 100 });
      const scan1Time = Date.now() - scan1;

      // 2. Cached scan
      const scan2 = Date.now();
      await scanPackagesTool({ limit: 100 });
      const scan2Time = Date.now() - scan2;

      // 3. Filtered scan
      const scan3 = Date.now();
      const filtered = await scanPackagesTool({ category: 'production', limit: 50 });
      const scan3Time = Date.now() - scan3;

      // 4. Read a package
      const packageName = Object.keys(filtered.packages)[0];
      let read1Time = 0;
      if (packageName) {
        const read1 = Date.now();
        await readPackageTool({ packageName });
        read1Time = Date.now() - read1;
      }

      const totalTime = Date.now() - workflowStart;

      console.error('[BENCHMARK] Typical workflow times:');
      console.error(`  1. Fresh scan (100 packages): ${scan1Time}ms`);
      console.error(`  2. Cached scan: ${scan2Time}ms`);
      console.error(`  3. Filtered scan: ${scan3Time}ms`);
      console.error(`  4. Read package: ${read1Time}ms`);
      console.error(`  Total workflow: ${totalTime}ms`);

      // Check if we're using SQLite
      const cacheType = scan2Time < scan1Time / 2 ? 'SQLite (fast)' : 'JSON (standard)';
      console.error(`\n[BENCHMARK] Cache type detected: ${cacheType}`);

      if (scan2Time < scan1Time / 2) {
        console.error('[BENCHMARK] ✅ SQLite cache is providing excellent performance');
        console.error(`[BENCHMARK] Cache speedup: ${(scan1Time / scan2Time).toFixed(1)}x faster`);
      } else {
        console.error(
          '[BENCHMARK] ℹ️ Using JSON cache (install better-sqlite3 for better performance)',
        );
      }

      // Overall performance should be good
      expect(totalTime).toBeLessThan(5000); // Less than 5 seconds for full workflow
    });
  });
});
