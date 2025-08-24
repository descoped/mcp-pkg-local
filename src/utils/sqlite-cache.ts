import Database from 'better-sqlite3';
import { pack, unpack } from 'msgpackr';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import type { SQLiteCacheConfig, EnvironmentRow, PackageRow } from '#types.js';
import type { ScanResult, BasicPackageInfo, EnvironmentInfo } from '#scanners/types.js';
import type { UnifiedPackageContent } from '#types/unified-schema.js';
import { getSQLiteDbPath } from '#utils/cache-paths.js';

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
      dbPath: config.dbPath ?? getSQLiteDbPath(),
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
          environment_id, name, version, location, language,
          has_type_definitions, unified_content
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `),

      updatePackage: this.db.prepare(`
        UPDATE packages
        SET version = ?, location = ?, unified_content = ?
        WHERE environment_id = ? AND name = ?
      `),

      deletePackagesByEnv: this.db.prepare(`
        DELETE FROM packages WHERE environment_id = ?
      `),

      getPackagesByEnv: this.db.prepare(`
        SELECT * FROM packages
        WHERE environment_id = ?
        ORDER BY name ASC
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
        ORDER BY name ASC
        LIMIT ?
      `),

      searchPackages: this.db.prepare(`
        SELECT * FROM packages
        WHERE environment_id = ? AND name LIKE ?
        ORDER BY name ASC
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
        | EnvironmentRow
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
        const firstPackageName = Object.keys(result.packages ?? {})[0];
        const language =
          firstPackageName && result.packages?.[firstPackageName]
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
      for (const [name, pkg] of Object.entries(result.packages ?? {})) {
        // Pack unified content separately
        const unifiedContentBlob = pkg.unifiedContent ? pack(pkg.unifiedContent) : null;

        this.statements.insertPackage.run(
          environmentId,
          name,
          pkg.version,
          pkg.location,
          pkg.language,
          pkg.hasTypes ? 1 : 0, // has_type_definitions
          unifiedContentBlob, // Store unified content
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
    const packageMap: Record<string, BasicPackageInfo> = {};
    for (const pkg of packages) {
      // Unpack unified content if present
      const unifiedContent = pkg.unified_content
        ? (unpack(pkg.unified_content) as UnifiedPackageContent)
        : undefined;

      let result: BasicPackageInfo;
      result = {
        name: pkg.name,
        version: pkg.version,
        location: pkg.location,
        language: pkg.language as 'python' | 'javascript',
        packageManager: 'unknown', // Will be set from environment
        hasTypes: Boolean(pkg.has_type_definitions),
        unifiedContent,
      };

      packageMap[pkg.name] = result;
    }

    const environment = unpack(env.metadata) as EnvironmentInfo;

    // Set packageManager from environment for all packages
    for (const pkg of Object.values(packageMap)) {
      if (pkg.packageManager === 'unknown' && environment.packageManager) {
        pkg.packageManager = environment.packageManager;
      }
    }

    let result: ScanResult;
    result = {
      success: true,
      packages: packageMap,
      environment: environment,
      scanTime: env.last_scan,
    };

    // Add scanDurationMs only if it has a value
    // scanDurationMs is not part of the scanner EnvironmentInfo type

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
