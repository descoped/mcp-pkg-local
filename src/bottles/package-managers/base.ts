/**
 * Base package manager adapter for Bottles architecture
 * Provides common functionality for all Python package manager adapters
 */

import { join, resolve } from 'node:path';
import { access } from 'node:fs/promises';
import { constants } from 'node:fs';

import type { ShellRPC, CommandResult } from '#bottles/shell-rpc';
import type { VolumeController, PackageManager } from '#bottles/volume-controller';
import type { EnvironmentInfo } from '#bottles/environment-detector';

/**
 * Package manager detection result
 */
export interface DetectionResult {
  /** Whether this package manager is present in the project */
  detected: boolean;
  /** Confidence score (0-1) */
  confidence: number;
  /** Manifest files found */
  manifestFiles: string[];
  /** Lock files found */
  lockFiles: string[];
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Package manifest information
 */
export interface Manifest {
  /** Project name */
  name?: string;
  /** Project version */
  version?: string;
  /** Project description */
  description?: string;
  /** Dependencies */
  dependencies: Record<string, string>;
  /** Development dependencies */
  devDependencies: Record<string, string>;
  /** Optional dependencies */
  optionalDependencies: Record<string, string>;
  /** Python version requirement (for Python packages) */
  pythonRequires?: string;
  /** Author information */
  author?: string | { name: string; email?: string };
  /** License */
  license?: string;
  /** Additional metadata from the manifest */
  metadata?: Record<string, unknown>;
}

/**
 * Package installation options
 */
export interface InstallOptions {
  /** Install as development dependency */
  dev?: boolean;
  /** Install as optional dependency */
  optional?: boolean;
  /** Force reinstall */
  force?: boolean;
  /** Use specific index/registry */
  index?: string;
  /** Additional package manager specific options */
  extraArgs?: string[];
  /** Environment variables */
  env?: Record<string, string>;
  /** Working directory */
  cwd?: string;
}

/**
 * Cache path information
 */
export interface CachePaths {
  /** Global package cache directory */
  global: string;
  /** Local project cache directory */
  local?: string;
  /** Temporary cache directory */
  temp?: string;
  /** Additional cache directories */
  additional?: string[];
}

/**
 * Package information
 */
export interface PackageInfo {
  /** Package name */
  name: string;
  /** Package version */
  version: string;
  /** Installation location */
  location: string;
  /** Whether it's a development dependency */
  isDev: boolean;
  /** Whether it's optional */
  isOptional: boolean;
  /** Package metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Installation validation result
 */
export interface ValidationResult {
  /** Whether the installation is valid */
  valid: boolean;
  /** Issues found during validation */
  issues: string[];
  /** Warnings */
  warnings: string[];
  /** Environment information */
  environment?: Record<string, unknown>;
}

/**
 * Package manager adapter error
 */
export class PackageManagerError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly suggestion?: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'PackageManagerError';
  }
}

/**
 * Base interface that all package manager adapters must implement
 */
export interface PackageManagerAdapter {
  /** Package manager name */
  readonly name: PackageManager;
  /** Display name for the package manager */
  readonly displayName: string;
  /** Package manager executable name */
  readonly executable: string;
  /** Common manifest file names */
  readonly manifestFiles: string[];
  /** Common lock file names */
  readonly lockFiles: string[];

  /**
   * Detect if this package manager is used in the given directory
   */
  detectProject(dir: string): Promise<DetectionResult>;

  /**
   * Parse the manifest file(s) in the project
   */
  parseManifest(projectDir: string): Promise<Manifest | undefined>;

  /**
   * Install packages using this package manager
   */
  installPackages(packages: string[], options?: InstallOptions): Promise<void>;

  /**
   * Uninstall packages using this package manager
   */
  uninstallPackages(
    packages: string[],
    options?: Omit<InstallOptions, 'dev' | 'optional'>,
  ): Promise<void>;

  /**
   * Get cache paths for this package manager
   */
  getCachePaths(): Promise<CachePaths>;

  /**
   * Validate the current installation
   */
  validateInstallation(projectDir?: string): Promise<ValidationResult>;

