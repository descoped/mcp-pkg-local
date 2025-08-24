/**
 * Scanner interface definitions for package discovery
 * Scanners are responsible ONLY for finding packages, not extracting content
 */

import type { UnifiedPackageContent } from '#types/unified-schema.js';

export interface ScanOptions {
  forceRefresh?: boolean;
  filter?: string;
  limit?: number;
  includeTypes?: boolean;
  group?: 'testing' | 'building' | 'linting' | 'typescript' | 'framework' | 'utility';
  summary?: boolean;
}

export interface EnvironmentInfo {
  type: 'npm' | 'yarn' | 'pnpm' | 'conda' | 'venv' | '.venv' | 'system';
  path: string;
  nodeVersion?: string;
  pythonVersion?: string;
  packageManager?: string;
}

export interface BasicPackageInfo {
  name: string;
  version: string;
  location: string;
  language: 'javascript' | 'python';
  packageManager: string;
  hasTypes?: boolean;
  metadata?: Record<string, unknown>; // Cached package.json or metadata
  unifiedContent?: UnifiedPackageContent; // Optional unified content from adapters
  entryPoints?: string[]; // Optional entry points from adapters
}

export interface ScanResult {
  type?: 'list' | 'summary' | 'packages'; // Type field for MCP compatibility
  success: boolean;
  environment: EnvironmentInfo;
  packages?: Record<string, BasicPackageInfo>; // Made optional for summary mode
  scanTime: string;
  totalPackages?: number;
  error?: string;
  summary?: {
    total: number;
    filtered: number;
    languages: Record<string, number>;
    categories?: Record<string, number>;
  };
  // Additional fields for summary mode
  categories?: Record<string, number>;
}

/**
 * Package Scanner Interface
 * Responsible for discovering packages in language-specific environments
 */
export interface IPackageScanner {
  /**
   * Language identifier for this scanner
   */
  readonly language: 'javascript' | 'python';

  /**
   * Scan the environment for packages
   */
  scan(options?: ScanOptions): Promise<ScanResult>;

  /**
   * Get the location of a specific package
   */
  getPackageLocation(packageName: string): Promise<string | null>;

  /**
   * Get the version of a specific package
   */
  getPackageVersion(packageName: string): Promise<string | null>;

  /**
   * Get environment information
   */
  getEnvironmentInfo(): Promise<EnvironmentInfo>;

  /**
   * Get basic info for a specific package
   */
  getPackageInfo(packageName: string): Promise<BasicPackageInfo | null>;
}
