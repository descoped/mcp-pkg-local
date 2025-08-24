/**
 * Pip Package Manager Adapter for Bottles Architecture
 *
 * pip is the traditional Python package installer and the standard way to
 * install Python packages from the Python Package Index (PyPI) and other sources.
 *
 * Key features:
 * - Requirements.txt parsing with full pip syntax
 * - Support for constraints files (-c)
 * - Editable installs (-e)
 * - Index URL configuration
 * - pip-compile integration (if pip-tools installed)
 * - Cross-platform cache management
 */

import { join, resolve, dirname } from 'node:path';
import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';

import { PACKAGE_MANAGER_TIMEOUTS } from './timeouts.js';
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
import type { VolumeMount } from '#bottles/volume-controller';

/**
 * Package metadata extracted from setup.py, setup.cfg, or pyproject.toml
 */
interface PackageMetadata {
  name?: string;
  version?: string;
  description?: string;
  author?: string | { name: string; email?: string };
  license?: string;
  python_requires?: string;
  install_requires?: string[];
  extras_require?: Record<string, string[]>;
  optional_dependencies?: Record<string, string[]>;
  dependencies?: string[];
  [key: string]: unknown;
}

/**
 * Parsed requirement entry from requirements.txt
 */
interface RequirementEntry {
  /** Package name */
  name: string;
  /** Version specification (e.g., '>=1.0.0', '==2.1.0') */
  version: string;
  /** Whether this is an editable install */
  editable: boolean;
  /** Source URL for VCS or URL installs */
  url?: string;
  /** Environment markers (e.g., python_version >= '3.8') */
  markers?: string;
  /** Extras (e.g., requests[security]) */
  extras?: string[];
  /** Original line from requirements file */
  originalLine: string;
  /** Whether this is a development dependency */
  isDev?: boolean;
}

/**
 * pip list JSON output format
 */
interface PipListItem {
  name: string;
  version: string;
  editable_project_location?: string;
  installer?: string;
}

/**
 * pip package manager adapter implementation
 */
export class PipAdapter extends BasePackageManagerAdapter {
  public readonly name = 'pip' as const;
  public readonly displayName = 'pip';
  public readonly executable = 'pip';
  public readonly manifestFiles = [
    'requirements.txt',
    'requirements-dev.txt',
    'requirements-test.txt',
    'dev-requirements.txt',
    'setup.py',
    'setup.cfg',
    'pyproject.toml',
  ];
  public readonly lockFiles = ['requirements-lock.txt', 'requirements.lock', 'pip-compile.lock'];

