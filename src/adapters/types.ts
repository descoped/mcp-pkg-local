/**
 * Adapter interface definitions for content extraction
 * Adapters are responsible ONLY for extracting content from packages
 */

import type { UnifiedPackageContent } from '#types/unified-schema.js';
import type { BasicPackageInfo } from '#scanners/types.js';

/**
 * Content Adapter Interface
 * Responsible for extracting and normalizing package content
 */
export interface IContentAdapter {
  /**
   * The language this adapter handles
   */
  readonly language: 'javascript' | 'python';

  /**
   * Check if this adapter can process a package
   */
  canProcess(packageInfo: BasicPackageInfo): boolean;

  /**
   * Extract deep content from a package
   */
  extractContent(
    packagePath: string,
    packageInfo: BasicPackageInfo,
  ): Promise<UnifiedPackageContent>;

  /**
   * Get main entry points for lazy loading
   */
  getEntryPoints(packagePath: string, packageInfo: BasicPackageInfo): Promise<string[]>;

  /**
   * Read a specific file from the package
   */
  readPackageFile(packagePath: string, filePath: string): Promise<string | null>;
}
