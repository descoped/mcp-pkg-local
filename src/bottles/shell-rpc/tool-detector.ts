/**
 * Dynamic tool detection for bottle environments
 *
 * This module dynamically detects tool locations at runtime instead of
 * hardcoding OS-specific paths. This ensures bottles work regardless of
 * where tools are installed and creates truly minimal environments.
 */

import { execSync } from 'node:child_process';
import { dirname, sep } from 'node:path';
import { existsSync } from 'node:fs';
import { detectPlatform } from './platform.js';

export interface ToolInfo {
  name: string;
  path: string;
  directory: string;
  version?: string;
}

/**
 * Tools required for different package managers
 */
const PACKAGE_MANAGER_TOOLS: Record<string, string[]> = {
  pip: ['python', 'python3', 'pip', 'pip3'],
  uv: ['python', 'python3', 'uv'],
  npm: ['node', 'npm'],
  yarn: ['node', 'yarn'],
  pnpm: ['node', 'pnpm'],
};

/**
 * Essential system tools that should always be available
 */
const ESSENTIAL_TOOLS = ['sh', 'bash', 'which', 'env'];

/**
 * Detects the full path of a tool if available on the system
 * @param tool - Name of the tool to detect (e.g., 'python', 'npm')
 * @returns Full path to the tool or null if not found
 */
export function detectToolLocation(tool: string): string | null {
  const platform = detectPlatform();
  const command = platform === 'win32' ? 'where' : 'which';

  try {
    const result = execSync(`${command} ${tool}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();

    // On Windows, 'where' can return multiple paths
    if (platform === 'win32' && result?.includes('\n')) {
      const firstPath = result.split('\n')[0];
      return firstPath ? firstPath.trim() : null;
    }

    return result || null;
  } catch {
    // Tool not found
    return null;
  }
}

/**
 * Detects multiple tools and returns their availability and paths
 * @param tools - Array of tool names to detect
 * @returns Array of ToolInfo objects with availability and paths
 */
export function detectTools(tools: string[]): ToolInfo[] {
  const detected: ToolInfo[] = [];
  const seen = new Set<string>();

  for (const tool of tools) {
    // Skip if we've already detected this tool
    if (seen.has(tool)) continue;
    seen.add(tool);

    const toolPath = detectToolLocation(tool);
    if (toolPath) {
      detected.push({
        name: tool,
        path: toolPath,
        directory: dirname(toolPath),
      });
    }
  }

  return detected;
}

/**
 * Extracts unique directories from tool paths
 * @param tools - Array of tool names
 * @returns Array of unique directory paths containing the tools
 */
export function getToolDirectories(tools: string[]): string[] {
  const toolInfos = detectTools(tools);
  const directories = new Set<string>();

  for (const info of toolInfos) {
    directories.add(info.directory);
  }

  return Array.from(directories);
}

/**
 * Creates a minimal PATH with only required tools for a package manager
 * @param packageManager - Type of package manager ('pip' or 'uv')
 * @param venvPath - Optional path to virtual environment
 * @returns Minimal PATH string for the environment
 */
export function createMinimalPath(packageManager: string, venvPath?: string): string {
  const platform = detectPlatform();
  const pathSeparator = platform === 'win32' ? ';' : ':';
  const paths: string[] = [];

  // Add virtual environment path first if provided
  if (venvPath) {
    const venvBinDir = platform === 'win32' ? `${venvPath}${sep}Scripts` : `${venvPath}${sep}bin`;

    if (existsSync(venvBinDir)) {
      paths.push(venvBinDir);
    }
  }

  // Get required tools for this package manager
  const requiredTools = PACKAGE_MANAGER_TOOLS[packageManager] ?? [];
  const allTools = [...ESSENTIAL_TOOLS, ...requiredTools];

  // Get directories containing these tools
  const toolDirs = getToolDirectories(allTools);
  paths.push(...toolDirs);

  // Add minimal system paths based on platform
  const minimalSystemPaths = getMinimalSystemPaths(platform);
  for (const sysPath of minimalSystemPaths) {
    if (existsSync(sysPath) && !paths.includes(sysPath)) {
      paths.push(sysPath);
    }
  }

  return paths.join(pathSeparator);
}

/**
 * Get minimal system paths required for basic operation
 */
function getMinimalSystemPaths(platform: NodeJS.Platform): string[] {
  switch (platform) {
    case 'win32':
      return ['C:\\Windows\\System32', 'C:\\Windows'];
    case 'darwin':
      return ['/usr/bin', '/bin'];
    default: // linux and others
      return ['/usr/bin', '/bin'];
  }
}

// Note: Python environment detection functionality has been moved to
// environment-detector.ts for centralized management of all environment detection.
// The detectPythonEnvironment function was removed as it duplicated functionality
// already present in the environment-detector module.

/**
 * Creates environment variables for a bottle execution context
 * @param packageManager - Type of package manager
 * @param projectDir - Project directory path
 * @param customEnv - Optional custom environment variables
 * @returns Complete environment variable map for the bottle
 */
export function createBottleEnvironment(
  packageManager: string,
  projectDir: string,
  customEnv?: Record<string, string>,
): Record<string, string> {
  const platform = detectPlatform();
  const env: Record<string, string> = {};

  // Add essential environment variables
  const essentialVars = ['HOME', 'USER', 'USERNAME', 'LOGNAME', 'SHELL', 'TMPDIR', 'TEMP', 'TMP'];

  for (const key of essentialVars) {
    const value = process.env[key];
    if (value !== undefined) {
      env[key] = value;
    }
  }

  // Platform-specific essentials
  if (platform === 'win32') {
    const winVars = ['SYSTEMROOT', 'WINDIR', 'COMSPEC', 'PATHEXT'];
    for (const key of winVars) {
      const value = process.env[key];
      if (value !== undefined) {
        env[key] = value;
      }
    }
  }

  // Create minimal PATH
  const venvPath = `${projectDir}${sep}.venv`;
  env.PATH = createMinimalPath(packageManager, venvPath);

  // Set virtual environment if it exists
  if (existsSync(venvPath)) {
    env.VIRTUAL_ENV = venvPath;
  }

  // Set non-interactive flags
  env.TERM = 'dumb';
  env.NO_COLOR = '1';
  env.CI = 'true';
  env.NONINTERACTIVE = '1';

  // Python-specific
  if (packageManager === 'pip' || packageManager === 'uv') {
    env.PYTHONDONTWRITEBYTECODE = '1';
    env.PYTHONUNBUFFERED = '1';
  }

  // Merge with custom environment (custom takes precedence)
  if (customEnv) {
    Object.assign(env, customEnv);
  }

  return env;
}
