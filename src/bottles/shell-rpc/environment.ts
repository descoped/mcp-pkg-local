/**
 * Environment management for clean and isolated shell sessions
 */
import { existsSync } from 'node:fs';
import { detectPlatform } from './platform.js';
import { createMinimalPath, detectTools } from './tool-detector.js';

/**
 * Essential environment variables for basic shell operation
 */
const ESSENTIAL_VARS = {
  common: [
    'HOME',
    'USER',
    'USERNAME',
    'LOGNAME',
    'SHELL',
    'TERM',
    'LANG',
    'LC_ALL',
    'LC_CTYPE',
    'TZ',
    'TMPDIR',
    'TEMP',
    'TMP',
  ],
  win32: [
    'SYSTEMROOT',
    'WINDIR',
    'COMSPEC',
    'PATHEXT',
    'SYSTEMDRIVE',
    'HOMEDRIVE',
    'HOMEPATH',
    'APPDATA',
    'LOCALAPPDATA',
    'PROGRAMFILES',
    'PROGRAMFILES(X86)',
    'COMMONPROGRAMFILES',
    'USERPROFILE',
    'ALLUSERSPROFILE',
    'PUBLIC',
  ],
  unix: ['PWD', 'OLDPWD', 'HOSTNAME', 'HOSTTYPE', 'OSTYPE', 'MACHTYPE', 'SHLVL'],
};

// Note: DEFAULT_PATHS is now deprecated in favor of dynamic detection
// Keeping for reference but will be removed in future versions

/**
 * Create a clean environment with only essential variables
 */
export function createCleanEnvironment(
  customEnv?: Record<string, string>,
  preservePaths?: string[],
  packageManager?: string,
): Record<string, string> {
  const plat = detectPlatform();
  const cleanEnv: Record<string, string> = {};

  // Add essential variables from current environment
  const essentials = [
    ...ESSENTIAL_VARS.common,
    ...(plat === 'win32' ? ESSENTIAL_VARS.win32 : ESSENTIAL_VARS.unix),
  ];

  for (const key of essentials) {
    const value = process.env[key];
    if (value !== undefined) {
      cleanEnv[key] = value;
    }
  }

  // Build clean PATH dynamically
  const pathSeparator = plat === 'win32' ? ';' : ':';
  const pathComponents: string[] = [];

  // Add preserved paths (at the beginning for priority)
  if (preservePaths && preservePaths.length > 0) {
    pathComponents.push(...preservePaths);
  }

  // If package manager specified, create minimal path for it
  if (packageManager) {
    const minimalPath = createMinimalPath(packageManager);
    pathComponents.push(...minimalPath.split(pathSeparator));
  } else {
    // Detect common tools dynamically
    const commonTools = ['python', 'python3', 'pip', 'pip3', 'node', 'npm', 'uv'];
    const detectedTools = detectTools(commonTools);

    // Add directories containing detected tools
    const toolDirs = new Set<string>();
    for (const tool of detectedTools) {
      toolDirs.add(tool.directory);
    }
    pathComponents.push(...Array.from(toolDirs));

    // Add minimal system paths
    const systemPaths =
      plat === 'win32' ? ['C:\\Windows\\System32', 'C:\\Windows'] : ['/usr/bin', '/bin'];

    for (const sysPath of systemPaths) {
      if (existsSync(sysPath)) {
        pathComponents.push(sysPath);
      }
    }
  }

  // Remove duplicates while preserving order (keep first occurrence)
  const seen = new Set<string>();
  const uniquePaths: string[] = [];
  for (const path of pathComponents) {
    if (!seen.has(path)) {
      seen.add(path);
      uniquePaths.push(path);
    }
  }
  cleanEnv.PATH = uniquePaths.join(pathSeparator);

  // Add shell configuration for non-interactive mode
  cleanEnv.TERM = 'dumb';
  cleanEnv.NO_COLOR = '1';
  cleanEnv.CI = 'true';
  cleanEnv.NONINTERACTIVE = '1';

  // Merge with custom environment (custom takes precedence)
  if (customEnv) {
    Object.assign(cleanEnv, customEnv);
  }

  return cleanEnv;
}

/**
 * Create standard environment (inherits from parent process)
 */
export function createStandardEnvironment(
  customEnv?: Record<string, string>,
): Record<string, string> {
  const env: Record<string, string | undefined> = {
    ...process.env,
    ...customEnv,
    // Disable interactive prompts and colors
    TERM: 'dumb',
    NO_COLOR: '1',
    CI: 'true',
  };

  // Remove any problematic environment variables
  delete env.PS1;
  delete env.PROMPT;
  delete env.PROMPT_COMMAND;

  // Filter out undefined values
  const cleanEnv: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    if (value !== undefined) {
      cleanEnv[key] = value;
    }
  }

  return cleanEnv;
}

/**
 * Create shell environment based on options
 */
export function createShellEnvironment(
  options: {
    env?: Record<string, string>;
    cleanEnv?: boolean;
    preservePaths?: string[];
    packageManager?: string;
  } = {},
): Record<string, string> {
  if (options.cleanEnv) {
    return createCleanEnvironment(options.env, options.preservePaths, options.packageManager);
  }
  return createStandardEnvironment(options.env);
}

// Re-export bottle environment creation for convenience
export { createBottleEnvironment } from './tool-detector.js';
