import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { ScanResult, EnvironmentInfo } from '#scanners/types.js';
import { SQLiteCache } from '#utils/sqlite-cache.js';
import { getCacheDir } from '#utils/cache-paths.js';

/**
 * Unified cache using SQLite for high performance
 */
export class UnifiedCache {
  private readonly cache: SQLiteCache;

  constructor(basePath: string = process.cwd()) {
    // Ensure cache directory exists
    const cacheDir = getCacheDir(basePath);
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
    }

    // Use directory-based database name for tests to allow cache sharing while avoiding conflicts
    const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
    const dbName = isTest
      ? `cache-${Buffer.from(basePath).toString('hex').slice(-16)}.db`
      : 'cache.db';

    this.cache = new SQLiteCache({
      dbPath: join(cacheDir, dbName),
      maxAge: 3600, // 1 hour in seconds
      enableWAL: true,
      enableFileCache: false,
    });
    console.error('[CACHE] Using SQLite cache for high performance');
  }

  save(scanResult: ScanResult): void {
    const partitionKey = this.getPartitionKey(scanResult.environment);
    this.cache.save(partitionKey, scanResult);
  }

  load(environment: EnvironmentInfo): ScanResult | null {
    const partitionKey = this.getPartitionKey(environment);
    return this.cache.get(partitionKey);
  }

  isStale(environment: EnvironmentInfo): boolean {
    const partitionKey = this.getPartitionKey(environment);
    return !this.cache.isValid(partitionKey);
  }

  private getPartitionKey(environment: EnvironmentInfo): string {
    return `${environment.type}-${environment.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  // Clean up resources when done
  close(): void {
    this.cache.close();
  }
}
