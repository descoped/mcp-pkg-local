/**
 * Volume Controller for managing package manager caches in bottles
 *
 * This component provides:
 * - Cache directory management for different package managers
 * - Mount point configuration and management
 * - Cache statistics and cleanup
 * - Cross-platform support for cache persistence
 * - Integration with Shell-RPC for package manager operations
 */
import { join } from 'node:path';
import { promises as fs } from 'node:fs';
import type {
  PackageManager,
  VolumeMount,
  CacheStats,
  VolumeStats,
  VolumeConfig,
} from './types.js';
import { VolumeError } from './types.js';
import {
  getSystemCacheDir,
  getBottleCacheDir,
  getMountPath,
  detectPackageManagers,
  validateCacheDir,
} from './cache-paths.js';
import { getBottlesDir } from '#bottles/paths';

const DEFAULT_CONFIG = {
  baseCacheDir: '',
  maxCacheSize: 0, // Unlimited
  cacheTtl: 0, // Never expire
  autoCreateDirs: true,
  crossPlatform: true,
  detectedManagers: undefined,
  skipAutoDetection: false,
  projectDir: undefined,
};

/**
 * Main Volume Controller class for managing package manager caches
 */
export class VolumeController {
  private readonly config: Required<VolumeConfig>;
  private readonly mounts = new Map<PackageManager, VolumeMount>();
  private readonly bottleId: string;
  private initialized = false;
  private readonly injectedManagers?: PackageManager[];

  constructor(bottleId: string, config: VolumeConfig = {}) {
    this.bottleId = bottleId;

    // Store injected managers if provided
    this.injectedManagers = config.detectedManagers;

    // Set up configuration with defaults
    this.config = {
      ...DEFAULT_CONFIG,
      baseCacheDir: config.baseCacheDir ?? join(getBottlesDir(), 'cache'),
      skipAutoDetection: config.skipAutoDetection ?? false,
      projectDir: config.projectDir ?? process.cwd(),
      ...config,
    } as Required<VolumeConfig>;
  }

  /**
   * Initialize the volume controller and set up cache directories
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create base cache directory
      if (this.config.autoCreateDirs) {
        try {
          await fs.access(this.config.baseCacheDir);
        } catch {
          // Directory doesn't exist, create it
          await fs.mkdir(this.config.baseCacheDir, { recursive: true });
        }
      }

      // Use injected managers or auto-detect based on configuration
      const detectedManagers =
        this.injectedManagers ??
        (this.config.skipAutoDetection ? [] : detectPackageManagers(this.config.projectDir));

      // Initialize cache directories for detected managers
      for (const manager of detectedManagers) {
        await this.initializeManagerCache(manager);
      }

      this.initialized = true;
    } catch (error) {
      throw new VolumeError(
        `Failed to initialize volume controller: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'INIT_FAILED',
        undefined,
        error,
      );
    }
  }

  /**
   * Initialize cache directory for a specific package manager
   */
  private async initializeManagerCache(manager: PackageManager): Promise<void> {
    const bottleCacheDir = getBottleCacheDir(manager, this.config.baseCacheDir);
    const mountPath = getMountPath(manager);

    // Create bottle cache directory
    if (this.config.autoCreateDirs) {
      try {
        await fs.access(bottleCacheDir);
      } catch {
        // Directory doesn't exist, create it
        await fs.mkdir(bottleCacheDir, { recursive: true });
      }
    }

    // Check if system cache exists and copy/link if needed
    const systemCacheDir = getSystemCacheDir(manager);
    const markerPath = join(bottleCacheDir, '.initialized');

    try {
      await fs.access(systemCacheDir);
      try {
        await fs.access(markerPath);
        // Marker exists, already initialized
      } catch {
        // Marker doesn't exist, initialize from system
        await this.initializeCacheFromSystem(manager, systemCacheDir, bottleCacheDir);
      }
    } catch {
      // System cache doesn't exist, skip initialization
    }

    // Create mount configuration
    const mount: VolumeMount = {
      manager,
      cachePath: bottleCacheDir,
      mountPath,
      active: false,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
    };

    this.mounts.set(manager, mount);
  }

  /**
   * Initialize cache from system cache (copy or link)
   */
  private async initializeCacheFromSystem(
    manager: PackageManager,
    systemPath: string,
    bottlePath: string,
  ): Promise<void> {
    try {
      // For now, we just mark as initialized
      // In a full implementation, we might selectively copy or create symlinks
      // to the system cache to avoid duplicating large cache files

      // Create initialization marker
      const markerFile = join(bottlePath, '.initialized');
      await fs.mkdir(bottlePath, { recursive: true });

      // Write initialization info
      const initInfo = {
        sourceCache: systemPath,
        initTime: new Date().toISOString(),
        manager,
        strategy: 'isolated', // Future: could be 'symlink' or 'copy'
      };

      await fs.writeFile(markerFile, JSON.stringify(initInfo, null, 2));
    } catch (error) {
      console.warn(`[VolumeController] Failed to initialize ${manager} cache from system:`, error);
      // Continue without system cache initialization
    }
  }

