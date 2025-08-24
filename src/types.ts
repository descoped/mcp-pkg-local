import { z } from 'zod';

// Import shared types from scanners to avoid duplication
export type { EnvironmentInfo, ScanResult } from '#scanners/types.js';

// PackageInfo removed - use BasicPackageInfo from scanners/types.ts instead

// EnvironmentInfo is now imported from scanners/types.ts to avoid duplication

// ScanResult is now imported from scanners/types.ts to avoid duplication

// Read package result
export type ReadPackageResult =
  | {
      type: 'tree';
      success: true;
      package: string;
      version: string;
      initContent?: string;
      fileTree: string[];
      fileCount?: number;
      mainFiles?: string[];
      truncated?: boolean;
    }
  | {
      type: 'file';
      success: true;
      package: string;
      filePath: string;
      content: string;
      extractedSummary?: boolean;
    }
  | {
      type: 'error';
      success: false;
      error: string;
      suggestion?: string;
    };

// IndexFileSchema removed - no longer used since we moved to SQLite cache

// Tool parameters - Simplified API v2.0

// Minimal scan-packages parameters
export const ScanPackagesParamsSchema = z.object({
  scope: z
    .enum(['all', 'project'])
    .optional()
    .default('all')
    .describe('Scan all packages or only project dependencies'),
  forceRefresh: z.boolean().optional().default(false).describe('Force rescan even if cached'),
});

export type ScanPackagesParams = z.infer<typeof ScanPackagesParamsSchema>;

// Minimal read-package parameters
export const ReadPackageParamsSchema = z.object({
  packageName: z.string().min(1).describe('Name of the package to read'),
});

export type ReadPackageParams = z.infer<typeof ReadPackageParamsSchema>;

// Legacy parameter schemas for backward compatibility (deprecated)
export const LegacyScanPackagesParamsSchema = z.object({
  forceRefresh: z.boolean().optional(),
  filter: z.string().optional(),
  limit: z.number().optional(),
  summary: z.boolean().optional(),
  category: z.enum(['production', 'development', 'all']).optional(),
  includeTypes: z.boolean().optional(),
  group: z
    .enum(['testing', 'building', 'linting', 'typescript', 'framework', 'utility'])
    .optional(),
  includeContent: z.boolean().optional(),
});

export type LegacyScanPackagesParams = z.infer<typeof LegacyScanPackagesParamsSchema>;

export const LegacyReadPackageParamsSchema = z.object({
  packageName: z.string().min(1),
  filePath: z.string().optional(),
  includeTree: z.boolean().optional(),
  maxDepth: z.number().optional(),
  pattern: z.string().optional(),
});

export type LegacyReadPackageParams = z.infer<typeof LegacyReadPackageParamsSchema>;

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
  constructor(language: 'python' | 'javascript' = 'python') {
    const message =
      language === 'python' ? 'No virtual environment found' : 'No Node.js project found';
    const suggestion =
      language === 'python'
        ? 'Run "python -m venv .venv" to create a virtual environment'
        : 'Ensure package.json exists and run "npm install" to install dependencies';
    super(message, 'ENV_NOT_FOUND', suggestion);
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

// SQLite Cache Types

export interface SQLiteCacheConfig {
  dbPath: string;
  maxAge: number; // seconds
  enableWAL: boolean;
  enableFileCache: boolean;
}

// CacheEnvironment removed - use EnvironmentRow instead

// Database row types for better-sqlite3
export interface EnvironmentRow {
  id: number;
  partition_key: string;
  project_path: string;
  language: string;
  package_manager: string | null;
  last_scan: string;
  scan_duration_ms: number | null;
  metadata: Buffer;
  created_at: string;
  updated_at: string;
}

export interface PackageRow {
  id: number;
  environment_id: number;
  name: string;
  version: string;
  location: string;
  language: string;
  has_type_definitions: number;
  unified_content: Buffer;
  created_at: string;
  updated_at: string;
}
