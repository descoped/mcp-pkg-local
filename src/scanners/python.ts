import { BaseScanner } from '#scanners/base';
import type { ScanResult, EnvironmentInfo, PackageInfo } from '#types';
import { EnvironmentNotFoundError } from '#types';
import { join, basename } from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export class PythonScanner extends BaseScanner {
  private venvPath: string | null = null;
  private sitePackagesPath: string | null = null;
  private packageCache = new Map<string, PackageInfo>();

  async scan(): Promise<ScanResult> {
    this.log('Starting Python environment scan');

    // Find virtual environment
    const envPath = await this.findVirtualEnvironment();
    if (!envPath) {
      throw new EnvironmentNotFoundError();
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
    // Check cache first
    const cached = this.packageCache.get(packageName);
    if (cached) {
      return cached.location;
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
    ];

    for (const name of possibleNames) {
      const packagePath = join(this.sitePackagesPath, name);
      if ((await this.pathExists(packagePath)) && (await this.isDirectory(packagePath))) {
        return packagePath;
      }
    }

    return null;
  }

  async getPackageVersion(packageName: string): Promise<string | null> {
    // Check cache first
    const cached = this.packageCache.get(packageName);
    if (cached) {
      return cached.version;
    }

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
          const version = await this.extractVersionFromDistInfo(join(this.sitePackagesPath, entry));
          if (version) return version;
        }
      }
    }

    return null;
  }

  async getEnvironmentInfo(): Promise<EnvironmentInfo> {
    if (!this.venvPath) {
      throw new EnvironmentNotFoundError();
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
    // Common site-packages locations
    const possiblePaths = [
      // Unix/macOS
      join(venvPath, 'lib', 'python3.13', 'site-packages'),
      join(venvPath, 'lib', 'python3.12', 'site-packages'),
      join(venvPath, 'lib', 'python3.11', 'site-packages'),
      join(venvPath, 'lib', 'python3.10', 'site-packages'),
      join(venvPath, 'lib', 'python3.9', 'site-packages'),
      // Windows
      join(venvPath, 'Lib', 'site-packages'),
    ];

    // Also check by listing lib directory
    const libPath = join(venvPath, 'lib');
    if ((await this.pathExists(libPath)) && (await this.isDirectory(libPath))) {
      const entries = await this.readDir(libPath);
      for (const entry of entries) {
        if (entry.startsWith('python')) {
          possiblePaths.unshift(join(libPath, entry, 'site-packages'));
        }
      }
    }

    for (const path of possiblePaths) {
      if ((await this.pathExists(path)) && (await this.isDirectory(path))) {
        return path;
      }
    }

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
          const match = stdout.match(/Python (\d+\.\d+\.\d+)/);
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

  private async scanPackages(): Promise<Record<string, PackageInfo>> {
    const sitePackagesPath = this.sitePackagesPath;
    if (!sitePackagesPath) {
      throw new Error('Site-packages path not set');
    }

    const packages: Record<string, PackageInfo> = {};
    const entries = await this.readDir(sitePackagesPath);

    // Process .dist-info directories for metadata
    const distInfoDirs = entries.filter((entry) => entry.endsWith('.dist-info'));

    for (const distInfo of distInfoDirs) {
      const packageInfo = await this.extractPackageInfoFromDistInfo(
        join(sitePackagesPath, distInfo),
      );

      if (packageInfo) {
        packages[packageInfo.name] = packageInfo;
        this.packageCache.set(packageInfo.name, packageInfo);
      }
    }

    // Also check for packages without .dist-info (editable installs, etc.)
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

      // Check if it's a Python package (has __init__.py)
      const initPath = join(entryPath, '__init__.py');
      if (await this.pathExists(initPath)) {
        // If we don't already have info about this package
        if (!packages[entry]) {
          packages[entry] = {
            name: entry,
            version: 'unknown',
            location: entryPath,
          };
        }
      }
    }

    return packages;
  }

  private async extractPackageInfoFromDistInfo(distInfoPath: string): Promise<PackageInfo | null> {
    try {
      const metadataPath = join(distInfoPath, 'METADATA');
      if (!(await this.pathExists(metadataPath))) {
        return null;
      }

      const metadata = await this.readFile(metadataPath);
      const nameMatch = metadata.match(/^Name:\s*(.+)$/m);
      const versionMatch = metadata.match(/^Version:\s*(.+)$/m);

      if (!nameMatch) {
        return null;
      }

      const name = nameMatch[1]?.trim() ?? '';
      const version = versionMatch?.[1]?.trim() ?? 'unknown';

      // Find the actual package directory
      const packageLoc = await this.getPackageLocation(name);
      const location = packageLoc ?? distInfoPath;

      return { name, version, location };
    } catch (error) {
      this.log(`Failed to extract info from ${distInfoPath}:`, error);
      return null;
    }
  }

  private async extractVersionFromDistInfo(distInfoPath: string): Promise<string | null> {
    try {
      const metadataPath = join(distInfoPath, 'METADATA');
      if (!(await this.pathExists(metadataPath))) {
        return null;
      }

      const metadata = await this.readFile(metadataPath);
      const versionMatch = metadata.match(/^Version:\s*(.+)$/m);

      return versionMatch?.[1]?.trim() ?? null;
    } catch {
      return null;
    }
  }
}
