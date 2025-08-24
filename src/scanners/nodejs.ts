import { BaseScanner } from '#scanners/base.js';
import type { BasicPackageInfo, ScanResult, EnvironmentInfo } from '#scanners/types.js';
import { EnvironmentNotFoundError } from '#types.js';
import { join, dirname } from 'node:path';
import { readdir, readFile } from 'node:fs/promises';
import { StreamManager, createConsoleStream } from '#utils/streaming.js';

export class NodeJSScanner extends BaseScanner {
  // Scanner identification properties
  readonly language = 'javascript' as const;
  readonly supportedPackageManagers = ['npm', 'pnpm', 'yarn', 'bun'] as const;

  private projectRoot: string | null = null;
  private nodeModulesPath: string | null = null;
  private packageJsonCache = new Map<string, Record<string, unknown>>();
  private cachedPackageManager: string | null = null;

  async scan(): Promise<ScanResult> {
    const startTime = Date.now();

    // Setup streaming - use console stream if VERBOSE or DEBUG is enabled
    const shouldStream =
      process.env.VERBOSE === '1' || (process.env.DEBUG?.includes('mcp-pkg-local') ?? false);
    const stream = shouldStream ? new StreamManager(createConsoleStream()) : new StreamManager();

    this.log('Starting Node.js environment scan');

    // Find package.json (project root)
    const projectPath = await this.findPackageJson();
    if (!projectPath) {
      throw new EnvironmentNotFoundError('javascript');
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

    // Emit scan started event
    await stream.scanStarted({
      environment: environment.type,
      packageManager: environment.packageManager ?? 'npm',
    });

    // Scan packages with streaming
    const packages = await this.scanPackagesWithStreaming(stream);

    // Emit completion event
    const duration = Date.now() - startTime;
    await stream.scanCompleted(Object.keys(packages).length, duration);

    return {
      success: true,
      packages,
      environment,
      scanTime: new Date().toISOString(),
    };
  }

  async getPackageLocation(packageName: string): Promise<string | null> {
    // Check cache first using base class method
    const cachedLocation = this.getCachedPackageLocation(packageName);
    if (cachedLocation) {
      return cachedLocation;
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

  /**
   * Read and cache package.json content to avoid multiple file reads
   */
  private async readPackageJson(packagePath: string): Promise<Record<string, unknown> | null> {
    const cacheKey = packagePath;

    // Check cache first
    if (this.packageJsonCache.has(cacheKey)) {
      return this.packageJsonCache.get(cacheKey) ?? null;
    }

    try {
      const packageJsonPath = join(packagePath, 'package.json');
      const packageJson = await readFile(packageJsonPath, 'utf-8');
      const parsed = JSON.parse(packageJson) as Record<string, unknown>;

      // Cache the result
      this.packageJsonCache.set(cacheKey, parsed);
      return parsed;
    } catch {
      return null;
    }
  }

  async getPackageVersion(packageName: string): Promise<string | null> {
    const packagePath = await this.getPackageLocation(packageName);
    if (!packagePath) {
      return null;
    }

    const packageJson = await this.readPackageJson(packagePath);
    if (!packageJson) {
      return 'unknown';
    }

    return (packageJson.version as string) ?? 'unknown';
  }

  async getPackageInfo(packageName: string): Promise<BasicPackageInfo | null> {
    const packagePath = await this.getPackageLocation(packageName);
    if (!packagePath) {
      return null;
    }

    const version = await this.getPackageVersion(packageName);
    if (!version) {
      return null;
    }

    // Get cached package.json metadata
    const packageJson = await this.readPackageJson(packagePath);

    return {
      name: packageName,
      version,
      location: packagePath,
      language: 'javascript',
      packageManager: (await this.detectPackageManager()) ?? 'npm',
      hasTypes: packageName.startsWith('@types/') || (await this.hasTypeDefinitions(packagePath)),
      metadata: packageJson ?? undefined,
    };
  }

  private async hasTypeDefinitions(packagePath: string): Promise<boolean> {
    const packageJson = await this.readPackageJson(packagePath);
    if (!packageJson) {
      return false;
    }

    return !!(packageJson.types ?? packageJson.typings);
  }

  async canHandle(basePath: string): Promise<boolean> {
    // Check if package.json exists
    const packageJsonPath = join(basePath, 'package.json');
    return this.pathExists(packageJsonPath);
  }

  async detectPackageManager(): Promise<string | null> {
    // Return cached result if available
    if (this.cachedPackageManager !== null) {
      return this.cachedPackageManager;
    }

    const root = this.projectRoot ?? this.basePath;

    // Detect package manager by lock files
    if (await this.pathExists(join(root, 'pnpm-lock.yaml'))) {
      this.cachedPackageManager = 'pnpm';
    } else if (await this.pathExists(join(root, 'yarn.lock'))) {
      this.cachedPackageManager = 'yarn';
    } else if (await this.pathExists(join(root, 'bun.lockb'))) {
      this.cachedPackageManager = 'bun';
    } else if (await this.pathExists(join(root, 'package-lock.json'))) {
      this.cachedPackageManager = 'npm';
    } else {
      this.cachedPackageManager = 'npm'; // default
    }

    return this.cachedPackageManager;
  }

  async getEnvironmentInfo(): Promise<EnvironmentInfo> {
    // Ensure we have found the project root
    if (!this.projectRoot) {
      const projectPath = await this.findPackageJson();
      if (!projectPath) {
        throw new Error('Project root not found');
      }
      this.projectRoot = projectPath;
    }

    // Use detectPackageManager method
    const packageManager = (await this.detectPackageManager()) ?? 'npm';

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

  private async scanPackagesWithStreaming(
    stream: StreamManager,
  ): Promise<Record<string, BasicPackageInfo>> {
    if (!this.nodeModulesPath) {
      return {};
    }

    const packages: Record<string, BasicPackageInfo> = {};
    let processed = 0;

    try {
      const entries = await readdir(this.nodeModulesPath, { withFileTypes: true });
      const directories = entries.filter((entry) => entry.isDirectory());

      // Estimate total packages (including scoped packages)
      let estimatedTotal = directories.length;
      for (const entry of directories) {
        if (entry.name.startsWith('@')) {
          const scopedPath = join(this.nodeModulesPath, entry.name);
          try {
            const scopedEntries = await readdir(scopedPath, { withFileTypes: true });
            estimatedTotal += scopedEntries.filter((e) => e.isDirectory()).length - 1; // -1 for the scope itself
          } catch {
            // Continue if can't read scoped directory
          }
        }
      }

      for (const entry of directories) {
        const entryName = entry.name;
        const entryPath = join(this.nodeModulesPath, entryName);

        // Handle scoped packages (@scope/package)
        if (entryName.startsWith('@')) {
          await stream.packageDiscovered(entryName, entryPath);

          const scopedEntries = await readdir(entryPath, { withFileTypes: true });

          for (const scopedEntry of scopedEntries) {
            if (!scopedEntry.isDirectory()) {
              continue;
            }

            const packageName = `${entryName}/${scopedEntry.name}`;
            const packagePath = join(entryPath, scopedEntry.name);

            await stream.packageDiscovered(packageName, packagePath);
            await stream.scanProgress(processed, estimatedTotal, packageName);

            const packageInfo = await this.extractPackageInfo(packageName, packagePath);

            if (packageInfo) {
              packages[packageName] = packageInfo;
              this.locationCache.set(packageName, packageInfo.location);
              await stream.packageProcessed(packageName, packageInfo.version, packageInfo.location);
            }

            processed++;
          }
        } else {
          // Regular package
          await stream.packageDiscovered(entryName, entryPath);
          await stream.scanProgress(processed, estimatedTotal, entryName);

          const packageInfo = await this.extractPackageInfo(entryName, entryPath);

          if (packageInfo) {
            packages[entryName] = packageInfo;
            this.locationCache.set(entryName, packageInfo.location);
            await stream.packageProcessed(entryName, packageInfo.version, packageInfo.location);
          }

          processed++;
        }
      }
    } catch (error) {
      this.log('Error scanning node_modules:', error);
      await stream.error('Failed to scan packages', undefined, String(error));
      // Continue with partial results
    }

    return packages;
  }

  private async extractPackageInfo(
    packageName: string,
    packagePath: string,
  ): Promise<BasicPackageInfo | null> {
    try {
      const packageJson = await this.readPackageJson(packagePath);
      if (!packageJson) {
        return null;
      }

      // Store relative path from project root
      const relativePath = this.toRelativePath(packagePath);

      // Check for TypeScript definitions
      const hasTypes = Boolean(
        packageJson.types ?? packageJson.typings ?? packageName.startsWith('@types/'),
      );

      // NOTE: AST parsing is done on-demand in read-package, not during scan
      // This keeps the scan fast and only processes packages when requested

      return {
        name: packageName,
        version: (packageJson.version as string) ?? 'unknown',
        location: relativePath,
        language: 'javascript',
        packageManager: 'npm', // Default, will be updated by environment detection
        hasTypes,
        metadata: packageJson,
      };
    } catch (error) {
      this.log(`Failed to extract info from ${packagePath}:`, error);
      return null;
    }
  }
}
