import { BaseScanner } from '#scanners/base.js';
import type {
  BasicPackageInfo,
  ScanOptions,
  ScanResult,
  EnvironmentInfo,
} from '#scanners/types.js';
import { EnvironmentNotFoundError } from '#types.js';
import { join, basename } from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export class PythonScanner extends BaseScanner {
  // Scanner identification properties
  readonly language = 'python' as const;
  readonly supportedPackageManagers = ['pip', 'poetry', 'uv', 'pipenv', 'conda'] as const;

  private venvPath: string | null = null;
  private sitePackagesPath: string | null = null;
  private cachedPackageManager: string | null = null;

  async scan(_options?: ScanOptions): Promise<ScanResult> {
    this.log('Starting Python environment scan');

    // Find virtual environment
    const envPath = await this.findVirtualEnvironment();
    if (!envPath) {
      // Handle empty environments gracefully - return empty result
      this.log('No virtual environment found, returning empty result');
      return {
        success: true,
        totalPackages: 0,
        packages: {},
        environment: {
          type: 'system',
          path: this.basePath,
        },
        scanTime: new Date().toISOString(),
      };
    }

    this.venvPath = envPath;
    this.log(`Found virtual environment at: ${envPath}`);

    // Find site-packages
    this.sitePackagesPath = await this.findSitePackages(envPath);
    if (!this.sitePackagesPath) {
      throw new Error('Could not find site-packages directory');
    }

    this.log(`Found site-packages at: ${this.sitePackagesPath}`);

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
    // Check cache first using base class method
    const cachedLocation = this.getCachedPackageLocation(packageName);
    if (cachedLocation) {
      return cachedLocation;
    }

    // Ensure we have site-packages path
    if (!this.sitePackagesPath) {
      const envPath = await this.findVirtualEnvironment();
      if (!envPath) return null;
      this.sitePackagesPath = await this.findSitePackages(envPath);
      if (!this.sitePackagesPath) return null;
    }

    // Look for package directory
    const normalizedName = this.normalizePackageName(packageName);
    const possibleNames = [
      packageName,
      normalizedName,
      packageName.replace('-', '_'),
      packageName.replace('_', '-'),
      packageName.toLowerCase(),
      packageName.toLowerCase().replace('-', '_'),
      packageName.toLowerCase().replace('_', '-'),
    ];

    for (const name of possibleNames) {
      const packagePath = join(this.sitePackagesPath, name);
      if (await this.pathExists(packagePath)) {
        // Check if it's a directory
        if (await this.isDirectory(packagePath)) {
          this.log(`Found package directory for ${packageName}: ${packagePath}`);
          return packagePath;
        }
        // For some packages, the main module might be a single .py file
        if (packagePath.endsWith('.py')) {
          this.log(`Found package file for ${packageName}: ${packagePath}`);
          return packagePath;
        }
      }
    }

    // Additional check: look for .py files with the package name
    for (const name of possibleNames) {
      const packageFilePath = join(this.sitePackagesPath, `${name}.py`);
      if (await this.pathExists(packageFilePath)) {
        this.log(`Found package file for ${packageName}: ${packageFilePath}`);
        return packageFilePath;
      }
    }

    return null;
  }

  async getPackageVersion(packageName: string): Promise<string | null> {
    // Try to get full package info and return just the version
    if (!this.sitePackagesPath) {
      const envPath = await this.findVirtualEnvironment();
      if (!envPath) return null;
      this.sitePackagesPath = await this.findSitePackages(envPath);
      if (!this.sitePackagesPath) return null;
    }

    // Look for .dist-info directory
    const entries = await this.readDir(this.sitePackagesPath);
    const normalizedName = this.normalizePackageName(packageName);

    for (const entry of entries) {
      if (entry.endsWith('.dist-info')) {
        const prefix = entry.replace(/[-.]dist-info$/, '').toLowerCase();
        if (prefix === normalizedName || prefix === packageName.toLowerCase()) {
          const packageInfo = await this.extractPackageInfoFromDistInfo(
            join(this.sitePackagesPath, entry),
          );
          return packageInfo?.version ?? null;
        }
      }
    }

    return null;
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

    // Check for .pyi type stub files
    let hasTypes = false;
    try {
      const entries = await this.readDir(packagePath);
      hasTypes = entries.some((entry) => entry.endsWith('.pyi'));
    } catch {
      // Ignore errors checking for type stubs
    }

    return {
      name: packageName,
      version,
      location: packagePath,
      language: 'python',
      packageManager: (await this.detectPackageManager()) ?? 'pip',
      hasTypes,
    };
  }

  async canHandle(basePath: string): Promise<boolean> {
    // Check for virtual environment directories
    const venvDirs = ['.venv', 'venv'];
    for (const dir of venvDirs) {
      if (await this.pathExists(join(basePath, dir))) {
        return true;
      }
    }
    // Also check for Python project files
    const projectFiles = ['pyproject.toml', 'requirements.txt', 'Pipfile', 'environment.yml'];
    for (const file of projectFiles) {
      if (await this.pathExists(join(basePath, file))) {
        return true;
      }
    }
    return false;
  }

  async detectPackageManager(): Promise<string | null> {
    // Return cached result if available
    if (this.cachedPackageManager !== null) {
      return this.cachedPackageManager;
    }

    const basePath = this.basePath;

    // Check for package manager config files
    if (await this.pathExists(join(basePath, 'pyproject.toml'))) {
      const content = await this.readFile(join(basePath, 'pyproject.toml'));
      if (content.includes('[tool.poetry]')) {
        this.cachedPackageManager = 'poetry';
      } else if (content.includes('[tool.uv]') || content.includes('uv.')) {
        this.cachedPackageManager = 'uv';
      } else {
        this.cachedPackageManager = 'pip'; // Default for pyproject.toml
      }
    } else if (await this.pathExists(join(basePath, 'Pipfile'))) {
      this.cachedPackageManager = 'pipenv';
    } else if (await this.pathExists(join(basePath, 'environment.yml'))) {
      this.cachedPackageManager = 'conda';
    } else if (await this.pathExists(join(basePath, 'requirements.txt'))) {
      this.cachedPackageManager = 'pip';
    } else {
      this.cachedPackageManager = 'pip'; // default
    }

    return this.cachedPackageManager;
  }

  async getEnvironmentInfo(): Promise<EnvironmentInfo> {
    // Ensure we have found the virtual environment
    if (!this.venvPath) {
      const envPath = await this.findVirtualEnvironment();
      if (!envPath) {
        throw new EnvironmentNotFoundError();
      }
      this.venvPath = envPath;
    }

    const pythonVersion = await this.getPythonVersion();
    const envType = basename(this.venvPath) as '.venv' | 'venv';

    return {
      type: envType === '.venv' ? '.venv' : 'venv',
      path: this.venvPath,
      pythonVersion,
    };
  }

  private async findVirtualEnvironment(): Promise<string | null> {
    // Check for .venv first, then venv
    const possiblePaths = [join(this.basePath, '.venv'), join(this.basePath, 'venv')];

    for (const path of possiblePaths) {
      if ((await this.pathExists(path)) && (await this.isDirectory(path))) {
        // Verify it's a valid Python venv by checking for bin/python or Scripts/python.exe
        const pythonPaths = [join(path, 'bin', 'python'), join(path, 'Scripts', 'python.exe')];

        for (const pythonPath of pythonPaths) {
          if (await this.pathExists(pythonPath)) {
            return path;
          }
        }
      }
    }

    return null;
  }

  private async findSitePackages(venvPath: string): Promise<string | null> {
    this.log(`Looking for site-packages in virtual environment: ${venvPath}`);

    // First, try the most common locations
    const commonPaths = [
      // Windows
      join(venvPath, 'Lib', 'site-packages'),
      // Unix/macOS with common Python versions (most likely first)
      join(venvPath, 'lib', 'python3.12', 'site-packages'),
      join(venvPath, 'lib', 'python3.11', 'site-packages'),
      join(venvPath, 'lib', 'python3.10', 'site-packages'),
      join(venvPath, 'lib', 'python3.13', 'site-packages'),
      join(venvPath, 'lib', 'python3.9', 'site-packages'),
      join(venvPath, 'lib', 'python3.8', 'site-packages'),
    ];

    // Check common paths first for performance
    for (const path of commonPaths) {
      this.log(`Checking common path: ${path}`);
      if ((await this.pathExists(path)) && (await this.isDirectory(path))) {
        this.log(`Found site-packages at: ${path}`);
        return path;
      }
    }

    // Dynamically discover Python versions by examining the lib directory
    const libPath = join(venvPath, 'lib');
    this.log(`Scanning lib directory for Python versions: ${libPath}`);

    if ((await this.pathExists(libPath)) && (await this.isDirectory(libPath))) {
      try {
        const entries = await this.readDir(libPath);
        this.log(`Found lib directory entries: ${entries.join(', ')}`);

        // Sort by version to prefer newer versions
        const pythonDirs = entries
          .filter((entry) => entry.startsWith('python'))
          .sort((a, b) => b.localeCompare(a)); // Descending order for newer versions first

        for (const pythonDir of pythonDirs) {
          const sitePackagesPath = join(libPath, pythonDir, 'site-packages');
          this.log(`Checking dynamically found path: ${sitePackagesPath}`);

          if (
            (await this.pathExists(sitePackagesPath)) &&
            (await this.isDirectory(sitePackagesPath))
          ) {
            this.log(`Found site-packages at: ${sitePackagesPath}`);
            return sitePackagesPath;
          }
        }
      } catch (error) {
        this.log(`Error scanning lib directory: ${error}`);
      }
    }

    // Last resort: check if there's a pyvenv.cfg file that might tell us the Python version
    const pyvenvConfig = join(venvPath, 'pyvenv.cfg');
    if (await this.pathExists(pyvenvConfig)) {
      try {
        const configContent = await this.readFile(pyvenvConfig);
        const versionMatch = /version\s*=\s*(\d+\.\d+)/.exec(configContent);
        if (versionMatch?.[1]) {
          const pythonVersion = versionMatch[1];
          const configBasedPath = join(venvPath, 'lib', `python${pythonVersion}`, 'site-packages');
          this.log(`Checking pyvenv.cfg-based path: ${configBasedPath}`);

          if (
            (await this.pathExists(configBasedPath)) &&
            (await this.isDirectory(configBasedPath))
          ) {
            this.log(`Found site-packages at: ${configBasedPath}`);
            return configBasedPath;
          }
        }
      } catch (error) {
        this.log(`Error reading pyvenv.cfg: ${error}`);
      }
    }

    this.log(`No site-packages directory found in virtual environment: ${venvPath}`);
    return null;
  }

  private async getPythonVersion(): Promise<string> {
    if (!this.venvPath) {
      return 'unknown';
    }

    try {
      const pythonPaths = [
        join(this.venvPath, 'bin', 'python'),
        join(this.venvPath, 'Scripts', 'python.exe'),
      ];

      for (const pythonPath of pythonPaths) {
        if (await this.pathExists(pythonPath)) {
          const { stdout } = await execAsync(`"${pythonPath}" --version`);
          const match = /Python (\d+\.\d+\.\d+)/.exec(stdout);
          if (match?.[1]) {
            return match[1];
          }
        }
      }
    } catch (error) {
      this.log('Failed to get Python version:', error);
    }

    return 'unknown';
  }

  private async scanPackages(): Promise<Record<string, BasicPackageInfo>> {
    const sitePackagesPath = this.sitePackagesPath;
    if (!sitePackagesPath) {
      throw new Error('Site-packages path not set');
    }

    this.log(`Scanning packages in site-packages: ${sitePackagesPath}`);
    const packages: Record<string, BasicPackageInfo> = {};

    let entries: string[];
    try {
      entries = await this.readDir(sitePackagesPath);
      this.log(`Found ${entries.length} entries in site-packages`);
    } catch (error) {
      this.log(`Error reading site-packages directory: ${error}`);
      return packages;
    }

    // Process .dist-info directories for metadata
    const distInfoDirs = entries.filter((entry) => entry.endsWith('.dist-info'));
    this.log(`Found ${distInfoDirs.length} .dist-info directories: ${distInfoDirs.join(', ')}`);

    for (const distInfo of distInfoDirs) {
      this.log(`Processing dist-info directory: ${distInfo}`);
      const packageInfo = await this.extractPackageInfoFromDistInfo(
        join(sitePackagesPath, distInfo),
      );

      if (packageInfo) {
        this.log(
          `Successfully extracted package info for: ${packageInfo.name} (version: ${packageInfo.version})`,
        );
        packages[packageInfo.name] = packageInfo;
        this.locationCache.set(packageInfo.name, packageInfo.location);
      } else {
        this.log(`Failed to extract package info from: ${distInfo}`);
      }
    }

    // Also check for packages without .dist-info (editable installs, etc.)
    let packageDirCount = 0;
    for (const entry of entries) {
      const entryPath = join(sitePackagesPath, entry);

      // Skip if not a directory or already processed
      if (!(await this.isDirectory(entryPath)) || entry.endsWith('.dist-info')) {
        continue;
      }

      // Skip special directories
      if (entry.startsWith('_') || entry.startsWith('.') || entry === '__pycache__') {
        continue;
      }

      packageDirCount++;

      // Check if it's a Python package (has __init__.py)
      const initPath = join(entryPath, '__init__.py');
      if (await this.pathExists(initPath)) {
        // If we don't already have info about this package
        // Store relative path from project root
        const relativePath = this.toRelativePath(entryPath);
        if (!packages[entry]) {
          packages[entry] = {
            name: entry,
            version: 'unknown',
            location: relativePath,
            language: 'python',
            packageManager: 'pip',
          };
          this.log(`Added package without .dist-info: ${entry}`);
        }
      }
    }

    this.log(`Processed ${packageDirCount} potential package directories`);

    const packageNames = Object.keys(packages);
    this.log(`Found ${packageNames.length} packages total: ${packageNames.join(', ')}`);

    // Log detailed package info for debugging
    for (const [name, info] of Object.entries(packages)) {
      this.log(
        `Package details - ${name}: version=${info.version}, location=${info.location}, hasTypes=${info.hasTypes ?? false}`,
      );
    }

    return packages;
  }

  private async extractPackageInfoFromDistInfo(
    distInfoPath: string,
  ): Promise<BasicPackageInfo | null> {
    try {
      const metadataPath = join(distInfoPath, 'METADATA');
      if (!(await this.pathExists(metadataPath))) {
        this.log(`METADATA file not found in ${distInfoPath}`);
        return null;
      }

      const metadata = await this.readFile(metadataPath);
      const nameMatch = /^Name:\s*(.+)$/m.exec(metadata);
      const versionMatch = /^Version:\s*(.+)$/m.exec(metadata);

      if (!nameMatch) {
        this.log(`No Name field found in METADATA for ${distInfoPath}`);
        return null;
      }

      const name = nameMatch[1]?.trim() ?? '';
      const version = versionMatch?.[1]?.trim() ?? 'unknown';

      if (!name) {
        this.log(`Empty name extracted from ${distInfoPath}`);
        return null;
      }

      // Find the actual package directory - but don't fail if we can't find it
      let packageLoc: string | null = null;
      try {
        packageLoc = await this.getPackageLocation(name);
      } catch (error) {
        this.log(`Error getting package location for ${name}: ${error}`);
      }

      let location: string;

      if (packageLoc) {
        location = packageLoc;
        this.log(`Found package directory for ${name}: ${packageLoc}`);
      } else {
        // Fallback: some packages might not have traditional directory structure
        // Use the dist-info directory as the location
        location = distInfoPath;
        this.log(`Using dist-info as location for ${name}: ${distInfoPath}`);
      }

      // Store relative path from project root
      let relativeLoc: string;
      try {
        relativeLoc = this.toRelativePath(location);
      } catch (error) {
        this.log(`Error converting to relative path for ${name}, using absolute path: ${error}`);
        relativeLoc = location;
      }

      // Get package manager (with fallback)
      let packageManager = 'pip';
      try {
        packageManager = (await this.detectPackageManager()) ?? 'pip';
      } catch (error) {
        this.log(`Error detecting package manager for ${name}, using 'pip': ${error}`);
      }

      const packageInfo = {
        name,
        version,
        location: relativeLoc,
        language: 'python' as const,
        packageManager,
      };

      this.log(`Successfully extracted package info for ${name} (version: ${version})`);
      return packageInfo;
    } catch (error) {
      this.log(`Failed to extract info from ${distInfoPath}:`, error);
      return null;
    }
  }
}
