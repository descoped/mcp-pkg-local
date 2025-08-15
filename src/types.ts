import { z } from 'zod';

// Package metadata
export type PackageInfo = {
  name: string;
  version: string;
  location: string;
  language: 'python' | 'javascript';
  packageManager?: string | undefined;
};

// Environment information
export type EnvironmentInfo = {
  type: 'venv' | '.venv' | 'conda' | 'system' | 'npm' | 'pnpm' | 'yarn';
  path: string;
  pythonVersion?: string | undefined;
  nodeVersion?: string | undefined;
  packageManager?: string | undefined;
};

// Scan result
export type ScanResult = {
  success: boolean;
  packages: Record<string, PackageInfo>;
  environment: EnvironmentInfo;
  scanTime: string;
};

// Read package result
export type ReadPackageResult = 
  | {
      type: 'tree';
      success: true;
      package: string;
      version: string;
      initContent?: string;
      fileTree: string[];
    }
  | {
      type: 'file';
      success: true;
      package: string;
      filePath: string;
      content: string;
    }
  | {
      type: 'error';
      success: false;
      error: string;
      suggestion?: string;
    };

// Index file structure
export const IndexFileSchema = z.object({
  version: z.string(),
  lastUpdated: z.string().datetime(),
  environment: z.object({
    type: z.enum(['venv', '.venv', 'conda', 'system', 'npm', 'pnpm', 'yarn']),
    path: z.string(),
    pythonVersion: z.string().optional(),
    nodeVersion: z.string().optional(),
    packageManager: z.string().optional(),
  }),
  packages: z.record(z.string(), z.object({
    name: z.string(),
    version: z.string(),
    location: z.string(),
    language: z.enum(['python', 'javascript']),
    packageManager: z.string().optional(),
  })),
});

export type IndexFile = z.infer<typeof IndexFileSchema>;

// Tool parameters
export const ScanPackagesParamsSchema = z.object({
  forceRefresh: z.boolean().optional().default(false),
});

export type ScanPackagesParams = z.infer<typeof ScanPackagesParamsSchema>;

export const ReadPackageParamsSchema = z.object({
  packageName: z.string().min(1),
  filePath: z.string().optional(),
});

export type ReadPackageParams = z.infer<typeof ReadPackageParamsSchema>;

// Scanner interfaces

/**
 * Core scanner interface that all language scanners must implement
 */
export interface Scanner {
  scan(): Promise<ScanResult>;
  getPackageLocation(packageName: string): Promise<string | null>;
  getPackageVersion(packageName: string): Promise<string | null>;
  getEnvironmentInfo(): Promise<EnvironmentInfo>;
}

/**
 * Extended scanner capabilities for language-specific features
 */
export interface LanguageScanner extends Scanner {
  /** The language this scanner supports */
  readonly language: 'python' | 'javascript' | 'go' | 'rust' | 'java';
  
  /** Supported package managers for this language */
  readonly supportedPackageManagers: readonly string[];
  
  /** File extensions this language uses */
  readonly supportedExtensions: readonly string[];
  
  /** Check if this scanner can handle the given directory */
  canHandle(basePath: string): Promise<boolean>;
  
  /** Get the main/entry file for a package (language-specific) */
  getPackageMainFile?(packageName: string): Promise<string | null>;
}

/**
 * Package manager specific capabilities
 */
export interface PackageManagerScanner {
  /** Detect which package manager is being used */
  detectPackageManager(): Promise<string | null>;
  
  /** Get lock file path if it exists */
  getLockFilePath?(): Promise<string | null>;
  
  /** Check if dependencies are installed */
  isDependenciesInstalled(): Promise<boolean>;
}

// Error types
export class McpError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly suggestion?: string,
  ) {
    super(message);
    this.name = 'McpError';
  }
}

export class EnvironmentNotFoundError extends McpError {
  constructor(message = 'No virtual environment found') {
    super(message, 'ENV_NOT_FOUND', 'Run "python -m venv .venv" to create a virtual environment');
  }
}

export class NodeEnvironmentNotFoundError extends McpError {
  constructor(message = 'No Node.js project found') {
    super(message, 'NODE_ENV_NOT_FOUND', 'Ensure package.json exists and run "npm install" to install dependencies');
  }
}

export class PackageNotFoundError extends McpError {
  constructor(packageName: string) {
    super(
      `Package "${packageName}" not found in environment`,
      'PACKAGE_NOT_FOUND',
      `Ensure the package is installed with "pip install ${packageName}"`,
    );
  }
}

export class FileNotFoundError extends McpError {
  constructor(filePath: string) {
    super(`File "${filePath}" not found`, 'FILE_NOT_FOUND');
  }
}
