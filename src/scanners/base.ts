import type { LanguageScanner, PackageManagerScanner, ScanResult, EnvironmentInfo } from '#types';
import { promises as fs } from 'node:fs';

export abstract class BaseScanner implements LanguageScanner, PackageManagerScanner {
  protected readonly basePath: string;
  protected readonly debug: boolean;

  // LanguageScanner required properties
  abstract readonly language: 'python' | 'javascript' | 'go' | 'rust' | 'java';
  abstract readonly supportedPackageManagers: readonly string[];
  abstract readonly supportedExtensions: readonly string[];

  constructor(basePath: string = process.cwd()) {
    this.basePath = basePath;
    this.debug = process.env.DEBUG?.includes('mcp-pkg-local') ?? false;
  }

  // Scanner interface methods (required)
  abstract scan(): Promise<ScanResult>;
  abstract getPackageLocation(packageName: string): Promise<string | null>;
  abstract getPackageVersion(packageName: string): Promise<string | null>;
  abstract getEnvironmentInfo(): Promise<EnvironmentInfo>;

  // LanguageScanner interface methods (required)
  abstract canHandle(basePath: string): Promise<boolean>;
  abstract getPackageMainFile?(packageName: string): Promise<string | null>;

  // PackageManagerScanner interface methods (required)
  abstract detectPackageManager(): Promise<string | null>;
  abstract isDependenciesInstalled(): Promise<boolean>;
  abstract getLockFilePath?(): Promise<string | null>;

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
}
