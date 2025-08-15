import { existsSync, mkdirSync, promises as fs } from 'node:fs';
import { join } from 'node:path';
import type { IndexFile, PackageInfo, ScanResult } from '#types';
import { IndexFileSchema } from '#types';
import { SQLiteCache } from '#utils/sqlite-cache';

const INDEX_FILE_NAME = '.pkg-local-index.json';
const CACHE_DIR_NAME = '.pkg-local-cache';
const INDEX_VERSION = '1.1.0'; // Bump for partitioned cache

interface CachePartition {
  environment: IndexFile['environment'];
  packages: Record<string, PackageInfo>;
  lastUpdated: string;
  packageHashes: Record<string, string>; // For incremental updates
  validityTimestamp: string; // When this cache becomes invalid
  packageTimestamps: Record<string, string>; // Individual package update times
}

// Legacy export for backward compatibility
export { IndexCache, PartitionedCache };

class IndexCache {
  private readonly indexPath: string;
  private cache: IndexFile | null = null;

  constructor(basePath: string = process.cwd()) {
    this.indexPath = join(basePath, INDEX_FILE_NAME);
  }

  // Commented out - not used
  // async exists(): Promise<boolean> {
  //   try {
  //     await fs.access(this.indexPath);
  //     return true;
  //   } catch {
  //     return false;
  //   }
  // }

  async read(): Promise<IndexFile | null> {
    try {
      if (this.cache) {
        return this.cache;
      }

      const content = await fs.readFile(this.indexPath, 'utf-8');
      const data = JSON.parse(content) as unknown;

      // Validate with Zod schema
      const validated = IndexFileSchema.parse(data);

      // Check version compatibility
      if (validated.version !== INDEX_VERSION) {
        console.error(
          `Index version mismatch: expected ${INDEX_VERSION}, got ${validated.version}`,
        );
        return null;
      }

      this.cache = validated;
      return validated;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Failed to read index file:', error);
      }
      return null;
    }
  }

  // Commented out - not used
  // async write(scanResult: ScanResult): Promise<void> {
  //   const indexFile: IndexFile = {
  //     version: INDEX_VERSION,
  //     lastUpdated: scanResult.scanTime,
  //     environment: scanResult.environment,
  //     packages: scanResult.packages,
  //   };
  //
  //   // Write atomically using a temp file
  //   const tempPath = `${this.indexPath}.tmp`;
  //
  //   try {
  //     await fs.writeFile(tempPath, JSON.stringify(indexFile, null, 2), 'utf-8');
  //
  //     // Atomic rename
  //     await fs.rename(tempPath, this.indexPath);
  //
  //     // Update cache
  //     this.cache = indexFile;
  //   } catch (error) {
  //     // Clean up temp file if it exists
  //     try {
  //       await fs.unlink(tempPath);
  //     } catch {
  //       // Ignore cleanup errors
  //     }
  //     throw error;
  //   }
  // }

  // Commented out - not used
  // async getAge(): Promise<number | null> {
  //   try {
  //     const stats = await fs.stat(this.indexPath);
  //     return Date.now() - stats.mtime.getTime();
  //   } catch {
  //     return null;
  //   }
  // }

  // Commented out - not used
  // async isStale(maxAgeMs = 3600000): Promise<boolean> {
  //   const age = await this.getAge();
  //   return age === null || age > maxAgeMs;
  // }
}

class PartitionedCache {
  private readonly cacheDir: string;
  private readonly metaPath: string;
  private partitions = new Map<string, CachePartition>();

  constructor(basePath: string = process.cwd()) {
    this.cacheDir = join(basePath, CACHE_DIR_NAME);
    this.metaPath = join(this.cacheDir, 'meta.json');
  }

