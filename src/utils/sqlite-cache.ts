import Database from 'better-sqlite3';
import { pack, unpack } from 'msgpackr';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import type {
  ScanResult,
  PackageInfo,
  EnvironmentInfo,
  SQLiteCacheConfig,
  CacheEnvironment,
  EnvironmentRow,
  PackageRow,
} from '#types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * High-performance SQLite cache implementation for package scanning
 * Uses prepared statements and MessagePack serialization for optimal performance
 */
export class SQLiteCache {
  private db: Database.Database;
  private readonly config: SQLiteCacheConfig;

  // Prepared statements for common operations
  private readonly statements: {
    // Environment operations
    getEnvironment: Database.Statement;
    insertEnvironment: Database.Statement;
    updateEnvironment: Database.Statement;
    deleteOldEnvironments: Database.Statement;

    // Package operations
    insertPackage: Database.Statement;
    updatePackage: Database.Statement;
    deletePackagesByEnv: Database.Statement;
    getPackagesByEnv: Database.Statement;
    getPackageByName: Database.Statement;
    getTopPackages: Database.Statement;
    searchPackages: Database.Statement;

    // Stats operations
    getStats: Database.Statement;
    updateLastAccess: Database.Statement;
  };

  constructor(config: Partial<SQLiteCacheConfig> = {}) {
    this.config = {
      dbPath: config.dbPath ?? '.pkg-local-cache.db',
      maxAge: config.maxAge ?? 7 * 24 * 60 * 60, // 7 days
      enableWAL: config.enableWAL !== false,
      enableFileCache: config.enableFileCache ?? false,
    };

    // Ensure cache directory exists
    const cacheDir = dirname(this.config.dbPath);
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
    }