  /**
   * Create manager-specific cache subdirectories
   */
  private async createCacheSubdirectories(
    manager: PackageManager,
    cachePath: string,
  ): Promise<void> {
    const subdirectories: string[] = [];

    switch (manager) {
      case 'pip':
        subdirectories.push('wheels', 'http', 'selfcheck');
        break;
      case 'uv':
        subdirectories.push('builds', 'wheels', 'git', 'pypi-v1', 'simple-v1');
        break;
      case 'npm':
        subdirectories.push('_cacache', '_logs', '_locks');
        break;
      case 'yarn':
        subdirectories.push('v6', 'v4', 'v1');
        break;
      case 'pnpm':
        subdirectories.push('v3', 'metadata', 'tmp');
        break;
      case 'poetry':
        subdirectories.push('cache', 'virtualenvs', 'artifacts');
        break;
      case 'maven':
        subdirectories.push('repository');
        break;
      case 'gradle':
        subdirectories.push('caches', 'wrapper');
        break;
      case 'cargo':
        subdirectories.push('registry', 'git');
        break;
      case 'go':
        subdirectories.push('mod', 'build');
        break;
      // Add more package managers as needed
      default:
        // Generic cache subdirectories for unknown managers
        subdirectories.push('cache', 'temp');
        break;
    }

    // Create all subdirectories
    await Promise.allSettled(
      subdirectories.map(async (subdir) => {
        const subdirPath = join(cachePath, subdir);
        try {
          await fs.mkdir(subdirPath, { recursive: true });
        } catch (error) {
          console.warn(
            `[VolumeController] Failed to create ${subdir} subdirectory for ${manager}:`,
            error,
          );
        }
      }),
    );
  }

