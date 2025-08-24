/**
 * Type definitions for the Volume Controller
 */

export type PackageManager =
  | 'pip'
  | 'npm'
  | 'yarn'
  | 'pnpm'
  | 'bun'
  | 'poetry'
  | 'uv'
  | 'pipenv'
  | 'maven'
  | 'gradle'
  | 'cargo'
  | 'go';

export interface VolumeMount {
  /**
   * Package manager this mount is for
   */
  manager: PackageManager;

  /**
   * Local cache directory path
   */
  cachePath: string;

  /**
   * Mount point path within the bottle
   */
  mountPath: string;

  /**
   * Whether the mount is currently active
   */
  active: boolean;

  /**
   * Creation timestamp
   */
  createdAt: number;

  /**
   * Last accessed timestamp
   */
  lastAccessed: number;
}

export interface CacheStats {
  /**
   * Package manager
   */
  manager: PackageManager;

  /**
   * Total size in bytes
   */
  size: number;

  /**
   * Number of cached items/packages
   */
  itemCount: number;

  /**
   * Last modified timestamp
   */
  lastModified: number;

  /**
   * Cache hit ratio (if available)
   */
  hitRatio?: number;
}

export interface VolumeStats {
  /**
   * Total cache size across all managers
   */
  totalSize: number;

  /**
   * Total number of items
   */
  totalItems: number;

  /**
   * Stats per package manager
   */
  managers: Record<PackageManager, CacheStats>;

  /**
   * Active mounts
   */
  activeMounts: number;

  /**
   * Timestamp of last stats calculation
   */
  calculatedAt: number;
}

export interface VolumeConfig {
  /**
   * Base cache directory (defaults to .pkg-local-cache/bottles/cache)
   */
  baseCacheDir?: string;

  /**
   * Maximum cache size in bytes (0 = unlimited)
   */
  maxCacheSize?: number;

  /**
   * Cache TTL in milliseconds (0 = never expire)
   */
  cacheTtl?: number;

  /**
   * Whether to create cache directories automatically
   */
  autoCreateDirs?: boolean;

  /**
   * Cross-platform path handling
   */
  crossPlatform?: boolean;

  /**
   * Explicitly injected package managers (overrides auto-detection)
   */
  detectedManagers?: PackageManager[];

  /**
   * Skip auto-detection of package managers (useful for tests)
   */
  skipAutoDetection?: boolean;

  /**
   * Explicit project directory for package manager detection
   */
  projectDir?: string;
}

export class VolumeError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly manager?: PackageManager,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'VolumeError';
  }
}
