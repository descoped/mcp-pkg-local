/**
 * UV Package Manager Adapter for Bottles Architecture
 *
 * UV is a Rust-based Python package manager that's 10-100x faster than pip.
 * It serves as a full replacement for pip, poetry, and pipenv.
 *
 * Key features:
 * - Ultra-fast dependency resolution
 * - Built-in virtual environment management
 * - Lock file generation (uv.lock)
 * - Workspace support for monorepos
 * - Superior caching system
 *
 * Best Practices:
 * - Always use `uv sync` or `uv sync --all-groups` for installing dependencies
 * - Use `uv add` for adding new packages (not `uv pip install`)
 * - Use `uv sync -U` to update all packages to latest versions
 * - Activate venv with `source .venv/bin/activate` to avoid needing `uv run` prefix
 * - Never mix pip and uv commands - they don't stay in sync
 */

import { join } from 'node:path';
import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import * as TOML from 'smol-toml';

import { PACKAGE_MANAGER_TIMEOUTS } from './timeouts.js';
import type { EnvironmentInfo } from '#bottles/environment-detector';
import {
  BasePackageManagerAdapter,
  PackageManagerError,
  type DetectionResult,
  type Manifest,
  type InstallOptions,
  type PackageInfo,
  type ValidationResult,
  type CachePaths,
} from '#bottles/package-managers/base';
import type { ShellRPC } from '#bottles/shell-rpc';
import type { VolumeController, VolumeMount } from '#bottles/volume-controller';

/**
 * UV specific configuration from pyproject.toml
 */
interface UVProjectConfig {
  name?: string;
  version?: string;
  description?: string;
  dependencies: string[];
  devDependencies: string[];
  optionalDependencies: Record<string, string[]>;
  dependencyGroups?: Record<string, string[]>;
  'python-requires'?: string;
  authors?: Array<{ name: string; email?: string }> | string[];
  license?: string;
  uvSources?: Record<string, unknown>;
  uvIndex?: Record<string, unknown>;
}

/**
 * UV lock file structure (simplified)
 */
interface UVLockFile {
  version: number;
  requires_python?: string;
  resolution_markers?: string[];
  supported_markers?: string[];
  lock_version?: number;
  package?: Array<{
    name: string;
    version: string;
    source?: {
      registry?: string;
      url?: string;
    };
    dependencies?: Array<{
      name: string;
      marker?: string;
    }>;
    requires_dist?: string[];
    requires_python?: string;
    summary?: string;
    wheel?: Array<{
      url: string;
      hash: string;
    }>;
  }>;
}

/**
 * UV package manager adapter implementation
 */
export class UVAdapter extends BasePackageManagerAdapter {
  public readonly name = 'uv' as const;
  public readonly displayName = 'uv';
  public readonly executable = 'uv';
  public readonly manifestFiles = ['pyproject.toml'];
  public readonly lockFiles = ['uv.lock'];

  constructor(
    shellRPC: ShellRPC,
    volumeController: VolumeController,
    environment: EnvironmentInfo,
    projectDir: string = process.cwd(),
  ) {
    super(shellRPC, volumeController, environment, projectDir);
  }

  /**
   * Detect if UV is used in the project
   */
  public async detectProject(dir: string): Promise<DetectionResult> {
    const manifestFiles = await this.findManifestFiles(dir);
    const lockFiles = await this.findLockFiles(dir);

    if (manifestFiles.length === 0) {
      return {
        detected: false,
        confidence: 0.0,
        manifestFiles: [],
        lockFiles: [],
      };
    }

    let confidence = 0.5; // Base confidence for pyproject.toml presence
    const metadata: Record<string, unknown> = {};

    // Higher confidence if uv.lock exists
    if (lockFiles.length > 0) {
      confidence = 0.95;
      metadata.hasLockFile = true;
    }

    // Check pyproject.toml content for UV-specific configuration
    // manifestFiles.length > 0 guaranteed by early return above
    const pyprojectPath = manifestFiles[0];
    if (pyprojectPath) {
      try {
        const content = await readFile(pyprojectPath, 'utf8');

        // Check for dependency-groups (UV's format)
        if (content.includes('[dependency-groups]')) {
          confidence = Math.max(confidence, 0.85);
          metadata.hasDependencyGroups = true;
        }

        // Look for UV-specific tool configuration
        if (content.includes('[tool.uv]')) {
          confidence = Math.max(confidence, 0.9);
          metadata.hasUVConfig = true;
        }

        // Check for UV-specific tool sections
        if (content.includes('[tool.uv.sources]')) {
          confidence = 0.92;
          metadata.hasUVSources = true;
        }

        if (content.includes('[tool.uv.index]')) {
          confidence = Math.max(confidence, 0.9);
          metadata.hasUVIndex = true;
        }

        // Check for UV workspace configuration
        if (content.includes('[tool.uv.workspace]')) {
          confidence = 0.95;
          metadata.isWorkspace = true;
        }

        // Legacy check for old dev-dependencies under tool.uv
        if (content.includes('[tool.uv]') && content.includes('dev-dependencies')) {
          metadata.hasLegacyDevDeps = true;
        }
      } catch {
        // If we can't read the file, lower confidence
        confidence = Math.max(confidence * 0.5, 0.1);
      }
    }

    return {
      detected: confidence >= 0.5,
      confidence,
      manifestFiles,
      lockFiles,
      metadata,
    };
  }

