/**
 * Base adapter for language-specific package processing
 * Provides a common interface for extracting package information across different languages
 */

import type { UnifiedPackageContent } from '#types/unified-schema.js';
import type { IContentAdapter } from './types.js';
import type { BasicPackageInfo } from '#scanners/types.js';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';

export abstract class BaseAdapter implements IContentAdapter {
  /**
   * The language this adapter handles
   */
  abstract readonly language: 'javascript' | 'python';

  /**
   * Check if this adapter can process a package
   */
  canProcess(packageInfo: BasicPackageInfo): boolean {
    return packageInfo.language === this.language;
  }

  /**
   * Extract deep content from a package
   */
  abstract extractContent(
    packagePath: string,
    packageInfo: BasicPackageInfo,
  ): Promise<UnifiedPackageContent>;

  /**
   * Get main entry points for lazy loading
   */
  abstract getEntryPoints(packagePath: string, packageInfo: BasicPackageInfo): Promise<string[]>;

  /**
   * Read a specific file from the package
   */
  async readPackageFile(packagePath: string, filePath: string): Promise<string | null> {
    try {
      const fullPath = join(packagePath, filePath);
      return await fs.readFile(fullPath, 'utf-8');
    } catch {
      return null;
    }
  }

  /**
   * Clean up any resources used by the adapter
   */
  cleanup(): void {
    // Default implementation - override if needed
  }
}