  /**
   * Detect if pip is used in the project
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

    let confidence = 0.4; // Base confidence for having any manifest files (increased from 0.3)
    const metadata: Record<string, unknown> = {};

    // Higher confidence for requirements.txt files
    const requirementFiles = manifestFiles.filter(
      (f) => f.includes('requirements') && f.endsWith('.txt'),
    );

    if (requirementFiles.length > 0) {
      confidence = 0.8;
      metadata.hasRequirements = true;
      metadata.requirementFiles = requirementFiles.length;
    }

    // Check for setup.py/setup.cfg (traditional Python packaging)
    const hasSetupPy = manifestFiles.some((f) => f.endsWith('setup.py'));
    const hasSetupCfg = manifestFiles.some((f) => f.endsWith('setup.cfg'));

    if (hasSetupPy || hasSetupCfg) {
      confidence = Math.max(confidence, 0.7);
      metadata.hasSetupFiles = true;
    }

    // Check for pyproject.toml but lower confidence than UV/Poetry
    const pyprojectPath = manifestFiles.find((f) => f.endsWith('pyproject.toml'));
    if (pyprojectPath) {
      try {
        const content = await readFile(pyprojectPath, 'utf8');

        // Look for pip-specific markers or lack of other tool markers
        if (
          !content.includes('[tool.uv]') &&
          !content.includes('[tool.poetry]') &&
          !content.includes('[tool.pipenv]')
        ) {
          confidence = Math.max(confidence, 0.6);
          metadata.hasPyprojectToml = true;
        } else {
          // Lower confidence if other tools are present
          confidence = Math.min(confidence, 0.4);
        }
      } catch {
        confidence = Math.max(confidence, 0.5);
      }
    }

    // Check for pip-tools specific files
    if (lockFiles.length > 0) {
      confidence = Math.max(confidence, 0.9);
      metadata.hasLockFiles = true;
    }

    // Check for virtual environment
    const venvPaths = ['.venv', 'venv', 'env'];
    for (const venvPath of venvPaths) {
      try {
        await access(join(dir, venvPath), constants.F_OK);
        confidence = Math.max(confidence, 0.7);
        metadata.hasVenv = true;
        break;
      } catch {
        // Continue checking other paths
      }
    }

    return {
      detected: confidence > 0.5,
      confidence,
      manifestFiles,
      lockFiles,
      metadata,
    };
  }

  /**
   * Parse requirements.txt and other manifest files
   */
  public async parseManifest(projectDir: string): Promise<Manifest | undefined> {
    const manifestFiles = await this.findManifestFiles(projectDir);

    if (manifestFiles.length === 0) {
      // Return undefined when no manifest found
      return undefined;
    }

    const dependencies: Record<string, string> = {};
    const devDependencies: Record<string, string> = {};
    const optionalDependencies: Record<string, string> = {};

    let projectName: string | undefined = undefined;
    let projectVersion: string | undefined = undefined;
    let projectDescription: string | undefined = undefined;
    let pythonRequires: string | undefined = undefined;
    let author: string | { name: string; email?: string } | undefined = undefined;
    let license: string | undefined = undefined;

    // Parse each manifest file
    for (const manifestFile of manifestFiles) {
      const filename = manifestFile.split('/').pop() ?? '';

      try {
        if (filename.includes('requirements') && filename.endsWith('.txt')) {
          // Parse requirements.txt files
          const requirements = await this.parseRequirementsFile(manifestFile);
          const isDev = filename.includes('dev') || filename.includes('test');

          for (const req of requirements) {
            const targetDeps = isDev ? devDependencies : dependencies;
            targetDeps[req.name] = req.version;
          }
        } else if (filename === 'setup.py') {
          // Parse setup.py for project metadata
          const setupInfo = await this.parseSetupPy(manifestFile);
          projectName = setupInfo.name ?? projectName;
          projectVersion = setupInfo.version ?? projectVersion;
          projectDescription = setupInfo.description ?? projectDescription;
          pythonRequires = setupInfo.python_requires ?? pythonRequires;
          author = setupInfo.author ?? author;
          license = setupInfo.license ?? license;

          // Add install_requires as dependencies
          if (setupInfo.install_requires) {
            for (const req of setupInfo.install_requires) {
              const parsed = this.parseVersionSpec(req);
              dependencies[parsed.name] = parsed.constraint ?? parsed.version;
            }
          }

          // Add extras_require as optional dependencies
          if (setupInfo.extras_require && typeof setupInfo.extras_require === 'object') {
            for (const [extra, deps] of Object.entries(setupInfo.extras_require)) {
              if (Array.isArray(deps)) {
                for (const req of deps) {
                  // deps is typed as string[], so req is always string
                  const parsed = this.parseVersionSpec(req);
                  optionalDependencies[`${parsed.name}[${extra}]`] =
                    parsed.constraint ?? parsed.version;
                }
              }
            }
          }
        } else if (filename === 'setup.cfg') {
          // Parse setup.cfg for project metadata
          const setupCfgInfo = await this.parseSetupCfg(manifestFile);
          projectName = setupCfgInfo.name ?? projectName;
          projectVersion = setupCfgInfo.version ?? projectVersion;
          projectDescription = setupCfgInfo.description ?? projectDescription;
          pythonRequires = setupCfgInfo.python_requires ?? pythonRequires;
          author = setupCfgInfo.author ?? author;
          license = setupCfgInfo.license ?? license;

          // Add install_requires as dependencies
          if (setupCfgInfo.install_requires && Array.isArray(setupCfgInfo.install_requires)) {
            for (const req of setupCfgInfo.install_requires) {
              // install_requires is typed as string[], so req is always string
              const parsed = this.parseVersionSpec(req);
              dependencies[parsed.name] = parsed.constraint ?? parsed.version;
            }
          }
        } else if (filename === 'pyproject.toml') {
          // Parse pyproject.toml for project metadata (PEP 621)
          const pyprojectInfo = await this.parsePyprojectToml(manifestFile);
          projectName = pyprojectInfo.name ?? projectName;
          projectVersion = pyprojectInfo.version ?? projectVersion;
          projectDescription = pyprojectInfo.description ?? projectDescription;
          pythonRequires = pyprojectInfo.python_requires ?? pythonRequires;
          author = pyprojectInfo.author ?? author;
          license = pyprojectInfo.license ?? license;

          // Add dependencies from pyproject.toml
          if (pyprojectInfo.dependencies && Array.isArray(pyprojectInfo.dependencies)) {
            for (const req of pyprojectInfo.dependencies) {
              // dependencies is typed as string[], so req is always string
              const parsed = this.parseVersionSpec(req);
              dependencies[parsed.name] = parsed.constraint ?? parsed.version;
            }
          }

          // Add optional dependencies
          if (
            pyprojectInfo.optional_dependencies &&
            typeof pyprojectInfo.optional_dependencies === 'object'
          ) {
            for (const [group, deps] of Object.entries(pyprojectInfo.optional_dependencies)) {
              if (Array.isArray(deps)) {
                for (const req of deps) {
                  // deps is typed as string[], so req is always string
                  const parsed = this.parseVersionSpec(req);
                  optionalDependencies[`${parsed.name}[${group}]`] =
                    parsed.constraint ?? parsed.version;
                }
              }
            }
          }
        }
      } catch (error) {
        console.warn(
          `[PipAdapter] Failed to parse ${manifestFile}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    return {
      name: projectName,
      version: projectVersion,
      description: projectDescription,
      dependencies,
      devDependencies,
      optionalDependencies,
      pythonRequires,
      author: typeof author === 'object' ? author.name : author,
      license,
      metadata: {
        manifestFiles: manifestFiles.map((f) => f.split('/').pop()),
        hasRequirements:
          Object.keys(dependencies).length > 0 || Object.keys(devDependencies).length > 0,
        hasSetupFiles: manifestFiles.some((f) => f.endsWith('setup.py') || f.endsWith('setup.cfg')),
        hasPyprojectToml: manifestFiles.some((f) => f.endsWith('pyproject.toml')),
      },
    };
  }

  /**
   * Install packages using pip
   */
  public async installPackages(packages: string[], options: InstallOptions = {}): Promise<void> {
    const args = this.buildPipInstallArgs(options);
    const env = await this.getEnvironmentVariables(options);
    const cwd = options.cwd ?? this.projectDir;

    // Get the activation prefix for virtual environment
    const activationPrefix = await this.getVenvActivationPrefix(cwd);
    const pipExecutable = this.getPipExecutable(cwd);

    let command: string;

    if (packages.length === 0) {
      // Install from requirements files
      const requirementFiles = await this.findRequirementsFiles(cwd);
      if (requirementFiles.length === 0) {
        throw new PackageManagerError(
          'No packages specified and no requirements files found',
          'NO_REQUIREMENTS',
          'Specify packages to install or create a requirements.txt file',
        );
      }

      const installArgs = requirementFiles.map((f) => `-r "${f}"`).join(' ');
      command = `${activationPrefix}${pipExecutable} install ${args.join(' ')} ${installArgs}`;
    } else {
      // Install specific packages - quote each package to handle version specifiers
      const quotedPackages = packages.map((pkg) => `"${pkg}"`).join(' ');
      command = `${activationPrefix}${pipExecutable} install ${args.join(' ')} ${quotedPackages}`;
    }

    if (process.env.DEBUG_BOTTLES) {
      // Debug: Running install command
      // console.log(`[PipAdapter] Running install command: ${command}`);
    }

    await this.executeCommand(command, {
      cwd,
      env,
      timeout: PACKAGE_MANAGER_TIMEOUTS.standard, // Inactivity timeout - resets on download/install progress
    });
  }

  /**
   * Get the correct pip executable
   * The environment detection has already determined which command works
   */
  private getPipExecutable(_projectDir: string): string {
    // Use the injected environment
    if (this.environment.pip.command) {
      return this.environment.pip.command;
    }

    // This shouldn't happen if environment detection worked
    // Default to pip3 (more likely on modern systems)
    return 'pip3';
  }

  /**
   * Uninstall packages using pip
   */
  public async uninstallPackages(
    packages: string[],
    options: Omit<InstallOptions, 'dev' | 'optional'> = {},
  ): Promise<void> {
    const env = await this.getEnvironmentVariables(options);
    const cwd = options.cwd ?? this.projectDir;
    const args = options.extraArgs ?? [];

    // Get the activation prefix for virtual environment
    const activationPrefix = await this.getVenvActivationPrefix(cwd);
    const pipExecutable = this.getPipExecutable(cwd);

    // Quote packages to handle special characters
    const quotedPackages = packages.map((pkg) => `"${pkg}"`).join(' ');
    const command = `${activationPrefix}${pipExecutable} uninstall -y ${args.join(' ')} ${quotedPackages}`;

    await this.executeCommand(command, {
      cwd,
      env,
      timeout: PACKAGE_MANAGER_TIMEOUTS.standard, // Activity-based timeout
    });
  }

  /**
   * Get list of installed packages
   */
  public async getInstalledPackages(projectDir?: string): Promise<PackageInfo[]> {
    const resolvedDir = this.resolveProjectDir(projectDir);
    const env = await this.getEnvironmentVariables();

    // Check if virtual environment exists first
    const venvPaths = ['.venv', 'venv', 'env'];
    let hasVenv = false;
    for (const venvPath of venvPaths) {
      const venvDir = join(resolvedDir, venvPath);
      try {
        await access(venvDir, constants.F_OK);
        hasVenv = true;
        break;
      } catch {
        // Continue checking
      }
    }

    if (!hasVenv) {
      // Return empty array when no virtual environment exists
      // This allows graceful handling in tests and production
      return [];
    }

    // Get the activation prefix for virtual environment
    const activationPrefix = await this.getVenvActivationPrefix(resolvedDir);
    const pipExecutable = this.getPipExecutable(resolvedDir);

    // Use pip list --format json to get installed packages
    const result = await this.executeCommand(
      `${activationPrefix}${pipExecutable} list --format json`,
      {
        cwd: resolvedDir,
        env,
        suppressErrors: true,
      },
    );

    if (result.exitCode !== 0) {
      throw new PackageManagerError(
        'Failed to list installed packages',
        'LIST_FAILED',
        'Ensure pip is installed and a virtual environment is activated',
      );
    }

    try {
      // Parse JSON output using base class method
      const packages = this.parsePackageManagerJson<PipListItem[]>(result.stdout, 'array', []);

      // Parse manifest to determine dev/optional status
      const parsedManifest = await this.parseManifest(resolvedDir);
      const manifest: Manifest = parsedManifest ?? {
        dependencies: {},
        devDependencies: {},
        optionalDependencies: {},
      };

      return packages.map((pkg) => ({
        name: pkg.name,
        version: pkg.version,
        location: pkg.editable_project_location ?? 'site-packages',
        isDev: pkg.name in manifest.devDependencies,
        isOptional: Object.keys(manifest.optionalDependencies).some((key) =>
          key.startsWith(pkg.name),
        ),
        metadata: {
          editable: !!pkg.editable_project_location,
          installer: pkg.installer ?? 'pip',
          manager: 'pip',
        },
      }));
    } catch (error) {
      // Re-throw PackageManagerError as-is, wrap other errors
      if (error instanceof PackageManagerError) {
        throw error;
      }

      throw new PackageManagerError(
        `Failed to get installed packages: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'LIST_ERROR',
        'Check that pip is installed and accessible',
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Create a virtual environment using python -m venv
   */
  public async createEnvironment(projectDir: string, pythonVersion?: string): Promise<void> {
    const env = await this.getEnvironmentVariables();

    // Detect the correct Python command
    let pythonCmd = 'python';
    if (pythonVersion) {
      pythonCmd = `python${pythonVersion}`;
    } else {
      // Try python3 first, then python
      for (const cmd of ['python3', 'python']) {
        try {
          const result = await this.shellRPC.execute(`which ${cmd}`, 1000);
          if (result.exitCode === 0 && !result.timedOut) {
            pythonCmd = cmd;
            break;
          }
        } catch {
          // Continue to next command
        }
      }
    }

    // Create .venv directory in the project
    // Use --clear to remove existing virtual environment without prompting
    const venvPath = join(projectDir, '.venv');
    const command = `${pythonCmd} -m venv --clear "${venvPath}"`;

    await this.executeCommand(command, {
      cwd: projectDir,
      env,
      timeout: PACKAGE_MANAGER_TIMEOUTS.standard, // Inactivity timeout - resets on progress output
    });

    // Upgrade pip in the new environment using activation
    const activationPrefix = await this.getVenvActivationPrefix(projectDir);

    try {
      await this.executeCommand(`${activationPrefix}pip install --upgrade pip`, {
        cwd: projectDir,
        env,
        timeout: PACKAGE_MANAGER_TIMEOUTS.standard, // Pip upgrade timeout
      });
    } catch (error) {
      console.warn(
        `[PipAdapter] Failed to upgrade pip in new environment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get environment variables for activating pip environment
   */
  public async activateEnvironment(projectDir: string): Promise<Record<string, string>> {
    let venvPath = join(projectDir, '.venv');

    // Check if environment exists
    try {
      await access(venvPath, constants.F_OK);
    } catch {
      // Try other common venv names
      const altPaths = ['venv', 'env'];
      let found = false;

      for (const altPath of altPaths) {
        const altVenvPath = join(projectDir, altPath);
        try {
          await access(altVenvPath, constants.F_OK);
          venvPath = altVenvPath;
          found = true;
          break;
        } catch {
          // Continue searching
        }
      }

      if (!found) {
        throw new PackageManagerError(
          'Virtual environment not found',
          'VENV_NOT_FOUND',
          `Run 'python -m venv .venv' in ${projectDir} to create a virtual environment`,
        );
      }
    }

    // Return environment variables for activation
    const isWindows = process.platform === 'win32';
    const binDir = isWindows ? 'Scripts' : 'bin';
    const pythonExe = isWindows ? 'python.exe' : 'python';

    return {
      VIRTUAL_ENV: venvPath,
      PATH: `${join(venvPath, binDir)}${isWindows ? ';' : ':'}${process.env.PATH ?? ''}`,
      PYTHON: join(venvPath, binDir, pythonExe),
      PIP_REQUIRE_VIRTUALENV: 'true',
    };
  }

  /**
   * Override getCachePaths to use pip's cache locations
   */
  public getCachePaths(): Promise<CachePaths> {
    // First try to get the mount from volume controller
    let mount: VolumeMount | undefined;

    try {
      mount = this.volumeController.getMount(this.name);
    } catch (error) {
      console.warn(
        `[PipAdapter] Failed to get mount from volume controller: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    if (mount?.cachePath) {
      return Promise.resolve({
        global: mount.cachePath,
        local: mount.cachePath,
        temp: join(mount.cachePath, 'temp'),
        additional: [join(mount.cachePath, 'wheels'), join(mount.cachePath, 'http')],
      });
    }

    // Fallback to pip's default cache location
    const homeDir = process.env.HOME ?? process.env.USERPROFILE ?? '';
    const defaultCache =
      process.platform === 'win32'
        ? join(process.env.LOCALAPPDATA ?? homeDir, 'pip', 'cache')
        : join(homeDir, '.cache', 'pip');

    return Promise.resolve({
      global: defaultCache,
      local: join(this.projectDir, '.pip-cache'),
      temp: join(defaultCache, 'temp'),
      additional: [join(defaultCache, 'wheels'), join(defaultCache, 'http')],
    });
  }

  /**
   * Enhanced validation for pip
   */
  public async validateInstallation(
    projectDir: string = this.projectDir,
  ): Promise<ValidationResult> {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Get the correct pip executable (venv or system)
    const pipExecutable = this.getPipExecutable(projectDir);

    if (process.env.DEBUG_BOTTLES || process.env.CI) {
      // Debug: validateInstallation using executable
      // console.log(`[PipAdapter] validateInstallation using executable: ${pipExecutable}`);
    }

    const environment: Record<string, unknown> = {
      packageManager: this.name,
      projectDir,
      executable: pipExecutable,
    };

    try {
      // Check if pip is installed and get version
      const versionResult = await this.executeCommand(`${pipExecutable} --version`, {
        cwd: projectDir,
        suppressErrors: true,
      });

      if (versionResult.exitCode !== 0) {
        issues.push('pip is not installed or not accessible');
      } else {
        const versionMatch = /pip\s+(\d+\.\d+\.\d+)/.exec(versionResult.stdout);
        if (versionMatch?.[1]) {
          const version = versionMatch[1];
          environment.pipVersion = version;

          // Check for old pip versions
          const versionParts = version.split('.');
          const majorStr = versionParts[0];
          if (majorStr) {
            const major = Number(majorStr);
            if (!isNaN(major) && major < 21) {
              warnings.push(
                `pip version ${version} is outdated. Consider upgrading with 'pip install --upgrade pip'.`,
              );
            }
          }
        }
      }

      // Check for Python (try python3 first, then python)
      let pythonCmd = 'python';
      for (const cmd of ['python3', 'python']) {
        const testResult = await this.executeCommand(`which ${cmd}`, {
          cwd: projectDir,
          suppressErrors: true,
        });
        if (testResult.exitCode === 0) {
          pythonCmd = cmd;
          break;
        }
      }

      const pythonResult = await this.executeCommand(`${pythonCmd} --version`, {
        cwd: projectDir,
        suppressErrors: true,
      });

      if (pythonResult.exitCode !== 0) {
        issues.push('Python is not installed or not accessible');
      } else {
        environment.pythonVersion = pythonResult.stdout.trim();
      }

      // Check for project files
      const manifestFiles = await this.findManifestFiles(projectDir);
      if (manifestFiles.length === 0) {
        warnings.push('No pip manifest files found. Consider creating a requirements.txt file.');
      } else {
        environment.hasManifest = true;
        environment.manifestFiles = manifestFiles.length;
      }

      // Check for virtual environment
      const venvPaths = ['.venv', 'venv', 'env'];
      let hasVenv = false;

      for (const venvPath of venvPaths) {
        try {
          await access(join(projectDir, venvPath), constants.F_OK);
          hasVenv = true;
          environment.venvPath = venvPath;
          break;
        } catch {
          // Continue checking
        }
      }

      if (!hasVenv) {
        warnings.push(
          "No virtual environment found. Consider running 'python -m venv .venv' to create one.",
        );
      } else {
        environment.hasVenv = true;
      }

      // Check pip cache
      const cachePaths = await this.getCachePaths();
      try {
        await access(cachePaths.global, constants.F_OK);
        environment.hasCache = true;
      } catch {
        warnings.push('pip cache directory not found. This is normal for first-time use.');
      }

      // Check for pip-tools (optional)
      try {
        const pipToolsResult = await this.executeCommand('pip-compile --version', {
          cwd: projectDir,
          suppressErrors: true,
        });

        if (pipToolsResult.exitCode === 0) {
          environment.hasPipTools = true;
          environment.pipToolsVersion = pipToolsResult.stdout.trim();
        }
      } catch {
        // pip-tools is optional
      }
    } catch (error) {
      issues.push(
        `Failed to validate pip installation: ${error instanceof Error ? error.message : String(error)}`,
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
   * Parses a requirements.txt file following pip's specification
   * @param filePath - Absolute path to requirements.txt file
   * @returns Array of parsed requirement entries
   * @throws {PackageManagerError} If file cannot be read
   * @see https://pip.pypa.io/en/stable/reference/requirements-file-format/
   * @internal
   */
  private async parseRequirementsFile(filePath: string): Promise<RequirementEntry[]> {
    const content = await readFile(filePath, 'utf8');
    const lines = content.split('\n');
    const requirements: RequirementEntry[] = [];

    for (let line of lines) {
      line = line.trim();

      // Skip empty lines and comments
      if (!line || line.startsWith('#')) {
        continue;
      }

      // Handle includes (-r other-requirements.txt)
      if (line.startsWith('-r ') || line.startsWith('--requirement ')) {
        const includeFile = line.replace(/^-r\s+|^--requirement\s+/, '').trim();
        const includePath = resolve(dirname(filePath), includeFile);

        try {
          const includedRequirements = await this.parseRequirementsFile(includePath);
          requirements.push(...includedRequirements);
        } catch (error) {
          console.warn(
            `[PipAdapter] Failed to parse included requirements file ${includeFile}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
        continue;
      }

      // Handle constraints (-c constraints.txt) - skip for dependency parsing
      if (line.startsWith('-c ') || line.startsWith('--constraint ')) {
        continue;
      }

      // Handle index URLs (skip for dependency parsing)
      if (
        line.startsWith('--index-url') ||
        line.startsWith('--extra-index-url') ||
        line.startsWith('--find-links') ||
        line.startsWith('--trusted-host')
      ) {
        continue;
      }

      // Parse requirement line
      const requirement = this.parseRequirementLine(line);
      if (requirement) {
        requirements.push(requirement);
      }
    }

    return requirements;
  }

  /**
   * Parses a single requirement line from requirements.txt
   * @param line - Line to parse (comments and whitespace removed)
   * @returns Parsed requirement entry or null if invalid
   * @internal
   */
  private parseRequirementLine(line: string): RequirementEntry | null {
    // Remove inline comments (but preserve #egg= parameters)
    const commentIndex = line.indexOf('#');
    if (commentIndex !== -1 && !line.includes('#egg=')) {
      line = line.substring(0, commentIndex).trim();
    }

    if (!line) return null;

    const originalLine = line;
    let editable = false;
    let url: string | undefined = undefined;

    // Handle editable installs (-e)
    if (line.startsWith('-e ') || line.startsWith('--editable ')) {
      editable = true;
      line = line.replace(/^-e\s+|^--editable\s+/, '').trim();
    }

    // Handle VCS URLs (git+https://, git+ssh://, etc.)
    const vcsMatch = /^(git\+|hg\+|svn\+|bzr\+)([^#]+)(?:#egg=([^&\s]+))?/.exec(line);
    if (vcsMatch?.[0]) {
      url = vcsMatch[0];
      const eggName = vcsMatch[3];

      if (eggName) {
        return {
          name: this.normalizePackageName(eggName),
          version: '*',
          editable,
          url,
          originalLine,
        };
      } else {
        // Try to extract package name from URL if no egg parameter
        const urlPart = vcsMatch[2];
        if (urlPart) {
          const urlNameMatch = /\/([^/]+?)(?:\.git)?(?:[/@].*)?$/.exec(urlPart);
          if (urlNameMatch?.[1]) {
            return {
              name: this.normalizePackageName(urlNameMatch[1]),
              version: '*',
              editable,
              url,
              originalLine,
            };
          }
        }

        console.warn(
          `[PipAdapter] VCS requirement missing egg name and could not extract from URL: ${line}`,
        );
        return null;
      }
    }

    // Handle direct URLs
    // Note: http:// URLs are supported for compatibility with legacy requirements
    // but should be upgraded to https:// when possible for security
    if (line.startsWith('https://') || line.startsWith('http://') || line.startsWith('file://')) {
      url = line;

      // First check for #egg= parameter (highest priority)
      const eggMatch = /#egg=([^&\s]+)/.exec(line);
      if (eggMatch?.[1]) {
        return {
          name: this.normalizePackageName(eggMatch[1]),
          version: '*',
          editable,
          url,
          originalLine,
        };
      }

      // Try to extract package name from URL filename
      // First try with version: package-1.0.0.whl or package-1.0.0.tar.gz
      let urlMatch = /\/([^/]+)-[\d.]+.*\.(whl|tar\.gz)$/.exec(line);
      if (urlMatch?.[1]) {
        return {
          name: this.normalizePackageName(urlMatch[1]),
          version: '*',
          editable,
          url,
          originalLine,
        };
      }

      // Try without version: package.whl or package.tar.gz
      urlMatch = /\/([^/]+)\.(whl|tar\.gz)$/.exec(line);
      if (urlMatch?.[1]) {
        return {
          name: this.normalizePackageName(urlMatch[1]),
          version: '*',
          editable,
          url,
          originalLine,
        };
      }

      console.warn(`[PipAdapter] Cannot determine package name from URL: ${line}`);
      return null;
    }

    // Handle local file paths
    if (line.startsWith('.') || line.startsWith('/') || /^[A-Za-z]:/.test(line)) {
      // Local path - try to determine package name
      const pathParts = line.split(/[/\\]/);
      const lastPart = pathParts[pathParts.length - 1];

      if (lastPart) {
        return {
          name: this.normalizePackageName(lastPart),
          version: '*',
          editable,
          originalLine,
        };
      } else {
        console.warn(`[PipAdapter] Cannot determine package name from path: ${line}`);
        return null;
      }
    }

    // Handle standard package specifications
    // Format: package[extra1,extra2]>=1.0.0,<2.0.0; python_version >= "3.8"

    // Extract environment markers
    let markers: string | undefined;
    const markerMatch = /;\s*(.+)$/.exec(line);
    if (markerMatch?.[1] && markerMatch.index !== undefined) {
      markers = markerMatch[1].trim();
      line = line.substring(0, markerMatch.index).trim();
    }

    // Extract extras
    let extras: string[] | undefined;
    const extrasMatch = /^([^[]+)\[([^\]]+)](.*)$/.exec(line);
    if (extrasMatch?.[1] && extrasMatch[2] && extrasMatch[3] !== undefined) {
      extras = extrasMatch[2].split(',').map((e) => e.trim());
      line = extrasMatch[1] + extrasMatch[3];
    }

    // Parse name and version specification
    const parsed = this.parseVersionSpec(line);

    return {
      name: parsed.name,
      version: parsed.constraint ?? parsed.version,
      editable,
      url,
      markers,
      extras,
      originalLine,
    };
  }

  /**
   * Override parseVersionSpec to handle VCS and URL dependencies properly
   */
  protected parseVersionSpec(spec: string): { name: string; version: string; constraint?: string } {
    // Handle VCS URLs (git+, hg+, svn+, bzr+)
    if (
      spec.includes('git+') ||
      spec.includes('hg+') ||
      spec.includes('svn+') ||
      spec.includes('bzr+')
    ) {
      // Extract package name from egg parameter if present
      const eggMatch = /egg=([^&\s#]+)/.exec(spec);
      if (eggMatch?.[1]) {
        return {
          name: this.normalizePackageName(eggMatch[1]),
          version: '*',
        };
      }

      // Try to extract from URL path (improved pattern)
      const urlMatch =
        /(?:git\+|hg\+|svn\+|bzr\+)(?:https?|ssh|git):\/\/[^/]+\/(?:[^/]+\/)*?([^/.]+?)(?:\.git)?(?:[/@#].*)?$/.exec(
          spec,
        );
      if (urlMatch?.[1]) {
        return {
          name: this.normalizePackageName(urlMatch[1]),
          version: '*',
        };
      }

      // Extract from Github-style URLs
      const githubMatch = /github\.com[/:]([\w-]+)\/([\w-]+)/.exec(spec);
      if (githubMatch?.[2]) {
        return {
          name: this.normalizePackageName(githubMatch[2]),
          version: '*',
        };
      }

      // Fallback: use a generic name
      console.warn(`[PipAdapter] Could not extract package name from VCS URL: ${spec}`);
      return {
        name: 'vcs-package',
        version: '*',
      };
    }

    // Handle direct URLs (http://, https://, file://)
    // Note: http:// URLs are supported for compatibility but should use https:// when possible
    if (spec.startsWith('http://') || spec.startsWith('https://') || spec.startsWith('file://')) {
      // First try to extract package name from egg parameter
      const eggMatch = /[#&]egg=([^&\s#]+)/.exec(spec);
      if (eggMatch?.[1]) {
        return {
          name: this.normalizePackageName(eggMatch[1]),
          version: '*',
        };
      }

      // Try to extract package name from URL
      const urlParts = spec.split('/');
      const filename = urlParts[urlParts.length - 1]?.split('?')[0]?.split('#')[0];
      if (filename) {
        // Remove common file extensions and extract package name
        let nameMatch = filename.replace(/\.(whl|tar\.gz|zip|egg)$/, '');

        // For wheel files, extract name from filename pattern: package-version-...
        if (filename.endsWith('.whl') || filename.includes('-')) {
          const packageMatch = /^([^-]+)/.exec(nameMatch);
          if (packageMatch?.[1]) {
            nameMatch = packageMatch[1];
          }
        }

        if (nameMatch && nameMatch !== filename && nameMatch !== '') {
          return {
            name: this.normalizePackageName(nameMatch),
            version: '*',
          };
        }
      }

      console.warn(`[PipAdapter] Could not extract package name from URL: ${spec}`);
      return {
        name: 'url-package',
        version: '*',
      };
    }

    // Fall back to base class implementation for normal package specs
    return super.parseVersionSpec(spec);
  }

  /**
   * Parse setup.py for project metadata (basic parsing)
   */
  private async parseSetupPy(filePath: string): Promise<PackageMetadata> {
    const content = await readFile(filePath, 'utf8');
    const metadata: PackageMetadata = {};

    // Simple regex-based parsing for common setup.py patterns
    const patterns = {
      name: /name\s*=\s*["']([^"']+)["']/,
      version: /version\s*=\s*["']([^"']+)["']/,
      description: /description\s*=\s*["']([^"']+)["']/,
      author: /author\s*=\s*["']([^"']+)["']/,
      license: /license\s*=\s*["']([^"']+)["']/,
      python_requires: /python_requires\s*=\s*["']([^"']+)["']/,
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = pattern.exec(content);
      if (match?.[1]) {
        metadata[key] = match[1];
      }
    }

    // Parse install_requires list
    const installRequiresMatch = /install_requires\s*=\s*\[([\s\S]*?)]/.exec(content);
    if (installRequiresMatch?.[1]) {
      const requiresContent = installRequiresMatch[1];
      metadata.install_requires =
        requiresContent.match(/["']([^"']+)["']/g)?.map((match) => match.replace(/["']/g, '')) ??
        [];
    }

    // Parse extras_require dict
    const extrasRequireMatch = /extras_require\s*=\s*\{([\s\S]*?)}/.exec(content);
    if (extrasRequireMatch?.[1]) {
      const extrasContent = extrasRequireMatch[1];
      const extras: Record<string, string[]> = {};

      // Simple parsing of extras_require dict
      const extraMatches = extrasContent.matchAll(/["']([^"']+)["']\s*:\s*\[([\s\S]*?)]/g);
      for (const match of extraMatches) {
        if (match[1] && match[2] !== undefined) {
          const extraName = match[1];
          const extraContent = match[2];
          extras[extraName] =
            extraContent.match(/["']([^"']+)["']/g)?.map((m) => m.replace(/["']/g, '')) ?? [];
        }
      }

      metadata.extras_require = extras;
    }

    return metadata;
  }

  /**
   * Parse setup.cfg for project metadata
   */
  private async parseSetupCfg(filePath: string): Promise<PackageMetadata> {
    const content = await readFile(filePath, 'utf8');
    const metadata: PackageMetadata = {};

    // Parse INI-style configuration
    const lines = content.split('\n');
    let currentSection = '';

    for (let line of lines) {
      line = line.trim();

      if (!line || line.startsWith('#')) continue;

      // Section headers
      if (line.startsWith('[') && line.endsWith(']')) {
        currentSection = line.slice(1, -1);
        continue;
      }

      // Key-value pairs
      const keyValue = /^([^=]+?)\s*=\s*(.*)$/.exec(line);
      if (!keyValue?.[1] || keyValue[2] === undefined) continue;

      const key = keyValue[1].trim();
      const value = keyValue[2].trim();

      if (currentSection === 'metadata') {
        if (key === 'name') metadata.name = value;
        else if (key === 'version') metadata.version = value;
        else if (key === 'description') metadata.description = value;
        else if (key === 'author') metadata.author = value;
        else if (key === 'license') metadata.license = value;
        else if (key === 'python_requires') metadata.python_requires = value;
      } else if (currentSection === 'options') {
        if (key === 'install_requires') {
          // Multi-line install_requires
          const requires: string[] = [];
          let i = lines.indexOf(line) + 1;

          // Collect subsequent indented lines
          while (i < lines.length) {
            const currentLine = lines[i];
            if (!currentLine) {
              break;
            }
            const nextLine = currentLine.trim();
            if (!nextLine || nextLine.startsWith('[') || !currentLine.startsWith(' ')) {
              break;
            }
            if (nextLine && !nextLine.startsWith('#')) {
              requires.push(nextLine);
            }
            i++;
          }

          // Also include current line if it has requirements
          if (value) {
            requires.unshift(value);
          }

          metadata.install_requires = requires;
        }
      }
    }

    return metadata;
  }

  /**
   * Parse pyproject.toml for project metadata (basic TOML parsing)
   */
  private async parsePyprojectToml(filePath: string): Promise<PackageMetadata> {
    const content = await readFile(filePath, 'utf8');
    const metadata: PackageMetadata = {};

    // Simple regex-based parsing for PEP 621 project metadata
    const projectSectionMatch = /\[project]([\s\S]*?)(?=\n\[|\n$|$)/.exec(content);
    if (!projectSectionMatch?.[1]) {
      return metadata;
    }

    const projectSection = projectSectionMatch[1];

    // Parse basic fields
    metadata.name = this.extractTomlString(projectSection, 'name');
    metadata.version = this.extractTomlString(projectSection, 'version');
    metadata.description = this.extractTomlString(projectSection, 'description');
    metadata.license = this.extractTomlLicense(projectSection);
    metadata.python_requires = this.extractTomlString(projectSection, 'requires-python');

    // Parse dependencies array
    metadata.dependencies = this.extractTomlArray(projectSection, 'dependencies');

    // Parse authors (handle both array of objects and array of strings)
    const authorsMatch = /authors\s*=\s*\[([\s\S]*?)]/.exec(projectSection);
    if (authorsMatch?.[1]) {
      const authorsContent = authorsMatch[1];

      // Try to parse as object with name and email
      const objectMatch = /{\s*name\s*=\s*"([^"]+)"(?:\s*,\s*email\s*=\s*"([^"]*)")?\s*}/.exec(
        authorsContent,
      );
      if (objectMatch?.[1]) {
        const name = objectMatch[1];
        const email = objectMatch[2];
        metadata.author = email ? { name, email } : name;
      } else {
        // Try to parse as simple string
        const stringMatch = /"([^"]+)"/.exec(authorsContent);
        if (stringMatch?.[1]) {
          metadata.author = stringMatch[1];
        }
      }
    }

    // Parse optional-dependencies
    const optionalDepsMatch = /\[project\.optional-dependencies]([\s\S]*?)(?=\n\[|\n$|$)/.exec(
      content,
    );
    if (optionalDepsMatch?.[1]) {
      const optionalSection = optionalDepsMatch[1];
      const optionalDeps: Record<string, string[]> = {};

      // Parse each optional dependency group
      const groupMatches = optionalSection.matchAll(/(\w+)\s*=\s*\[([\s\S]*?)]/g);
      for (const match of groupMatches) {
        if (match[1] && match[2] !== undefined) {
          const groupName = match[1];
          const depsContent = match[2];
          optionalDeps[groupName] = this.parseTomlStringArray(depsContent);
        }
      }

      metadata.optional_dependencies = optionalDeps;
    }

    return metadata;
  }

  /**
   * Extract a string value from TOML content
   */
  private extractTomlString(content: string, key: string): string | undefined {
    // Match key at the beginning of a line (after optional whitespace)
    const match = new RegExp(`^\\s*${key}\\s*=\\s*"([^"]*)"`, 'im').exec(content);
    return match?.[1] ?? undefined;
  }

  /**
   * Extract an array value from TOML content
   */
  private extractTomlArray(content: string, key: string): string[] | undefined {
    // Match key at the beginning of a line (after optional whitespace)
    const match = new RegExp(`^\\s*${key}\\s*=\\s*\\[([\\s\\S]*?)\\]`, 'im').exec(content);
    if (!match?.[1]) return undefined;

    return this.parseTomlStringArray(match[1]);
  }

  /**
   * Extract license value from TOML content (handles both string and {text="value"} formats)
   */
  private extractTomlLicense(content: string): string | undefined {
    // Try {text = "value"} format first (PEP 621)
    const objectMatch = /license\s*=\s*{\s*text\s*=\s*"([^"]+)"\s*}/i.exec(content);
    if (objectMatch?.[1]) {
      return objectMatch[1];
    }

    // Try {file = "path"} format
    const fileMatch = /license\s*=\s*{\s*file\s*=\s*"([^"]+)"\s*}/i.exec(content);
    if (fileMatch?.[1]) {
      // For now, just return the filename - in a full implementation you'd read the file
      return fileMatch[1];
    }

    // Fall back to simple string format
    return this.extractTomlString(content, 'license');
  }

  /**
   * Parse a TOML string array
   */
  private parseTomlStringArray(arrayContent: string): string[] {
    const strings: string[] = [];
    const matches = arrayContent.matchAll(/"([^"]*)"/g);

    for (const match of matches) {
      if (match[1] !== undefined) {
        strings.push(match[1]);
      }
    }

    return strings;
  }

  /**
   * Build pip install command arguments
   */
  private buildPipInstallArgs(options: InstallOptions): string[] {
    const args: string[] = [];

    if (options.force) {
      args.push('--force-reinstall');
    }

    if (options.index) {
      args.push('--index-url', options.index);
    }

    // pip-specific options
    if (options.extraArgs) {
      args.push(...options.extraArgs);
    }

    return args;
  }

  /**
   * Find all requirements files in the project
   */
  private async findRequirementsFiles(projectDir: string): Promise<string[]> {
    const requirementFiles: string[] = [];
    const manifestFiles = await this.findManifestFiles(projectDir);

    for (const file of manifestFiles) {
      const filename = file.split('/').pop() ?? '';
      if (filename.includes('requirements') && filename.endsWith('.txt')) {
        requirementFiles.push(file);
      }
    }

    return requirementFiles;
  }

  /**
   * Override getEnvironmentVariables to set pip-specific variables
   */
  protected override async getEnvironmentVariables(
    options: InstallOptions = {},
  ): Promise<Record<string, string>> {
    // Get base environment variables (this handles mount creation)
    const baseEnv = await super.getEnvironmentVariables(options);
    const cachePaths = await this.getCachePaths();

    return {
      ...baseEnv,
      // Set pip cache directory to mounted volume or fallback to default
      PIP_CACHE_DIR: baseEnv.PIP_CACHE_DIR ?? cachePaths.global,
      PIP_DISABLE_PIP_VERSION_CHECK: '1', // Reduce noise
      PIP_NO_COLOR: '1', // Disable colors for cleaner output
      // Always ensure clean output for JSON parsing
      NO_COLOR: '1',
      PIP_PROGRESS_BAR: 'off',
      FORCE_COLOR: '0',
      // Include any custom env vars from options (override base)
      ...options.env,
    };
  }
}
