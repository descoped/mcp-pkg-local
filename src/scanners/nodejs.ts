import { BaseScanner } from '#scanners/base';
import type { ScanResult, PackageInfo, EnvironmentInfo } from '#types';
import { NodeEnvironmentNotFoundError } from '#types';
import { join, dirname } from 'node:path';
import { readdir, readFile } from 'node:fs/promises';

export class NodeJSScanner extends BaseScanner {
  // LanguageScanner required properties
  readonly language = 'javascript' as const;
  readonly supportedPackageManagers = ['npm', 'pnpm', 'yarn', 'bun'] as const;
  readonly supportedExtensions = ['.js', '.ts', '.mjs', '.cjs', '.jsx', '.tsx', '.json'] as const;
  
  private projectRoot: string | null = null;
  private nodeModulesPath: string | null = null;
  private packageCache = new Map<string, PackageInfo>();

  async scan(): Promise<ScanResult> {
    this.log('Starting Node.js environment scan');

    // Find package.json (project root)
    const projectPath = await this.findPackageJson();
    if (!projectPath) {
      throw new NodeEnvironmentNotFoundError();
    }

    this.projectRoot = projectPath;
    this.log(`Found package.json at: ${projectPath}`);

    // Find node_modules
    this.nodeModulesPath = join(projectPath, 'node_modules');
    if (!(await this.pathExists(this.nodeModulesPath))) {
      throw new Error('Could not find node_modules directory. Run "npm install" first.');
    }

    this.log(`Found node_modules at: ${this.nodeModulesPath}`);

    // Get environment info
    const environment = await this.getEnvironmentInfo();

    // Scan packages
    const packages = await this.scanPackages();

    return {
      success: true,
      packages,
      environment,
      scanTime: new Date().toISOString(),
    };
  }

  async getPackageLocation(packageName: string): Promise<string | null> {
    // Check cache first
    const cached = this.packageCache.get(packageName);
    if (cached) {
      return cached.location;
    }

    if (!this.nodeModulesPath) {
      return null;
    }

    // Handle scoped packages (@scope/package)
    const packagePath = packageName.startsWith('@')
      ? join(this.nodeModulesPath, ...packageName.split('/'))
      : join(this.nodeModulesPath, packageName);

    if (await this.pathExists(packagePath)) {
      return packagePath;
    }

    return null;
  }

  async getPackageVersion(packageName: string): Promise<string | null> {
    const packagePath = await this.getPackageLocation(packageName);
    if (!packagePath) {
      return null;
    }

    try {
      const packageJsonPath = join(packagePath, 'package.json');
      const packageJson = await readFile(packageJsonPath, 'utf-8');
      const parsed = JSON.parse(packageJson) as { version?: string };
      return parsed.version ?? 'unknown';
    } catch {
      return 'unknown';
    }
  }

  async canHandle(basePath: string): Promise<boolean> {
    // Check if package.json exists
    const packageJsonPath = join(basePath, 'package.json');
    return this.pathExists(packageJsonPath);
  }

  async detectPackageManager(): Promise<string | null> {
    const root = this.projectRoot ?? this.basePath;

    // Detect package manager by lock files
    if (await this.pathExists(join(root, 'pnpm-lock.yaml'))) {
      return 'pnpm';
    } else if (await this.pathExists(join(root, 'yarn.lock'))) {
      return 'yarn';
    } else if (await this.pathExists(join(root, 'bun.lockb'))) {
      return 'bun';
    } else if (await this.pathExists(join(root, 'package-lock.json'))) {
      return 'npm';
    }
    return 'npm'; // default
  }

  async getEnvironmentInfo(): Promise<EnvironmentInfo> {
    if (!this.projectRoot) {
      throw new Error('Project root not found');
    }

    // Use detectPackageManager method
    const packageManager = await this.detectPackageManager() ?? 'npm';

    // Get Node.js version if possible
    let nodeVersion: string;
    try {
      const { exec } = await import('node:child_process');
      const { promisify } = await import('node:util');
      const execAsync = promisify(exec);
      const { stdout } = await execAsync('node --version');
      nodeVersion = stdout.trim();
    } catch {
      // Fallback to process version
      nodeVersion = process.version;
    }

    return {
      type: packageManager as 'npm' | 'pnpm' | 'yarn',
      path: this.projectRoot,
      nodeVersion,
      packageManager,
    } satisfies EnvironmentInfo;
  }