    // Initialize database
    this.db = new Database(this.config.dbPath);
    this.initDatabase();
    this.statements = this.prepareStatements();
  }

  private initDatabase(): void {
    // Load and execute schema synchronously
    const schemaPath = join(__dirname, '..', 'schemas', 'cache-schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    // Execute schema in transaction
    this.db.exec(schema);

    // Configure database settings
    if (this.config.enableWAL) {
      this.db.pragma('journal_mode = WAL');
    }
    this.db.pragma('foreign_keys = ON');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('temp_store = MEMORY');
    this.db.pragma('mmap_size = 268435456'); // 256MB
  }

  private prepareStatements(): typeof this.statements {
    return {
      // Environment operations
      getEnvironment: this.db.prepare(`
        SELECT * FROM environments 
        WHERE partition_key = ?
      `),

      insertEnvironment: this.db.prepare(`
        INSERT INTO environments (
          partition_key, project_path, language, package_manager, 
          last_scan, scan_duration_ms, metadata
        ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
      `),

      updateEnvironment: this.db.prepare(`
        UPDATE environments 
        SET last_scan = CURRENT_TIMESTAMP, 
            scan_duration_ms = ?, 
            metadata = ?,
            package_manager = ?
        WHERE partition_key = ?
      `),

      deleteOldEnvironments: this.db.prepare(`
        DELETE FROM environments 
        WHERE last_scan < datetime('now', '-' || ? || ' seconds')
      `),

      // Package operations
      insertPackage: this.db.prepare(`
        INSERT OR REPLACE INTO packages (
          environment_id, name, version, location, language, category,
          relevance_score, popularity_score, file_count, size_bytes,
          main_file, has_types, is_direct_dependency, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `),

      updatePackage: this.db.prepare(`
        UPDATE packages 
        SET version = ?, location = ?, category = ?, 
            relevance_score = ?, metadata = ?
        WHERE environment_id = ? AND name = ?
      `),

      deletePackagesByEnv: this.db.prepare(`
        DELETE FROM packages WHERE environment_id = ?
      `),

      getPackagesByEnv: this.db.prepare(`
        SELECT * FROM packages 
        WHERE environment_id = ?
        ORDER BY relevance_score DESC, name ASC
      `),

      getPackageByName: this.db.prepare(`
        SELECT p.*, e.partition_key 
        FROM packages p
        JOIN environments e ON p.environment_id = e.id
        WHERE e.partition_key = ? AND p.name = ?
      `),

      getTopPackages: this.db.prepare(`
        SELECT * FROM packages 
        WHERE environment_id = ?
        ORDER BY relevance_score DESC
        LIMIT ?
      `),

      searchPackages: this.db.prepare(`
        SELECT * FROM packages 
        WHERE environment_id = ? AND name LIKE ?
        ORDER BY relevance_score DESC
      `),

      // Stats operations
      getStats: this.db.prepare(`
        SELECT 
          (SELECT COUNT(*) FROM environments) as environments,
          (SELECT COUNT(*) FROM packages) as packages,
          (SELECT AVG(scan_duration_ms) FROM environments) as avg_scan_duration,
          (SELECT MAX(last_scan) FROM environments) as latest_scan
      `),

      updateLastAccess: this.db.prepare(`
        UPDATE environments 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE partition_key = ?
      `),
    };
  }

  /**
   * Save or update a scan result in the cache
   */
  save(partitionKey: string, result: ScanResult): void {
    const startTime = Date.now();

    // Begin transaction for atomic operation
    const transaction = this.db.transaction(() => {
      // Check if environment exists
      const existingEnv = this.statements.getEnvironment.get(partitionKey) as
        | CacheEnvironment
        | undefined;

      let environmentId: number;
      const scanDuration = Date.now() - startTime;
      const metadataBlob = pack(result.environment);

      if (existingEnv) {
        // Update existing environment
        this.statements.updateEnvironment.run(
          scanDuration,
          metadataBlob,
          result.environment.packageManager ?? null,
          partitionKey,
        );
        environmentId = existingEnv.id;

        // Clear old packages
        this.statements.deletePackagesByEnv.run(environmentId);
      } else {
        // Insert new environment
        // Determine language from packages or default to javascript
        const firstPackageName = Object.keys(result.packages)[0];
        const language =
          firstPackageName && result.packages[firstPackageName]
            ? result.packages[firstPackageName].language
            : 'javascript';

        const insertResult = this.statements.insertEnvironment.run(
          partitionKey,
          result.environment.path,
          language,
          result.environment.packageManager ?? null,
          scanDuration,
          metadataBlob,
        );
        environmentId = insertResult.lastInsertRowid as number;
      }

      // Insert packages
      for (const [name, pkg] of Object.entries(result.packages)) {
        const metadataBlob = pack(pkg);

        this.statements.insertPackage.run(
          environmentId,
          name,
          pkg.version,
          pkg.location,
          pkg.language,
          pkg.category ?? null,
          pkg.relevanceScore ?? 0,
          pkg.popularityScore ?? 0,
          pkg.fileCount ?? null,
          pkg.sizeBytes ?? null,
          pkg.mainFile ?? null,
          pkg.hasTypes ? 1 : 0,
          pkg.isDirectDependency ? 1 : 0,
          metadataBlob,
        );
      }
    });

    // Execute transaction
    transaction();
  }

  /**
   * Get cached scan result for a partition
   */
  get(partitionKey: string): ScanResult | null {
    // Get environment
    const env = this.statements.getEnvironment.get(partitionKey) as EnvironmentRow | undefined;
    if (!env) {
      return null;
    }

    // Check if cache is still valid
    // SQLite datetime strings need to be parsed carefully
    const lastScanTime = new Date(env.last_scan + 'Z').getTime(); // Add Z for UTC
    const ageSeconds = (Date.now() - lastScanTime) / 1000;
    if (ageSeconds > this.config.maxAge) {
      return null;
    }

    // Update access time
    this.statements.updateLastAccess.run(partitionKey);

    // Get packages
    const packages = this.statements.getPackagesByEnv.all(env.id) as PackageRow[];

    // Build result
    const packageMap: Record<string, PackageInfo> = {};
    for (const pkg of packages) {
      const metadata = unpack(pkg.metadata) as PackageInfo;
      const result: PackageInfo = {
        ...metadata,
        relevanceScore: pkg.relevance_score,
        popularityScore: pkg.popularity_score,
        hasTypes: Boolean(pkg.has_types),
        isDirectDependency: Boolean(pkg.is_direct_dependency),
      };

      // Add optional properties only if they have values
      if (pkg.file_count !== null) {
        result.fileCount = pkg.file_count;
      }
      if (pkg.size_bytes !== null) {
        result.sizeBytes = pkg.size_bytes;
      }
      if (pkg.main_file !== null) {
        result.mainFile = pkg.main_file;
      }

      packageMap[pkg.name] = result;
    }

    const environment = unpack(env.metadata) as EnvironmentInfo;

    const result: ScanResult = {
      success: true,
      packages: packageMap,
      environment: environment,
      scanTime: env.last_scan,
    };

    // Add scanDurationMs only if it has a value
    if (env.scan_duration_ms !== null) {
      result.environment = {
        ...environment,
        scanDurationMs: env.scan_duration_ms,
      };
    }

    return result;
  }



  /**
   * Check if cache is valid for a partition
   */
  isValid(partitionKey: string): boolean {
    const env = this.statements.getEnvironment.get(partitionKey) as EnvironmentRow | undefined;
    if (!env) {
      return false;
    }

    // SQLite datetime strings need to be parsed carefully
    const lastScanTime = new Date(env.last_scan + 'Z').getTime(); // Add Z for UTC
    const ageSeconds = (Date.now() - lastScanTime) / 1000;
    return ageSeconds <= this.config.maxAge;
  }


  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }

}
