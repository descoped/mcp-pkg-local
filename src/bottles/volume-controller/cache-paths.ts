/**
 * Cross-platform cache path management for different package managers
 */
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { existsSync } from 'node:fs';
import type { PackageManager } from './types.js';

/**
 * Get the default system cache directory for a package manager
 */
export function getSystemCacheDir(manager: PackageManager): string {
  const platform = process.platform;
  const home = homedir();

  switch (manager) {
    case 'npm':
      if (platform === 'win32') {
        return join(home, 'AppData', 'Local', 'npm-cache');
      } else if (platform === 'darwin') {
        return join(home, 'Library', 'Caches', 'npm');
      } else {
        return join(home, '.npm');
      }

    case 'yarn':
      if (platform === 'win32') {
        return join(home, 'AppData', 'Local', 'Yarn', 'Cache');
      } else if (platform === 'darwin') {
        return join(home, 'Library', 'Caches', 'Yarn');
      } else {
        return join(home, '.cache', 'yarn');
      }

    case 'pnpm':
      if (platform === 'win32') {
        return join(home, 'AppData', 'Local', 'pnpm-cache');
      } else if (platform === 'darwin') {
        return join(home, 'Library', 'Caches', 'pnpm');
      } else {
        return join(home, '.cache', 'pnpm');
      }

    case 'bun':
      if (platform === 'win32') {
        return join(home, 'AppData', 'Local', 'bun');
      } else if (platform === 'darwin') {
        return join(home, 'Library', 'Caches', 'bun');
      } else {
        return join(home, '.bun', 'install', 'cache');
      }

    case 'pip':
      if (platform === 'win32') {
        return join(home, 'AppData', 'Local', 'pip', 'Cache');
      } else if (platform === 'darwin') {
        return join(home, 'Library', 'Caches', 'pip');
      } else {
        return join(home, '.cache', 'pip');
      }

    case 'poetry':
      if (platform === 'win32') {
        return join(home, 'AppData', 'Local', 'pypoetry', 'Cache');
      } else if (platform === 'darwin') {
        return join(home, 'Library', 'Caches', 'pypoetry');
      } else {
        return join(home, '.cache', 'pypoetry');
      }

    case 'uv':
      if (platform === 'win32') {
        return join(home, 'AppData', 'Local', 'uv', 'cache');
      } else if (platform === 'darwin') {
        return join(home, 'Library', 'Caches', 'uv');
      } else {
        return join(home, '.cache', 'uv');
      }

    case 'pipenv':
      if (platform === 'win32') {
        return join(home, 'AppData', 'Local', 'pipenv', 'Cache');
      } else {
        return join(home, '.cache', 'pipenv');
      }

    case 'maven':
      return join(home, '.m2', 'repository');

    case 'gradle':
      if (platform === 'win32') {
        return join(home, '.gradle', 'caches');
      } else {
        return join(home, '.gradle', 'caches');
      }

    case 'cargo':
      if (platform === 'win32') {
        return join(home, '.cargo', 'registry');
      } else {
        return join(home, '.cargo', 'registry');
      }

    case 'go':
      if (platform === 'win32') {
        return join(home, 'go', 'pkg', 'mod');
      } else {
        return join(home, 'go', 'pkg', 'mod');
      }

    default:
      throw new Error(`Unknown package manager: ${manager}`);
  }
}

/**
 * Get the bottle cache directory for a package manager
 */
export function getBottleCacheDir(manager: PackageManager, baseCacheDir: string): string {
  return join(baseCacheDir, manager);
}

/**
 * Get the mount path within a bottle for a package manager
 */
export function getMountPath(manager: PackageManager): string {
  switch (manager) {
    case 'npm':
    case 'yarn':
    case 'pnpm':
    case 'bun':
      return '/bottle/npm-cache';

    case 'pip':
    case 'poetry':
    case 'uv':
    case 'pipenv':
      return '/bottle/pip-cache';

    case 'maven':
      return '/bottle/m2';

    case 'gradle':
      return '/bottle/gradle';

    case 'cargo':
      return '/bottle/cargo';

    case 'go':
      return '/bottle/go-mod';

    default:
      return `/bottle/${manager}-cache`;
  }
}

/**
 * Detect which package managers are in use in the current directory
 */
export function detectPackageManagers(projectDir: string = process.cwd()): PackageManager[] {
  const managers: PackageManager[] = [];

  // Node.js package managers
  if (existsSync(join(projectDir, 'package.json'))) {
    managers.push('npm'); // Default

    if (existsSync(join(projectDir, 'yarn.lock'))) {
      managers.push('yarn');
    }
    if (existsSync(join(projectDir, 'pnpm-lock.yaml'))) {
      managers.push('pnpm');
    }
    if (existsSync(join(projectDir, 'bun.lockb'))) {
      managers.push('bun');
    }
  }

  // Python package managers
  if (
    existsSync(join(projectDir, 'requirements.txt')) ||
    existsSync(join(projectDir, 'setup.py')) ||
    existsSync(join(projectDir, 'setup.cfg'))
  ) {
    managers.push('pip');
  }

  if (existsSync(join(projectDir, 'pyproject.toml'))) {
    managers.push('poetry');
    managers.push('uv'); // uv also uses pyproject.toml
  }

  if (existsSync(join(projectDir, 'Pipfile'))) {
    managers.push('pipenv');
  }

  // Java package managers
  if (existsSync(join(projectDir, 'pom.xml'))) {
    managers.push('maven');
  }

  if (
    existsSync(join(projectDir, 'build.gradle')) ||
    existsSync(join(projectDir, 'build.gradle.kts'))
  ) {
    managers.push('gradle');
  }

  // Rust
  if (existsSync(join(projectDir, 'Cargo.toml'))) {
    managers.push('cargo');
  }

  // Go
  if (existsSync(join(projectDir, 'go.mod'))) {
    managers.push('go');
  }

  return managers;
}

/**
 * Validate that a cache directory exists and is accessible
 */
export function validateCacheDir(cachePath: string): boolean {
  try {
    if (!existsSync(cachePath)) {
      return false;
    }

    // Try to resolve the path to check accessibility
    const resolvedPath = resolve(cachePath);
    return existsSync(resolvedPath);
  } catch {
    return false;
  }
}