  async isDependenciesInstalled(): Promise<boolean> {
    return this.nodeModulesPath ? this.pathExists(this.nodeModulesPath) : false;
  }

  async getLockFilePath(): Promise<string | null> {
    const root = this.projectRoot ?? this.basePath;
    const lockFiles = [
      'package-lock.json',
      'pnpm-lock.yaml', 
      'yarn.lock',
      'bun.lockb'
    ];
    
    for (const lockFile of lockFiles) {
      const path = join(root, lockFile);
      if (await this.pathExists(path)) {
        return path;
      }
    }
    return null;
  }

  private async findPackageJson(): Promise<string | null> {
    let currentPath = this.basePath;
    
    // Look for package.json in current directory and parents
    while (currentPath !== dirname(currentPath)) {
      const packageJsonPath = join(currentPath, 'package.json');
      if (await this.pathExists(packageJsonPath)) {
        return currentPath;
      }
      currentPath = dirname(currentPath);
    }

    return null;
  }

  private async scanPackages(): Promise<Record<string, PackageInfo>> {
    if (!this.nodeModulesPath) {
      return {};
    }

    const packages: Record<string, PackageInfo> = {};

    try {
      const entries = await readdir(this.nodeModulesPath, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) {
          continue;
        }

        const entryName = entry.name;
        const entryPath = join(this.nodeModulesPath, entryName);

        // Handle scoped packages (@scope/package)
        if (entryName.startsWith('@')) {
          const scopedEntries = await readdir(entryPath, { withFileTypes: true });
          
          for (const scopedEntry of scopedEntries) {
            if (!scopedEntry.isDirectory()) {
              continue;
            }

            const packageName = `${entryName}/${scopedEntry.name}`;
            const packagePath = join(entryPath, scopedEntry.name);
            const packageInfo = await this.extractPackageInfo(packageName, packagePath);
            
            if (packageInfo) {
              packages[packageName] = packageInfo;
              this.packageCache.set(packageName, packageInfo);
            }
          }
        } else {
          // Regular package
          const packageInfo = await this.extractPackageInfo(entryName, entryPath);
          
          if (packageInfo) {
            packages[entryName] = packageInfo;
            this.packageCache.set(entryName, packageInfo);
          }
        }
      }
    } catch (error) {
      this.log('Error scanning node_modules:', error);
    }

    return packages;
  }

  async getPackageMainFile(packageName: string): Promise<string | null> {
    const packagePath = await this.getPackageLocation(packageName);
    if (!packagePath) {
      return null;
    }

    try {
      const packageJsonPath = join(packagePath, 'package.json');
      const packageJson = await readFile(packageJsonPath, 'utf-8');
      const parsed = JSON.parse(packageJson) as {
        main?: string;
        module?: string;
        exports?: Record<string, unknown> | { '.': { default?: string } | string };
      };

      // Check for entry points in order of preference
      const entryPoints = [
        parsed.main,
        parsed.module,
        (typeof parsed.exports === 'object' && parsed.exports !== null && '.' in parsed.exports
          ? typeof parsed.exports['.'] === 'object' && parsed.exports['.'] !== null && 'default' in parsed.exports['.']
            ? (parsed.exports['.'] as { default?: string }).default
            : typeof parsed.exports['.'] === 'string'
            ? parsed.exports['.']
            : undefined
          : undefined),
        'index.js',
        'index.ts',
        'index.mjs',
        'lib/index.js',
        'dist/index.js',
      ].filter(Boolean);

      for (const entry of entryPoints) {
        if (typeof entry === 'string') {
          const entryPath = join(packagePath, entry);
          if (await this.pathExists(entryPath)) {
            return entry;
          }
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  private async extractPackageInfo(packageName: string, packagePath: string): Promise<PackageInfo | null> {
    try {
      const packageJsonPath = join(packagePath, 'package.json');
      
      if (!(await this.pathExists(packageJsonPath))) {
        return null;
      }

      const packageJson = await readFile(packageJsonPath, 'utf-8');
      const parsed = JSON.parse(packageJson) as { version?: string };

      return {
        name: packageName,
        version: parsed.version ?? 'unknown',
        location: packagePath,
        language: 'javascript',
        packageManager: undefined, // Will be filled by the environment detection
      };
    } catch (error) {
      this.log(`Failed to extract info from ${packagePath}:`, error);
      return null;
    }
  }
}