  /**
   * Get list of installed packages
   */
  getInstalledPackages(projectDir?: string): Promise<PackageInfo[]>;

  /**
   * Create a virtual environment (Python specific)
   */
  createEnvironment?(projectDir: string, pythonVersion?: string): Promise<void>;

  /**
   * Activate virtual environment (Python specific)
   */
  activateEnvironment?(projectDir: string): Promise<Record<string, string>>;
}

/**
 * Base package manager adapter implementation
 * Provides common functionality that all specific adapters can extend
 */
export abstract class BasePackageManagerAdapter implements PackageManagerAdapter {
  public abstract readonly name: PackageManager;
  public abstract readonly displayName: string;
  public abstract readonly executable: string;
  public abstract readonly manifestFiles: string[];
  public abstract readonly lockFiles: string[];

  constructor(
    protected readonly shellRPC: ShellRPC,
    protected readonly volumeController: VolumeController,
    protected readonly environment: EnvironmentInfo,
    protected readonly projectDir: string = process.cwd(),
  ) {}

  /**
   * Abstract methods that must be implemented by specific adapters
   */
  public abstract detectProject(dir: string): Promise<DetectionResult>;

  public abstract parseManifest(projectDir: string): Promise<Manifest | undefined>;

  public abstract installPackages(packages: string[], options?: InstallOptions): Promise<void>;

  public abstract uninstallPackages(
    packages: string[],
    options?: Omit<InstallOptions, 'dev' | 'optional'>,
  ): Promise<void>;

  public abstract getInstalledPackages(projectDir?: string): Promise<PackageInfo[]>;