  /**
   * Parse pyproject.toml and uv.lock for manifest information
   */
  public async parseManifest(projectDir: string): Promise<Manifest | undefined> {
    const manifestFiles = await this.findManifestFiles(projectDir);

    if (manifestFiles.length === 0) {
      // Return undefined when no manifest found, don't throw
      return undefined;
    }

    const pyprojectPath = manifestFiles[0];
    if (!pyprojectPath) {
      return undefined;
    }

    try {
      const content = await readFile(pyprojectPath, 'utf8');
      const projectConfig = this.parsePyprojectToml(content);

      // Parse lock file if it exists for more precise dependency info
      const lockFiles = await this.findLockFiles(projectDir);
      let lockData: UVLockFile | null = null;

      if (lockFiles.length > 0) {
        const lockFile = lockFiles[0];
        if (lockFile) {
          try {
            const lockContent = await readFile(lockFile, 'utf8');
            lockData = this.parseUVLockFile(lockContent);
          } catch (error) {
            console.warn(
              `[UVAdapter] Failed to parse uv.lock: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
          }
        }
      }

      // Build dependencies from project config and lock file
      const dependencies: Record<string, string> = {};
      const devDependencies: Record<string, string> = {};
      const optionalDependencies: Record<string, string> = {};

      // Process dependencies from pyproject.toml
      if (projectConfig?.dependencies) {
        for (const dep of projectConfig.dependencies) {
          const parsed = this.parseVersionSpec(dep);
          dependencies[parsed.name] = parsed.constraint ?? parsed.version;
        }
      }

      if (projectConfig?.devDependencies) {
        for (const dep of projectConfig.devDependencies) {
          const parsed = this.parseVersionSpec(dep);
          devDependencies[parsed.name] = parsed.constraint ?? parsed.version;
        }
      }

      if (projectConfig?.optionalDependencies) {
        for (const [group, deps] of Object.entries(projectConfig.optionalDependencies)) {
          for (const dep of deps) {
            const parsed = this.parseVersionSpec(dep);
            optionalDependencies[`${parsed.name}[${group}]`] = parsed.constraint ?? parsed.version;
          }
        }
      }

      // Override with lock file data for precise versions
      const lockPackages = lockData?.package;
      if (lockPackages) {
        for (const pkg of lockPackages) {
          const name = this.normalizePackageName(pkg.name);
          if (name in dependencies) {
            dependencies[name] = pkg.version;
          } else if (name in devDependencies) {
            devDependencies[name] = pkg.version;
          }
        }
      }

      // Handle authors field (can be array of objects or strings)
      let author: string | { name: string; email?: string } | undefined;
      if (projectConfig?.authors && Array.isArray(projectConfig.authors)) {
        const firstAuthor = projectConfig.authors[0];
        if (firstAuthor) {
          // firstAuthor is either a string or an object with name/email
          author = firstAuthor;
        }
      }

      return {
        name: projectConfig?.name,
        version: projectConfig?.version,
        description: projectConfig?.description,
        dependencies,
        devDependencies,
        optionalDependencies,
        pythonRequires: projectConfig?.['python-requires'] ?? lockData?.requires_python,
        author,
        license: projectConfig?.license,
        metadata: {
          hasLockFile: lockFiles.length > 0,
          lockFileVersion: lockData?.lock_version,
          uvVersion: lockData?.version,
          isWorkspace: content.includes('[tool.uv.workspace]'),
        },
      };
    } catch (error) {
      throw new PackageManagerError(
        `Failed to parse pyproject.toml: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'MANIFEST_PARSE_ERROR',
        'Ensure pyproject.toml is valid TOML format and contains required UV configuration',
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Install packages using UV
   */
  public async installPackages(packages: string[], options: InstallOptions = {}): Promise<void> {
    const args = this.buildUVInstallArgs(options);
    const env = await this.getEnvironmentVariables(options);
    const cwd = options.cwd ?? this.projectDir;

    // UV automatically uses .venv if it exists
    // No activation needed - UV handles this internally

    // Detect if we're in a UV project context or simple virtual environment
    const isUVProject = await this.isUVProjectContext(cwd);

    // Check if virtual environment exists for non-project mode
    if (!isUVProject) {
      const venvPath = join(cwd, '.venv');
      const venvExists = await this.fileExists(venvPath);

      if (!venvExists && packages.length > 0) {
        // Create virtual environment if it doesn't exist
        console.error('[UVAdapter] Virtual environment not found, creating one...');
        await this.createEnvironment(cwd);
      }
    }

    let command: string;

    // Debug logging
    if (process.env.CI || process.env.DEBUG_BOTTLES || process.env.DEBUG_SHELL_RPC) {
      /* eslint-disable no-console */
      console.log(`[DEBUG] UVAdapter.installPackages: packages=${JSON.stringify(packages)}`);
      console.log(`[DEBUG] UVAdapter.installPackages: isUVProject=${isUVProject}`);
      console.log(`[DEBUG] UVAdapter.installPackages: cwd=${cwd}`);
      console.log(`[DEBUG] UVAdapter.installPackages: options=${JSON.stringify(options)}`);
      /* eslint-enable no-console */
    }

    if (packages.length === 0) {
      if (isUVProject) {
        // Install from lock file or pyproject.toml using uv sync
        const commandParts = [this.executable, 'sync', ...args].filter(Boolean);
        command = commandParts.join(' ');

        if (process.env.CI || process.env.DEBUG_BOTTLES || process.env.DEBUG_SHELL_RPC) {
          /* eslint-disable no-console */
          console.log(`[DEBUG] UVAdapter.installPackages: Using uv sync command: ${command}`);
          /* eslint-enable no-console */
        }
      } else {
        // No packages to install in simple virtual environment mode
        throw new PackageManagerError(
          'No packages specified for installation',
          'NO_PACKAGES',
          'Provide packages to install or use UV project mode with pyproject.toml',
        );
      }
    } else if (isUVProject) {
      // UV Project Mode: Use uv add/remove commands
      if (options.dev) {
        // Add development dependencies - quote packages to handle version specifiers
        const quotedPackages = packages.map((pkg) => `"${pkg}"`).join(' ');
        const commandParts = [this.executable, 'add', '--dev', ...args, quotedPackages].filter(
          Boolean,
        );
        command = commandParts.join(' ');
      } else {
        // Add regular dependencies - quote packages to handle version specifiers
        const quotedPackages = packages.map((pkg) => `"${pkg}"`).join(' ');
        const commandParts = [this.executable, 'add', ...args, quotedPackages].filter(Boolean);
        command = commandParts.join(' ');
      }
    } else {
      // Virtual Environment Mode: For non-UV projects with venv, still use uv pip install
      // Note: While uv pip install is legacy, it's needed for non-UV projects
      // For UV projects, always use uv add or uv sync
      const quotedPackages = packages.map((pkg) => `"${pkg}"`).join(' ');
      const commandParts = [this.executable, 'pip', 'install', ...args, quotedPackages].filter(
        Boolean,
      );
      command = commandParts.join(' ');
    }

    // Enhanced debug logging for CI and debugging
    if (process.env.CI || process.env.DEBUG_BOTTLES || process.env.DEBUG_SHELL_RPC) {
      /* eslint-disable no-console */
      console.log(`[DEBUG] UVAdapter.installPackages: Executing command: ${command}`);
      console.log(`[DEBUG] UVAdapter.installPackages: Working directory: ${cwd}`);
      console.log(`[DEBUG] UVAdapter.installPackages: Environment variables:`);
      console.log(`  UV_PROJECT_ENVIRONMENT=${env.UV_PROJECT_ENVIRONMENT}`);
      console.log(`  VIRTUAL_ENV=${env.VIRTUAL_ENV}`);
      console.log(`  UV_CACHE_DIR=${env.UV_CACHE_DIR}`);
      console.log(`  PATH=${env.PATH?.substring(0, 200)}...`); // Truncate PATH for readability
      /* eslint-enable no-console */
    }

    try {
      const result = await this.executeCommand(command, {
        cwd,
        env,
        timeout: PACKAGE_MANAGER_TIMEOUTS.standard, // Activity-based timeout, resets on stdout progress
      });

      if (process.env.CI || process.env.DEBUG_BOTTLES || process.env.DEBUG_SHELL_RPC) {
        /* eslint-disable no-console */
        console.log(`[DEBUG] UVAdapter.installPackages: Command completed successfully`);
        console.log(
          `[DEBUG] UVAdapter.installPackages: Stdout length: ${result?.stdout?.length || 0}`,
        );
        console.log(
          `[DEBUG] UVAdapter.installPackages: Stderr length: ${result?.stderr?.length || 0}`,
        );
        /* eslint-enable no-console */
      }
    } catch (error) {
      if (process.env.CI || process.env.DEBUG_BOTTLES || process.env.DEBUG_SHELL_RPC) {
        console.error(`[DEBUG] UVAdapter.installPackages: Command failed with error:`);
        console.error(error);
      }
      throw error;
    }
  }

  /**
   * Uninstall packages using UV
   */
  public async uninstallPackages(
    packages: string[],
    options: Omit<InstallOptions, 'dev' | 'optional'> = {},
  ): Promise<void> {
    const env = await this.getEnvironmentVariables(options);
    const cwd = options.cwd ?? this.projectDir;
    const args = options.extraArgs ?? [];

    // UV automatically uses .venv if it exists
    // No activation needed

    // Detect if we're in a UV project context or simple virtual environment
    const isUVProject = await this.isUVProjectContext(cwd);

    // Quote packages to handle special characters
    const quotedPackages = packages.map((pkg) => `"${pkg}"`).join(' ');

    let command: string;
    if (isUVProject) {
      // UV Project Mode: Use uv remove
      command = `${this.executable} remove ${args.join(' ')} ${quotedPackages}`;
    } else {
      // Virtual Environment Mode: Use uv pip uninstall
      command = `${this.executable} pip uninstall -y ${args.join(' ')} ${quotedPackages}`;
    }

    await this.executeCommand(command, {
      cwd,
      env,
      timeout: PACKAGE_MANAGER_TIMEOUTS.standard, // Uninstall should be fast
    });
  }

  /**
   * Get list of installed packages
   */
  public async getInstalledPackages(projectDir?: string): Promise<PackageInfo[]> {
    const resolvedDir = this.resolveProjectDir(projectDir);
    const env = await this.getEnvironmentVariables();

    // Check if virtual environment exists
    const venvPath = join(resolvedDir, '.venv');
    const hasVenv = await this.fileExists(venvPath);

    if (!hasVenv) {
      // Return empty array when no virtual environment exists
      // This aligns with test expectations and graceful handling
      return [];
    }

    // UV automatically uses .venv if it exists in the project directory
    // No activation prefix needed

    // Debug logging
    if (process.env.DEBUG_BOTTLES || process.env.CI) {
      // Debug: Getting installed packages
      // console.log(`[UVAdapter] Getting installed packages from: ${resolvedDir}`);
      // console.log(`[UVAdapter] Using executable: ${this.executable}`);
    }

    // Use uv pip list to get installed packages
    const result = await this.executeCommand(`${this.executable} pip list --format json`, {
      cwd: resolvedDir,
      env,
      suppressErrors: true,
    });

    if (result.exitCode !== 0) {
      throw new PackageManagerError(
        'Failed to list installed packages',
        'LIST_FAILED',
        'Ensure UV is installed and a virtual environment exists',
      );
    }

    try {
      // Parse JSON output
      interface PipListItem {
        name: string;
        version: string;
        location?: string;
        editable_project_location?: string;
      }

      // Parse JSON output using base class method
      const packages = this.parsePackageManagerJson<PipListItem[]>(result.stdout, 'array', []);

      // Try to parse manifest for dev/optional dependency info, but don't fail if not found
      let manifest: Manifest | undefined = undefined;
      try {
        manifest = await this.parseManifest(resolvedDir);
      } catch {
        // Manifest parsing failed, continue without dev/optional dependency info
      }

      return packages.map((pkg) => ({
        name: pkg.name,
        version: pkg.version,
        // UV doesn't provide location in JSON output, but packages are in the venv
        location: pkg.editable_project_location ?? pkg.location ?? 'site-packages',
        isDev: manifest ? pkg.name in manifest.devDependencies : false,
        isOptional: manifest ? pkg.name in manifest.optionalDependencies : false,
        metadata: {
          editable: !!pkg.editable_project_location,
          manager: 'uv',
        },
      }));
    } catch (error) {
      if (error instanceof PackageManagerError) {
        throw error;
      }

      throw new PackageManagerError(
        `Failed to get installed packages: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'LIST_ERROR',
        'Check that UV is installed and the project has a valid environment',
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Create a virtual environment using UV
   */
  public async createEnvironment(projectDir: string, pythonVersion?: string): Promise<void> {
    const env = await this.getEnvironmentVariables();

    // Build command with --clear to replace existing venv without prompting
    let command = `${this.executable} venv --clear`;
    if (pythonVersion) {
      command += ` --python=${pythonVersion}`;
    }

    // Debug logging
    if (process.env.CI || process.env.DEBUG_BOTTLES || process.env.DEBUG_SHELL_RPC) {
      /* eslint-disable no-console */
      console.log(`[DEBUG] UVAdapter.createEnvironment: Creating virtual environment`);
      console.log(`[DEBUG] UVAdapter.createEnvironment: Project directory: ${projectDir}`);
      console.log(`[DEBUG] UVAdapter.createEnvironment: Command: ${command}`);
      console.log(
        `[DEBUG] UVAdapter.createEnvironment: Python version: ${pythonVersion ?? 'default'}`,
      );
      /* eslint-enable no-console */
    }

    try {
      // UV creates .venv by default in the project directory
      // --clear ensures existing virtual environments are replaced without prompts
      const result = await this.executeCommand(command, {
        cwd: projectDir,
        env,
        timeout: PACKAGE_MANAGER_TIMEOUTS.standard, // Activity-based timeout, resets on progress
      });

      if (process.env.CI || process.env.DEBUG_BOTTLES || process.env.DEBUG_SHELL_RPC) {
        /* eslint-disable no-console */
        console.log(
          `[DEBUG] UVAdapter.createEnvironment: Virtual environment created successfully`,
        );
        console.log(
          `[DEBUG] UVAdapter.createEnvironment: Stdout length: ${result?.stdout?.length || 0}`,
        );
        /* eslint-enable no-console */
      }
    } catch (error) {
      if (process.env.CI || process.env.DEBUG_BOTTLES || process.env.DEBUG_SHELL_RPC) {
        console.error(`[DEBUG] UVAdapter.createEnvironment: Failed to create virtual environment:`);
        console.error(error);
      }
      throw error;
    }
  }

  /**
   * Get environment variables for activating UV environment
   */
  public async activateEnvironment(projectDir: string): Promise<Record<string, string>> {
    const venvPath = join(projectDir, '.venv');

    // Check if environment exists
    try {
      await access(venvPath, constants.F_OK);
    } catch {
      throw new PackageManagerError(
        'Virtual environment not found',
        'VENV_NOT_FOUND',
        `Run 'uv venv' in ${projectDir} to create a virtual environment`,
      );
    }

    // Return environment variables for activation
    const isWindows = process.platform === 'win32';
    const binDir = isWindows ? 'Scripts' : 'bin';
    const pythonExe = isWindows ? 'python.exe' : 'python';

    return {
      VIRTUAL_ENV: venvPath,
      PATH: `${join(venvPath, binDir)}${isWindows ? ';' : ':'}${process.env.PATH ?? ''}`,
      PYTHON: join(venvPath, binDir, pythonExe),
      UV_PYTHON_INSTALL_MIRROR: process.env.UV_PYTHON_INSTALL_MIRROR ?? '',
    };
  }

  /**
   * Override getCachePaths to leverage UV's superior caching
   */
  public getCachePaths(): Promise<CachePaths> {
    // First try to get the mount from volume controller
    let mount: VolumeMount | undefined;

    try {
      mount = this.volumeController.getMount(this.name);
    } catch (error) {
      console.warn(
        `[UVAdapter] Failed to get mount from volume controller: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    if (mount?.cachePath) {
      return Promise.resolve({
        global: mount.cachePath,
        local: mount.cachePath,
        temp: join(mount.cachePath, 'temp'),
        additional: [
          join(mount.cachePath, 'builds'),
          join(mount.cachePath, 'wheels'),
          join(mount.cachePath, 'git'),
        ],
      });
    }

    // Fallback to UV's default cache location
    const homeDir = process.env.HOME ?? process.env.USERPROFILE ?? '';
    const defaultCache =
      process.platform === 'win32'
        ? join(process.env.LOCALAPPDATA ?? homeDir, 'uv', 'cache')
        : join(homeDir, '.cache', 'uv');

    return Promise.resolve({
      global: defaultCache,
      local: join(this.projectDir, '.uv-cache'),
      temp: join(defaultCache, 'temp'),
      additional: [
        join(defaultCache, 'builds'),
        join(defaultCache, 'wheels'),
        join(defaultCache, 'git'),
      ],
    });
  }

  /**
   * Enhanced validation for UV
   */
  public async validateInstallation(
    projectDir: string = this.projectDir,
  ): Promise<ValidationResult> {
    const issues: string[] = [];
    const warnings: string[] = [];
    const environment: Record<string, unknown> = {
      packageManager: this.name,
      projectDir,
      executable: this.executable,
    };

    try {
      // Check if UV is installed and get version
      const versionResult = await this.executeCommand(`${this.executable} --version`, {
        cwd: projectDir,
        suppressErrors: true,
      });

      if (versionResult.exitCode !== 0) {
        issues.push('UV is not installed or not accessible');
      } else {
        const version = versionResult.stdout.trim().replace(/^uv\s+/, '');
        environment.uvVersion = version;

        // Check for minimum version (UV is new, so we expect recent versions)
        const versionRegex = /(\d+)\.(\d+)\.(\d+)/;
        const versionMatch = versionRegex.exec(version);
        if (versionMatch && versionMatch.length >= 4) {
          const versionParts = versionMatch.slice(1, 3);
          const majorStr = versionParts[0];
          const minorStr = versionParts[1];
          if (majorStr && minorStr) {
            const major = parseInt(majorStr, 10);
            const minor = parseInt(minorStr, 10);
            if (!isNaN(major) && !isNaN(minor) && major === 0 && minor < 1) {
              warnings.push(
                `UV version ${version} is very early. Consider upgrading to a more stable version.`,
              );
            }
          }
        }
      }

      // Check for project files
      const manifestFiles = await this.findManifestFiles(projectDir);
      if (manifestFiles.length === 0) {
        warnings.push('No pyproject.toml found. Run `uv init` to initialize a UV project.');
      } else {
        environment.hasManifest = true;

        // Check for lock file
        const lockFiles = await this.findLockFiles(projectDir);
        if (lockFiles.length === 0) {
          warnings.push(
            'No uv.lock found. Run `uv lock` to create a lock file for reproducible installs.',
          );
        } else {
          environment.hasLockFile = true;
        }
      }

      // Check for virtual environment
      const venvPath = join(projectDir, '.venv');
      try {
        await access(venvPath, constants.F_OK);
        environment.hasVenv = true;
      } catch {
        warnings.push('No .venv directory found. Run `uv venv` to create a virtual environment.');
      }

      // Check UV cache
      const cachePaths = await this.getCachePaths();
      try {
        await access(cachePaths.global, constants.F_OK);
        environment.hasCache = true;
      } catch {
        warnings.push('UV cache directory not found. This is normal for first-time use.');
      }
    } catch (error) {
      issues.push(
        `Failed to validate UV installation: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings,
      environment,
    };
  }

  /**
   * Parse UV lock file content
   *
   * UV lock files are TOML format. This method uses smol-toml for robust parsing.
   */
  /**
   * @internal Exposed for testing
   */
  public parseUVLockFile(content: string): UVLockFile | null {
    try {
      // Handle empty content
      if (!content || content.trim() === '') {
        return null;
      }

      // Parse TOML content using smol-toml
      const parsed = TOML.parse(content) as Record<string, unknown>;

      // Normalize to our internal model
      const lockFile: UVLockFile = {
        version: 1,
        package: [],
      };

      // Extract version (top-level field)
      if (typeof parsed.version === 'number') {
        lockFile.version = parsed.version;
      }

      // Extract requires-python if present
      if (typeof parsed['requires-python'] === 'string') {
        lockFile.requires_python = parsed['requires-python'];
      }

      // Extract lock-version if present
      if (typeof parsed['lock-version'] === 'number') {
        lockFile.lock_version = parsed['lock-version'];
      }

      // Extract packages from [[package]] array
      // In TOML, [[package]] creates an array of tables
      const packages = parsed.package;
      if (Array.isArray(packages)) {
        for (const pkg of packages) {
          if (typeof pkg === 'object' && pkg !== null && 'name' in pkg && 'version' in pkg) {
            const pkgObj = pkg as Record<string, unknown>;
            if (typeof pkgObj.name === 'string' && typeof pkgObj.version === 'string') {
              const packageEntry: {
                name: string;
                version: string;
                source?: { registry?: string; url?: string; editable?: string };
                dependencies?: Array<{ name: string; marker?: string }>;
              } = {
                name: pkgObj.name,
                version: pkgObj.version,
              };

              // Add optional source field if present and valid
              if (
                'source' in pkgObj &&
                typeof pkgObj.source === 'object' &&
                pkgObj.source !== null
              ) {
                const src = pkgObj.source as Record<string, unknown>;
                const source: { registry?: string; url?: string; editable?: string } = {};
                if (typeof src.registry === 'string') source.registry = src.registry;
                if (typeof src.url === 'string') source.url = src.url;
                if (typeof src.editable === 'string') source.editable = src.editable;
                if (source.registry || source.url || source.editable) {
                  packageEntry.source = source;
                }
              }

              // Add dependencies if present and valid
              if ('dependencies' in pkgObj && Array.isArray(pkgObj.dependencies)) {
                const deps: Array<{ name: string; marker?: string }> = [];
                // Handle mixed-type array (string | object dependencies)
                type Dependency = string | { name: string; marker?: string };
                const dependencies = pkgObj.dependencies as Dependency[];
                for (const dep of dependencies) {
                  // Use explicit type check to handle mixed types
                  const depType = typeof dep;
                  if (depType === 'string') {
                    // Simple string dependency
                    deps.push({ name: dep as string });
                  } else if (
                    depType === 'object' &&
                    dep !== null &&
                    dep !== undefined &&
                    typeof dep === 'object' &&
                    'name' in dep
                  ) {
                    // Object with name and optional marker
                    const depObj = dep as Record<string, unknown>;
                    if (typeof depObj.name === 'string') {
                      const depEntry: { name: string; marker?: string } = { name: depObj.name };
                      if (typeof depObj.marker === 'string') {
                        depEntry.marker = depObj.marker;
                      }
                      deps.push(depEntry);
                    }
                  }
                }
                if (deps.length > 0) {
                  packageEntry.dependencies = deps;
                }
              }

              lockFile.package?.push(packageEntry);
            }
          }
        }
      }

      // Log unmapped fields for debugging (in development only)
      if (process.env.NODE_ENV === 'development') {
        const knownFields = new Set([
          'version',
          'requires-python',
          'package',
          'options',
          'manifest',
        ]);
        const unknownFields = Object.keys(parsed).filter((key) => !knownFields.has(key));
        if (unknownFields.length > 0) {
          // Use console.warn which is allowed by our ESLint rules
          console.warn('[UVAdapter] Unknown fields in uv.lock:', unknownFields);
        }
      }

      return lockFile;
    } catch (error) {
      console.warn(
        `[UVAdapter] Failed to parse UV lock file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
    }
  }

  /**
   * Parse pyproject.toml content using smol-toml
   * @internal Exposed for testing
   */
  public parsePyprojectToml(content: string): UVProjectConfig | null {
    try {
      // Handle empty content
      if (!content || content.trim() === '') {
        return null;
      }

      const parsed = TOML.parse(content) as Record<string, unknown>;
      const config: UVProjectConfig = {
        dependencies: [],
        devDependencies: [],
        optionalDependencies: {},
      };

      // Extract [project] section
      const project = parsed.project;
      if (typeof project === 'object' && project !== null) {
        const proj = project as Record<string, unknown>;

        // Basic string fields
        if (typeof proj.name === 'string') config.name = proj.name;
        if (typeof proj.version === 'string') config.version = proj.version;
        if (typeof proj.description === 'string') config.description = proj.description;
        if (typeof proj.license === 'string') config.license = proj.license;
        if (typeof proj['requires-python'] === 'string') {
          config['python-requires'] = proj['requires-python'];
        }

        // Dependencies array
        if (Array.isArray(proj.dependencies)) {
          config.dependencies = proj.dependencies.filter((d): d is string => typeof d === 'string');
        }

        // Authors array
        if (Array.isArray(proj.authors)) {
          const authorsList: Array<{ name: string; email?: string }> | string[] = [];

          for (const author of proj.authors) {
            if (typeof author === 'string') {
              // Simple string format (just names)
              (authorsList as string[]).push(author);
            } else if (typeof author === 'object' && author !== null) {
              // Object format with name and optional email
              const authorObj = author as Record<string, unknown>;
              if (typeof authorObj.name === 'string') {
                const entry: { name: string; email?: string } = { name: authorObj.name };
                if (typeof authorObj.email === 'string') {
                  entry.email = authorObj.email;
                }
                (authorsList as Array<{ name: string; email?: string }>).push(entry);
              }
            }
          }

          if (authorsList.length > 0) {
            config.authors = authorsList;
          }
        }

        // Optional dependencies
        const optDeps = proj['optional-dependencies'];
        if (typeof optDeps === 'object' && optDeps !== null) {
          const optionalDeps: Record<string, string[]> = {};
          for (const [key, value] of Object.entries(optDeps)) {
            if (Array.isArray(value)) {
              optionalDeps[key] = value.filter((d): d is string => typeof d === 'string');
            }
          }
          if (Object.keys(optionalDeps).length > 0) {
            config.optionalDependencies = optionalDeps;
          }
        }
      } else {
        // No project section means not a valid pyproject.toml for our purposes
        return null;
      }

      // Extract dependency-groups (UV's format at top level)
      const depGroups = parsed['dependency-groups'];
      if (typeof depGroups === 'object' && depGroups !== null) {
        const groups = depGroups as Record<string, unknown>;

        // Collect all dev-related dependencies
        const devDeps: string[] = [];

        // Common dev group names
        const devGroupNames = ['dev', 'development', 'test', 'testing', 'lint', 'type-check'];

        for (const [groupName, deps] of Object.entries(groups)) {
          if (Array.isArray(deps) && devGroupNames.includes(groupName)) {
            devDeps.push(...deps.filter((d): d is string => typeof d === 'string'));
          }
        }

        if (devDeps.length > 0) {
          config.devDependencies = devDeps;
        }

        // Store all dependency groups for reference
        config.dependencyGroups = groups as Record<string, string[]>;
      }

      // Extract [tool.uv] if present (for sources, index, etc.)
      const tool = parsed.tool;
      if (typeof tool === 'object' && tool !== null) {
        const uv = (tool as Record<string, unknown>).uv;
        if (typeof uv === 'object' && uv !== null) {
          const uvConfig = uv as Record<string, unknown>;

          // UV sources (for editable installs, git sources, etc.)
          if (typeof uvConfig.sources === 'object' && uvConfig.sources !== null) {
            config.uvSources = uvConfig.sources as Record<string, unknown>;
          }

          // UV index configuration
          if (typeof uvConfig.index === 'object' && uvConfig.index !== null) {
            config.uvIndex = uvConfig.index as Record<string, unknown>;
          }

          // UV dev-dependencies (legacy format under [tool.uv])
          if (Array.isArray(uvConfig['dev-dependencies'])) {
            const uvDevDeps = uvConfig['dev-dependencies'].filter(
              (d): d is string => typeof d === 'string',
            );
            // Merge with existing dev dependencies from dependency-groups
            config.devDependencies.push(...uvDevDeps);
          }
        }
      }

      return config;
    } catch (error) {
      console.warn(
        `[UVAdapter] Failed to parse pyproject.toml: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
    }
  }

  /**
   * Build UV-specific install arguments
   */
  private buildUVInstallArgs(options: InstallOptions): string[] {
    const args: string[] = [];

    if (options.force) {
      args.push('--reinstall');
    }

    if (options.index) {
      args.push('--index-url', options.index);
    }

    // UV-specific options
    if (options.extraArgs) {
      args.push(...options.extraArgs);
    }

    return args;
  }

  /**
   * Determine if we're in a UV project context (with pyproject.toml) or simple virtual environment
   */
  private async isUVProjectContext(projectDir: string): Promise<boolean> {
    try {
      const manifestFiles = await this.findManifestFiles(projectDir);
      if (manifestFiles.length === 0) {
        return false;
      }

      // Check if pyproject.toml has project configuration
      const pyprojectPath = manifestFiles[0];
      if (!pyprojectPath) {
        return false;
      }

      const content = await readFile(pyprojectPath, 'utf8');

      // UV project context requires a [project] section with at least name
      const hasProjectSection = /\[project]/.test(content);
      const hasProjectName = /name\s*=\s*["'][^"']+["']/.test(content);

      return hasProjectSection && hasProjectName;
    } catch {
      // If we can't read or parse the file, default to virtual environment mode
      return false;
    }
  }

  /**
   * Get environment variables with UV-specific cache settings
   */
  protected override async getEnvironmentVariables(
    options: InstallOptions = {},
  ): Promise<Record<string, string>> {
    const baseEnv = await super.getEnvironmentVariables(options);
    const cachePaths = await this.getCachePaths();

    // Determine the correct project directory (use cwd from options if provided)
    const projectDir = options.cwd ?? this.projectDir;
    const venvPath = join(projectDir, '.venv');

    // Construct PATH with virtual environment bin directory first
    const venvBinPath =
      process.platform === 'win32' ? join(venvPath, 'Scripts') : join(venvPath, 'bin');

    const currentPath = baseEnv.PATH ?? process.env.PATH ?? '';
    const newPath = `${venvBinPath}${process.platform === 'win32' ? ';' : ':'}${currentPath}`;

    const envVars: Record<string, string> = {
      ...baseEnv,
      UV_CACHE_DIR: cachePaths.global,
      // Point UV to the virtual environment in the correct directory
      UV_PROJECT_ENVIRONMENT: venvPath,
      // Also set VIRTUAL_ENV for compatibility
      VIRTUAL_ENV: venvPath,
      // Update PATH to include virtual environment bin directory
      PATH: newPath,
      // Set UV to prefer system Python installations
      UV_PYTHON_PREFERENCE: 'only-system',
      // Always ensure clean output for JSON parsing
      UV_NO_PROGRESS: '1',
      UV_NO_COLOR: '1',
      NO_COLOR: '1',
      FORCE_COLOR: '0',
      ...options.env,
    };

    // Only set UV_PYTHON_INSTALL_MIRROR if it exists
    if (process.env.UV_PYTHON_INSTALL_MIRROR) {
      envVars.UV_PYTHON_INSTALL_MIRROR = process.env.UV_PYTHON_INSTALL_MIRROR;
    }

    return envVars;
  }
}
