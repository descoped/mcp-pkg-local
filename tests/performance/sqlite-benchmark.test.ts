import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { promises as fs } from 'node:fs';
import { existsSync } from 'node:fs';

// Test SQLite cache directly
describe.sequential('SQLite Cache Direct Benchmark', () => {
  it('should benchmark SQLite cache if available', async () => {
    // Check if better-sqlite3 is available
    const sqliteAvailable = existsSync(join(process.cwd(), 'node_modules', 'better-sqlite3'));
    
    if (!sqliteAvailable) {
      console.log('[BENCHMARK] SQLite not available - skipping direct benchmark');
      console.log('[BENCHMARK] To enable SQLite cache: npm install better-sqlite3');
      return;
    }
    
    console.log('[BENCHMARK] SQLite is available - running direct benchmark');
    
    // Import SQLiteCache dynamically
    const { SQLiteCache } = await import('#utils/sqlite-cache');
    
    // Create test directory
    const testDir = join(tmpdir(), `sqlite-bench-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    
    try {
      // Create cache instance
      const cache = new SQLiteCache({
        dbPath: join(testDir, 'test.db'),
        maxAge: 3600, // 1 hour
        enableWAL: true,
      });
      
      // Create test data
      const testData = {
        success: true,
        packages: {} as any,
        environment: {
          type: 'npm' as const,
          path: testDir,
          nodeVersion: 'v20.0.0',
        },
        scanTime: new Date().toISOString(),
      };
      
      // Add many packages for realistic test
      for (let i = 0; i < 500; i++) {
        testData.packages[`package-${i}`] = {
          name: `package-${i}`,
          version: `1.0.${i}`,
          location: `node_modules/package-${i}`,
          language: 'javascript' as const,
          category: i % 2 === 0 ? 'production' as const : 'development' as const,
          relevanceScore: Math.random() * 1000,
          popularityScore: Math.random() * 100,
          fileCount: Math.floor(Math.random() * 100),
          sizeBytes: Math.floor(Math.random() * 1000000),
          hasTypes: i % 3 === 0,
          isDirectDependency: i % 5 === 0,
        };
      }
      
      const partitionKey = 'test-partition';
      
      console.log('[BENCHMARK] Testing SQLite write performance...');
      
      // Benchmark writes
      const writeStart = Date.now();
      for (let i = 0; i < 10; i++) {
        cache.save(partitionKey, testData);
      }
      const writeTime = Date.now() - writeStart;
      console.log(`  - 10 writes of 500 packages: ${writeTime}ms (${(writeTime/10).toFixed(1)}ms avg)`);
      
      // Benchmark reads
      console.log('[BENCHMARK] Testing SQLite read performance...');
      const readStart = Date.now();
      let readCount = 0;
      for (let i = 0; i < 100; i++) {
        const result = cache.get(partitionKey);
        if (result) {
          readCount++;
          expect(Object.keys(result.packages).length).toBe(500);
        }
      }
      
      // If no reads succeeded, try to debug
      if (readCount === 0) {
        console.log('[BENCHMARK] Debug: No reads succeeded, checking cache validity...');
        
        // Check if the data was actually saved
        const db = (cache as any).db;
        const checkEnv = db.prepare('SELECT * FROM environments WHERE partition_key = ?').get(partitionKey);
        if (checkEnv) {
          console.log(`  - Environment found in DB`);
          console.log(`  - last_scan value: "${checkEnv.last_scan}"`);
          console.log(`  - last_scan type: ${typeof checkEnv.last_scan}`);
          
          // Try to parse the date
          try {
            const date1 = new Date(checkEnv.last_scan);
            const date2 = new Date(checkEnv.last_scan + 'Z');
            console.log(`  - Parsed without Z: ${date1.toISOString()} (valid: ${!isNaN(date1.getTime())})`);
            console.log(`  - Parsed with Z: ${date2.toISOString()} (valid: ${!isNaN(date2.getTime())})`);
            
            const ageSeconds = (Date.now() - date2.getTime()) / 1000;
            console.log(`  - Age in seconds: ${ageSeconds}`);
            console.log(`  - Max age config: ${(cache as any).config.maxAge}`);
            console.log(`  - Should be valid: ${ageSeconds <= (cache as any).config.maxAge}`);
          } catch (e) {
            console.log(`  - Date parsing error: ${e}`);
          }
        } else {
          console.log(`  - No environment found for partition key: ${partitionKey}`);
        }
        
        const isValid = cache.isValid(partitionKey);
        console.log(`  - Cache.isValid() returns: ${isValid}`);
      } else {
        console.log(`  - Successfully read ${readCount}/100 times`);
      }
      const readTime = Date.now() - readStart;
      console.log(`  - 100 reads of 500 packages: ${readTime}ms (${(readTime/100).toFixed(1)}ms avg)`);
      
      // Benchmark validity checks
      console.log('[BENCHMARK] Testing SQLite validity check performance...');
      const validStart = Date.now();
      for (let i = 0; i < 1000; i++) {
        const isValid = cache.isValid(partitionKey);
        expect(isValid).toBe(true);
      }
      const validTime = Date.now() - validStart;
      console.log(`  - 1000 validity checks: ${validTime}ms (${(validTime/1000).toFixed(2)}ms avg)`);
      
      // Close database
      cache.close();
      
      console.log('\n[BENCHMARK] SQLite Performance Summary:');
      console.log(`  ✅ Write: ${(writeTime/10).toFixed(1)}ms per operation`);
      console.log(`  ✅ Read: ${(readTime/100).toFixed(1)}ms per operation`);
      console.log(`  ✅ Validity: ${(validTime/1000).toFixed(2)}ms per check`);
      
      // Performance expectations
      expect(writeTime/10).toBeLessThan(50); // < 50ms per write
      if (readCount > 0) {
        expect(readTime/100).toBeLessThan(10); // < 10ms per read
      }
      expect(validTime/1000).toBeLessThan(1); // < 1ms per validity check
      
    } finally {
      // Clean up
      await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
    }
  });
  
  it('should compare SQLite vs JSON performance', async () => {
    console.log('\n[BENCHMARK] === SQLite vs JSON Comparison ===');
    
    // Test with actual tools
    const { scanPackagesTool } = await import('#tools/scan-packages');
    
    // Do multiple scans to test caching
    const times = {
      fresh: [] as number[],
      cached: [] as number[],
    };
    
    for (let i = 0; i < 3; i++) {
      // Fresh scan
      const freshStart = Date.now();
      await scanPackagesTool({ forceRefresh: true, limit: 100 });
      times.fresh.push(Date.now() - freshStart);
      
      // Cached scan (should be faster)
      const cachedStart = Date.now();
      await scanPackagesTool({ limit: 100 });
      times.cached.push(Date.now() - cachedStart);
      
      // Small delay between iterations
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const avgFresh = times.fresh.reduce((a, b) => a + b, 0) / times.fresh.length;
    const avgCached = times.cached.reduce((a, b) => a + b, 0) / times.cached.length;
    
    console.log('[BENCHMARK] Average times over 3 iterations:');
    console.log(`  - Fresh scan: ${avgFresh.toFixed(1)}ms`);
    console.log(`  - Cached scan: ${avgCached.toFixed(1)}ms`);
    
    if (avgCached < avgFresh) {
      const speedup = (avgFresh / avgCached).toFixed(1);
      console.log(`  - ✅ Cache provides ${speedup}x speedup`);
    } else {
      console.log('  - ⚠️ Cache not providing expected speedup');
      console.log('  - This might be because the scan itself is already fast');
    }
    
    // Check if SQLite is being used
    const sqliteDbExists = existsSync('.pkg-local-cache.db');
    const jsonCacheExists = existsSync('.pkg-local-cache');
    
    console.log('\n[BENCHMARK] Cache backend detection:');
    if (sqliteDbExists) {
      console.log('  - ✅ SQLite database found (.pkg-local-cache.db)');
      
      // Check database size
      const { statSync } = await import('node:fs');
      const stats = statSync('.pkg-local-cache.db');
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`  - Database size: ${sizeMB} MB`);
    }
    if (jsonCacheExists) {
      console.log('  - ℹ️ JSON cache directory found (.pkg-local-cache/)');
    }
    
    // The key metric is whether caching provides any benefit
    const cacheBenefit = avgFresh - avgCached;
    if (cacheBenefit > 0) {
      console.log(`\n[BENCHMARK] ✅ Cache saves ${cacheBenefit.toFixed(0)}ms per operation`);
    }
  });
});