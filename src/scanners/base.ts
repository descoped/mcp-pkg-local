import type {
  IPackageScanner,
  ScanResult,
  EnvironmentInfo,
  ScanOptions,
  BasicPackageInfo,
} from '#scanners/types.js';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';

export abstract class BaseScanner implements IPackageScanner {
  protected readonly basePath: string;
  protected readonly debug: boolean;
  // Cache package locations (relative paths) to avoid repeated filesystem lookups
  protected locationCache = new Map<string, string>();

  // Scanner identification properties
  abstract readonly language: 'python' | 'javascript';
  abstract readonly supportedPackageManagers: readonly string[];

  constructor(basePath: string = process.cwd()) {
    this.basePath = basePath;
    this.debug = process.env.DEBUG?.includes('mcp-pkg-local') ?? false;
  }

  // IPackageScanner interface methods (required)
  abstract scan(options?: ScanOptions): Promise<ScanResult>;
  abstract getPackageLocation(packageName: string): Promise<string | null>;
  abstract getPackageVersion(packageName: string): Promise<string | null>;
  abstract getEnvironmentInfo(): Promise<EnvironmentInfo>;
  abstract getPackageInfo(packageName: string): Promise<BasicPackageInfo | null>;

  // Scanner capability methods
  abstract canHandle(basePath: string): Promise<boolean>;
  abstract detectPackageManager(): Promise<string | null>;

  protected log(message: string, ...args: unknown[]): void {
    if (this.debug) {
      console.error(`[SCANNER] ${message}`, ...args);
    }
  }

  protected async pathExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  protected async isDirectory(path: string): Promise<boolean> {
    try {
      const stats = await fs.stat(path);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  protected async readFile(path: string): Promise<string> {
    return fs.readFile(path, 'utf-8');
  }

  protected async readDir(path: string): Promise<string[]> {
    return fs.readdir(path);
  }

  protected normalizePackageName(name: string): string {
    // Normalize package names (e.g., pillow -> PIL)
    // This is a basic implementation; can be extended with a mapping
    return name.toLowerCase().replace(/_/g, '-');
  }

  /**
   * Convert absolute path to relative path from base directory
   */
  protected toRelativePath(absolutePath: string): string {
    return absolutePath.replace(this.basePath + '/', '').replace(this.basePath + '\\', '');
  }

  /**
   * Common method to check cache for package location
   * Returns absolute path if found in cache, null otherwise
   */
  protected getCachedPackageLocation(packageName: string): string | null {
    const cachedLocation = this.locationCache.get(packageName);
    if (cachedLocation) {
      // Convert relative path back to absolute
      return join(this.basePath, cachedLocation);
    }
    return null;
  }
}