  /**
   * Mount cache for a specific package manager
   */
  async mount(manager: PackageManager, customPath?: string): Promise<VolumeMount> {
    if (!this.initialized) {
      await this.initialize();
    }

    let mount = this.mounts.get(manager);

    // Create mount if it doesn't exist or update if custom path provided
    if (!mount || customPath) {
      const cachePath =
        customPath ?? mount?.cachePath ?? getBottleCacheDir(manager, this.config.baseCacheDir);
      const mountPath = getMountPath(manager);

      if (this.config.autoCreateDirs) {
        try {
          await fs.access(cachePath);
        } catch {
          // Directory doesn't exist, create it
          try {
            await fs.mkdir(cachePath, { recursive: true });
          } catch (error) {
            throw new VolumeError(
              `Failed to create cache directory: ${cachePath}. Check permissions for cache path. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
              'CACHE_CREATE_FAILED',
              manager,
            );
          }
        }

        // Create manager-specific cache subdirectories
        await this.createCacheSubdirectories(manager, cachePath);
      }

      mount = {
        manager,
        cachePath,
        mountPath,
        active: false,
        createdAt: mount?.createdAt ?? Date.now(),
        lastAccessed: Date.now(),
      };

      this.mounts.set(manager, mount);
    }

    // Validate cache directory with better error handling for tests
    if (!validateCacheDir(mount.cachePath)) {
      // Try to create the directory one more time
      if (this.config.autoCreateDirs) {
        try {
          await fs.mkdir(mount.cachePath, { recursive: true });
          await this.createCacheSubdirectories(manager, mount.cachePath);
        } catch (error) {
          throw new VolumeError(
            `Failed to create cache directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'CACHE_CREATION_FAILED',
            manager,
            error instanceof Error ? error : undefined,
          );
        }

        // Re-validate after creating
        if (!validateCacheDir(mount.cachePath)) {
          throw new VolumeError(
            `Cache directory not accessible after creation: ${mount.cachePath}`,
            'CACHE_NOT_ACCESSIBLE',
            manager,
          );
        }
      } else {
        throw new VolumeError(
          `Cache directory not accessible: ${mount.cachePath}`,
          'CACHE_NOT_ACCESSIBLE',
          manager,
        );
      }
    }

    // Activate the mount
    mount.active = true;
    mount.lastAccessed = Date.now();

    return mount;
  }

  /**
   * Unmount cache for a specific package manager
   */
  async unmount(manager: PackageManager): Promise<boolean> {
    const mount = this.mounts.get(manager);
    if (!mount) {
      return false;
    }

    mount.active = false;

    // Persist unmount metadata for debugging/recovery
    try {
      const metadataPath = join(mount.cachePath, '.unmount-metadata.json');
      const metadata = {
        unmountedAt: new Date().toISOString(),
        manager,
        lastAccessed: mount.lastAccessed,
      };
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    } catch {
      // Metadata write is optional, don't fail the unmount
    }

    return true;
  }

  /**
   * Clear cache for one or all package managers
   */
  async clear(manager?: PackageManager): Promise<void> {
    if (manager) {
      // Clear specific manager cache
      const mount = this.mounts.get(manager);
      if (mount) {
        try {
          await fs.access(mount.cachePath);
          await fs.rm(mount.cachePath, { recursive: true, force: true });
          await fs.mkdir(mount.cachePath, { recursive: true });
        } catch {
          // Cache directory doesn't exist, nothing to clear
        }
      }
    } else {
      // Clear all caches
      for (const [, mount] of this.mounts) {
        try {
          await fs.access(mount.cachePath);
          await fs.rm(mount.cachePath, { recursive: true, force: true });
          await fs.mkdir(mount.cachePath, { recursive: true });
        } catch {
          // Cache directory doesn't exist, skip
        }
      }
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<VolumeStats> {
    const stats: VolumeStats = {
      totalSize: 0,
      totalItems: 0,
      managers: {} as Record<PackageManager, CacheStats>,
      activeMounts: 0,
      calculatedAt: Date.now(),
    };

    for (const [manager, mount] of this.mounts) {
      if (mount.active) {
        stats.activeMounts++;
      }

      const cacheStats = await this.getCacheStats(manager, mount.cachePath);
      stats.managers[manager] = cacheStats;
      stats.totalSize += cacheStats.size;
      stats.totalItems += cacheStats.itemCount;
    }

    return stats;
  }

  /**
   * Get statistics for a specific cache directory
   */
  private async getCacheStats(manager: PackageManager, cachePath: string): Promise<CacheStats> {
    const stats: CacheStats = {
      manager,
      size: 0,
      itemCount: 0,
      lastModified: 0,
    };

    try {
      await fs.access(cachePath);
    } catch {
      // Directory doesn't exist
      return stats;
    }

    try {
      const dirStat = await fs.stat(cachePath);
      stats.lastModified = dirStat.mtime.getTime();

      // Calculate size and count recursively
      const calculateDirStats = async (dirPath: string): Promise<void> => {
        try {
          const entries = await fs.readdir(dirPath, { withFileTypes: true });

          for (const entry of entries) {
            const entryPath = join(dirPath, entry.name);

            if (entry.isDirectory()) {
              stats.itemCount++;
              await calculateDirStats(entryPath);
            } else if (entry.isFile()) {
              const fileStat = await fs.stat(entryPath);
              stats.size += fileStat.size;
              stats.itemCount++;
            }
          }
        } catch (error) {
          // Skip inaccessible directories/files
          console.warn(`[VolumeController] Cannot access ${dirPath}:`, error);
        }
      };

      await calculateDirStats(cachePath);
    } catch (error) {
      console.warn(`[VolumeController] Error calculating stats for ${manager}:`, error);
    }

    return stats;
  }

  /**
   * Get mount information for a specific package manager
   */
  getMount(manager: PackageManager): VolumeMount | undefined {
    return this.mounts.get(manager);
  }

  /**
   * Get all active mounts
   */
  getActiveMounts(): VolumeMount[] {
    return Array.from(this.mounts.values()).filter((mount) => mount.active);
  }

  /**
   * Get all mounts (active and inactive)
   */
  getAllMounts(): VolumeMount[] {
    return Array.from(this.mounts.values());
  }

  /**
   * Get mount environment variables for Shell-RPC integration
   */
  getMountEnvVars(): Record<string, string> {
    const envVars: Record<string, string> = {};

    for (const [manager, mount] of this.mounts) {
      if (!mount.active) continue;

      // Set cache directory environment variables that package managers recognize
      switch (manager) {
        case 'npm':
          envVars.npm_config_cache = mount.cachePath;
          break;
        case 'yarn':
          envVars.YARN_CACHE_FOLDER = mount.cachePath;
          break;
        case 'pnpm':
          envVars.PNPM_HOME = mount.cachePath;
          break;
        case 'pip':
          envVars.PIP_CACHE_DIR = mount.cachePath;
          break;
        case 'poetry':
          envVars.POETRY_CACHE_DIR = mount.cachePath;
          break;
        case 'uv':
          envVars.UV_CACHE_DIR = mount.cachePath;
          break;
        case 'maven':
          envVars.MAVEN_OPTS = `-Dmaven.repo.local=${mount.cachePath}`;
          break;
        case 'gradle':
          envVars.GRADLE_USER_HOME = mount.cachePath;
          break;
        case 'cargo':
          envVars.CARGO_HOME = mount.cachePath;
          break;
        case 'go':
          envVars.GOMODCACHE = mount.cachePath;
          break;
      }
    }

    return envVars;
  }

  /**
   * Get the bottle ID this controller manages
   */
  getBottleId(): string {
    return this.bottleId;
  }

  /**
   * Check if the controller is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Cleanup and prepare for shutdown
   */
  async cleanup(): Promise<void> {
    // Unmount all active mounts
    for (const [manager] of this.mounts) {
      await this.unmount(manager);
    }

    this.mounts.clear();
    this.initialized = false;
  }
}