  /**
   * Execute a shell command with proper error handling
   */
  protected async executeCommand(
    command: string,
    options: {
      cwd?: string;
      env?: Record<string, string>;
      timeout?: number;
      suppressErrors?: boolean;
    } = {},
  ): Promise<CommandResult> {
    const { cwd = this.projectDir, env = {}, timeout = 30000, suppressErrors = false } = options;

    let result: CommandResult;

    try {
      // Build the command with environment variables
      // Use export for each variable to ensure proper handling
      let fullCommand = command;
      if (Object.keys(env).length > 0) {
        // Export each environment variable separately, then run the command
        const exports = Object.entries(env)
          .map(([key, value]) => {
            // Escape single quotes in value and wrap in single quotes for safety
            const escapedValue = String(value).replace(/'/g, "'\\''");
            return `export ${key}='${escapedValue}'`;
          })
          .join('; ');
        fullCommand = `${exports}; ${command}`;
      }

      // Note: The Shell-RPC should be initialized with the correct working directory
      // If cwd is different from projectDir, we may need to handle that case
      // For package managers, we typically always work in the project directory
      if (cwd !== this.projectDir) {
        console.warn(`[BaseAdapter] Command requested different cwd: ${cwd} vs ${this.projectDir}`);
      }

      result = await this.shellRPC.execute(fullCommand, timeout);
    } catch (error) {
      throw new PackageManagerError(
        `Failed to execute command: ${command}`,
        'EXECUTION_ERROR',
        `Ensure ${this.displayName} is installed and the project directory is accessible`,
        error instanceof Error ? error : new Error(String(error)),
      );
    }

    if (result.exitCode !== 0 && !suppressErrors) {
      throw new PackageManagerError(
        `Command failed: ${command}`,
        'COMMAND_FAILED',
        `Check that ${this.displayName} is installed and accessible. Error: ${result.stderr}`,
        new Error(result.stderr),
      );
    }

    return result;
  }

  /**
   * Check if a file exists
   */
  protected async fileExists(filePath: string): Promise<boolean> {
    try {
      await access(filePath, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Find manifest files in the project directory
   */
  protected async findManifestFiles(dir: string): Promise<string[]> {
    const found: string[] = [];

    for (const filename of this.manifestFiles) {
      const filePath = join(dir, filename);
      if (await this.fileExists(filePath)) {
        found.push(filePath);
      }
    }

    return found;
  }

  /**
   * Find lock files in the project directory
   */
  protected async findLockFiles(dir: string): Promise<string[]> {
    const found: string[] = [];

    for (const filename of this.lockFiles) {
      const filePath = join(dir, filename);
      if (await this.fileExists(filePath)) {
        found.push(filePath);
      }
    }

    return found;
  }

  /**
   * Get cache paths for this package manager
   */
  public getCachePaths(): Promise<CachePaths> {
    const mount = this.volumeController.getMount(this.name);

    if (!mount) {
      throw new PackageManagerError(
        `No mount found for package manager: ${this.name}`,
        'MOUNT_NOT_FOUND',
        'Initialize the volume controller before using cache paths',
      );
    }

    return Promise.resolve({
      global: mount.cachePath,
      local: mount.cachePath,
      temp: join(mount.cachePath, 'temp'),
    });
  }

  /**
   * Get the platform string
   */
  protected get platform(): NodeJS.Platform {
    return process.platform;
  }

  /**
   * Get virtual environment activation command prefix
   * Consolidates logic from pip.ts and uv.ts
   */
  protected async getVenvActivationPrefix(projectDir: string): Promise<string> {
    const venvPath = await this.getVenvPath(projectDir);

    if (this.platform === 'win32') {
      const activateScript = join(venvPath, 'Scripts', 'activate.bat');
      return `"${activateScript}" && `;
    }

    const activateScript = join(venvPath, 'bin', 'activate');
    return `. "${activateScript}" && `;
  }

  /**
   * Get standardized virtual environment path
   * Checks for existing venv in order of preference: .venv, venv, env
   */
  protected async getVenvPath(projectDir: string): Promise<string> {
    const candidates = ['.venv', 'venv', 'env'];

    for (const candidate of candidates) {
      const path = join(projectDir, candidate);
      if (await this.fileExists(path)) {
        return path;
      }
    }

    // Default to .venv for creation
    return join(projectDir, '.venv');
  }

  /**
   * Basic validation implementation
   */
  public async validateInstallation(
    projectDir: string = this.projectDir,
  ): Promise<ValidationResult> {
    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      // Check if package manager is available
      const result = await this.executeCommand(`${this.executable} --version`, {
        cwd: projectDir,
        suppressErrors: true,
      });

      if (result.exitCode !== 0) {
        issues.push(`${this.displayName} is not installed or not accessible`);
      }

      // Check for manifest files
      const manifestFiles = await this.findManifestFiles(projectDir);
      if (manifestFiles.length === 0) {
        warnings.push(`No ${this.displayName} manifest files found in ${projectDir}`);
      }
    } catch (error) {
      issues.push(
        `Failed to validate ${this.displayName}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings,
      environment: {
        packageManager: this.name,
        projectDir,
        executable: this.executable,
      },
    };
  }

  /**
   * Normalize package names for consistent handling
   */
  protected normalizePackageName(name: string): string {
    return name.toLowerCase().trim();
  }

  /**
   * Parse version specifications
   */
  protected parseVersionSpec(spec: string): { name: string; version: string; constraint?: string } {
    // Handle common version specification formats
    // e.g., "package>=1.0.0", "package==1.2.3", "package~=1.0"
    const regex = /^([^<>=!~]+)([<>=!~].*)$/;
    const match = regex.exec(spec);

    if (match?.[1] && match[2]) {
      return {
        name: this.normalizePackageName(match[1]),
        version: match[2],
        constraint: match[2],
      };
    }

    return {
      name: this.normalizePackageName(spec),
      version: '*',
    };
  }

  /**
   * Parse JSON output from package manager commands with robust error handling
   * Handles mixed output where JSON might be mixed with other text
   */
  protected parseJsonOutput<T = unknown>(output: string, context?: string): T {
    // Remove ANSI escape codes and control characters first
    // eslint-disable-next-line no-control-regex
    let cleaned = output.replace(/\x1b\[[0-9;]*m/g, '');

    // Remove progress indicators (carriage returns without newlines)
    cleaned = cleaned.replace(/^.*\r(?!\n)/gm, '');

    const trimmed = cleaned.trim();

    // Handle empty output
    if (!trimmed || trimmed === '[]') {
      return [] as unknown as T;
    }

    // First, try simple parsing if output looks like pure JSON
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return JSON.parse(trimmed) as T;
      } catch (error) {
        const contextMsg = context ? ` (${context})` : '';
        const preview = trimmed.substring(0, 100) + (trimmed.length > 100 ? '...' : '');
        throw new PackageManagerError(
          `JSON parsing failed${contextMsg}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'JSON_PARSE_ERROR',
          `Output was: ${preview}`,
        );
      }
    }

    // Handle mixed output - look for JSON array or object anywhere in output
    // This handles cases where package managers output environment info before JSON
    let jsonMatch = /\[[\s\S]*?]/.exec(trimmed);
    jsonMatch ??= /\{[\s\S]*?}/.exec(trimmed);

    if (jsonMatch?.[0]) {
      try {
        return JSON.parse(jsonMatch[0]) as T;
      } catch (error) {
        const contextMsg = context ? ` (${context})` : '';
        const preview = trimmed.substring(0, 100) + (trimmed.length > 100 ? '...' : '');
        throw new PackageManagerError(
          `JSON parsing failed${contextMsg}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'JSON_PARSE_ERROR',
          `Output was: ${preview}`,
        );
      }
    }

    // Check for common patterns that indicate empty results
    if (trimmed.includes('Using Python') && !trimmed.includes('[') && !trimmed.includes('{')) {
      return [] as unknown as T;
    }

    // If we get here, the output doesn't contain valid JSON
    const contextMsg = context ? ` (${context})` : '';
    const preview = trimmed.substring(0, 100) + (trimmed.length > 100 ? '...' : '');

    throw new PackageManagerError(
      `Invalid JSON output${contextMsg}: ${preview}`,
      'INVALID_JSON_OUTPUT',
      'Check that the package manager is properly installed and the command executed successfully',
    );
  }

  /**
   * Enhanced JSON parsing with fallback strategies for package manager output
   */
  protected parsePackageManagerJson<T = unknown>(
    output: string,
    expectedFormat?: 'array' | 'object',
    fallbackValue?: T,
  ): T {
    try {
      const result = this.parseJsonOutput<T>(output);

      // Validate expected format if specified
      if (expectedFormat === 'array' && !Array.isArray(result)) {
        console.warn(`Expected array but got ${typeof result}, falling back`);
        return fallbackValue ?? ([] as T);
      }

      if (expectedFormat === 'object' && (typeof result !== 'object' || Array.isArray(result))) {
        console.warn(`Expected object but got ${typeof result}, falling back`);
        return fallbackValue ?? ({} as T);
      }

      return result;
    } catch (error) {
      console.warn(
        `Failed to parse package manager JSON output: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return fallbackValue ?? ([] as T);
    }
  }

  /**
   * Get environment variables for package manager execution
   */
  protected async getEnvironmentVariables(
    options: InstallOptions = {},
  ): Promise<Record<string, string>> {
    let mount = this.volumeController.getMount(this.name);

    // If no mount exists, create one automatically
    if (!mount) {
      console.warn(`[${this.constructor.name}] No mount found for ${this.name}, creating one...`);
      try {
        mount = await this.volumeController.mount(this.name);
      } catch (mountError) {
        console.error(`[${this.constructor.name}] Failed to create mount:`, mountError);
        throw new PackageManagerError(
          `Failed to create mount for package manager: ${this.name}`,
          'MOUNT_CREATION_FAILED',
          `Mount error: ${mountError instanceof Error ? mountError.message : 'Unknown error'}`,
          mountError instanceof Error ? mountError : new Error(String(mountError)),
        );
      }
    }

    if (!mount) {
      throw new PackageManagerError(
        `Failed to create mount for package manager: ${this.name}`,
        'MOUNT_CREATION_FAILED',
        'Mount returned null or undefined',
      );
    }

    const env: Record<string, string> = {
      // Set cache directory to mounted volume
      [`${this.name.toUpperCase()}_CACHE_DIR`]: mount.cachePath,
      ...options.env,
    };

    // Inherit current environment (especially PATH), filtering out undefined values
    // and npm-specific variables that can cause issues with shell execution
    for (const [key, value] of Object.entries(process.env)) {
      // Skip npm-specific variables that can pollute the environment
      if (key.startsWith('npm_')) {
        continue;
      }

      // Skip variables with invalid bash identifiers (containing hyphens)
      if (key.includes('-')) {
        continue;
      }

      if (value !== undefined && !(key in env)) {
        env[key] = value;
      }
    }

    return Promise.resolve(env);
  }

  /**
   * Build command arguments from options
   */
  protected buildCommandArgs(options: InstallOptions = {}): string[] {
    const args: string[] = [];

    if (options.dev) {
      args.push('--dev');
    }

    if (options.force) {
      args.push('--force-reinstall');
    }

    if (options.index) {
      args.push('--index-url', options.index);
    }

    if (options.extraArgs) {
      args.push(...options.extraArgs);
    }

    return args;
  }

  /**
   * Resolve project directory
   */
  protected resolveProjectDir(projectDir?: string): string {
    return projectDir ? resolve(projectDir) : this.projectDir;
  }
}

/**
 * Package manager adapter factory
 */
export class PackageManagerAdapterFactory {
  private static readonly adapters = new Map<
    PackageManager,
    new (
      shellRPC: ShellRPC,
      volumeController: VolumeController,
      environment: EnvironmentInfo,
      projectDir?: string,
    ) => PackageManagerAdapter
  >();

  /**
   * Register a package manager adapter with validation
   */
  public static register(
    name: PackageManager,
    adapterClass: new (
      shellRPC: ShellRPC,
      volumeController: VolumeController,
      environment: EnvironmentInfo,
      projectDir?: string,
    ) => PackageManagerAdapter,
  ): void {
    // Validate that the adapter class extends BasePackageManagerAdapter
    if (!adapterClass.prototype || !(adapterClass.prototype instanceof BasePackageManagerAdapter)) {
      throw new PackageManagerError(
        `Invalid adapter class for ${name}`,
        'INVALID_ADAPTER_CLASS',
        'Adapter must extend BasePackageManagerAdapter',
      );
    }

    // Warn if overwriting existing adapter
    if (this.adapters.has(name)) {
      console.warn(`Overwriting existing adapter for package manager: ${name}`);
    }

    this.adapters.set(name, adapterClass);
  }

  /**
   * Create an adapter instance
   */
  public static create(
    name: PackageManager,
    shellRPC: ShellRPC,
    volumeController: VolumeController,
    environment: EnvironmentInfo,
    projectDir?: string,
  ): PackageManagerAdapter {
    const AdapterClass = this.adapters.get(name);

    if (!AdapterClass) {
      throw new PackageManagerError(
        `No adapter registered for package manager: ${name}`,
        'ADAPTER_NOT_FOUND',
        `Available adapters: ${Array.from(this.adapters.keys()).join(', ')}`,
      );
    }

    return new AdapterClass(shellRPC, volumeController, environment, projectDir);
  }

  /**
   * Get all registered adapter names
   */
  public static getRegisteredAdapters(): PackageManager[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Auto-detect the appropriate package manager for a project
   */
  public static async autoDetect(
    projectDir: string,
    shellRPC: ShellRPC,
    volumeController: VolumeController,
    environment: EnvironmentInfo,
  ): Promise<PackageManagerAdapter[]> {
    const detected: Array<{ adapter: PackageManagerAdapter; result: DetectionResult }> = [];

    for (const name of this.adapters.keys()) {
      try {
        const adapter = this.create(name, shellRPC, volumeController, environment, projectDir);
        const result = await adapter.detectProject(projectDir);

        if (result.detected) {
          detected.push({ adapter, result });
        }
      } catch (error) {
        // Skip adapters that fail to initialize
        console.warn(`Failed to initialize ${name} adapter:`, error);
      }
    }

    // Sort by confidence score (highest first)
    detected.sort((a, b) => b.result.confidence - a.result.confidence);

    return detected.map(({ adapter }) => adapter);
  }
}