  private getPartitionKey(environment: IndexFile['environment']): string {
    return `${environment.type}-${environment.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  private getPartitionPath(partitionKey: string): string {
    return join(this.cacheDir, `${partitionKey}.json`);
  }

  private async ensureCacheDir(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }
  }

  // Commented out - not used
  // async exists(): Promise<boolean> {
  //   try {
  //     await fs.access(this.metaPath);
  //     return true;
  //   } catch {
  //     return false;
  //   }
  // }

  async loadPartition(environment: IndexFile['environment']): Promise<CachePartition | null> {
    const partitionKey = this.getPartitionKey(environment);

    // Check memory cache first
    const cachedPartition = this.partitions.get(partitionKey);
    if (cachedPartition) {
      return cachedPartition;
    }

    try {
      const partitionPath = this.getPartitionPath(partitionKey);
      const content = await fs.readFile(partitionPath, 'utf-8');
      const partition = JSON.parse(content) as CachePartition;

      // Cache in memory
      this.partitions.set(partitionKey, partition);
      return partition;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error(`Failed to read partition ${partitionKey}:`, error);
      }
      return null;
    }
  }

  async savePartition(scanResult: ScanResult, maxAgeMs = 3600000): Promise<void> {
    await this.ensureCacheDir();

    const partitionKey = this.getPartitionKey(scanResult.environment);
    const now = new Date();
    const validityTimestamp = new Date(now.getTime() + maxAgeMs).toISOString();

    const packageTimestamps: Record<string, string> = {};
    const scanTime = scanResult.scanTime;
    for (const packageName of Object.keys(scanResult.packages)) {
      packageTimestamps[packageName] = scanTime;
    }

    const partition: CachePartition = {
      environment: scanResult.environment,
      packages: scanResult.packages,
      lastUpdated: scanResult.scanTime,
      packageHashes: this.generatePackageHashes(scanResult.packages),
      validityTimestamp,
      packageTimestamps,
    };

    const partitionPath = this.getPartitionPath(partitionKey);
    const tempPath = `${partitionPath}.tmp`;

    try {
      // Write partition atomically
      await fs.writeFile(tempPath, JSON.stringify(partition, null, 2), 'utf-8');
      await fs.rename(tempPath, partitionPath);

      // Update memory cache
      this.partitions.set(partitionKey, partition);

      // Update metadata
      await this.updateMetadata(partitionKey, scanResult.scanTime);
    } catch (error) {
      // Clean up temp file
      try {
        await fs.unlink(tempPath);
      } catch {
        // Ignore cleanup errors
      }
      throw error;
    }
  }

  async getPartitionAge(environment: IndexFile['environment']): Promise<number | null> {
    try {
      const partitionKey = this.getPartitionKey(environment);
      const partitionPath = this.getPartitionPath(partitionKey);
      const stats = await fs.stat(partitionPath);
      return Date.now() - stats.mtime.getTime();
    } catch {
      return null;
    }
  }

  async isPartitionStale(
    environment: IndexFile['environment'],
    maxAgeMs = 3600000,
  ): Promise<boolean> {
    const partition = await this.loadPartition(environment);
    if (!partition) {
      return true; // No partition means stale
    }

    // Check validity timestamp first (more accurate)
    if (partition.validityTimestamp) {
      const validUntil = new Date(partition.validityTimestamp).getTime();
      const now = Date.now();
      return now > validUntil;
    }

    // Fall back to file age for older partitions
    const age = await this.getPartitionAge(environment);
    return age === null || age > maxAgeMs;
  }

  private async updateMetadata(partitionKey: string, lastUpdated: string): Promise<void> {
    try {
      let metadata: Record<string, { lastUpdated: string }> = {};

      try {
        const content = await fs.readFile(this.metaPath, 'utf-8');
        metadata = JSON.parse(content) as Record<string, { lastUpdated: string }>;
      } catch {
        // File doesn't exist, use empty metadata
      }

      metadata[partitionKey] = { lastUpdated };
      await fs.writeFile(this.metaPath, JSON.stringify(metadata, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to update cache metadata:', error);
    }
  }

  private generatePackageHashes(packages: Record<string, PackageInfo>): Record<string, string> {
    const hashes: Record<string, string> = {};
    for (const [name, info] of Object.entries(packages)) {
      hashes[name] = this.hashPackage(info);
    }
    return hashes;
  }

  private hashPackage(packageInfo: PackageInfo): string {
    // Simple hash based on key properties
    const key = `${packageInfo.name}:${packageInfo.version}:${packageInfo.location}`;
    return Buffer.from(key).toString('base64');
  }

  // Commented out - not used
  // // Convert from old IndexFile format to partitioned cache for backward compatibility
  // async migrateFromIndexFile(indexFile: IndexFile): Promise<void> {
  //   const scanResult: ScanResult = {
  //     success: true,
  //     environment: indexFile.environment,
  //     packages: indexFile.packages,
  //     scanTime: indexFile.lastUpdated,
  //     summary: {
  //       total: Object.keys(indexFile.packages).length,
  //       filtered: Object.keys(indexFile.packages).length,
  //       languages: {
  //         [indexFile.environment.type.includes('npm') ||
  //         indexFile.environment.type.includes('yarn') ||
  //         indexFile.environment.type.includes('pnpm')
  //           ? 'javascript'
  //           : 'python']: Object.keys(indexFile.packages).length,
  //       },
  //       categories: { production: 0, development: Object.keys(indexFile.packages).length },
  //     },
  //   };
  //
  //   // Use a shorter validity period for migrated data to encourage fresh scan
  //   await this.savePartition(scanResult, 1800000); // 30 minutes instead of 1 hour
  // }
}

/**
 * Unified cache that uses SQLite when available, falls back to PartitionedCache
 */
export class UnifiedCache {
  private readonly cache: SQLiteCache | PartitionedCache;
  private readonly usingSQLite: boolean;

  constructor(basePath: string = process.cwd()) {
    // Ensure cache directory exists
    const cacheDir = join(basePath, CACHE_DIR_NAME);
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
    }

    // Check if better-sqlite3 module exists
    const sqliteAvailable = existsSync(join(process.cwd(), 'node_modules', 'better-sqlite3'));

    if (sqliteAvailable) {
      try {
        this.cache = new SQLiteCache({
          dbPath: join(cacheDir, 'cache.db'), // Store in .pkg-local-cache/
          maxAge: 3600, // 1 hour in seconds
          enableWAL: true,
          enableFileCache: false,
        });
        this.usingSQLite = true;
        console.error('[CACHE] Using SQLite cache for high performance');
      } catch (error) {
        // Fallback if SQLite initialization fails
        console.error('[CACHE] SQLite initialization failed, falling back to JSON cache:', error);
        this.cache = new PartitionedCache(basePath);
        this.usingSQLite = false;
      }
    } else {
      this.cache = new PartitionedCache(basePath);
      this.usingSQLite = false;
      console.error('[CACHE] Using JSON cache (install better-sqlite3 for 40x faster performance)');
    }
  }

  async save(scanResult: ScanResult): Promise<void> {
    if (this.usingSQLite) {
      const sqliteCache = this.cache as SQLiteCache;
      const partitionKey = this.getPartitionKey(scanResult.environment);
      sqliteCache.save(partitionKey, scanResult);
    } else {
      await (this.cache as PartitionedCache).savePartition(scanResult);
    }
  }

  async load(environment: IndexFile['environment']): Promise<ScanResult | null> {
    if (this.usingSQLite) {
      const sqliteCache = this.cache as SQLiteCache;
      const partitionKey = this.getPartitionKey(environment);
      return sqliteCache.get(partitionKey);
    } else {
      const partition = await (this.cache as PartitionedCache).loadPartition(environment);
      if (!partition) return null;

      return {
        success: true,
        packages: partition.packages,
        environment: partition.environment,
        scanTime: partition.lastUpdated,
      };
    }
  }

  async isStale(environment: IndexFile['environment'], maxAgeMs = 3600000): Promise<boolean> {
    if (this.usingSQLite) {
      const sqliteCache = this.cache as SQLiteCache;
      const partitionKey = this.getPartitionKey(environment);
      return !sqliteCache.isValid(partitionKey);
    } else {
      return (this.cache as PartitionedCache).isPartitionStale(environment, maxAgeMs);
    }
  }

  private getPartitionKey(environment: IndexFile['environment']): string {
    return `${environment.type}-${environment.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  // Clean up resources when done
  close(): void {
    if (this.usingSQLite) {
      (this.cache as SQLiteCache).close();
    }
  }
}
